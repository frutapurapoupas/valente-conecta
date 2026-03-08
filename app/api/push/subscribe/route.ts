import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type SubscriptionPayload = {
  subscription?: {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  user_agent?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionPayload;

    const endpoint = body.subscription?.endpoint;
    const p256dh = body.subscription?.keys?.p256dh;
    const auth = body.subscription?.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "Inscrição push incompleta." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase não configurado no servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint,
        p256dh,
        auth,
        expiration_time: body.subscription?.expirationTime ?? null,
        user_agent: body.user_agent ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro em /api/push/subscribe:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar inscrição push." },
      { status: 500 }
    );
  }
}