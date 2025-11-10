import { connectDB } from "@/lib/mongodb";
import Bhajan from "@/models/Bhajan";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const data = await req.json();

    // Remove undefined or null fields
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined && v !== null)
    );

    const updatedBhajan = await Bhajan.findByIdAndUpdate(
      id,
      { $set: filteredData },
      { new: true }
    );

    if (!updatedBhajan) {
      return NextResponse.json({ message: "Bhajan not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBhajan);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedBhajan = await Bhajan.findByIdAndDelete(id);

    if (!deletedBhajan) {
      return NextResponse.json({ message: "Bhajan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bhajan deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
