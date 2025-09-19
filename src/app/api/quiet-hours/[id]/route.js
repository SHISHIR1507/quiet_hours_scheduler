import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { date, startTime, endTime } = await req.json();

    if (!id || !date || !startTime || !endTime) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const collection = db.collection("quiet_hours");

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { date, startTime, endTime, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "No document found" }, { status: 404 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
