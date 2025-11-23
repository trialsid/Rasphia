// app/api/chats/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    if (!chatId)
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("rasphia");

    await db.collection("chats").deleteOne({ _id: new ObjectId(chatId) });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
