// app/api/chats/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const q = String(req.nextUrl.searchParams.get("q") ?? "").trim();
    const email = String(req.nextUrl.searchParams.get("email") ?? "");
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("rasphia");
    if (!q) {
      const chats = await db
        .collection("chats")
        .find({ userEmail: email })
        .sort({ updatedAt: -1 })
        .toArray();
      return NextResponse.json(chats);
    }

    // Simple text search across titles and messages (escape for regex)
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");

    const chats = await db
      .collection("chats")
      .find({
        userEmail: email,
        $or: [
          { title: { $regex: regex } },
          { "messages.text": { $regex: regex } },
        ],
      })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(chats);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
