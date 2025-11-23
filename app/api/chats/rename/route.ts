// app/api/chats/rename/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Body: { chatId, title? }
 * If title omitted, server generates a title from last user message.
 */
export async function POST(req: NextRequest) {
  try {
    const { chatId, title } = await req.json();

    if (!chatId)
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("rasphia");
    const coll = db.collection("chats");

    if (title) {
      await coll.updateOne(
        { _id: new ObjectId(chatId) },
        { $set: { title, updatedAt: new Date().toISOString() } }
      );
      return NextResponse.json({ ok: true, title }, { status: 200 });
    }

    // auto-generate title: take last user message or first user message (shortened)
    const chat = await coll.findOne({ _id: new ObjectId(chatId) });
    const messages = chat?.messages ?? [];
    let candidate = messages
      .slice()
      .reverse()
      .find((m: any) => m.author === "user")?.text;
    if (!candidate)
      candidate =
        messages.find((m: any) => m.author === "user")?.text ?? "Conversation";
    const generated = candidate.trim().slice(0, 60).replace(/\n/g, " ");
    const finalTitle = generated.length ? generated : "Conversation";

    await coll.updateOne(
      { _id: new ObjectId(chatId) },
      { $set: { title: finalTitle, updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ ok: true, title: finalTitle }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
