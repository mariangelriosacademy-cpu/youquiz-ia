"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2, CheckCircle, XCircle, Sun, Moon } from "lucide-react";

interface Pregunta {
  id: number;
  tipo: string;
  pregunta: string;
  opciones?: string[];
  respuesta_correcta: string;
  explicacion: string;
}

export default function QuizPage() {
  const { examId } = useParams();
  const [examen, setExamen] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pantalla, setPantalla] = useState<"bienvenida" | "preguntas" | "resultado">("bienvenida");
  const [darkMode, setDarkMode] = useState(true);

  const [nombre, setNombre] = useState("");
  const [seccionEst, setSeccionEst] = useState("");

  const [actual, setActual] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [respuestaActual, setRespuestaActual] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [timerActivo, setTimerActivo] = useState(false);
  const [mostrarRetro, setMostrarRetro] = useState(false);
  const [retroEsCorrecta, setRetroEsCorrecta] = useState(false);

  const bg = darkMode ? "bg-[#0F0F1A]" : "bg-slate-100";
  const card = darkMode ? "bg-white/5 border-white/10" : "bg-white border-slate-200";
  const texto = darkMode ? "text-white" : "text-slate-800";
  const subtexto = darkMode ? "text-slate-400" : "text-slate-500";
  const input = darkMode
    ? "bg-white/5 border-white/10 text-white placeholder-slate-500"
    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400";
  const btnOpcion = (seleccionado: boolean) => darkMode
    ? seleccionado ? "bg-violet-600 border-violet-500 text-white" : "bg-white/5 border-white/10 text-slate-300 hover:border-violet-500"
    : seleccionado ? "bg-violet-600 border-violet-500 text-white" : "bg-white border-slate-200 text-slate-700 hover:border-violet-500";

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase.from("exams").select("*").eq("id", examId).single();
      setExamen(data);
      setLoading(false);
    }
    cargar();
  }, [examId]);

  useEffect(() => {
    if (pantalla !== "preguntas" || !examen) return;
    const pregunta = examen.preguntas[actual];
    const tiempo = pregunta.tipo === "abierta" ? 90 : 45;
    setTiempoRestante(tiempo);
    setTimerActivo(true);
    setMostrarRetro(false);
    setRespuestaActual("");
  }, [actual, pantalla]);

  useEffect(() => {
    if (!timerActivo || tiempoRestante <= 0) {
      if (tiempoRestante === 0 && timerActivo) {
        setTimerActivo(false);
        if (!mostrarRetro) manejarRespuesta(true);
      }
      return;
    }
    const interval = setInterval(() => {
      setTiempoRestante(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActivo, tiempoRestante]);

  function getTiempoTotal() {
    if (!examen) return 45;
    return examen.preguntas[actual]?.tipo === "abierta" ? 90 : 45;
  }

  function manejarRespuesta(porTiempo = false) {
    if (mostrarRetro) return;
    setTimerActivo(false);
    const pregunta = examen.preguntas[actual];
    const esCorrecta = !porTiempo &&
      respuestaActual.trim().toLowerCase() === pregunta.respuesta_correcta.trim().toLowerCase();
    setRetroEsCorrecta(esCorrecta);
    setMostrarRetro(true);
  }

  function siguiente() {
    const pregunta = examen.preguntas[actual];
    const esCorrecta = respuestaActual.trim().toLowerCase() === pregunta.respuesta_correcta.trim().toLowerCase();
    const nuevasRespuestas = [...respuestas, respuestaActual];
    setRespuestas(nuevasRespuestas);
    if (esCorrecta) setPuntaje(p => p + 1);
    setMostrarRetro(false);
    if (actual + 1 < examen.preguntas.length) {
      setActual(actual + 1);
    } else {
      guardarResultados(nuevasRespuestas, esCorrecta ? puntaje + 1 : puntaje);
    }
  }

  function comenzar() {
  if (!nombre.trim() || !seccionEst.trim()) return;
  const key = `quiz_completado_${examId}`;
  if (localStorage.getItem(key)) {
    alert("Ya presentaste este examen. Solo se permite un intento por dispositivo.");
    return;
  }
  setPantalla("preguntas");
}

  async function guardarResultados(todasRespuestas: string[], puntajeFinal: number) {
    setGuardando(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: sesion } = await supabase.from("exam_sessions").insert({
      exam_id: examId,
      estudiante_nombre: nombre,
      puntaje: puntajeFinal,
      total: examen.preguntas.length,
      seccion: seccionEst,
    }).select().single();

    if (sesion) {
      await supabase.from("responses").insert(
        examen.preguntas.map((p: Pregunta, i: number) => ({
          session_id: sesion.id,
          pregunta_index: i,
          respuesta_dada: todasRespuestas[i] || "",
          es_correcta: todasRespuestas[i]?.trim().toLowerCase() === p.respuesta_correcta.trim().toLowerCase(),
        }))
      );
    }
    localStorage.setItem(`quiz_completado_${examId}`, "true");
    setPuntaje(puntajeFinal);
    setGuardando(false);
    setPantalla("resultado");
  }

  function getMensaje(porcentaje: number) {
    if (porcentaje >= 90) return { texto: "¡Excelente! 🏆", color: "text-green-400" };
    if (porcentaje >= 70) return { texto: "¡Muy bien! 👏", color: "text-blue-400" };
    if (porcentaje >= 50) return { texto: "Sigue practicando 💪", color: "text-yellow-400" };
    return { texto: "Repasa el tema 📚", color: "text-red-400" };
  }

  if (loading) return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <Loader2 className="animate-spin text-violet-400" size={28} />
    </div>
  );

  if (!examen) return (
    <div className={`min-h-screen ${bg} flex items-center justify-center`}>
      <p className={subtexto}>Examen no encontrado.</p>
    </div>
  );

  const preguntaActual: Pregunta = examen.preguntas[actual];
  const porcentaje = Math.round((puntaje / examen.preguntas.length) * 100);
  const mensaje = getMensaje(porcentaje);
  const tiempoTotal = getTiempoTotal();
  const tiempoPct = (tiempoRestante / tiempoTotal) * 100;
  const tiempoColor = tiempoRestante <= 10 ? "text-red-400" : tiempoRestante <= 20 ? "text-yellow-400" : "text-green-400";
  const tiempoBarColor = tiempoRestante <= 10 ? "bg-red-500" : tiempoRestante <= 20 ? "bg-yellow-500" : "bg-green-500";

  return (
    <main className={`min-h-screen ${bg} flex items-center justify-center px-4 py-10 transition-colors duration-300`}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <img src="/logo.png" alt="YouQuiz IA" className="h-8 w-auto" />
          <button onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition ${darkMode
              ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"}`}>
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* BIENVENIDA */}
        {pantalla === "bienvenida" && (
          <div className={`${card} border rounded-2xl p-8`}>
            <h1 className={`text-xl font-bold ${texto} mb-1`}>{examen.titulo}</h1>
            <p className={`${subtexto} text-sm mb-2`}>
  {examen.preguntas.length} preguntas
  {examen.grado ? ` · ${examen.grado}` : ""}
  {examen.asignatura ? ` · ${examen.asignatura}` : ""}
</p>
<p className={`${subtexto} text-xs mb-2`}>Completa tus datos para comenzar</p>
            <div className={`flex items-center gap-2 text-xs mb-6 ${subtexto}`}>
              <span>⏱️ 45 seg por pregunta (90 seg preguntas abiertas)</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-medium ${subtexto} mb-1`}>Nombre completo *</label>
                <input type="text" placeholder="Ej: María González"
                  value={nombre} onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && comenzar()}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} />
              </div>
              <div>
                <label className={`block text-xs font-medium ${subtexto} mb-1`}>Sección *</label>
                <input type="text" placeholder="Ej: A, B, C..."
                  value={seccionEst} onChange={(e) => setSeccionEst(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && comenzar()}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 ${input}`} />
              </div>
              <button onClick={comenzar} disabled={!nombre.trim() || !seccionEst.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium rounded-xl py-3 text-sm transition mt-2">
                Comenzar examen →
              </button>
            </div>
          </div>
        )}

        {/* PREGUNTAS */}
        {pantalla === "preguntas" && (
          <div className={`${card} border rounded-2xl p-6`}>

            {/* Progreso */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={subtexto}>Pregunta {actual + 1} de {examen.preguntas.length}</span>
                <span className="text-violet-400 font-medium">
                  {Math.round((actual / examen.preguntas.length) * 100)}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${darkMode ? "bg-white/10" : "bg-slate-200"}`}>
                <div className="bg-violet-600 h-2 rounded-full transition-all"
                  style={{ width: `${(actual / examen.preguntas.length) * 100}%` }} />
              </div>
            </div>

            {/* Temporizador */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className={subtexto}>⏱️ Tiempo restante</span>
                <span className={`font-bold text-sm ${tiempoColor}`}>{tiempoRestante}s</span>
              </div>
              <div className={`w-full rounded-full h-2 ${darkMode ? "bg-white/10" : "bg-slate-200"}`}>
                <div className={`${tiempoBarColor} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${tiempoPct}%` }} />
              </div>
            </div>

            <p className={`${texto} font-medium text-base mb-5`}>{preguntaActual.pregunta}</p>

            {!mostrarRetro && (
              <>
                {preguntaActual.tipo === "multiple" && preguntaActual.opciones && (
                  <div className="space-y-2 mb-5">
                    {preguntaActual.opciones.map((op, j) => (
                      <button key={j} onClick={() => setRespuestaActual(op)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition ${btnOpcion(respuestaActual === op)}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                )}

                {preguntaActual.tipo === "verdadero_falso" && (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {["Verdadero", "Falso"].map((op) => (
                      <button key={op} onClick={() => setRespuestaActual(op)}
                        className={`py-4 rounded-xl text-sm font-medium border transition ${btnOpcion(respuestaActual === op)}`}>
                        {op === "Verdadero" ? "✅ Verdadero" : "❌ Falso"}
                      </button>
                    ))}
                  </div>
                )}

                {preguntaActual.tipo === "abierta" && (
                  <textarea placeholder="Escribe tu respuesta aquí..."
                    value={respuestaActual} onChange={(e) => setRespuestaActual(e.target.value)}
                    rows={4}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none mb-5 ${input}`} />
                )}

                <button onClick={() => manejarRespuesta()}
                  disabled={!respuestaActual.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium rounded-xl py-3 text-sm transition">
                  Responder
                </button>
              </>
            )}

            {/* RETROALIMENTACIÓN */}
            {mostrarRetro && (
              <div className={`rounded-xl p-4 mb-4 border ${retroEsCorrecta
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {retroEsCorrecta
                    ? <CheckCircle size={18} className="text-green-400" />
                    : <XCircle size={18} className="text-red-400" />}
                  <p className={`font-semibold text-sm ${retroEsCorrecta ? "text-green-400" : "text-red-400"}`}>
                    {retroEsCorrecta ? "¡Correcto! 🎉" : "Incorrecto 😕"}
                  </p>
                </div>
                {!retroEsCorrecta && (
                  <p className="text-xs text-green-400 mb-1">
                    Respuesta correcta: <strong>{preguntaActual.respuesta_correcta}</strong>
                  </p>
                )}
                <p className={`text-xs ${subtexto}`}>{preguntaActual.explicacion}</p>
                <button onClick={siguiente} disabled={guardando}
                  className="mt-3 w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-medium rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2">
                  {guardando ? <Loader2 size={14} className="animate-spin" /> : null}
                  {actual + 1 === examen.preguntas.length ? "Ver resultados →" : "Siguiente pregunta →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* RESULTADO */}
        {pantalla === "resultado" && (
          <div className={`${card} border rounded-2xl p-8`}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎓</div>
              <p className={`text-xs ${subtexto} mb-2`}>{nombre} · Sección {seccionEst}</p>
              <h2 className={`text-3xl font-bold ${texto} mb-1`}>{puntaje}/{examen.preguntas.length}</h2>
              <p className={`text-lg font-semibold mb-1 ${mensaje.color}`}>{mensaje.texto}</p>
              <p className={`${subtexto} text-sm`}>{porcentaje}% de respuestas correctas</p>
            </div>

            <div className="space-y-3 mb-5">
              <p className={`text-xs font-semibold ${subtexto} uppercase tracking-wide`}>Revisión de respuestas</p>
              {examen.preguntas.map((p: Pregunta, i: number) => {
                const esCorrecta = respuestas[i]?.trim().toLowerCase() === p.respuesta_correcta.trim().toLowerCase();
                return (
                  <div key={i} className={`rounded-xl p-3 border ${esCorrecta
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"}`}>
                    <div className="flex items-start gap-2">
                      {esCorrecta
                        ? <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                        : <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className={`${texto} text-xs font-medium`}>{p.pregunta}</p>
                        {!esCorrecta && (
                          <>
                            <p className="text-red-400 text-xs mt-0.5">Tu respuesta: {respuestas[i] || "Sin respuesta"}</p>
                            <p className="text-green-400 text-xs">Correcta: {p.respuesta_correcta}</p>
                          </>
                        )}
                        <p className={`${subtexto} text-xs mt-0.5`}>{p.explicacion}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={`${subtexto} text-xs text-center`}>Tus resultados han sido guardados ✓</p>
          </div>
        )}
      </div>
    </main>
  );
}