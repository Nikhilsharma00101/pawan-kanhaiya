import { connectDB } from "@/lib/mongodb";
import Bhajan from "@/models/Bhajan";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { order } = await req.json();

  if (!Array.isArray(order)) {
    return NextResponse.json(
      { error: "Invalid order data" },
      { status: 400 }
    );
  }

  const bulkOps = order.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: item.order } },
    },
  }));

  await Bhajan.bulkWrite(bulkOps);

  return NextResponse.json({ success: true });
}
