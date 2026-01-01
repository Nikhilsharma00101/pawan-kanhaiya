import { connectDB } from "@/lib/mongodb";
import Bhajan from "@/models/Bhajan";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const bhajans = await Bhajan.find().sort({
    category: 1,
    order: 1,
  });

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

  // 🔥 FIND LAST ORDER IN CATEGORY
  const lastBhajan = await Bhajan.findOne({
    category: data.category.trim(),
  }).sort({ order: -1 });

  const nextOrder = lastBhajan ? lastBhajan.order + 1 : 1;

  const newBhajan = await Bhajan.create({
    ...data,
    title: data.title.trim(),
    category: data.category.trim(),
    lyrics: data.lyrics.trim(),
    order: nextOrder,
  });

  return NextResponse.json(newBhajan);
}
