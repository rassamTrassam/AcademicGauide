"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RealtimeApprovalListener({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to changes on the user_profiles table for this specific user
    const channel = supabase
      .channel("realtime_approval")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = payload.new.approval_status;
          if (newStatus === "approved") {
            // Force a hard navigation to the dashboard
            window.location.href = "/dashboard";
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router, supabase]);

  return null; // This is a purely logical component, no UI
}
