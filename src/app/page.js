import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Quiet Hours Scheduler</h1>
      <p>
        Welcome! This is the homepage of your project. Use the link below to log
        in and start creating your quiet hours.
      </p>

      <Link
        href="/auth"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#0070f3",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        Go to Login
      </Link>
    </main>
  );
}
