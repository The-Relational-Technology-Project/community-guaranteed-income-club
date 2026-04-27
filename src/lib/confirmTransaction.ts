import { supabase } from "@/integrations/supabase/client";

export async function confirmTransactionSide(
  txnId: string,
  role: "sender" | "receiver"
) {
  const update =
    role === "sender"
      ? { is_confirmed_sender: true, confirmed_sender_at: new Date().toISOString() }
      : { is_confirmed_receiver: true, confirmed_receiver_at: new Date().toISOString() };

  return supabase.from("transactions").update(update).eq("id", txnId);
}