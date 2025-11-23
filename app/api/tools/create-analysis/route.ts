// app/api/tools/create-analysis/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import clientPromise from "@/app/lib/mongodb";
import { uploadToVercelBlob } from "@/utils/storage";
import { embedQuery } from "@/app/lib/queryEmbeddings";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs"; // Sharp needs Node

export async function POST(req: Request) {
  const userEmail = req.headers.get("x-user-email");
  if (!userEmail)
    return NextResponse.json({ error: "Missing user email" }, { status: 401 });

  // 💡 Parse multipart form-data WITHOUT formidable
  const form = await req.formData();

  const file = form.get("file") as File | null;
  const tool = (form.get("tool") as string) || "custom";
  const notes = (form.get("notes") as string) || "";

  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  // Validate file type
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported image format" },
      { status: 400 }
    );
  }

  // Convert to ArrayBuffer → Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Sanitize / compress
  const sanitized = await sharp(buffer)
    .rotate()
    .jpeg({ quality: 90 })
    .toBuffer();

  // Upload to Vercel Blob
  const fileUrl = await uploadToVercelBlob(sanitized, "image/jpeg");

  // Generate embedding
  const prompt = `Analyse this image in context of ${tool}. Notes: ${
    notes || "none"
  }`;
  const embedding = await embedQuery(prompt).catch(() => null);

  // Gemini analysis
  let aiResult = null;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ text: prompt }, { text: `Image: ${fileUrl}` }],
    });
    aiResult = { text: result.text };
    console.log(JSON.stringify(aiResult));
  } catch (err) {
    console.error("Gemini error:", err);
  }

  // Save to DB
  const now = new Date().toISOString();
  const analysisId = uuidv4();

  const client = await clientPromise;
  const db = client.db("rasphia");

  const doc = {
    analysisId,
    userEmail,
    tool,
    fileUrl,
    prompt,
    embedding,
    aiResult,
    notes,
    chatRefs: [],
    createdAt: now,
    updatedAt: now,
    title: `${tool} analysis (${now.slice(0, 10)})`,
  };

  await db.collection("analyses").insertOne(doc);

  return NextResponse.json({ ok: true, analysis: doc });
}
