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
