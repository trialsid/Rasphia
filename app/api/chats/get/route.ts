// app/api/chats/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import { ChatSession } from "@/app/types";

export async function GET(req: NextRequest) {
  try {
    const id = String(req.nextUrl.searchParams.get("id") ?? "");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("rasphia");
    const chat = await db
      .collection<ChatSession>("chats")
      .findOne({ _id: new ObjectId(id) });

    if (!chat)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(chat, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
