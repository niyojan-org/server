import { v2 as cloudinary } from 'cloudinary';
import { CloudneraryUploadResult } from '../types/generated-assets.upload';
import fs from 'fs/promises';
import path from 'path';

class GeneratedAssetStorageService {
  static async cloudinaryUpload(
    buffer: Buffer,
    publicId: string,
    folder: string,
  ): Promise<CloudneraryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: 'image', format: 'png' },
        (error, result) => {
          if (error || !result) {
            reject(new Error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`));
            return;
          }
          resolve({
            url: result.secure_url ?? result.url,
            publicId: result.public_id,
            bytes: result.bytes ?? buffer.byteLength,
            format: result.format ?? 'png',
          });
        },
      );
      stream.end(buffer);
    });
  }
  static async localUpload(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<{ path: string; size: number }> {
    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const targetDirectory = path.join(uploadsRoot, folder);
    await fs.mkdir(targetDirectory, { recursive: true });
    const normalizedFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    const filePath = path.join(targetDirectory, normalizedFilename);
    await fs.writeFile(filePath, buffer);

    return { path: filePath, size: buffer.byteLength };
  }
}

export default GeneratedAssetStorageService;