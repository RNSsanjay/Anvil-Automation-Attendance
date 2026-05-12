import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const modelsDir = path.join(process.cwd(), 'public', 'models');
    
    // Check if models directory exists
    let files: string[] = [];
    try {
      files = await fs.readdir(modelsDir);
    } catch (err) {
      return NextResponse.json({
        success: false,
        message: 'Models directory not found',
        path: modelsDir,
        error: String(err)
      }, { status: 404 });
    }

    // Required model files
    const requiredFiles = [
      'ssd_mobilenetv1_model-weights_manifest.json',
      'ssd_mobilenetv1_model-shard1',
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ];

    const modelStatus = requiredFiles.map(file => ({
      file,
      exists: files.includes(file),
      accessible: true // If we can read the directory, files are accessible
    }));

    const allPresent = modelStatus.every(m => m.exists);

    return NextResponse.json({
      success: allPresent,
      message: allPresent ? 'All models present' : 'Some models missing',
      modelsDirectory: modelsDir,
      totalFiles: files.length,
      filesFound: files,
      modelStatus,
      publicPath: '/models',
      deployment: process.env.VERCEL ? 'Vercel' : 'Local'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error checking models',
      error: String(error)
    }, { status: 500 });
  }
}
