"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Sign up new user
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Signup successful! Please check your email to confirm.");
    }

    setLoading(false);
  };

  // Login existing user
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Login successful! Redirecting...");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "5rem auto",
        padding: "2rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Quiet Hours Login
      </h1>

      <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: "0.75rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            padding: "0.75rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "1rem", textAlign: "center", color: "red" }}>
          {message}
        </p>
      )}
    </div>
  );
}
