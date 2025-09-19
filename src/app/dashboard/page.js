"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

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
      setMessageType("error");
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
      setMessageType("success");
      setMessage("✅ Block added successfully!");
      setStartTime("");
      setEndTime("");
      fetchBlocks();
    } else {
      setMessageType("error");
      setMessage("❌ " + (json.error || "Something went wrong"));
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-red-500">📚 Quiet Hours Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Form */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Quiet Hour Block</h2>
        <form onSubmit={handleAddBlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Add Block
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* Table */}
      <h2 className="text-xl font-semibold mb-3">Your Quiet Hour Blocks</h2>
      {blocks.length === 0 ? (
        <p className="text-gray-500">No blocks yet. Add one above 👆</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="border-t px-4 py-2">
                    {new Date(b.startTime).toLocaleString()}
                  </td>
                  <td className="border-t px-4 py-2">
                    {new Date(b.endTime).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
