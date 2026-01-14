import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { saveRecipeImage } from '@/lib/storage';

/**
 * POST /api/uploads
 * Upload an image file for use in rich text editors (Trix attachments)
 * Returns { url, href } for Trix attachment compatibility
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Convert to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveRecipeImage(buffer);

    // Return in Trix-compatible format
    return NextResponse.json({ url, href: url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
