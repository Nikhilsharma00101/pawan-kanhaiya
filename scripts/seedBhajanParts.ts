import mongoose from "mongoose";
import Bhajan from "../models/Bhajan";
import BhajanPart from "../models/BhajanPart";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const bhajans = await Bhajan.find().sort({ order: 1 });

  // Example: create parts of 10 bhajans each
  const PART_SIZE = 10;
  const parts = [];

  for (let i = 0; i < bhajans.length; i += PART_SIZE) {
    parts.push({
      title: `भाग ${i / PART_SIZE + 1}`,
      order: i / PART_SIZE + 1,
      bhajans: bhajans
        .slice(i, i + PART_SIZE)
        .map((b, index) => ({ bhajanId: b._id, order: index + 1 })),
    });
  }

  await BhajanPart.insertMany(parts);
  console.log("Bhajan parts seeded successfully!");

  mongoose.disconnect();
}

main().catch(console.error);