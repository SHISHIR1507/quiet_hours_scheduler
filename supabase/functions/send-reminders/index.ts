import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SUPA_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "onboarding@resend.dev";

const supabase = createClient(SUPA_URL, SUPA_KEY);
const resend = new Resend(RESEND_KEY);

serve(async () => {
  try {
    const now = new Date();

    const windowStart = new Date(now.getTime() + 9.5 * 60 * 1000).toISOString();
    const windowEnd   = new Date(now.getTime() + 10.5 * 60 * 1000).toISOString();

    const { data: candidates, error: selectErr } = await supabase
      .from("quiet_hours")
      .select("id, user_email, start_ts")
      .gte("start_ts", windowStart)
      .lte("start_ts", windowEnd)
      .eq("reminder_sent", false);

    if (selectErr) throw selectErr;
    if (!candidates || candidates.length === 0) {
      console.log("no reminders due");
      return new Response("no reminders", { status: 200 });
    }

    for (const row of candidates) {
      const diffMs = new Date(row.start_ts).getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Send only if ~10 minutes away (±1 min tolerance)
      if (Math.abs(diffMinutes - 10) > 1) {
        console.log("skipping row (not within ±1min of 10min):", row.id);
        continue;
      }

      const { data: claimed, error: claimErr } = await supabase
        .from("quiet_hours")
        .update({ reminder_sent: true, updated_at: new Date().toISOString() })
        .match({ id: row.id, reminder_sent: false })
        .select("id, user_email, start_ts");

      if (claimErr) {
        console.error("claim error", claimErr);
        continue;
      }
      if (!claimed || claimed.length === 0) continue;

      const item = claimed[0];
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: item.user_email,
          subject: "⏰ Quiet Hour starts in 10 minutes",
          html: `<p>Your quiet block starts at <strong>${new Date(item.start_ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</strong> — 10 minutes from now.</p>`,
        });

        console.log("sent reminder", item.id, item.user_email);
      } catch (sendErr) {
        console.error("send error for", item.id, sendErr);
        await supabase.from("quiet_hours").update({ reminder_sent: false }).eq("id", item.id);
      }
    }

    return new Response("done", { status: 200 });
  } catch (err) {
    console.error("function error", err);
    return new Response(`error: ${err.message}`, { status: 500 });
  }
});