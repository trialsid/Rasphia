import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const { chatId, title } = await req.json();

    if (!chatId || typeof title !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("rasphia");

    await db.collection("chats").updateOne(
      { _id: new ObjectId(chatId) },
      {
        $set: {
          title: title.trim() || "Untitled",
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to update:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
