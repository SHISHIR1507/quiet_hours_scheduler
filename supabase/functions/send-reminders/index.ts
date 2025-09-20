// supabase/functions/send-reminders/index.ts
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
    // window 9..11 minutes from now to allow scheduling skew
    const windowStart = new Date(now.getTime() + 9 * 60 * 1000).toISOString();
    const windowEnd = new Date(now.getTime() + 11 * 60 * 1000).toISOString();

    // 1) find candidate rows that haven't been reminded yet
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

    // 2) For each candidate, atomically claim and send
    for (const row of candidates) {
      // Try to atomically mark as claimed (reminder_sent = true) only if still false
      const { data: claimed, error: claimErr } = await supabase
        .from("quiet_hours")
        .update({ reminder_sent: true, updated_at: new Date().toISOString() })
        .match({ id: row.id, reminder_sent: false })
        .select("id, user_email, start_ts");

      if (claimErr) {
        console.error("claim error", claimErr);
        continue;
      }
      if (!claimed || claimed.length === 0) {
        // someone else already claimed it
        continue;
      }

      const item = claimed[0];
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: item.user_email,
          subject: "⏰ Quiet Hour starts in 10 minutes",
          html: `<p>Your quiet block starts at <strong>${new Date(item.start_ts).toLocaleString()}</strong> — 10 minutes from now.</p>`,
        });

        console.log("sent reminder", item.id, item.user_email);
      } catch (sendErr) {
        console.error("send error for", item.id, sendErr);
        // rollback claim so it can be retried later
        await supabase.from("quiet_hours").update({ reminder_sent: false }).eq("id", item.id);
      }
    }

    return new Response("done", { status: 200 });
  } catch (err) {
    console.error("function error", err);
    return new Response(`error: ${err.message}`, { status: 500 });
  }
});
