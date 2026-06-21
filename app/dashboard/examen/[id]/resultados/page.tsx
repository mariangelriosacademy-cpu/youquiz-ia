"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Trophy, Users, TrendingUp, TrendingDown, Download, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

export default function ResultadosPage() {
  const { id } = useParams();
  const router = useRouter();
  const [examen, setExamen] = useState<any>(null);
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, any[]>>({});
  const [expandido, setExpandido] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: exam } = await supabase.from("exams").select("*").eq("id", id).single();
      const { data: ses } = await supabase.from("exam_sessions").select("*").eq("exam_id", id).order("completado_at", { ascending: false });
      setExamen(exam);
      setSesiones(ses || []);
      setLoading(false);
    }
    cargar();
  }, [id]);

  async function cargarRespuestas(sessionId: string) {
    if (respuestas[sessionId]) {
      setExpandido(expandido === sessionId ? null : sessionId);
      return;
    }
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase.from("responses").select("*").eq("session_id", sessionId).order("pregunta_index");
    setRespuestas(prev => ({ ...prev, [sessionId]: data || [] }));
    setExpandido(sessionId);
  }

  function getLogro(porcentaje: number) {
    if (porcentaje >= 90) return { label: "Excelente", color: "bg-green-500/20 text-green-400", emoji: "🏆" };
    if (porcentaje >= 70) return { label: "Aprobado", color: "bg-blue-500/20 text-blue-400", emoji: "✅" };
    if (porcentaje >= 50) return { label: "Regular", color: "bg-yellow-500/20 text-yellow-400", emoji: "⚠️" };
    return { label: "Reprobado", color: "bg-red-500/20 text-red-400", emoji: "❌" };
  }

  async function descargarPDF() {
    if (!examen || sesiones.length === 0) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const ancho = doc.internal.pageSize.getWidth();

    const aprobadosPDF = sesiones.filter(s => (s.puntaje / s.total) * 100 >= 70).length;
    const reprobadosPDF = sesiones.length - aprobadosPDF;
    const promedioPDF = sesiones.length > 0
      ? Math.round(sesiones.reduce((acc, s) => acc + (s.puntaje / s.total) * 100, 0) / sesiones.length) : 0;
    const mejorPDF = sesiones.length > 0 ? Math.max(...sesiones.map(s => Math.round((s.puntaje / s.total) * 100))) : 0;
    const peorPDF = sesiones.length > 0 ? Math.min(...sesiones.map(s => Math.round((s.puntaje / s.total) * 100))) : 0;
    const aprobadosPct = sesiones.length > 0 ? Math.round((aprobadosPDF / sesiones.length) * 100) : 0;
    const titulo = examen.titulo.replace(/ \(.*?\)/g, "");
    const fechaHoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

    doc.setFillColor(108, 63, 196);
    doc.rect(0, 0, ancho, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("REPORTE DE RESULTADOS", ancho / 2, 11, { align: "center" });
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, ancho / 2, 22, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (examen.docente_nombre) doc.text(`Docente: ${examen.docente_nombre}`, ancho / 2, 31, { align: "center" });
    if (examen.asignatura) doc.text(`Asignatura: ${examen.asignatura}`, ancho / 2, 38, { align: "center" });
    doc.text(`Fecha: ${fechaHoy}`, ancho / 2, 46, { align: "center" });

    const metricas = [
      { label: "Total estudiantes", valor: String(sesiones.length) },
      { label: "Aprobados", valor: `${aprobadosPDF} (${aprobadosPct}%)` },
      { label: "Reprobados", valor: String(reprobadosPDF) },
      { label: "Promedio general", valor: `${promedioPDF}%` },
      { label: "Mejor nota", valor: `${mejorPDF}%` },
      { label: "Nota mas baja", valor: `${peorPDF}%` },
    ];

    const colW = (ancho - 28) / 3;
    let y = 58;
    metricas.forEach((m, i) => {
      const col = i % 3;
      const fila = Math.floor(i / 3);
      const x = 14 + col * colW;
      const yPos = y + fila * 22;
      doc.setFillColor(243, 238, 255);
      doc.roundedRect(x, yPos, colW - 4, 18, 2, 2, "F");
      doc.setTextColor(120, 100, 160);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(m.label.toUpperCase(), x + 4, yPos + 6);
      doc.setTextColor(50, 20, 100);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(m.valor, x + 4, yPos + 14);
    });
    y += 50;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80, 80, 80);
    doc.text(`Tasa de aprobacion: ${aprobadosPct}%`, 14, y + 5);
    doc.setFillColor(220, 220, 230);
    doc.roundedRect(14, y + 8, ancho - 28, 6, 3, 3, "F");
    if (aprobadosPct > 0) {
      doc.setFillColor(108, 63, 196);
      doc.roundedRect(14, y + 8, ((ancho - 28) * aprobadosPct) / 100, 6, 3, 3, "F");
    }
    y += 22;

    autoTable(doc, {
      startY: y,
      head: [["#", "Estudiante", "Seccion", "Puntaje", "Total", "%", "Logro", "Fecha"]],
      body: sesiones.map((s, idx) => {
        const pct = Math.round((s.puntaje / s.total) * 100);
        const logro = pct >= 90 ? "Excelente" : pct >= 70 ? "Aprobado" : pct >= 50 ? "Regular" : "Reprobado";
        return [idx + 1, s.estudiante_nombre, s.seccion || "-", s.puntaje, s.total, `${pct}%`, logro,
          new Date(s.completado_at).toLocaleDateString("es-ES")];
      }),
      headStyles: { fillColor: [108, 63, 196], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        2: { halign: "center" }, 3: { halign: "center" }, 4: { halign: "center" },
        5: { halign: "center", fontStyle: "bold" }, 6: { halign: "center" }, 7: { halign: "center" },
      },
      didDrawCell: (data: any) => {
        if (data.section === "body" && data.column.index === 6) {
          const val = data.cell.text[0];
          const colors: Record<string, [number, number, number]> = {
            "Excelente": [34, 197, 94], "Aprobado": [59, 130, 246],
            "Regular": [234, 179, 8], "Reprobado": [239, 68, 68],
          };
          const c = colors[val] || [150, 150, 150];
          doc.setTextColor(c[0], c[1], c[2]);
          doc.setFont("helvetica", "bold");
          doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "normal");
          return false;
        }
      },
    });

    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
      doc.setPage(pg);
      const h = doc.internal.pageSize.getHeight();
      doc.setFillColor(240, 237, 255);
      doc.rect(0, h - 14, ancho, 14, "F");
      doc.setFontSize(8);
      doc.setTextColor(130, 100, 180);
      doc.setFont("helvetica", "normal");
      doc.text("Generado con YouQuiz IA", 14, h - 5);
      doc.text(`Pagina ${pg} de ${totalPages}`, ancho - 14, h - 5, { align: "right" });
    }
    doc.save(`Resultados-${titulo}.pdf`);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-violet-400 animate-pulse">Cargando resultados...</div>
    </div>
  );

  const aprobados = sesiones.filter(s => (s.puntaje / s.total) * 100 >= 70).length;
  const reprobados = sesiones.length - aprobados;
  const promedio = sesiones.length > 0
    ? Math.round(sesiones.reduce((acc, s) => acc + (s.puntaje / s.total) * 100, 0) / sesiones.length) : 0;
  const mejor = sesiones.length > 0 ? Math.max(...sesiones.map(s => Math.round((s.puntaje / s.total) * 100))) : 0;
  const peor = sesiones.length > 0 ? Math.min(...sesiones.map(s => Math.round((s.puntaje / s.total) * 100))) : 0;

  return (
    <div className="min-h-screen bg-[#0F0F1A] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <button onClick={() => router.push(`/dashboard/examen/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
          <ArrowLeft size={16} /> Volver al examen
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">📊 Resultados</h1>
            <p className="text-slate-400 text-sm mt-0.5">{examen?.titulo}</p>
            {examen?.docente_nombre && <p className="text-slate-500 text-xs mt-0.5">Docente: {examen.docente_nombre}</p>}
          </div>
          {sesiones.length > 0 && (
            <button onClick={descargarPDF}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              <Download size={14} /> Descargar PDF
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <Users size={18} className="text-violet-400" />, label: "Estudiantes", valor: sesiones.length, color: "text-white" },
            { icon: <Trophy size={18} className="text-green-400" />, label: "Aprobados", valor: `${aprobados} (${sesiones.length > 0 ? Math.round((aprobados / sesiones.length) * 100) : 0}%)`, color: "text-green-400" },
            { icon: <TrendingUp size={18} className="text-blue-400" />, label: "Promedio", valor: `${promedio}%`, color: "text-blue-400" },
            { icon: <TrendingDown size={18} className="text-red-400" />, label: "Reprobados", valor: reprobados, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="mb-2">{stat.icon}</div>
              <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.valor}</p>
            </div>
          ))}
        </div>

        {sesiones.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-300 font-medium">Tasa de aprobación</p>
              <p className="text-sm font-bold text-white">{Math.round((aprobados / sesiones.length) * 100)}%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-violet-600 to-green-500 h-3 rounded-full transition-all"
                style={{ width: `${(aprobados / sesiones.length) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Mejor: {mejor}%</span>
              <span>Peor: {peor}%</span>
            </div>
          </div>
        )}

        {sesiones.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-white font-medium">Aún no hay respuestas</p>
            <p className="text-slate-400 text-sm mt-1">Comparte el link del examen con tus estudiantes</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-sm font-semibold text-slate-300">Detalle por estudiante</h2>
            </div>
            <div className="divide-y divide-white/5">
              {sesiones.map((s, i) => {
                const pct = Math.round((s.puntaje / s.total) * 100);
                const logro = getLogro(pct);
                const estaExpandido = expandido === s.id;
                const resps = respuestas[s.id] || [];

                return (
                  <div key={i}>
                    <div className="px-5 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-400 text-sm font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{s.estudiante_nombre}</p>
                        <p className="text-slate-500 text-xs">
                          {new Date(s.completado_at).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                          {s.seccion && ` · Sección ${s.seccion}`}
                        </p>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <p className="text-white font-bold text-sm">{s.puntaje}/{s.total}</p>
                        <p className="text-slate-400 text-xs">{pct}%</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${logro.color}`}>
                          {logro.emoji} {logro.label}
                        </span>
                      </div>
                      <div className="w-20 flex-shrink-0 hidden sm:block">
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className={`h-2 rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <button onClick={() => cargarRespuestas(s.id)}
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-lg text-xs transition">
                        {estaExpandido ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        Ver
                      </button>
                    </div>

                    {/* RESPUESTAS EXPANDIDAS */}
                    {estaExpandido && (
                      <div className="px-5 pb-4 bg-white/2">
                        <div className="bg-black/20 rounded-xl p-4 space-y-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Respuestas de {s.estudiante_nombre}</p>
                          {resps.map((r, j) => {
                            const pregunta = examen?.preguntas?.[r.pregunta_index];
                            return (
                              <div key={j} className={`rounded-lg p-3 border ${r.es_correcta ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                                <div className="flex items-start gap-2">
                                  {r.es_correcta
                                    ? <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                                    : <XCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-300 text-xs font-medium">{pregunta?.pregunta || `Pregunta ${r.pregunta_index + 1}`}</p>
                                    <p className={`text-xs mt-1 ${r.es_correcta ? "text-green-400" : "text-red-400"}`}>
                                      Respondió: <span className="font-medium">{r.respuesta_dada || "Sin respuesta"}</span>
                                    </p>
                                    {!r.es_correcta && pregunta?.respuesta_correcta && (
                                      <p className="text-xs text-green-400 mt-0.5">
                                        Correcta: <span className="font-medium">{pregunta.respuesta_correcta}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}