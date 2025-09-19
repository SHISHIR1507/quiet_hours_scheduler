"use client";

import { useState } from "react";
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

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Signup hai 
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Signup successful! Please check your email.");
    }

    setLoading(false);
  };

  // Login hai
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  const {
    data: { session, user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage(error.message);
  } else {
    // 👇 now works
    console.log("Access Token:", session?.access_token);
    console.log("User ID:", user?.id);

    setMessage("✅ Login successful! Redirecting...");
    router.push("/dashboard");
  }

  setLoading(false);
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Quiet Hours Login</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex gap-2">
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Button
                onClick={handleSignup}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                {loading ? "Signing up..." : "Signup"}
              </Button>
            </div>
          </form>

          {message && (
            <p className="text-center text-sm text-red-500 mt-4">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
