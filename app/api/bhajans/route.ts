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
  const newBhajan = await Bhajan.create(data);
  return NextResponse.json(newBhajan);
}
