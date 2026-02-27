import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getApiKey } from "./apiKeyManager";

const NCP_REGION = import.meta.env.VITE_NCP_REGION as string;
const NCP_ENDPOINT = import.meta.env.VITE_NCP_ENDPOINT as string;
const NCP_BUCKET_NAME = import.meta.env.VITE_NCP_BUCKET_NAME as string;
const NCP_BUCKET_PREFIX = import.meta.env.VITE_NCP_BUCKET_PREFIX as string;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

let s3Client: S3Client | null = null;
let lastCredentials = "";

function getNcpCredentials() {
  return {
    accessKey: getApiKey("ncp_access_key"),
    secretKey: getApiKey("ncp_secret_key"),
  };
}

function getS3Client(): S3Client {
  const creds = getNcpCredentials();
  const currentCredentials = `${creds.accessKey}:${creds.secretKey}`;

  if (!s3Client || lastCredentials !== currentCredentials) {
    s3Client = new S3Client({
      region: NCP_REGION,
      endpoint: NCP_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: creds.accessKey,
        secretAccessKey: creds.secretKey,
      },
    });
    lastCredentials = currentCredentials;
  }
  return s3Client;
}

function generateObjectKey(fileName?: string): string {
  const now = new Date();
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");

  if (fileName) {
    const sanitized = fileName.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_\-]/g, "_");
    return `${NCP_BUCKET_PREFIX}/${sanitized}_${timestamp}.webp`;
  }

  const randomBytes = crypto.getRandomValues(new Uint8Array(4));
  const randomId = Array.from(randomBytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `${NCP_BUCKET_PREFIX}/${timestamp}_${randomId}.webp`;
}

export function isStorageConfigured(): boolean {
  const creds = getNcpCredentials();
  return Boolean(creds.accessKey && creds.secretKey);
}

export async function uploadImageToStorage(
  blob: Blob,
  fileName?: string,
): Promise<{ cdnUrl: string; objectKey: string }> {
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error(
      `파일 크기가 ${MAX_FILE_SIZE / 1024 / 1024}MB를 초과합니다.`,
    );
  }

  if (blob.type && !ALLOWED_TYPES.includes(blob.type)) {
    throw new Error(`지원하지 않는 파일 형식입니다: ${blob.type}`);
  }

  const objectKey = generateObjectKey(fileName);
  const arrayBuffer = await blob.arrayBuffer();

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: NCP_BUCKET_NAME,
      Key: objectKey,
      Body: new Uint8Array(arrayBuffer),
      ContentType: blob.type || "image/jpeg",
      ACL: "public-read",
    }),
  );

  const cdnUrl = `${NCP_ENDPOINT}/${NCP_BUCKET_NAME}/${objectKey}`;

  return { cdnUrl, objectKey };
}
