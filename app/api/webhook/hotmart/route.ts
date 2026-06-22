import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CREDITOS_POR_PRODUCTO: Record<string, number> = {
  "7980108": 15, // Starter
  "7980130": 35, // Plus
  "7980134": 60, // Pro
};

const PLAN_POR_PRODUCTO: Record<string, string> = {
  "7980108": "starter",
  "7980130": "plus",
  "7980134": "pro",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log completo para debug
    console.log("Webhook Hotmart recibido:", JSON.stringify(body, null, 2));

    const evento = body?.event;
    console.log("Evento:", evento);

    // Aceptar cualquier evento de compra
    const eventosValidos = [
      "PURCHASE_APPROVED",
      "PURCHASE_COMPLETE",
      "PURCHASE_BILLET_PRINTED",
    ];

    if (!eventosValidos.includes(evento)) {
      console.log("Evento ignorado:", evento);
      return NextResponse.json({ message: "Evento ignorado", evento }, { status: 200 });
    }

    // Hotmart v2 — distintas rutas posibles para el email
    const comprador =
      body?.data?.buyer ||
      body?.data?.purchase?.buyer ||
      body?.buyer ||
      null;

    const producto =
      body?.data?.product ||
      body?.data?.purchase?.product ||
      body?.product ||
      null;

    console.log("Comprador:", comprador);
    console.log("Producto:", producto);

    if (!comprador?.email) {
      console.error("Email no encontrado en el body");
      return NextResponse.json({ error: "Email no encontrado", body }, { status: 400 });
    }

    if (!producto?.id) {
      console.error("Producto ID no encontrado en el body");
      return NextResponse.json({ error: "Producto ID no encontrado", body }, { status: 200 });
    }

    const email = comprador.email.toLowerCase().trim();
    const productoId = String(producto.id);
    const creditos = CREDITOS_POR_PRODUCTO[productoId];
    const plan = PLAN_POR_PRODUCTO[productoId];

    console.log("Email:", email, "ProductoID:", productoId, "Créditos:", creditos);

    if (!creditos) {
      console.error("Producto no reconocido:", productoId);
      return NextResponse.json({ error: "Producto no reconocido", productoId }, { status: 200 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: perfil, error: errorPerfil } = await supabase
      .from("profiles")
      .select("id, creditos, plan")
      .eq("email", email)
      .single();

    if (errorPerfil || !perfil) {
      console.error("Perfil no encontrado para:", email);
      // Retornar 200 para que Hotmart no siga reintentando
      return NextResponse.json({ message: "Usuario no registrado aún", email }, { status: 200 });
    }

    const creditosNuevos = (perfil.creditos || 0) + creditos;

    const { error: errorUpdate } = await supabase
      .from("profiles")
      .update({ creditos: creditosNuevos, plan })
      .eq("id", perfil.id);

    if (errorUpdate) {
      console.error("Error actualizando créditos:", errorUpdate);
      return NextResponse.json({ error: "Error actualizando créditos" }, { status: 500 });
    }

    console.log(`✅ Créditos activados: ${email} → +${creditos} (total: ${creditosNuevos})`);

    return NextResponse.json({
      success: true,
      email,
      creditos_agregados: creditos,
      creditos_total: creditosNuevos,
      plan,
    });

  } catch (error: any) {
    console.error("Error en webhook Hotmart:", error?.message || error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}