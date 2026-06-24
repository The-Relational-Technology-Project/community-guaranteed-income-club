import { supabase } from "@/integrations/supabase/client";

export async function confirmTransactionSide(
  txnId: string,
  role: "sender" | "receiver",
  value: boolean = true,
) {
  const update =
    role === "sender"
      ? { is_confirmed_sender: value, confirmed_sender_at: value ? new Date().toISOString() : null }
      : { is_confirmed_receiver: value, confirmed_receiver_at: value ? new Date().toISOString() : null };

  return supabase.from("transactions").update(update).eq("id", txnId);
}