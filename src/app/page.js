import Link from "next/link";
import { Button } from "@/components/ui/button"; // Remove .jsx extension

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      {/* Test div - remove the comment line */}
      <div className="bg-red-500 text-white p-4 m-4">
        TEST: This should be RED background with WHITE text
      </div>
      
      {/* Shadcn Button Test */}
      <div className="flex gap-4">
        <Button variant="default">🚀 Primary Button</Button>
        <Button variant="destructive">🔥 Destructive Button</Button>
        <Button variant="secondary">⚪ Secondary</Button>
        <Button variant="outline">📦 Outline</Button>
        <Button variant="ghost">👻 Ghost</Button>
        <Button variant="link">🔗 Link</Button>
      </div>

      {/* Additional Tailwind test */}
      <p className="bg-red-500 text-white p-4">Tailwind test</p>

      {/* Homepage content */}
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Quiet Hours Scheduler</h1>
        <p className="text-gray-600 mb-4">
          Welcome! This is the homepage of your project. Use the link below to
          log in and start creating your quiet hours.
        </p>

        <Link href="/auth">
          <Button>Go to Login</Button>
        </Link>
      </div>
    </main>
  );
}