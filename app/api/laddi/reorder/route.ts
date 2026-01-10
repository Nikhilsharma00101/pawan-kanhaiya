import { connectDB } from "@/lib/mongodb";
import BhajanPart from "@/models/BhajanPart";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  await connectDB();

  const {
    sourcePartId,
    targetPartId,
    activeId,
    overId,
  } = await req.json();

  if (!sourcePartId || !targetPartId || !activeId || !overId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sourcePart = await BhajanPart.findById(sourcePartId);
  const targetPart =
    sourcePartId === targetPartId
      ? sourcePart
      : await BhajanPart.findById(targetPartId);

  if (!sourcePart || !targetPart) {
    return NextResponse.json({ error: "Part not found" }, { status: 404 });
  }

  // 🔍 find indices FROM DB STATE
  const sourceIndex = sourcePart.bhajans.findIndex(
    (b: any) => String(b.bhajanId) === activeId
  );

  const targetIndex = targetPart.bhajans.findIndex(
    (b: any) => String(b.bhajanId) === overId
  );

  if (sourceIndex === -1 || targetIndex === -1) {
    return NextResponse.json({ error: "Bhajan not found" }, { status: 404 });
  }

  // 🧠 SAME PART — PURE REORDER
  if (sourcePartId === targetPartId) {
    const [moved] = sourcePart.bhajans.splice(sourceIndex, 1);
    sourcePart.bhajans.splice(targetIndex, 0, moved);
  }
  // 🧠 CROSS PART MOVE
  else {
    const [moved] = sourcePart.bhajans.splice(sourceIndex, 1);
    targetPart.bhajans.splice(targetIndex, 0, moved);
  }

  // 🔁 reindex orders (CRITICAL)
  sourcePart.bhajans.forEach((b: any, i: number) => (b.order = i + 1));
  if (sourcePartId !== targetPartId) {
    targetPart.bhajans.forEach((b: any, i: number) => (b.order = i + 1));
  }

  await sourcePart.save();
  if (sourcePartId !== targetPartId) await targetPart.save();

  return NextResponse.json({ success: true });
}
