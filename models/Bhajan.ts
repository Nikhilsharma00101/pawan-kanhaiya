import mongoose from "mongoose";

const BhajanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    lyrics: { type: String, required: true },
    description: { type: String },
    language: { type: String, default: "Hindi" },

    //  NEW FIELD FOR DRAG ORDER
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Bhajan ||
  mongoose.model("Bhajan", BhajanSchema);
