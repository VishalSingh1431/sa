import pool from '../config/database.js';

/**
 * WrittenReview Model - PostgreSQL operations
 */
class WrittenReview {
  /**
   * Create a new written review
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO written_reviews (
          name, rating, date, title, review, location, avatar, avatar_public_id, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        data.name,
        data.rating || 5,
        data.date || null,
        data.title || null,
        data.review,
        data.location || null,
        data.avatar || null,
        data.avatarPublicId || null,
        data.status || 'active',
        data.createdBy || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToWrittenReview(result.rows[0]);
    } catch (error) {
      console.error('WrittenReview.create error:', error);
      throw error;
    }
  }

  /**
   * Find written review by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM written_reviews WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToWrittenReview(result.rows[0]) : null;
    } catch (error) {
      console.error('WrittenReview.findById error:', error);
      throw error;
    }
  }

  /**
   * Get all written reviews (with optional filters)
   */
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM written_reviews WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount++}`;
        values.push(filters.status);
      } else if (!filters.includeDraft) {
        query += ` AND status = $${paramCount++}`;
        values.push('active');
      }

      query += ' ORDER BY created_at DESC';

      if (filters.limit) {
        query += ` LIMIT $${paramCount++}`;
        values.push(filters.limit);
      }

      if (filters.offset) {
        query += ` OFFSET $${paramCount++}`;
        values.push(filters.offset);
      }

      const result = await pool.query(query, values);
      return result.rows.map(row => this.mapRowToWrittenReview(row));
    } catch (error) {
      console.error('WrittenReview.findAll error:', error);
      throw error;
    }
  }

  /**
   * Update written review
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = {
        name: data.name,
        rating: data.rating,
        date: data.date,
        title: data.title,
        review: data.review,
        location: data.location,
        avatar: 'avatar',
        avatarPublicId: 'avatar_public_id',
        status: data.status,
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && data[key] !== undefined) {
          const dbKey = typeof value === 'string' ? value : key;
          updates.push(`${dbKey} = $${paramCount++}`);
          values.push(data[key]);
        }
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE written_reviews 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToWrittenReview(result.rows[0]);
    } catch (error) {
      console.error('WrittenReview.update error:', error);
      throw error;
    }
  }

  /**
   * Delete written review
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM written_reviews WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToWrittenReview(result.rows[0]) : null;
    } catch (error) {
      console.error('WrittenReview.delete error:', error);
      throw error;
    }
  }

  /**
   * Map database row to written review object
   */
  static mapRowToWrittenReview(row) {
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      rating: row.rating,
      date: row.date,
      title: row.title,
      review: row.review,
      location: row.location,
      avatar: row.avatar,
      avatarPublicId: row.avatar_public_id,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default WrittenReview;
