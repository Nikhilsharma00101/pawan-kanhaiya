import { connectDB } from "@/lib/mongodb";
import BhajanPart from "@/models/BhajanPart";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { title } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Part title is required" },
      { status: 400 }
    );
  }

  const lastPart = await BhajanPart.findOne().sort({ order: -1 });
  const nextOrder = lastPart ? lastPart.order + 1 : 1;

  const part = await BhajanPart.create({
    title: title.trim(),
    order: nextOrder,
    bhajans: [],
  });

  return NextResponse.json(part);
}
