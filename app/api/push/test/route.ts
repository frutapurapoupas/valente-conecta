import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

type TestPushBody = {
  title?: string;
  body?: string;
  url?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestPushBody;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject =
      process.env.VAPID_SUBJECT || "mailto:contato@valenteconecta.com";

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !vapidPublicKey ||
      !vapidPrivateKey
    ) {
      return NextResponse.json(
        { error: "Variáveis de ambiente do push não configuradas." },
        { status: 500 }
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("is_active", true)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma inscrição push ativa encontrada." },
        { status: 404 }
      );
    }

    const subscription = data[0];

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: body.title || "Teste do Valente Conecta",
        body: body.body || "Sua notificação push está funcionando.",
        url: body.url || "/",
        icon: "/icon?v=2",
        badge: "/icon?v=2",
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro em /api/push/test:", error);
    return NextResponse.json(
      { error: "Erro ao enviar push de teste." },
      { status: 500 }
    );
  }
}