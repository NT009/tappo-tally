import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import TallyEntry from "@/lib/models/TallyEntry";
import Tally from "@/lib/models/Tally";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const GET = withAuth(async (req, { user }) => {
  const url = new URL(req.url);
  const month = url.searchParams.get("month"); // YYYY-MM
  
  if (!month) {
    return NextResponse.json({ success: false, error: "Month parameter is required (YYYY-MM)" }, { status: 400 });
  }

  // Use MongoDB Aggregation to group data at the database level
  // and construct the final Record (dictionary) object directly.
  const aggregated = await TallyEntry.aggregate([
    {
      $match: {
        userId: user.id,
        date: { $regex: `^${month}` },
      }
    },
    {
      // 1. Group the entries by tallyId
      $group: {
        _id: "$tallyId",
        entries: {
          $push: { date: "$date", count: "$count" }
        }
      }
    },
    {
      // 2. Group all those tally groups into a single array of { k, v } pairs
      $group: {
        _id: null,
        data: {
          $push: { k: { $toString: "$_id" }, v: "$entries" }
        }
      }
    },
    {
      // 3. Convert that array into a single dictionary object
      $replaceRoot: {
        newRoot: { $arrayToObject: "$data" }
      }
    }
  ]);

  // 'aggregated' is an array containing exactly one document (the dictionary)
  // or an empty array if there were no matches for that month.
  const groupedData = aggregated.length > 0 ? aggregated[0] : {};

  return NextResponse.json({ success: true, data: groupedData });
});

export const POST = withAuth(async (req, { user }) => {
  const { tallyId, incrementAmount } = await req.json();

  if (!tallyId || !incrementAmount) {
    return NextResponse.json({ success: false, error: "tallyId and incrementAmount are required" }, { status: 400 });
  }

  // Verify ownership of the Tally
  const tally = await Tally.findOne({ _id: tallyId, userId: user.id });
  if (!tally) {
    return NextResponse.json({ success: false, error: "Tally not found" }, { status: 404 });
  }

  const userTimezone = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = dayjs().tz(userTimezone).format("YYYY-MM-DD");

  const entry = await TallyEntry.findOneAndUpdate(
    { tallyId, date: today, userId: user.id },
    { $inc: { count: incrementAmount } },
    { new: true, upsert: true }
  );

  // Crucially, update the parent Tally's updatedAt timestamp
  await Tally.updateOne({ _id: tallyId, userId: user.id }, { $set: { updatedAt: new Date() } });

  return NextResponse.json({ success: true, data: entry });
});
