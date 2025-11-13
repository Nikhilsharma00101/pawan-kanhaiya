import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Bhajan from "../../../../models/Bhajan";

export async function GET() {
    await connectDB();

    try {
        // Replace these IDs with the 9 specific bhajan _ids from your DB
        const featuredIds = [
            "69077b91743e1a593c4e4e32",
            "690b8080f6786e156cd57d9d",
            "690b877e76045505ae36f9b2",
            "690b8d822ee71874f685afd3",
            "690b9154e6a9abb0834189b8",
            "690b9b072008afe111f2d47c",
            "690b95ee0a556996b4db9734",
            "69160f28cd836af92ded0824",
            "6916104fba9581cc04ed6dd0",

        ];

        const bhajans = await Bhajan.find({ _id: { $in: featuredIds } }).lean();
        return NextResponse.json(bhajans);
    } catch (error) {
        console.error("Error fetching featured bhajans:", error);
        return NextResponse.json({ error: "Failed to load bhajans" }, { status: 500 });
    }
}
