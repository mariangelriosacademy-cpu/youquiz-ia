"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase";

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };
  revalidatePath("/", "layout");
  return { success: true };
}

export async function register(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      // Redirigir al confirmar desde el link del correo
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes("already registered"))
      return { error: "Este correo ya tiene una cuenta. Inicia sesión." };
    if (error.message.includes("rate limit") || error.message.includes("email") || error.status === 429)
  return { error: "Límite de correos alcanzado. Espera unos minutos e intenta de nuevo." };
return { error: error.message || "Error al crear la cuenta. Intenta de nuevo." };
  }

  if (!data.user) {
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  // Intentar crear perfil (el trigger de Supabase también lo hace, esto es fallback)
  try {
    await supabase.from("profiles").upsert({
      id: data.user.id,
      email,
      nombre: name,
      plan: "free",
      examenes_mes: 0,
    }, { onConflict: "id" });
  } catch (e) {
    console.error("Error creando perfil:", e);
  }

  // Si Supabase devuelve sesión activa = email confirmation está DESACTIVADO
  // → el usuario puede ir directo al dashboard sin confirmar correo
  if (data.session) {
    revalidatePath("/", "layout");
    return { directo: true };
  }

  // Si no hay sesión = Supabase envió correo de confirmación (modo normal)
  return { confirmar: true };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}