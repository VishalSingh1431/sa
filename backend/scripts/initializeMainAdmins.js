import pool from '../config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const MAIN_ADMIN_EMAILS = [
  'vishalsingh05072003@gmail.com',
  'vinodpatel63767@gmail.com'
];

async function initializeMainAdmins() {
  try {
    console.log('🔧 Initializing Main Admins...');
    
    for (const email of MAIN_ADMIN_EMAILS) {
      // Check if user exists
      const checkResult = await pool.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (checkResult.rows.length > 0) {
        // User exists - update role to main_admin
        const user = checkResult.rows[0];
        if (user.role !== 'main_admin') {
          await pool.query(
            'UPDATE users SET role = $1 WHERE email = $2',
            ['main_admin', email.toLowerCase()]
          );
          console.log(`✅ Updated ${email} to main_admin`);
        } else {
          console.log(`ℹ️  ${email} is already main_admin`);
        }
      } else {
        // User doesn't exist - create with main_admin role
        await pool.query(
          `INSERT INTO users (email, role, created_at, updated_at) 
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [email.toLowerCase(), 'main_admin']
        );
        console.log(`✅ Created ${email} as main_admin`);
      }
    }

    console.log('✅ Main Admins initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing main admins:', error);
    process.exit(1);
  }
}

initializeMainAdmins();
