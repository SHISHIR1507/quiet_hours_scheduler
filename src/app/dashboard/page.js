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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const router = useRouter();
  const [quietHours, setQuietHours] = useState([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editId, setEditId] = useState(null); 

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/auth");
      else fetchQuietHours(data.session.access_token);
    };
    getSession();
  }, [router]);

  const fetchQuietHours = async (token) => {
    const res = await fetch("/api/quiet-hours", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setQuietHours(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const handleSaveQuietHour = async (e) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const token = session.access_token;

    if (editId) {

      await fetch(`/api/quiet-hours/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, startTime, endTime }),
      });
      setEditId(null);
    } else {

      await fetch("/api/quiet-hours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, startTime, endTime }),
      });
    }

    setDate("");
    setStartTime("");
    setEndTime("");
    fetchQuietHours(token);
  };

  const handleEdit = (block) => {
    setEditId(block._id);
    setDate(block.date);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const token = session.access_token;

    await fetch(`/api/quiet-hours/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchQuietHours(token);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📅 Quiet Hours Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{editId ? "Edit Quiet Hour" : "Add Quiet Hour"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSaveQuietHour}
            className="flex gap-4 items-center flex-wrap"
          >
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <Button type="submit">{editId ? "Update" : "Add"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quietHours.length > 0 ? (
                quietHours.map((block) => (
                  <TableRow key={block._id}>
                    <TableCell>{block.date}</TableCell>
                    <TableCell>{block.startTime}</TableCell>
                    <TableCell>{block.endTime}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(block)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(block._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-gray-500"
                  >
                    No quiet hours added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
