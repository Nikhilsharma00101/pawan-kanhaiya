import { connectDB } from "@/lib/mongodb";
import BhajanPart from "@/models/BhajanPart";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params; // ✅ IMPORTANT
  const { title } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const updated = await BhajanPart.findByIdAndUpdate(
    id,
    { title: title.trim() },
    { new: true }
  );

  return NextResponse.json(updated);
}
