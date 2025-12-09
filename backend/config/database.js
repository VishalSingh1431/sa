import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend directory (works even when run from different directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pkg;

// Parse Aiven Service URI if provided
let dbConfig = {};

if (process.env.DATABASE_URL || process.env.POSTGRES_SERVICE_URI) {
  try {
    // Aiven Service URI format: postgres://user:password@host:port/database?sslmode=require
    const uri = process.env.DATABASE_URL || process.env.POSTGRES_SERVICE_URI;
    
    // Validate URI format
    if (!uri.startsWith('postgres://') && !uri.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL must start with postgres:// or postgresql://');
    }
    
    const url = new URL(uri);
    
    // Validate required components
    if (!url.hostname) {
      throw new Error('DATABASE_URL is missing hostname');
    }
    if (!url.username) {
      throw new Error('DATABASE_URL is missing username');
    }
    if (!url.password) {
      throw new Error('DATABASE_URL is missing password');
    }
    
    dbConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.replace(/^\//, '') || 'defaultdb', // Remove leading '/'
      user: url.username,
      password: url.password,
      ssl: {
        rejectUnauthorized: false
      },
    };
    
    console.log('🔗 Database Config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: 'enabled'
    });
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
    console.error('📝 Expected format: postgres://username:password@host:port/database?sslmode=require');
    console.error('📝 Get your connection string from: https://console.aiven.io/');
    throw error;
  }
} else {
  // Use individual environment variables
  dbConfig = {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST,
    port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
    database: process.env.DB_NAME || process.env.POSTGRES_DB || 'defaultdb',
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.POSTGRES_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  };
}

// PostgreSQL connection pool (optimized for production)
const pool = new Pool({
  ...dbConfig,
  max: process.env.NODE_ENV === 'production' ? 30 : 20, // More connections in production
  min: process.env.NODE_ENV === 'production' ? 5 : 2, // Keep minimum connections alive
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false, // Keep pool alive
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  // Don't exit on error - let the app handle it gracefully
});

