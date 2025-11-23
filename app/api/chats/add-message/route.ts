// app/api/chats/add-message/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";
import { Message } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId, message } = body as { chatId: string; message: Message };

    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing chatId or message" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    message.createdAt = message.createdAt ?? now;

    const client = await clientPromise;
    const db = client.db("rasphia");

    await db
      .collection("chats")
      .updateOne(
        { _id: new ObjectId(chatId) },
        { $push: { messages: message } as any, $set: { updatedAt: now } }
      );

    const updated = await db
      .collection("chats")
      .findOne({ _id: new ObjectId(chatId) });
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
