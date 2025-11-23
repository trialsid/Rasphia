// app/api/chats/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { ChatSession } from "@/app/types";

export async function GET(req: NextRequest) {
  try {
    const email = String(req.nextUrl.searchParams.get("email") ?? "");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("rasphia");
    const chats = await db
      .collection<ChatSession>("chats")
      .find({ userEmail: email })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json(chats, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
