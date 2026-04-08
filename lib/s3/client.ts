import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(contentType)) {
      return {
        url: null,
        error: "Invalid file type. Only MP4, WebM, and MOV are allowed.",
      };
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { url, error: null };
  } catch (error) {
    console.error("[S3] Error generating upload URL:", error);
    return { url: null, error: "Failed to generate upload URL" };
  }
}

export async function getPresignedDownloadUrl(
  key: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return { url, error: null };
  } catch (error) {
    console.error("[S3] Error generating download URL:", error);
    return { url: null, error: "Failed to generate download URL" };
  }
}

export function generateVideoKey(userId: string, skillId: string): string {
  const timestamp = Date.now();
  return `evidence-videos/${userId}/${skillId}/${timestamp}.mp4`;
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}
