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
    options: { data: { full_name: name } },
  });

  if (error) {
    if (error.message.includes("already registered"))
      return { error: "Este correo ya tiene una cuenta. Inicia sesión." };
    if (error.message.includes("rate limit"))
      return { error: "Demasiados intentos. Espera un momento." };
    return { error: error.message || "Error al crear la cuenta. Intenta de nuevo." };
  }

  if (!data.user) {
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  try {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      nombre: name,
      plan: "free",
      examenes_mes: 0,
    });
  } catch (e) {
    console.error("Error creando perfil:", e);
  }

  if (data.session === null) {
    return { confirmar: true };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}