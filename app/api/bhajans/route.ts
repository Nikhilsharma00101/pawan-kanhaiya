import { connectDB } from "@/lib/mongodb";
import Bhajan from "@/models/Bhajan";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const bhajans = await Bhajan.find().sort({ createdAt: -1 });
  return NextResponse.json(bhajans);
}

export async function POST(req: Request) {
  await connectDB();
  const data = await req.json();

  if (!data.title?.trim() || !data.lyrics?.trim() || !data.category?.trim()) {
    return NextResponse.json(
      { error: "Title, lyrics and category are required" },
      { status: 400 }
    );
  }

  const newBhajan = await Bhajan.create({
    ...data,
    title: data.title.trim(),
    category: data.category.trim(),
    lyrics: data.lyrics.trim(),
  });

  return NextResponse.json(newBhajan);
}