// Test database connection function
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection test successful');
    console.log('   Current database time:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   Error details:', error);
    if (error.code === 'ENOTFOUND') {
      console.error('   → DNS resolution failed. The hostname cannot be found.');
      console.error('   → FIX: Check your Aiven dashboard at https://console.aiven.io/');
      console.error('   → Get the correct Service URI from: Project → PostgreSQL → Connection Information');
      console.error('   → Make sure your database service is running (not paused)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Connection refused. The database server is not accepting connections.');
      console.error('   → FIX: Check if the database service is running in Aiven dashboard');
      console.error('   → Verify the port number is correct');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   → Connection timeout. Network or firewall issue.');
      console.error('   → FIX: Check your internet connection and firewall settings');
    } else if (error.code === '28P01') {
      console.error('   → Authentication failed. Wrong username or password.');
      console.error('   → FIX: Get the correct password from Aiven dashboard');
    } else if (error.code === '3D000') {
      console.error('   → Database does not exist.');
      console.error('   → FIX: Check the database name in your DATABASE_URL');
    } else {
      console.error('   → Unknown error. Check your DATABASE_URL in .env file');
    }
    console.error('');
    console.error('📝 QUICK FIX:');
    console.error('   1. Go to https://console.aiven.io/');
    console.error('   2. Select your PostgreSQL service');
    console.error('   3. Click "Connection information"');
    console.error('   4. Copy the "Service URI"');
    console.error('   5. Paste it in backend/.env as: DATABASE_URL=<your-service-uri>');
    console.error('');
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  // First test the connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    throw new Error('Database connection failed. Please check your database configuration in .env file.');
  }

  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        phone VARCHAR(20),
        bio TEXT,
        picture TEXT,
        google_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist (for existing tables)
    // Check and add picture column
    const pictureColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'picture'
    `);
    if (pictureColumnCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN picture TEXT`);
      console.log('✅ Added missing "picture" column to users table');
    }

    // Check and add google_id column
    const googleIdColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'google_id'
    `);
    if (googleIdColumnCheck.rows.length === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN google_id VARCHAR(255)`);
      console.log('✅ Added missing "google_id" column to users table');
    }

    // Check and add role column with default 'user'
    const roleColumnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    if (roleColumnCheck.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user' 
        CHECK (role IN ('main_admin', 'admin', 'user'))
      `);
      console.log('✅ Added missing "role" column to users table');
    } else {
      // Update existing role column to ensure it has the correct constraint
      // First, drop existing constraint if any
      try {
        await pool.query(`
          ALTER TABLE users 
          DROP CONSTRAINT IF EXISTS users_role_check
        `);
      } catch (e) {
        // Ignore if constraint doesn't exist
      }
      // Add new constraint
      await pool.query(`
        ALTER TABLE users 
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('main_admin', 'admin', 'user'))
      `);
      // Set default for existing rows without role
      await pool.query(`
        UPDATE users 
        SET role = 'user' 
        WHERE role IS NULL OR role NOT IN ('main_admin', 'admin', 'user')
      `);
      // Set default value for column
      await pool.query(`
        ALTER TABLE users 
        ALTER COLUMN role SET DEFAULT 'user'
      `);
      console.log('✅ Updated "role" column constraints and defaults');
    }

    // Create otps table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create businesses table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        owner_name VARCHAR(255),
        category VARCHAR(50) NOT NULL CHECK (category IN ('Shop', 'Restaurant', 'Hotel', 'Clinic', 'Library', 'Services', 'Temple', 'School', 'College', 'Gym', 'Salon', 'Spa', 'Pharmacy', 'Bank', 'Travel Agency', 'Real Estate', 'Law Firm', 'Accounting', 'IT Services', 'Photography', 'Event Management', 'Catering', 'Bakery', 'Jewelry', 'Fashion', 'Electronics', 'Furniture', 'Automobile', 'Repair Services', 'Education', 'Healthcare', 'Beauty', 'Fitness', 'Entertainment', 'Tourism', 'Food & Beverage', 'Retail', 'Wholesale', 'Manufacturing', 'Construction', 'Other')),
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        map_link TEXT,
        whatsapp VARCHAR(20),
        description TEXT NOT NULL,
        logo_url TEXT,
        images_url JSONB DEFAULT '[]'::jsonb,
        youtube_video TEXT,
        social_links JSONB DEFAULT '{"instagram": "", "facebook": "", "website": ""}'::jsonb,
        slug VARCHAR(255) NOT NULL UNIQUE,
        subdomain_url TEXT NOT NULL,
        subdirectory_url TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trips table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL,
        old_price VARCHAR(50),
        image_url TEXT,
        video_url TEXT,
        video_public_id TEXT,
        image_public_id TEXT,
        gallery JSONB DEFAULT '[]'::jsonb,
        gallery_public_ids JSONB DEFAULT '[]'::jsonb,
        subtitle TEXT,
        intro TEXT,
        why_visit JSONB DEFAULT '[]'::jsonb,
        itinerary JSONB DEFAULT '[]'::jsonb,
        included JSONB DEFAULT '[]'::jsonb,
        not_included JSONB DEFAULT '[]'::jsonb,
        notes JSONB DEFAULT '[]'::jsonb,
        faq JSONB DEFAULT '[]'::jsonb,
        reviews JSONB DEFAULT '[]'::jsonb,
        slug VARCHAR(255) UNIQUE,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create certificates table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        images JSONB DEFAULT '[]'::jsonb,
        images_public_ids JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create destinations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        image_public_id TEXT,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        location VARCHAR(255),
        review TEXT NOT NULL,
        avatar TEXT,
        avatar_public_id TEXT,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create written_reviews table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS written_reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        date VARCHAR(50),
        title VARCHAR(255),
        review TEXT NOT NULL,
        location VARCHAR(255),
        avatar TEXT,
        avatar_public_id TEXT,
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
      CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);
      CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
      CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
      CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
      CREATE INDEX IF NOT EXISTS idx_trips_slug ON trips(slug);
      CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
      CREATE INDEX IF NOT EXISTS idx_trips_location ON trips(location);
      CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
      CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
      CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
      CREATE INDEX IF NOT EXISTS idx_written_reviews_status ON written_reviews(status);
    `);

    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers to automatically update updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
      CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON businesses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
      CREATE TRIGGER update_trips_updated_at
      BEFORE UPDATE ON trips
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
      CREATE TRIGGER update_certificates_updated_at
      BEFORE UPDATE ON certificates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
      CREATE TRIGGER update_destinations_updated_at
      BEFORE UPDATE ON destinations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
      CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_written_reviews_updated_at ON written_reviews;
      CREATE TRIGGER update_written_reviews_updated_at
      BEFORE UPDATE ON written_reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create enquiries table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        trip_id INTEGER REFERENCES trips(id),
        trip_title VARCHAR(255),
        trip_location VARCHAR(255),
        trip_price VARCHAR(50),
        selected_month VARCHAR(50),
        number_of_travelers INTEGER DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'booked', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for enquiries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_enquiries_trip_id ON enquiries(trip_id);
      CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
      CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);
      CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);
    `);

    // Create trigger for enquiries updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
      CREATE TRIGGER update_enquiries_updated_at
      BEFORE UPDATE ON enquiries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

export default pool;

