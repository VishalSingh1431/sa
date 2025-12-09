import pool from '../config/database.js';

/**
 * Destination Model - PostgreSQL operations
 */
class Destination {
  /**
   * Create a new destination
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO destinations (
          name, image, image_public_id, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        data.name,
        data.image || null,
        data.imagePublicId || null,
        data.status || 'active',
        data.createdBy || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToDestination(result.rows[0]);
    } catch (error) {
      console.error('Destination.create error:', error);
      throw error;
    }
  }

  /**
   * Find destination by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM destinations WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToDestination(result.rows[0]) : null;
    } catch (error) {
      console.error('Destination.findById error:', error);
      throw error;
    }
  }

  /**
   * Get all destinations (with optional filters)
   */
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM destinations WHERE 1=1';
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
      return result.rows.map(row => this.mapRowToDestination(row));
    } catch (error) {
      console.error('Destination.findAll error:', error);
      throw error;
    }
  }

  /**
   * Update destination
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = {
        name: data.name,
        image: 'image',
        imagePublicId: 'image_public_id',
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
        UPDATE destinations 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToDestination(result.rows[0]);
    } catch (error) {
      console.error('Destination.update error:', error);
      throw error;
    }
  }

  /**
   * Delete destination
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM destinations WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToDestination(result.rows[0]) : null;
    } catch (error) {
      console.error('Destination.delete error:', error);
      throw error;
    }
  }

  /**
   * Map database row to destination object
   */
  static mapRowToDestination(row) {
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      image: row.image,
      imagePublicId: row.image_public_id,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Destination;
