// app/api/tools/create-analysis/route.ts
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import clientPromise from "@/app/lib/mongodb";
import { put } from "@vercel/blob";
import { GoogleGenAI } from "@google/genai";
import {
  BASE_RULES,
  SKIN_RULES,
  HAIR_RULES,
  BODY_RULES,
  PRODUCT_RULES,
  OUTPUT_FORMATS,
} from "@/utils/promptModules";

export const runtime = "nodejs";

// ----------------------------
// FIXED: TYPE-SAFE TOOL MAPS
// ----------------------------
const TOOL_RULE_MAP: Record<
  "skin" | "hair" | "body" | "similar" | string,
  string
> = {
  skin: SKIN_RULES,
  hair: HAIR_RULES,
  body: BODY_RULES,
  similar: PRODUCT_RULES,
  default: "",
};

const TOOL_OUTPUT_MAP: Record<
  "skin" | "hair" | "body" | "similar" | string,
  string
> = {
  skin: OUTPUT_FORMATS.skin,
  hair: OUTPUT_FORMATS.hair,
  body: OUTPUT_FORMATS.body,
  similar: OUTPUT_FORMATS.similar,
  default: OUTPUT_FORMATS.default,
};

// ----------------------------
// PROMPT BUILDER
// ----------------------------
function buildPrompt(type: string) {
  return `
${BASE_RULES}

${TOOL_RULE_MAP[type] || TOOL_RULE_MAP.default}

Return ONLY JSON in this shape:
${TOOL_OUTPUT_MAP[type] || TOOL_OUTPUT_MAP.default}
  `;
}

// ----------------------------
// MAIN ROUTE HANDLER
// ----------------------------
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail)
      return NextResponse.json(
        { error: "Missing user email" },
        { status: 401 }
      );

    const file = form.get("file") as File | null;
    const type = String(form.get("tool") || "skin");
    const blur = form.get("blurSensitive") === "true";

    if (!file || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ----------------------------
    // IMAGE → BUFFER → COMPRESS
    // ----------------------------
    const arrBuff = await file.arrayBuffer();
    let buffer = Buffer.from(arrBuff) as any;

    buffer = await sharp(buffer).rotate().jpeg({ quality: 85 }).toBuffer();

    // ----------------------------
    // SAVE TO VERCEL BLOB
    // ----------------------------
    const blobName = `analysis-${uuid()}.jpg`;
    const uploaded = await put(blobName, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    const fileUrl = uploaded.url;

    // ----------------------------
    // PREPARE IMAGE FOR GEMINI
    // inlineData REQUIRED
    // ----------------------------
    const base64Image = buffer.toString("base64");

    const finalPrompt = buildPrompt(type);

    // ----------------------------
    // GEMINI CALL (WORKING)
    // ----------------------------
    let parsedResult: any = {};
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: finalPrompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      const raw = result.text as string;
      const cleaned = raw.replace(/```json|```/g, "").trim();

      parsedResult = JSON.parse(cleaned);
      console.log("The analysisi is:", raw, cleaned, parsedResult);
    } catch (err) {
      console.error("Gemini error:", err);
      parsedResult = {
        summary: "Could not analyze the image.",
        suggestions: "Please try uploading a clearer image.",
        optimizedPrompt: "Analyze the image for general patterns only.",
      };
    }

    // ----------------------------
    // SAVE TO MONGODB
    // ----------------------------
    const client = await clientPromise;
    const db = client.db("rasphia");

    const analysisId = uuid();
    const now = new Date().toISOString();

    const doc = {
      analysisId,
      userEmail,
      type,
      fileUrl,
      blurSensitive: blur,
      aiResult: parsedResult,
      chatRefs: [],
      createdAt: now,
      updatedAt: now,
      title: `${type} analysis (${now.slice(0, 10)})`,
    };

    await db.collection("analyses").insertOne(doc);

    return NextResponse.json({ ok: true, analysis: doc });
  } catch (err) {
    console.error("Create-analysis fatal error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
