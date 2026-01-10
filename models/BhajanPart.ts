import mongoose from "mongoose";

const BhajanPartSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },

    // Each part contains multiple bhajans, stored as reference + order
    bhajans: [
      {
        bhajanId: { type: mongoose.Schema.Types.ObjectId, ref: "Bhajan" },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.BhajanPart ||
  mongoose.model("BhajanPart", BhajanPartSchema);
