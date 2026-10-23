import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ===== Clases con colores directos (Hex) para garantizar que funcionen al 100% =====
const BOTON =
  'inline-flex items-center justify-center rounded-sm border border-[#3b1f0e] px-9 py-3 font-[inherit] text-[12px] font-semibold uppercase tracking-[0.14em] no-underline cursor-pointer'
const BOTON_VOLVER = `${BOTON} bg-transparent text-[#3b1f0e] hover:bg-[#3b1f0e]/10`
const BOTON_ENVIAR = `${BOTON} bg-[#3b1f0e] text-[#f2e9dc] enabled:hover:bg-[#6b3a1f] disabled:cursor-not-allowed disabled:opacity-40`

// Colores de los bloques de resultado
const ESTILOS = {
  acierto: {
    tarjeta: 'border-[#bfe3cb] bg-[#f7fcf9]',
    cabecera: 'border-[#d3eadb] bg-[#eef7f1]',
    icono: 'bg-[#27ae60]',
    color: 'text-[#27ae60]',
    cajaUsuario: 'flex-[0_1_540px] border-[#b7dcc4] bg-[#f1faf4]',
  },
  fallo: {
    tarjeta: 'border-[#f2c0bb] bg-[#fff8f7]',
    cabecera: 'border-[#f6d3cf] bg-[#fdecea]',
    icono: 'bg-[#c0392b]',
    color: 'text-[#c0392b]',
    cajaUsuario: 'flex-1 border-[#f2c0bb] bg-[#fdecea]',
  },
}

function Dato({ numero, texto, clases }) {
  return (
    <div
      className={`flex min-w-[104px] flex-col items-center rounded-lg border px-5 py-2 ${clases}`}
    >
      <strong className="font-titulo text-[26px] leading-[1.1]">{numero}</strong>
      <span className="text-[10px] uppercase tracking-[0.14em]">{texto}</span>
    </div>
  )
}

