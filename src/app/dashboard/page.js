"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  // Check session
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth");
      }
    };
    checkUser();
  }, [router]);

  // Fetch blocks
  const fetchBlocks = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/getBlocks", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const json = await res.json();
    setBlocks(json);
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // Add block
  const handleAddBlock = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!startTime || !endTime) {
      setMessage("⚠️ Please select both start and end times.");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth");
      return;
    }

    const res = await fetch("/api/addBlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ startTime, endTime }),
    });

    const json = await res.json();

    if (res.ok) {
      setMessage("✅ Block added successfully!");
      setStartTime("");
      setEndTime("");
      fetchBlocks();
    } else {
      setMessage("❌ " + (json.error || "Something went wrong"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Add your quiet-hour study blocks 👇</p>

      {/* Form */}
      <form onSubmit={handleAddBlock} className="space-y-4 bg-white shadow-md rounded-lg p-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          Add Block
        </button>
      </form>

      {message && (
        <p className="mb-4 text-center text-sm text-gray-700">{message}</p>
      )}

      {/* Blocks Table */}
      <h2 className="text-xl font-semibold mb-2">Your Blocks</h2>
      {blocks.length === 0 ? (
        <p className="text-gray-500">No blocks yet.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Start</th>
              <th className="border px-4 py-2 text-left">End</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  {new Date(b.startTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(b.endTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}