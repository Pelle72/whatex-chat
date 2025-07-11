import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { setupStaticServing } from './static-serve.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contacts.js';
import chatManagementRoutes from './routes/chats.js';

// Load environment variables FIRST - before any other imports
console.log('📍 Loading environment variables...');
dotenv.config();

console.log('🔧 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATA_DIRECTORY:', process.env.DATA_DIRECTORY);

// Enhanced API key logging (no encryption for now)
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
console.log('🔑 GOOGLE_GEMINI_API_KEY check:');
console.log('  - Present:', !!apiKey);
console.log('  - Length:', apiKey ? apiKey.length : 0);

if (!apiKey) {
  console.log('❌ GOOGLE_GEMINI_API_KEY is missing from environment');
} else if (apiKey === 'your_google_gemini_api_key_here' || apiKey === 'your_actual_api_key_here') {
  console.log('❌ GOOGLE_GEMINI_API_KEY is still set to placeholder value');
} else {
  // Check API key format
  console.log('🔓 API key appears to be configured');
  console.log('  - Starts with AIza:', apiKey.startsWith('AIza'));
  console.log('  - Length check:', apiKey.length >= 35 ? 'OK' : 'Too short');
  console.log('  - Preview:', apiKey.substring(0, 20) + '...');
  
  if (apiKey.startsWith('AIza') && apiKey.length >= 35) {
    console.log('✅ GOOGLE_GEMINI_API_KEY appears to be properly configured');
  } else {
    console.log('❌ GOOGLE_GEMINI_API_KEY has invalid format');
  }
}

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure data directory exists
const dataDir = process.env.DATA_DIRECTORY || './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory:', dataDir);
}

// Serve uploaded files (create directory if needed)
const uploadsPath = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory:', uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/chats', chatManagementRoutes);

// Health check endpoint (simplified without encryption)
app.get('/api/health', (req: express.Request, res: express.Response) => {
  const hasValidKey = !!apiKey && 
                     apiKey !== 'your_google_gemini_api_key_here' &&
                     apiKey !== 'your_actual_api_key_here' &&
                     apiKey.startsWith('AIza') &&
                     apiKey.length >= 35;

  res.json({ 
    status: 'ok', 
    message: 'API is running',
    hasGeminiKey: hasValidKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    encryptionStatus: 'disabled',
    keyFormat: hasValidKey ? 'valid' : 'invalid'
  });
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`🚀 API Server running on port ${port}`);
      
      const hasValidKey = !!apiKey && 
                         apiKey !== 'your_google_gemini_api_key_here' &&
                         apiKey !== 'your_actual_api_key_here' &&
                         apiKey.startsWith('AIza') &&
                         apiKey.length >= 35;
      
      if (hasValidKey) {
        console.log(`✅ Google Gemini API integration ready`);
        console.log(`🤖 AI-powered responses enabled`);
        console.log(`🔓 API key encryption: Disabled (using plain text)`);
      } else {
        console.log(`⚠️  Google Gemini API key not properly configured`);
        console.log(`📝 Using fallback responses based on personality types`);
        console.log(`🔧 To enable AI responses:`);
        console.log(`   1. Get your API key from: https://makersuite.google.com/app/apikey`);
        console.log(`   2. Add it to your .env file:`);
        console.log(`      GOOGLE_GEMINI_API_KEY=your_actual_api_key_here`);
        console.log(`   3. Restart the server`);
      }
      
      console.log(`📁 Data directory: ${dataDir}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
