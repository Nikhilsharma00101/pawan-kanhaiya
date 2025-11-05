import mongoose from "mongoose";

const BhajanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    lyrics: { type: String, required: true },
    description: { type: String },
    language: { type: String, default: "Hindi" },
  },
  { timestamps: true }
);

export default mongoose.models.Bhajan || mongoose.model("Bhajan", BhajanSchema);
