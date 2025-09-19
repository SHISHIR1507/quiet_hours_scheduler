import clientPromise from "@/lib/mongodb";
import { supabase } from "@/lib/supabaseClient";
import { ObjectId } from "mongodb";


export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const quietHours = await collection.find({ userId: user.id }).toArray();

    return Response.json(quietHours, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return Response.json({ error: "Invalid user" }, { status: 401 });
    }

    const { date, startTime, endTime } = await req.json();
    if (!date || !startTime || !endTime) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await collection.insertOne({
      userId: user.id, 
      date,
      startTime,
      endTime,
      createdAt: new Date(),
    });

    return Response.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
