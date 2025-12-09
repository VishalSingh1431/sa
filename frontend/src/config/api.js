import { API_BASE_URL } from './constants';

// API Configuration

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // If there's a help message, include it in the error
      const errorMessage = data.help 
        ? `${data.error}\n\n${data.help}`
        : data.error || 'Request failed';
      const error = new Error(errorMessage);
      error.help = data.help;
      error.code = data.code;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If it's a network error, provide helpful message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      const networkError = new Error('Cannot connect to server. Make sure the backend server is running on port 5000.');
      networkError.help = 'Start the backend server with: cd backend && npm run dev';
      throw networkError;
    }
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  sendOTP: async (email) => {
    return apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOTP: async (email, otp, isSignup) => {
    return apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, isSignup }),
    });
  },

  googleAuth: async (tokenId) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ tokenId }),
    });
  },

  verifyToken: async () => {
    return apiCall('/auth/verify', {
      method: 'GET',
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData) => {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Admin/Main Admin endpoints
  getAllUsers: async (search = '', limit = 50, offset = 0) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit);
    params.append('offset', offset);
    return apiCall(`/auth/users?${params.toString()}`, {
      method: 'GET',
    });
  },

  promoteUser: async (userId) => {
    return apiCall(`/auth/users/${userId}/promote`, {
      method: 'PUT',
    });
  },

  demoteUser: async (userId) => {
    return apiCall(`/auth/users/${userId}/demote`, {
      method: 'PUT',
    });
  },
};

// Trips API functions
export const tripsAPI = {
  getAllTrips: async (location = '', limit = 50, offset = 0) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    params.append('limit', limit);
    params.append('offset', offset);
    return apiCall(`/trips?${params.toString()}`, {
      method: 'GET',
    });
  },

  getTripById: async (id) => {
    return apiCall(`/trips/${id}`, {
      method: 'GET',
    });
  },

  getTripBySlug: async (slug) => {
    return apiCall(`/trips/slug/${slug}`, {
      method: 'GET',
    });
  },

  // Admin endpoints
  getAllTripsAdmin: async (status = '', location = '', limit = 50, offset = 0) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (location) params.append('location', location);
    params.append('limit', limit);
    params.append('offset', offset);
    return apiCall(`/trips/admin?${params.toString()}`, {
      method: 'GET',
    });
  },

  createTrip: async (tripData) => {
    return apiCall('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  updateTrip: async (id, tripData) => {
    return apiCall(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData),
    });
  },

  deleteTrip: async (id) => {
    return apiCall(`/trips/${id}`, {
      method: 'DELETE',
    });
  },
};

// Upload API functions
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to upload image';
        throw new Error(errorMessage);
      }
      return data;
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to upload video';
        throw new Error(errorMessage);
      }
      return data;
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  },

  deleteFile: async (publicId, resourceType = 'image') => {
    return apiCall(`/upload/${publicId}?resourceType=${resourceType}`, {
      method: 'DELETE',
    });
  },
};

// Certificates API functions
export const certificatesAPI = {
  getAllCertificates: async () => {
    return apiCall('/certificates', {
      method: 'GET',
    });
  },

  getAllCertificatesAdmin: async (status = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`/certificates/admin?${params.toString()}`, {
      method: 'GET',
    });
  },

  getCertificateById: async (id) => {
    return apiCall(`/certificates/${id}`, {
      method: 'GET',
    });
  },

  createCertificate: async (certificateData) => {
    return apiCall('/certificates', {
      method: 'POST',
      body: JSON.stringify(certificateData),
    });
  },

  updateCertificate: async (id, certificateData) => {
    return apiCall(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificateData),
    });
  },

  deleteCertificate: async (id) => {
    return apiCall(`/certificates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Destinations API functions
export const destinationsAPI = {
  getAllDestinations: async () => {
    return apiCall('/destinations', {
      method: 'GET',
    });
  },

  getAllDestinationsAdmin: async (status = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`/destinations/admin?${params.toString()}`, {
      method: 'GET',
    });
  },

  getDestinationById: async (id) => {
    return apiCall(`/destinations/${id}`, {
      method: 'GET',
    });
  },

  createDestination: async (destinationData) => {
    return apiCall('/destinations', {
      method: 'POST',
      body: JSON.stringify(destinationData),
    });
  },

  updateDestination: async (id, destinationData) => {
    return apiCall(`/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(destinationData),
    });
  },

  deleteDestination: async (id) => {
    return apiCall(`/destinations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reviews API functions
export const reviewsAPI = {
  getAllReviews: async () => {
    return apiCall('/reviews', {
      method: 'GET',
    });
  },

  getAllReviewsAdmin: async (status = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`/reviews/admin?${params.toString()}`, {
      method: 'GET',
    });
  },

  getReviewById: async (id) => {
    return apiCall(`/reviews/${id}`, {
      method: 'GET',
    });
  },

  createReview: async (reviewData) => {
    return apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  updateReview: async (id, reviewData) => {
    return apiCall(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (id) => {
    return apiCall(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Written Reviews API functions
export const writtenReviewsAPI = {
  getAllWrittenReviews: async () => {
    return apiCall('/written-reviews', {
      method: 'GET',
    });
  },

  getAllWrittenReviewsAdmin: async (status = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return apiCall(`/written-reviews/admin?${params.toString()}`, {
      method: 'GET',
    });
  },

  getWrittenReviewById: async (id) => {
    return apiCall(`/written-reviews/${id}`, {
      method: 'GET',
    });
  },

  createWrittenReview: async (writtenReviewData) => {
    return apiCall('/written-reviews', {
      method: 'POST',
      body: JSON.stringify(writtenReviewData),
    });
  },

  updateWrittenReview: async (id, writtenReviewData) => {
    return apiCall(`/written-reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(writtenReviewData),
    });
  },

  deleteWrittenReview: async (id) => {
    return apiCall(`/written-reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// Enquiries API functions
export const enquiriesAPI = {
  createEnquiry: async (enquiryData) => {
    return apiCall('/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiryData),
    });
  },
};

export default API_BASE_URL;
