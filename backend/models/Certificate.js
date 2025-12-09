import pool from '../config/database.js';

/**
 * Certificate Model - PostgreSQL operations
 */
class Certificate {
  /**
   * Create a new certificate
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO certificates (
          title, description, images, images_public_ids, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        data.title,
        data.description || null,
        JSON.stringify(data.images || []),
        JSON.stringify(data.imagesPublicIds || []),
        data.status || 'active',
        data.createdBy || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToCertificate(result.rows[0]);
    } catch (error) {
      console.error('Certificate.create error:', error);
      throw error;
    }
  }

  /**
   * Find certificate by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM certificates WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToCertificate(result.rows[0]) : null;
    } catch (error) {
      console.error('Certificate.findById error:', error);
      throw error;
    }
  }

  /**
   * Get all certificates (with optional filters)
   */
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM certificates WHERE 1=1';
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
      return result.rows.map(row => this.mapRowToCertificate(row));
    } catch (error) {
      console.error('Certificate.findAll error:', error);
      throw error;
    }
  }

  /**
   * Update certificate
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = {
        title: data.title,
        description: data.description,
        images: data.images,
        imagesPublicIds: 'images_public_ids',
        status: data.status,
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && data[key] !== undefined) {
          const dbKey = typeof value === 'string' ? value : key;
          if (['images', 'imagesPublicIds'].includes(key)) {
            updates.push(`${dbKey === 'imagesPublicIds' ? 'images_public_ids' : dbKey} = $${paramCount++}`);
            values.push(JSON.stringify(data[key]));
          } else {
            updates.push(`${dbKey} = $${paramCount++}`);
            values.push(data[key]);
          }
        }
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE certificates 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToCertificate(result.rows[0]);
    } catch (error) {
      console.error('Certificate.update error:', error);
      throw error;
    }
  }

  /**
   * Delete certificate
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM certificates WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToCertificate(result.rows[0]) : null;
    } catch (error) {
      console.error('Certificate.delete error:', error);
      throw error;
    }
  }

  /**
   * Map database row to certificate object
   */
  static mapRowToCertificate(row) {
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      images: Array.isArray(row.images) ? row.images : (row.images ? JSON.parse(row.images) : []),
      imagesPublicIds: Array.isArray(row.images_public_ids) ? row.images_public_ids : (row.images_public_ids ? JSON.parse(row.images_public_ids) : []),
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Certificate;
