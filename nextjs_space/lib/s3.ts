
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, NoSuchKey, S3ServiceException } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

function handleS3Error(error: any, operation: string): never {
  console.error(`S3 ${operation} error:`, error);
  
  if (error instanceof NoSuchKey || error?.name === 'NoSuchKey') {
    throw new Error(`File not found`);
  }
  
  if (error instanceof S3ServiceException || error?.name === 'AccessDenied') {
    throw new Error(`Access denied. Please check S3 permissions.`);
  }
  
  if (error?.name === 'NoSuchBucket') {
    throw new Error(`Storage bucket not found. Please check configuration.`);
  }
  
  if (error?.name === 'EntityTooLarge') {
    throw new Error(`File is too large for upload.`);
  }
  
  if (error?.name === 'InvalidObjectState') {
    throw new Error(`File is in an invalid state. Please try again.`);
  }
  
  // Generic error
  throw new Error(`Failed to ${operation}. Please try again later.`);
}

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Invalid file: buffer is empty");
  }
  
  if (!fileName || fileName.trim() === '') {
    throw new Error("Invalid file: filename is required");
  }

  try {
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folderPrefix}uploads/${Date.now()}-${sanitizedFileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf', // Default, will be set dynamically
    });

    await s3Client.send(command);
    return key; // This is the cloud_storage_path
  } catch (error) {
    handleS3Error(error, 'upload file');
  }
}

export async function downloadFile(key: string): Promise<string> {
  if (!key || key.trim() === '') {
    throw new Error("Invalid file: key is required");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    handleS3Error(error, 'generate download URL');
  }
}

export async function deleteFile(key: string): Promise<void> {
  if (!key || key.trim() === '') {
    throw new Error("Invalid file: key is required");
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    handleS3Error(error, 'delete file');
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
  if (!oldKey || oldKey.trim() === '') {
    throw new Error("Invalid file: old key is required");
  }
  
  if (!newKey || newKey.trim() === '') {
    throw new Error("Invalid file: new key is required");
  }

  try {
    // Get the object
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    });
    
    const response = await s3Client.send(getCommand);
    
    if (!response.Body) {
      throw new Error("File not found");
    }

    // Convert stream to buffer
    const buffer = await streamToBuffer(response.Body as any);
    
    // Upload with new key
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: newKey,
      Body: buffer,
      ContentType: response.ContentType,
    });
    
    await s3Client.send(putCommand);
    
    // Delete old file
    await deleteFile(oldKey);
    
    return newKey;
  } catch (error) {
    handleS3Error(error, 'rename file');
  }
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
