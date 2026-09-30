import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import Tally from "@/lib/models/Tally";
import TallyEntry from "@/lib/models/TallyEntry";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const GET = withAuth(async (req, { user }) => {
  const url = new URL(req.url);
  const countToday = url.searchParams.get("countToday") === "true";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  const query: any = { userId: user.id };
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const totalCount = await Tally.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  let tallies = await Tally.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (countToday) {
    const userTimezone = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = dayjs().tz(userTimezone).format("YYYY-MM-DD");

    const todayEntries = await TallyEntry.find({
      userId: user.id,
      date: today,
    }).lean();

    const entryMap = new Map(todayEntries.map(e => [e.tallyId.toString(), e.count]));

    tallies = tallies.map((tally: any) => ({
      ...tally,
      todayCount: entryMap.get(tally._id.toString()) || 0,
    }));
  }

  return NextResponse.json({ 
    success: true, 
    data: tallies,
    pagination: { page, limit, totalPages, totalCount }
  });
});

export const POST = withAuth(async (req, { user }) => {
  const { name, color, incrementRate } = await req.json();

  if (!name || !color) {
    return NextResponse.json({ success: false, error: "Name and color are required" }, { status: 400 });
  }

  const newTally = await Tally.create({
    userId: user.id,
    name,
    color,
    incrementRate: incrementRate || 1,
  });

  return NextResponse.json({ success: true, data: newTally });
});
