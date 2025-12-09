import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.');
  }
  
  // Check for common mistakes
  if (cloudName.includes(' ') || apiKey.includes(' ') || apiSecret.includes(' ')) {
    throw new Error('Cloudinary credentials contain spaces. Please remove any spaces from your .env file values.');
  }
  
  return { cloudName, apiKey, apiSecret };
};

// Configure Cloudinary
let cloudinaryConfigured = false;
try {
  const { cloudName, apiKey, apiSecret } = validateCloudinaryConfig();
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  
  cloudinaryConfigured = true;
  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud Name:', cloudName);
  console.log('   API Key:', `${apiKey.substring(0, 8)}...`);
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error.message);
  console.error('   Please check your .env file in the backend directory');
  console.error('   Required variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  cloudinaryConfigured = false;
}

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Folder path in Cloudinary (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadImage = async (fileBuffer, folder = 'varanasihub/images', publicId = null) => {
  if (!cloudinaryConfigured) {
    const { cloudName, apiKey, apiSecret } = validateCloudinaryConfig();
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
  
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer provided');
  }

  // Verify Cloudinary config is actually set
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error('Cloudinary is not properly configured. Please check your environment variables.');
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'image',
      };

      // Only add public_id if provided
      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      // Add transformation
      uploadOptions.transformation = [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary image upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            console.error('Error HTTP code:', error.http_code);
            console.error('Error name:', error.name);
            
            // Provide more helpful error messages
            if (error.http_code === 401 || error.message?.includes('Invalid Signature')) {
              reject(new Error('Cloudinary authentication failed. Please check your CLOUDINARY_API_SECRET in .env file. The API secret might be incorrect.'));
            } else if (error.http_code === 400) {
              reject(new Error(`Cloudinary upload failed: ${error.message || 'Invalid request'}`));
            } else {
              reject(new Error(error.message || 'Failed to upload image to Cloudinary'));
            }
          } else if (!result) {
            reject(new Error('No result returned from Cloudinary'));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);
      
      bufferStream.on('error', (err) => {
        console.error('Buffer stream error:', err);
        reject(err);
      });

      uploadStream.on('error', (err) => {
        console.error('Upload stream error:', err);
        reject(err);
      });

      bufferStream.pipe(uploadStream);
    } catch (error) {
      console.error('Error creating upload stream:', error);
      reject(error);
    }
  });
};

/**
 * Upload video to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Folder path in Cloudinary (optional)
 * @param {string} publicId - Custom public ID (optional)
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
export const uploadVideo = async (fileBuffer, folder = 'varanasihub/videos', publicId = null) => {
  validateCloudinaryConfig();
  
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer provided');
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'video',
          chunk_size: 10000000, // 10MB chunks for large videos (1GB support)
          eager: [
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary video upload error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            reject(new Error(error.message || 'Failed to upload video to Cloudinary'));
          } else if (!result) {
            reject(new Error('No result returned from Cloudinary'));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              duration: result.duration
            });
          }
        }
      );

      // Convert buffer to stream
      const bufferStream = new Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null);
      
      bufferStream.on('error', (err) => {
        console.error('Buffer stream error:', err);
        reject(err);
      });

      uploadStream.on('error', (err) => {
        console.error('Upload stream error:', err);
        reject(err);
      });

      bufferStream.pipe(uploadStream);
    } catch (error) {
      console.error('Error creating upload stream:', error);
      reject(error);
    }
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of public IDs to delete
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
export const deleteFiles = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
};

export default cloudinary;
