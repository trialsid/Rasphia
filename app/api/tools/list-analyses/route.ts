// app/api/tools/list-analyses/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email)
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db("rasphia");

  const docs = await db
    .collection("analyses")
    .find({ userEmail: email })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(docs);
}
