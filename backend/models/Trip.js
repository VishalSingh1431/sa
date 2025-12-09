import pool from '../config/database.js';

/**
 * Trip Model - PostgreSQL operations
 */
class Trip {
  /**
   * Create a new trip
   */
  static async create(data) {
    try {
      const query = `
        INSERT INTO trips (
          title, location, duration, price, old_price, image_url, video_url,
          video_public_id, image_public_id, gallery, gallery_public_ids,
          subtitle, intro, why_visit, itinerary, included, not_included,
          notes, faq, reviews, slug, status, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23
        )
        RETURNING *
      `;

      const values = [
        data.title,
        data.location,
        data.duration,
        data.price,
        data.oldPrice || null,
        data.imageUrl || null,
        data.videoUrl || null,
        data.videoPublicId || null,
        data.imagePublicId || null,
        JSON.stringify(data.gallery || []),
        JSON.stringify(data.galleryPublicIds || []),
        data.subtitle || null,
        data.intro || null,
        JSON.stringify(data.whyVisit || []),
        JSON.stringify(data.itinerary || []),
        JSON.stringify(data.included || []),
        JSON.stringify(data.notIncluded || []),
        JSON.stringify(data.notes || []),
        JSON.stringify(data.faq || []),
        JSON.stringify(data.reviews || []),
        data.slug || this.generateSlug(data.title),
        data.status || 'active',
        data.createdBy || null,
      ];

      const result = await pool.query(query, values);
      return this.mapRowToTrip(result.rows[0]);
    } catch (error) {
      console.error('Trip.create error:', error);
      throw error;
    }
  }

  /**
   * Find trip by ID
   */
  static async findById(id) {
    try {
      const query = 'SELECT * FROM trips WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToTrip(result.rows[0]) : null;
    } catch (error) {
      console.error('Trip.findById error:', error);
      throw error;
    }
  }

  /**
   * Find trip by slug
   */
  static async findBySlug(slug) {
    try {
      const query = 'SELECT * FROM trips WHERE slug = $1 AND status = $2';
      const result = await pool.query(query, [slug, 'active']);
      return result.rows.length > 0 ? this.mapRowToTrip(result.rows[0]) : null;
    } catch (error) {
      console.error('Trip.findBySlug error:', error);
      throw error;
    }
  }

  /**
   * Get all trips (with optional filters)
   */
  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM trips WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.status) {
        query += ` AND status = $${paramCount++}`;
        values.push(filters.status);
      } else if (!filters.includeDraft) {
        // By default, only show active trips unless includeDraft is true
        query += ` AND status = $${paramCount++}`;
        values.push('active');
      }

      if (filters.location) {
        query += ` AND location ILIKE $${paramCount++}`;
        values.push(`%${filters.location}%`);
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
      return result.rows.map(row => this.mapRowToTrip(row));
    } catch (error) {
      console.error('Trip.findAll error:', error);
      throw error;
    }
  }

  /**
   * Update trip
   */
  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      const fields = {
        title: data.title,
        location: data.location,
        duration: data.duration,
        price: data.price,
        oldPrice: 'old_price',
        imageUrl: 'image_url',
        videoUrl: 'video_url',
        videoPublicId: 'video_public_id',
        imagePublicId: 'image_public_id',
        gallery: data.gallery,
        galleryPublicIds: 'gallery_public_ids',
        subtitle: data.subtitle,
        intro: data.intro,
        whyVisit: 'why_visit',
        itinerary: data.itinerary,
        included: data.included,
        notIncluded: 'not_included',
        notes: data.notes,
        faq: data.faq,
        reviews: data.reviews,
        slug: data.slug,
        status: data.status,
      };

      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && data[key] !== undefined) {
          const dbKey = typeof value === 'string' ? value : key;
          if (['gallery', 'galleryPublicIds', 'whyVisit', 'itinerary', 'included', 'notIncluded', 'notes', 'faq', 'reviews'].includes(key)) {
            updates.push(`${dbKey} = $${paramCount++}`);
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
        UPDATE trips 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return this.mapRowToTrip(result.rows[0]);
    } catch (error) {
      console.error('Trip.update error:', error);
      throw error;
    }
  }

  /**
   * Delete trip
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM trips WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows.length > 0 ? this.mapRowToTrip(result.rows[0]) : null;
    } catch (error) {
      console.error('Trip.delete error:', error);
      throw error;
    }
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Map database row to trip object
   */
  static mapRowToTrip(row) {
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      location: row.location,
      duration: row.duration,
      price: row.price,
      oldPrice: row.old_price,
      image: row.image_url,
      imageUrl: row.image_url,
      video: row.video_url,
      videoUrl: row.video_url,
      videoPublicId: row.video_public_id,
      imagePublicId: row.image_public_id,
      gallery: Array.isArray(row.gallery) ? row.gallery : (row.gallery ? JSON.parse(row.gallery) : []),
      galleryPublicIds: Array.isArray(row.gallery_public_ids) ? row.gallery_public_ids : (row.gallery_public_ids ? JSON.parse(row.gallery_public_ids) : []),
      subtitle: row.subtitle,
      intro: row.intro,
      whyVisit: Array.isArray(row.why_visit) ? row.why_visit : (row.why_visit ? JSON.parse(row.why_visit) : []),
      itinerary: Array.isArray(row.itinerary) ? row.itinerary : (row.itinerary ? JSON.parse(row.itinerary) : []),
      included: Array.isArray(row.included) ? row.included : (row.included ? JSON.parse(row.included) : []),
      notIncluded: Array.isArray(row.not_included) ? row.not_included : (row.not_included ? JSON.parse(row.not_included) : []),
      notes: Array.isArray(row.notes) ? row.notes : (row.notes ? JSON.parse(row.notes) : []),
      faq: Array.isArray(row.faq) ? row.faq : (row.faq ? JSON.parse(row.faq) : []),
      reviews: Array.isArray(row.reviews) ? row.reviews : (row.reviews ? JSON.parse(row.reviews) : []),
      slug: row.slug,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default Trip;
