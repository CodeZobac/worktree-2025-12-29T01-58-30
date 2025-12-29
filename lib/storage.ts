import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir(dirPath: string) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

export async function saveRecipeImage(file: Buffer | string): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    const subDir = 'recipes';
    const dirPath = path.join(UPLOAD_DIR, subDir);
    const filePath = path.join(dirPath, fileName);

    await ensureDir(dirPath);

    let buffer: Buffer;
    if (typeof file === 'string') {
        // Assist handling base64 strings if passed directly
        const base64Data = file.split(';base64,').pop();
        if (!base64Data) throw new Error('Invalid base64 string');
        buffer = Buffer.from(base64Data, 'base64');
    } else {
        buffer = file;
    }

    // Optimize image: resize to reasonable max width, convert to webp for performance
    await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);

    // Return public URL path
    return `/uploads/${subDir}/${fileName}`;
}

export async function saveProfileImage(file: Buffer | string): Promise<string> {
    const fileName = `${uuidv4()}.webp`;
    const subDir = 'profiles';
    const dirPath = path.join(UPLOAD_DIR, subDir);
    const filePath = path.join(dirPath, fileName);

    await ensureDir(dirPath);

    let buffer: Buffer;
    if (typeof file === 'string') {
        const base64Data = file.split(';base64,').pop();
        if (!base64Data) throw new Error('Invalid base64 string');
        buffer = Buffer.from(base64Data, 'base64');
    } else {
        buffer = file;
    }

    // Optimize avatar: smaller square, webp
    await sharp(buffer)
        .resize(400, 400, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(filePath);

    return `/uploads/${subDir}/${fileName}`;
}

export async function deleteImage(publicUrl: string): Promise<void> {
    if (!publicUrl.startsWith('/uploads/')) return; // Not a local file

    const relativePath = publicUrl.replace(/^\/uploads\//, '');
    const filePath = path.join(UPLOAD_DIR, relativePath);

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.warn(`Failed to delete local image: ${filePath}`, error);
        // Suppress error as it might be already deleted or not strictly critical
    }
}
