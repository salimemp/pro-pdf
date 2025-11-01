
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client, getBucketConfig } from "./aws-config";

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  try {
    const key = `${folderPrefix}uploads/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf', // Default, will be set dynamically
    });

    await s3Client.send(command);
    return key; // This is the cloud_storage_path
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file");
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
    return signedUrl;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error("Failed to generate download URL");
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file");
  }
}

export async function renameFile(oldKey: string, newKey: string): Promise<string> {
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
    console.error("Error renaming file:", error);
    throw new Error("Failed to rename file");
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
