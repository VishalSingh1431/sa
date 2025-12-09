import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testCloudinary() {
  console.log('🔍 Testing Cloudinary Configuration...\n');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  console.log('Environment Variables:');
  console.log('  CLOUDINARY_CLOUD_NAME:', cloudName || '❌ NOT SET');
  console.log('  CLOUDINARY_API_KEY:', apiKey ? `${apiKey.substring(0, 8)}...` : '❌ NOT SET');
  console.log('  CLOUDINARY_API_SECRET:', apiSecret ? `${apiSecret.substring(0, 8)}...` : '❌ NOT SET');
  console.log('');

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Missing Cloudinary credentials!');
    console.error('   Please set all three variables in backend/.env file');
    process.exit(1);
  }

  // Validate credential formats
  console.log('Validating credential formats...');
  if (cloudName.length < 3) {
    console.error('❌ CLOUDINARY_CLOUD_NAME seems too short');
  }
  if (apiKey.length < 10) {
    console.error('❌ CLOUDINARY_API_KEY seems too short (should be ~20 characters)');
  }
  if (apiSecret.length < 20) {
    console.error('⚠️  WARNING: CLOUDINARY_API_SECRET seems too short!');
    console.error('   API Secret should be 20+ characters long');
    console.error('   Current length:', apiSecret.length);
    console.error('   Make sure you copied the ENTIRE API Secret from Cloudinary dashboard');
    console.error('');
  } else {
    console.log('✅ Credential lengths look good');
  }
  console.log('');

  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('✅ Configuration loaded');
    console.log('🔐 Testing authentication...\n');

    // Test authentication by uploading a small test image
    try {
      // Create a tiny 1x1 pixel PNG in base64
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const buffer = Buffer.from(testImage, 'base64');
      
      console.log('   Testing with a small image upload...');
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'test',
            resource_type: 'image',
            public_id: `test_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        uploadStream.end(buffer);
      });
      
      console.log('✅ Cloudinary authentication successful!');
      console.log('   Test upload successful');
      console.log('   Public ID:', uploadResult.public_id);
      
      // Clean up test image
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('   Test image cleaned up');
      } catch (cleanupError) {
        console.log('   (Could not clean up test image, but that\'s okay)');
      }
      
      console.log('\n🎉 Your Cloudinary credentials are correct!');
      process.exit(0);
    } catch (uploadError) {
      // If upload fails, try API ping
      console.log('   Upload test failed, trying API ping...');
      try {
        const result = await cloudinary.api.ping();
        if (result && result.status === 'ok') {
          console.log('✅ Cloudinary authentication successful!');
          console.log('   Status:', result.status);
          console.log('\n🎉 Your Cloudinary credentials are correct!');
          process.exit(0);
        }
      } catch (pingError) {
        throw uploadError; // Throw original upload error
      }
    }
  } catch (error) {
    console.error('❌ Cloudinary authentication failed!');
    
    // Extract error details
    const errorMessage = error.message || error.toString() || 'Unknown error';
    const httpCode = error.http_code;
    const errorInfo = error.error || {};
    
    console.error('   Error Message:', errorMessage);
    if (httpCode) {
      console.error('   HTTP Code:', httpCode);
    }
    if (Object.keys(errorInfo).length > 0) {
      console.error('   Error Details:', JSON.stringify(errorInfo, null, 2));
    }
    console.error('   Full Error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Check for specific error types
    const errorStr = JSON.stringify(error).toLowerCase();
    const hasInvalidSignature = errorMessage?.includes('Invalid Signature') || 
                                 errorStr.includes('invalid signature') ||
                                 httpCode === 401;
    
    if (hasInvalidSignature) {
      console.error('\n💡 This usually means:');
      console.error('   1. Your CLOUDINARY_API_SECRET is incorrect');
      console.error('   2. The API secret doesn\'t match the API key');
      console.error('   3. There might be extra spaces in your .env file');
      console.error('   4. You might have copied the API Key instead of API Secret');
      console.error('\n📝 How to fix:');
      console.error('   1. Go to https://console.cloudinary.com/');
      console.error('   2. Go to Settings > Security (or Dashboard)');
      console.error('   3. Copy the API Secret (NOT the API Key - they are different!)');
      console.error('   4. Make sure there are no spaces before/after in .env file');
      console.error('   5. Your .env should look like this (NO QUOTES, NO SPACES):');
      console.error('      CLOUDINARY_CLOUD_NAME=dtf73oqrz');
      console.error('      CLOUDINARY_API_KEY=8766614612345678');
      console.error('      CLOUDINARY_API_SECRET=PqIH8zYmYourFullSecretHere');
      console.error('');
      console.error('   ⚠️  IMPORTANT: The API Secret is LONG (usually 20+ characters)');
      console.error('      Make sure you copied the ENTIRE secret, not just part of it!');
      console.error('   6. After updating, restart your backend server');
    } else {
      console.error('\n💡 Possible issues:');
      console.error('   1. Network connectivity problem');
      console.error('   2. Cloudinary service is down');
      console.error('   3. Invalid credentials format');
      console.error('\n📝 Try:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify credentials at https://console.cloudinary.com/');
      console.error('   3. Make sure .env file is in the backend/ directory');
    }
    
    process.exit(1);
  }
}

testCloudinary();
