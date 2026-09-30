import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import Tally from "@/lib/models/Tally";

export const GET = withAuth(async (req, { user }, { id }) => {
  const tally = await Tally.findOne({ _id: id, userId: user.id }).lean();
  
  if (!tally) {
    return NextResponse.json({ success: false, error: "Tally not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: tally });
});

export const PUT = withAuth(async (req, { user }, { id }) => {
  const { name, color, incrementRate } = await req.json();

  const tally = await Tally.findOneAndUpdate(
    { _id: id, userId: user.id },
    { $set: { name, color, incrementRate } },
    { new: true }
  );

  if (!tally) {
    return NextResponse.json({ success: false, error: "Tally not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: tally });
});

export const DELETE = withAuth(async (req, { user }, { id }) => {
  const tally = await Tally.findOneAndDelete({ _id: id, userId: user.id });

  if (!tally) {
    return NextResponse.json({ success: false, error: "Tally not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { deleted: true } });
});
