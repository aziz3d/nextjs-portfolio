import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Determine the upload directory based on file type
    let uploadDir = '';
    const type = fileType || formData.get('type') as string; // Support both fileType and type parameters
    
    if (type === '3d-model') {
      uploadDir = path.join(process.cwd(), 'public', 'models');
    } else if (type === 'logo') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'logos');
    } else if (type === 'favicon') {
      uploadDir = path.join(process.cwd(), 'public');
    } else if (type === 'project') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'projects');
    } else if (type === 'profile') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'profile');
    } else if (type === 'gallery') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'gallery');
    } else if (type === 'testimonials') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'testimonials');
    } else if (type === 'social-icon') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'social-icons');
    } else if (type === 'skill-icon') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'skills');
    } else {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Ensure the directory exists
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Create a safe filename
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${fileType}-${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file to the filesystem
    await writeFile(filePath, buffer);

    // Return the relative path to the file (for use in the frontend)
    let relativePath = '';
    
    if (type === '3d-model') {
      relativePath = `/models/${fileName}`;
    } else if (type === 'logo') {
      relativePath = `/images/logos/${fileName}`;
    } else if (type === 'favicon') {
      // For favicon, we'll use a standard name
      const newFileName = 'favicon.' + fileExtension;
      const faviconPath = path.join(uploadDir, newFileName);
      await writeFile(faviconPath, buffer);
      relativePath = `/${newFileName}`;
    } else if (type === 'project') {
      relativePath = `/images/projects/${fileName}`;
    } else if (type === 'profile') {
      relativePath = `/images/profile/${fileName}`;
    } else if (type === 'gallery') {
      relativePath = `/images/gallery/${fileName}`;
    } else if (type === 'testimonials') {
      relativePath = `/images/testimonials/${fileName}`;
    } else if (type === 'social-icon') {
      relativePath = `/images/social-icons/${fileName}`;
    } else if (type === 'skill-icon') {
      relativePath = `/images/skills/${fileName}`;
    }
    
    return NextResponse.json({ 
      success: true, 
      filePath: relativePath,
      originalName: originalName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Upload API is working' });
}
