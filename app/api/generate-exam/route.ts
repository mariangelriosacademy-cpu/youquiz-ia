import { NextRequest, NextResponse } from "next/server";

// ─── MODO DEMO (sin API key) ──────────────────────────────────────────────────
function generarExamenDemo(tema: string, nivel: string, cantidad: number, tipos: string[]) {
  const preguntas = [];
  for (let i = 1; i <= cantidad; i++) {
    const tipo = tipos[i % tipos.length];
    if (tipo === "multiple") {
      preguntas.push({
        id: i, tipo: "multiple",
        pregunta: `Pregunta ${i} de opción múltiple sobre ${tema}`,
        opciones: ["A) Opción 1", "B) Opción 2", "C) Opción 3", "D) Opción 4"],
        respuesta_correcta: "A) Opción 1",
        explicacion: `Esta es la explicación de la pregunta ${i} sobre ${tema}.`
      });
    } else if (tipo === "verdadero_falso") {
      preguntas.push({
        id: i, tipo: "verdadero_falso",
        pregunta: `Afirmación ${i} sobre ${tema} para nivel ${nivel}.`,
        respuesta_correcta: "Verdadero",
        explicacion: `Explicación de por qué esta afirmación es verdadera.`
      });
    } else {
      preguntas.push({
        id: i, tipo: "abierta",
        pregunta: `Explica con tus palabras el concepto ${i} relacionado con ${tema}.`,
        respuesta_correcta: `Respuesta modelo para la pregunta ${i}.`,
        explicacion: `El estudiante debe demostrar comprensión del tema.`
      });
    }
  }
  return { titulo: `Examen de ${tema} — Nivel ${nivel}`, preguntas };
}

export async function POST(request: NextRequest) {
  try {
    const { tema, nivel, cantidad, tipos } = await request.json();

    if (!tema || !nivel || !cantidad || !tipos?.length) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    // Si hay API key usa Claude, si no usa el demo
    if (!process.env.ANTHROPIC_API_KEY) {
      const examenDemo = generarExamenDemo(tema, nivel, cantidad, tipos);
      return NextResponse.json(examenDemo);
    }

    // ─── CON API KEY: llama a Claude ─────────────────────────────────────────
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const tiposTexto = tipos.map((t: string) => {
      if (t === "multiple") return "opción múltiple (4 opciones)";
      if (t === "verdadero_falso") return "verdadero o falso";
      if (t === "abierta") return "pregunta abierta";
      return t;
    }).join(", ");

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: "Eres un experto en pedagogía que crea exámenes de alta calidad. Responde ÚNICAMENTE con un JSON válido, sin texto adicional ni bloques de código markdown.",
      messages: [{
        role: "user",
        content: `Crea un examen sobre "${tema}" para nivel ${nivel}. Cantidad: ${cantidad} preguntas. Tipos: ${tiposTexto}. Devuelve ÚNICAMENTE este JSON: { "titulo": string, "preguntas": [{ "id": number, "tipo": string, "pregunta": string, "opciones"?: string[], "respuesta_correcta": string, "explicacion": string }] }`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const exam = JSON.parse(clean);
    return NextResponse.json(exam);

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "No se pudo generar el examen." }, { status: 500 });
  }
}