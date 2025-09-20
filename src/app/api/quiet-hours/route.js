import clientPromise from "@/lib/mongodb";
import { supabase } from "@/lib/supabaseClient";


export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return Response.json({ error: "Invalid user" }, { status: 401 });

    const quietHours = await collection.find({ userId: user.id }).toArray();

    const quietHoursIST = quietHours.map((q) => ({
      ...q,
      startTime: q.start_ts
        ? new Date(q.start_ts).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          })
        : q.startTime,
      endTime: q.end_ts
        ? new Date(q.end_ts).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          })
        : q.endTime,
    }));

    return Response.json(quietHoursIST, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

//  POST new quiet hour
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    // 🔒 Auth check
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return Response.json({ error: "Invalid user" }, { status: 401 });

    //  Get input
    const { date, startTime, endTime } = await req.json();
    if (!date || !startTime || !endTime) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    // ⏰ Convert IST → UTC before saving
    const startUTC = new Date(`${date}T${startTime}:00+05:30`);
    const endUTC = new Date(`${date}T${endTime}:00+05:30`);

    //  Save to MongoDB
    const result = await collection.insertOne({
      userId: user.id,
      date,
      startTime, // original input (IST)
      endTime,   // original input (IST)
      start_ts: startUTC, // UTC for cron
      end_ts: endUTC,
      createdAt: new Date(),
    });

    //  Mirror into Supabase for cron jobs
    await supabase.from("quiet_hours").insert([
      {
        user_id: user.id,
        user_email: user.email,
        start_ts: startUTC,
        end_ts: endUTC,
      },
    ]);

    return Response.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
