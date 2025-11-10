import { connectDB } from "@/lib/mongodb";
import Bhajan from "@/models/Bhajan";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await req.json();
    const updatedBhajan = await Bhajan.findByIdAndUpdate(params.id, data, { new: true });

    if (!updatedBhajan) {
      return NextResponse.json({ message: "Bhajan not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBhajan);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedBhajan = await Bhajan.findByIdAndDelete(params.id);

    if (!deletedBhajan) {
      return NextResponse.json({ message: "Bhajan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bhajan deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
