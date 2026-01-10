import { connectDB } from "@/lib/mongodb";
import BhajanPart from "@/models/BhajanPart";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const parts = await BhajanPart.find()
    .sort({ order: 1 })
    .populate({
      path: "bhajans.bhajanId",  // Important: path matches the schema
      select: "title lyrics category description order",
    })
    .lean();

  // Format frontend-friendly object
  const formatted = parts.map((part: any) => ({
    _id: part._id.toString(),
    title: part.title,
    order: part.order,
    bhajans: part.bhajans
      .sort((a: any, b: any) => a.order - b.order)
      .map((b: any) => ({
        _id: b.bhajanId?._id?.toString() || "", // fallback
        title: b.bhajanId?.title || "",
        lyrics: b.bhajanId?.lyrics || "",
        category: b.bhajanId?.category || "",
        description: b.bhajanId?.description || "",
        order: b.order,
      })),
  }));

  return NextResponse.json(formatted);
}