function Pregunta() {
  const [preguntas, setPreguntas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [respuestas, setRespuestas] = useState({})
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    fetch('/api/preguntas')
      .then((res) => {
        if (!res.ok) throw new Error('Falló el servidor')
        return res.json()
      })
      .then((datos) => setPreguntas(datos))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  function elegir(idPregunta, letra) {
    setRespuestas({ ...respuestas, [idPregunta]: letra })
  }

  function enviar() {
    setEnviado(true)
    window.scrollTo(0, 0)
  }

  const total = preguntas.length
  const respondidas = Object.keys(respuestas).length
  const todasRespondidas = total > 0 && respondidas === total

  const aciertos = preguntas.filter((p) => {
    const elegida = p.opciones.find((o) => o.letra === respuestas[p.id])
    return elegida?.correcta
  }).length
  const fallos = total - aciertos
  const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0

  const PAGINA =
    'min-h-screen bg-[#f2e9dc] px-4 pb-8 pt-5 font-cuerpo text-[#3b1f0e] md:px-10 md:pb-10 md:pt-7'
  const CABECERA =
    'mb-6 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between'
  const TITULO = 'font-titulo text-[30px] font-bold text-[#3b1f0e]'

  // =====================================================
  //  VISTA 2: RESULTADOS
  // =====================================================
  if (enviado) {
    return (
      <main className={PAGINA}>
        <header className={CABECERA}>
          <h1 className={TITULO}>Resultados del aprendizaje</h1>

          <div className="flex gap-[10px]">
            <Dato numero={aciertos} texto="Correctas" clases="border-[#bfe3cb] bg-[#eef7f1] text-[#27ae60]" />
            <Dato numero={fallos} texto="Incorrectas" clases="border-[#f2c0bb] bg-[#fdecea] text-[#c0392b]" />
            <Dato numero={`${porcentaje}%`} texto="Puntaje" clases="border-[#3b1f0e] bg-[#3b1f0e] text-[#d9a066]" />
          </div>
        </header>

        {preguntas.map((p, i) => {
          const elegida = p.opciones.find((o) => o.letra === respuestas[p.id])
          const correcta = p.opciones.find((o) => o.correcta)
          const acerto = Boolean(elegida?.correcta)
          const numero = String(i + 1).padStart(2, '0')
          const e = acerto ? ESTILOS.acierto : ESTILOS.fallo

          return (
            <article
              key={p.id}
              className={`mb-[14px] overflow-hidden rounded-xl border ${e.tarjeta}`}
            >
              <div className={`flex items-center gap-4 border-b px-6 py-[14px] ${e.cabecera}`}>
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full text-[18px] font-bold text-white ${e.icono}`}
                >
                  {acerto ? '✓' : '✗'}
                </span>
                <div>
                  <span className={`mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] ${e.color}`}>
                    Pregunta {numero} — {acerto ? 'Correcta' : 'Incorrecta'}
                  </span>
                  <h2 className="font-titulo text-[15px] font-bold text-[#3b1f0e]">
                    {p.enunciado}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-[10px] p-4 md:py-4 md:pl-[76px] md:pr-6">
                <div className={`min-w-[220px] rounded-md border px-4 py-[10px] ${e.cajaUsuario}`}>
                  <span className={`mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] ${e.color}`}>
                    {acerto ? '✓ Tu respuesta (correcta)' : '✗ Tu respuesta'}
                  </span>
                  <span className="block text-[13px] text-[#3b1f0e]">
                    {elegida.letra}) {elegida.texto}
                  </span>
                </div>

                {!acerto && correcta && (
                  <div className="min-w-[220px] flex-1 rounded-md border border-[#b7dcc4] bg-[#f1faf4] px-4 py-[10px]">
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#27ae60]">
                      ✓ Respuesta correcta
                    </span>
                    <span className="block text-[13px] text-[#3b1f0e]">
                      {correcta.letra}) {correcta.texto}
                    </span>
                  </div>
                )}
              </div>
            </article>
          )
        })}

        <footer className="mt-6 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Link to="/" state={{ saltarCarga: true }} className={BOTON_VOLVER}>
            Volver al inicio
          </Link>
        </footer>
      </main>
    )
  }

  // =====================================================
  //  VISTA 1: RESPONDER
  // =====================================================
  return (
    <main className={PAGINA}>
      <header className={CABECERA}>
        <h1 className={TITULO}>Modo aprendizaje</h1>

        {total > 0 && (
          <div className="flex items-center gap-3 text-[12px] tracking-[0.08em] text-[#6b3a1f]">
            <span>
              Respondidas {respondidas} de {total}
            </span>
            <div className="h-[7px] w-[110px] overflow-hidden rounded-sm bg-[#dcc7ab]">
              <div
                className="h-full bg-[#3b1f0e] transition-[width] duration-300"
                style={{ width: `${(respondidas / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {cargando && <p>Cargando preguntas...</p>}
      {error && <p>No se pudieron cargar las preguntas.</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {preguntas.map((p, i) => {
          const ultimaImpar = total % 2 === 1 && i === total - 1

          return (
            <section
              key={p.id}
              className={`rounded-xl border border-[#dcc7ab] bg-[#fcf8f3] px-4 py-[18px] ${ultimaImpar ? 'md:col-span-2' : ''}`}
            >
              <div className="mb-[14px] flex items-center gap-3">
                <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-[#3b1f0e] font-titulo text-[10px] font-bold text-[#f2e9dc]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[13px] font-bold">{p.enunciado}</p>
              </div>

              <div
                className={`grid grid-cols-1 gap-[6px] ${ultimaImpar ? 'md:grid-cols-2 md:gap-y-1' : ''}`}
              >
                {p.opciones.map((o) => {
                  const elegida = respuestas[p.id] === o.letra

                  return (
                    <button
                      type="button"
                      key={o.letra}
                      aria-pressed={elegida}
                      onClick={() => elegir(p.id, o.letra)}
                      className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-[9px] text-left font-[inherit] text-[12px] transition-colors duration-150 ${
                        elegida
                          ? 'border-[#3b1f0e] bg-[#3b1f0e] text-[#f2e9dc]'
                          : 'border-[#dcc7ab] bg-white text-[#6b3a1f] hover:bg-[#f2e7da]'
                      }`}
                    >
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full border font-titulo text-[10px] font-bold ${
                          elegida
                            ? 'border-[#c98b57] bg-[#c98b57] text-white'
                            : 'border-[#dcc7ab] bg-white text-[#3b1f0e]'
                        }`}
                      >
                        {o.letra}
                      </span>
                      <span className={elegida ? 'text-[#f2e9dc]' : 'text-[#6b3a1f]'}>
                        {o.texto}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {total > 0 && (
        <footer className="mt-6 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <Link to="/" state={{ saltarCarga: true }} className={BOTON_VOLVER}>
            Volver
          </Link>
          <button
            type="button"
            className={BOTON_ENVIAR}
            disabled={!todasRespondidas}
            onClick={enviar}
          >
            Enviar respuestas
          </button>
        </footer>
      )}
    </main>
  )
}

export default Pregunta