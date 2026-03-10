import { supabase } from "@/lib/supabaseClient";

export async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

export function getSelectedCity(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("vc_city") || "";
}

export function setSelectedCity(city: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vc_city", city);
}

export async function listCities() {
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return { data: data ?? [], error };
}

export async function listOffersByCity(city?: string) {
  let query = supabase
    .from("ofertas_public_view")
    .select("*")
    .order("created_at", { ascending: false });

  if (city) {
    query = query.eq("cidade", city);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function hasUnlockedOfferContact(
  userId: string,
  offerId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("contact_unlocks")
    .select("id")
    .eq("user_id", userId)
    .eq("offer_id", offerId)
    .limit(1);

  if (error) return false;
  return !!data && data.length > 0;
}

export async function unlockOfferContactWithConecta(
  userId: string,
  offerId: string
) {
  const { data, error } = await supabase.rpc(
    "unlock_offer_contact_with_conecta",
    {
      p_user_id: userId,
      p_offer_id: offerId,
    }
  );

  return { data, error };
}

export async function listEmpresas(city?: string) {
  let query = supabase
    .from("empresas")
    .select("id, nome, whatsapp, is_provisional, plan_type, status, city")
    .order("nome", { ascending: true });

  if (city) {
    query = query.eq("city", city);
  }

  const { data, error } = await query;
  return { data: data ?? [], error };
}

export async function getMerchantWallet(merchantId: string) {
  const { data, error } = await supabase
    .from("merchant_wallet_balance_view")
    .select("*")
    .eq("merchant_id", merchantId)
    .single();

  return { data, error };
}

export async function getMerchantStatement(merchantId: string) {
  const { data, error } = await supabase
    .from("merchant_statement_view")
    .select("*")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}

export async function createMerchantInvite(params: {
  invitedBy: string;
  merchantName: string;
  merchantPhone?: string;
  city?: string;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc("create_merchant_invite", {
    p_invited_by: params.invitedBy,
    p_merchant_name: params.merchantName,
    p_merchant_phone: params.merchantPhone ?? null,
    p_city: params.city ?? null,
    p_notes: params.notes ?? null,
  });

  return { data, error };
}

export async function convertInviteToProvisionalMerchant(params: {
  inviteCode: string;
  nome: string;
  whatsapp?: string;
}) {
  const { data, error } = await supabase.rpc(
    "convert_invite_to_provisional_merchant",
    {
      p_invite_code: params.inviteCode,
      p_nome: params.nome,
      p_whatsapp: params.whatsapp ?? null,
    }
  );

  return { data, error };
}

export async function payWithCashback(
  userId: string,
  merchantId: string,
  amount: number,
  cashbackPercent = 5
) {
  const { data, error } = await supabase.rpc("conecta_pay_with_cashback", {
    p_user_id: userId,
    p_merchant_id: merchantId,
    p_amount: amount,
    p_cashback_percent: cashbackPercent,
  });

  return { data, error };
}

export async function conectaPayWithCashback(params: {
  userId: string;
  merchantId: string;
  amount: number;
  cashbackPercent?: number;
}) {
  return payWithCashback(
    params.userId,
    params.merchantId,
    params.amount,
    params.cashbackPercent ?? 5
  );
}

export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("user_wallet_balance_view")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) return 0;
  return Number(data.balance || 0);
}

export async function getUserWallet(userId: string) {
  const { data, error } = await supabase
    .from("user_wallet_balance_view")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error };
}

export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from("user_payments_view")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}

export async function getUserCashbacks(userId: string) {
  const { data, error } = await supabase
    .from("user_cashback_view")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data: data ?? [], error };
}

export async function getUserStatement() {
  const { data, error } = await supabase
    .from("user_wallet_statement_view")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return { data: data ?? [], error };
}