import pool from '../config/database.js';

/**
 * Enquiry Model - PostgreSQL operations
 */
class Enquiry {
  /**
   * Create a new enquiry
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO enquiries (
          trip_id, trip_title, trip_location, trip_price,
          selected_month, number_of_travelers,
          name, email, phone, message
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        data.tripId || null,
        data.tripTitle || null,
        data.tripLocation || null,
        data.tripPrice || null,
        data.selectedMonth || null,
        data.numberOfTravelers || 1,
        data.name,
        data.email.toLowerCase(),
        data.phone || null,
        data.message || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToEnquiry(result.rows[0]);
    } catch (error) {
      console.error('Enquiry.create error:', error);
      throw error;
    }
  }

  /**
   * Find enquiry by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM enquiries WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToEnquiry(result.rows[0]) : null;
    } catch (error) {
      console.error('Enquiry.findById error:', error);
      throw error;
    }
  }

  /**
   * Get all enquiries (Admin only)
   */
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM enquiries WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount++}`;
        values.push(filters.status);
      }

      if (filters.tripId) {
        query += ` AND trip_id = $${paramCount++}`;
        values.push(filters.tripId);
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
      return result.rows.map(row => this.mapRowToEnquiry(row));
    } catch (error) {
      console.error('Enquiry.findAll error:', error);
      throw error;
    }
  }

  /**
   * Update enquiry status
   */
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE enquiries 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [status, id]);
      return result.rows.length > 0 ? this.mapRowToEnquiry(result.rows[0]) : null;
    } catch (error) {
      console.error('Enquiry.updateStatus error:', error);
      throw error;
    }
  }

  /**
   * Map database row to enquiry object
   */
  static mapRowToEnquiry(row) {
    if (!row) return null;

    return {
      id: row.id,
      tripId: row.trip_id,
      tripTitle: row.trip_title,
      tripLocation: row.trip_location,
      tripPrice: row.trip_price,
      selectedMonth: row.selected_month,
      numberOfTravelers: row.number_of_travelers,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Enquiry;
