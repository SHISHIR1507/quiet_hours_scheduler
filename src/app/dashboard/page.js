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

  // ✅ Redirect if not logged in
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/auth");
    };
    getSession();
  }, [router]);

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  // ✅ Add Quiet Hour block
  const handleAddQuietHour = (e) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) return;

    const newBlock = { id: Date.now(), date, startTime, endTime };
    setQuietHours([...quietHours, newBlock]);

    setDate("");
    setStartTime("");
    setEndTime("");
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

      {/* Add Quiet Hour Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Quiet Hour</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddQuietHour}
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
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      {/* Quiet Hours Table */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {quietHours.length > 0 ? (
                quietHours.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>{block.date}</TableCell>
                    <TableCell>{block.startTime}</TableCell>
                    <TableCell>{block.endTime}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
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
