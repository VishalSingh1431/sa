import pool from '../config/database.js';

/**
 * User Model - PostgreSQL operations
 */
class User {
  /**
   * Create a new user
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO users (email, name, phone, bio, picture, google_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        data.email.toLowerCase(),
        data.name || null,
        data.phone || null,
        data.bio || null,
        data.picture || null,
        data.googleId || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('User.create error:', error);
      console.error('Error code:', error.code);
      // Re-throw with more context for database connection errors
      if (
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('connection') ||
        error.message.includes('timeout')
      ) {
        const dbError = new Error('Database connection failed. Please check your database configuration.');
        dbError.code = error.code;
        dbError.originalError = error.message;
        throw dbError;
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email.toLowerCase()]);
      return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
    } catch (error) {
      console.error('User.findByEmail error:', error);
      console.error('Error code:', error.code);
      // Re-throw with more context for database connection errors
      if (
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('connection') ||
        error.message.includes('timeout')
      ) {
        const dbError = new Error('Database connection failed. Please check your database configuration.');
        dbError.code = error.code;
        dbError.originalError = error.message;
        throw dbError;
      }
      throw error;
    }
  }

  /**
   * Find user by Google ID
   */
  static async findByGoogleId(googleId) {
    const query = 'SELECT * FROM users WHERE google_id = $1';
    const result = await pool.query(query, [googleId]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }

  /**
   * Update user
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(data.name);
      }
      if (data.phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(data.phone);
      }
      if (data.bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        values.push(data.bio);
      }
      if (data.picture !== undefined) {
        updates.push(`picture = $${paramCount++}`);
        values.push(data.picture);
      }
      if (data.googleId !== undefined) {
        updates.push(`google_id = $${paramCount++}`);
        values.push(data.googleId);
      }
      if (data.role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(data.role);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToUser(result.rows[0]);
    } catch (error) {
      console.error('User.update error:', error);
      console.error('Error code:', error.code);
      // Re-throw with more context for database connection errors
      if (
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('connection') ||
        error.message.includes('timeout')
      ) {
        const dbError = new Error('Database connection failed. Please check your database configuration.');
        dbError.code = error.code;
        dbError.originalError = error.message;
        throw dbError;
      }
      throw error;
    }
  }

  /**
   * Get all users (for admin panel)
   */
  static async findAll(limit = 100, offset = 0) {
    try {
      const query = `
        SELECT * FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      const result = await pool.query(query, [limit, offset]);
      return result.rows.map(row => this.mapRowToUser(row));
    } catch (error) {
      console.error('User.findAll error:', error);
      throw error;
    }
  }

  /**
   * Search users by email or name
   */
  static async search(searchTerm, limit = 50) {
    try {
      const query = `
        SELECT * FROM users 
        WHERE email ILIKE $1 OR name ILIKE $1
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      const result = await pool.query(query, [`%${searchTerm}%`, limit]);
      return result.rows.map(row => this.mapRowToUser(row));
    } catch (error) {
      console.error('User.search error:', error);
      throw error;
    }
  }

  /**
   * Get user count
   */
  static async count() {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM users');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('User.count error:', error);
      throw error;
    }
  }

  /**
   * Map database row to user object
   */
  static mapRowToUser(row) {
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      bio: row.bio,
      picture: row.picture,
      googleId: row.google_id,
      role: row.role || 'user',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default User;

