import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import User from "@/lib/models/User";

export const PUT = withAuth(async (req, { user }) => {
  const { timezone } = await req.json();

  if (!timezone) {
    return NextResponse.json({ success: false, error: "Timezone is required" }, { status: 400 });
  }

  await User.updateOne({ _id: user.id }, { $set: { timezone } });

  return NextResponse.json({ success: true, data: { timezone } });
});
