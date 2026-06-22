import { NextRequest, NextResponse } from "next/server";

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

// Descripciones pedagógicas para el prompt
const DESCRIPCION_FINALIDAD: Record<string, string> = {
  diagnostica: "DIAGNÓSTICA: Evalúa conocimientos PREVIOS al inicio del tema. Las preguntas deben explorar qué sabe el estudiante antes de la instrucción, identificar fortalezas y debilidades iniciales.",
  formativa: "FORMATIVA: Evalúa el proceso de aprendizaje DURANTE la instrucción. Las preguntas deben orientar la comprensión, detectar errores conceptuales y guiar la retroalimentación continua.",
  sumativa: "SUMATIVA: Evalúa el aprendizaje TOTAL al final de un ciclo. Las preguntas deben medir si se lograron los objetivos académicos y determinar la calificación final.",
};

const DESCRIPCION_PARTICIPANTE: Record<string, string> = {
  heteroevaluacion: "HETEROEVALUACIÓN: El docente evalúa al estudiante. Preguntas objetivas con criterios claros de corrección.",
  autoevaluacion: "AUTOEVALUACIÓN: El estudiante reflexiona sobre su propio aprendizaje. Incluye preguntas reflexivas como '¿Qué aprendí?', '¿Qué dificultades tuve?', preguntas de metacognición.",
  coevaluacion: "COEVALUACIÓN: Los estudiantes evalúan el trabajo de sus compañeros. Incluye criterios de evaluación entre pares, rúbricas y preguntas de análisis constructivo.",
};

export async function POST(request: NextRequest) {
  try {
    const { tema, nivel, cantidad, tipos, finalidad, participante, asignatura, grado, pais } = await request.json();

    if (!tema || !nivel || !cantidad || !tipos?.length) {
      return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(generarExamenDemo(tema, nivel, cantidad, tipos));
    }

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const tiposTexto = tipos.map((t: string) => {
      if (t === "multiple") return "opción múltiple (4 opciones A, B, C, D)";
      if (t === "verdadero_falso") return "verdadero o falso";
      if (t === "abierta") return "pregunta abierta";
      return t;
    }).join(", ");

    const descFinalidad = finalidad ? DESCRIPCION_FINALIDAD[finalidad] : null;
    const descParticipante = participante ? DESCRIPCION_PARTICIPANTE[participante] : null;

    const contextoExtra = [
      asignatura ? `Asignatura: ${asignatura}` : null,
      grado ? `Grado/Año: ${grado}` : null,
      pais ? `País: ${pais}` : null,
    ].filter(Boolean).join(", ");

    const tituloEvaluacion = finalidad
      ? `${finalidad === "diagnostica" ? "Evaluación Diagnóstica" : finalidad === "formativa" ? "Evaluación Formativa" : "Evaluación Sumativa"} de ${tema}`
      : `Examen de ${tema}`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: `Eres un experto en pedagogía latinoamericana y evaluación educativa. Creas evaluaciones de alta calidad adaptadas al contexto pedagógico indicado.
IMPORTANTE: Responde ÚNICAMENTE con JSON puro y válido. 
NO uses bloques de código markdown.
NO agregues texto antes o después del JSON.
El JSON debe comenzar con { y terminar con }.`,
      messages: [{
        role: "user",
        content: `Crea una evaluación sobre "${tema}" para nivel ${nivel} con ${cantidad} preguntas de tipo: ${tiposTexto}.
${contextoExtra ? `Contexto: ${contextoExtra}` : ""}
${descFinalidad ? `\nTipo de evaluación según finalidad:\n${descFinalidad}` : ""}
${descParticipante ? `\nTipo según participante:\n${descParticipante}` : ""}

Adapta el lenguaje, profundidad y enfoque de las preguntas según el tipo de evaluación indicado.

El JSON debe tener exactamente esta estructura:
{
  "titulo": "${tituloEvaluacion} — Nivel ${nivel}",
  "tipo_evaluacion": {
    "finalidad": "${finalidad || "general"}",
    "participante": "${participante || "heteroevaluacion"}"
  },
  "preguntas": [
    {
      "id": 1,
      "tipo": "multiple",
      "pregunta": "texto de la pregunta",
      "opciones": ["A) opción", "B) opción", "C) opción", "D) opción"],
      "respuesta_correcta": "A) opción correcta",
      "explicacion": "explicación breve"
    }
  ]
}

Para verdadero_falso no incluyas "opciones".
Para abierta no incluyas "opciones".`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
    let clean = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();
    
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }

    const exam = JSON.parse(clean);
    return NextResponse.json(exam);

  } catch (error: any) {
    console.error("Error generando examen:", error?.message || error);
    return NextResponse.json({ error: "No se pudo generar el examen." }, { status: 500 });
  }
}