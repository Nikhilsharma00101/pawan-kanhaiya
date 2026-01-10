import { connectDB } from "@/lib/mongodb";
import BhajanPart from "@/models/BhajanPart";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { title } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  const updated = await BhajanPart.findByIdAndUpdate(
    params.id,
    { title: title.trim() },
    { new: true }
  );

  return NextResponse.json(updated);
}
