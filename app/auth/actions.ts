"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
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
    },
  });

  console.log("DATA:", JSON.stringify(data));
  console.log("ERROR:", JSON.stringify(error));

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este correo ya tiene una cuenta. Inicia sesión." };
    }
    return { error: `Error: ${error.message}` };
  }

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      nombre: name,
      plan: "free",
      examenes_mes: 0,
    });
  }

  // Si el email necesita confirmación, redirigir a página de espera
  if (data.session === null) {
    redirect("/confirmar-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}