// app/api/tools/get-analysis/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("analysisId");
  if (!id)
    return NextResponse.json({ error: "Missing analysisId" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("rasphia");

  const doc = await db.collection("analyses").findOne({ analysisId: id });
  return NextResponse.json(doc);
}
