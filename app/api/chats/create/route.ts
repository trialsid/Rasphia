// app/api/chats/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ChatSession, Message } from "@/app/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, initialMessage } = body;

    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const now = new Date().toISOString();
    const firstMessage: Message = initialMessage ?? {
      author: "ai",
      text: "Hello — tell me what you're looking for and I'll find the best picks.",
      createdAt: now,
    };

    const newChat: Omit<ChatSession, "_id"> = {
      userEmail: email,
      title: "New conversation",
      createdAt: now,
      updatedAt: now,
      messages: [firstMessage],
    };

    const client = await clientPromise;
    const db = client.db("rasphia");
    const res = await db.collection("chats").insertOne(newChat);

    return NextResponse.json(
      { ...newChat, _id: res.insertedId },
      { status: 201 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
