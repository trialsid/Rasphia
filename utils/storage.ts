// src/utils/storage.ts
import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";

export async function uploadToVercelBlob(buffer: Buffer, contentType: string) {
  const filename = `analyses/${uuidv4()}.${
    contentType.includes("png") ? "png" : "jpg"
  }`;

  const { url } = await put(filename, buffer, {
    access: "public", // publicly accessible image
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN!,
  });

  return url; // Full CDN URL
}
