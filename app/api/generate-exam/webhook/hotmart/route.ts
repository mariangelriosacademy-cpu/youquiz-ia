import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Créditos por producto Hotmart
const CREDITOS_POR_PRODUCTO: Record<string, number> = {
  "7980108": 15, // Starter
  "7980130": 35, // Plus
  "7980134": 60, // Pro
};

// Plan por producto
const PLAN_POR_PRODUCTO: Record<string, string> = {
  "7980108": "starter",
  "7980130": "plus",
  "7980134": "pro",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar que es un evento de compra aprobada
    const evento = body?.event;
    if (evento !== "PURCHASE_APPROVED" && evento !== "PURCHASE_COMPLETE") {
      return NextResponse.json({ message: "Evento ignorado" }, { status: 200 });
    }

    // Extraer datos del comprador
    const comprador = body?.data?.buyer;
    const producto = body?.data?.product;

    if (!comprador?.email || !producto?.id) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const email = comprador.email.toLowerCase();
    const productoId = String(producto.id);
    const creditos = CREDITOS_POR_PRODUCTO[productoId];
    const plan = PLAN_POR_PRODUCTO[productoId];

    if (!creditos) {
      return NextResponse.json({ error: "Producto no reconocido" }, { status: 400 });
    }

    // Conectar a Supabase con service role (bypasa RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Buscar el perfil por email
    const { data: perfil, error: errorPerfil } = await supabase
      .from("profiles")
      .select("id, creditos, plan")
      .eq("email", email)
      .single();

    if (errorPerfil || !perfil) {
      console.error("Perfil no encontrado para:", email);
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Sumar créditos sin perder los que ya tenía
    const creditosNuevos = (perfil.creditos || 0) + creditos;

    const { error: errorUpdate } = await supabase
      .from("profiles")
      .update({
        creditos: creditosNuevos,
        plan: plan,
      })
      .eq("id", perfil.id);

    if (errorUpdate) {
      console.error("Error actualizando créditos:", errorUpdate);
      return NextResponse.json({ error: "Error actualizando créditos" }, { status: 500 });
    }

    console.log(`✅ Créditos activados: ${email} → +${creditos} créditos (total: ${creditosNuevos})`);

    return NextResponse.json({
      success: true,
      email,
      creditos_agregados: creditos,
      creditos_total: creditosNuevos,
      plan,
    });

  } catch (error) {
    console.error("Error en webhook Hotmart:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}