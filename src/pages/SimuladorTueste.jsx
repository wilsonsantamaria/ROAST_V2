import { useEffect, useRef, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'

// ===== Ajustes de la simulación =====
const VELOCIDAD = 10 // 1 segundo real = 10 segundos simulados
const AMBIENTE = 25
const PASO_MS = 100

// Color del grano según su temperatura (verde -> amarillo -> canela -> café -> oscuro)
const COLORES = [
  [25, [154, 171, 107]],
  [120, [200, 190, 100]],
  [160, [205, 160, 80]],
  [190, [160, 105, 55]],
  [210, [110, 66, 36]],
  [230, [62, 36, 22]],
  [250, [30, 18, 12]],
]

function colorGrano(t) {
  if (t <= COLORES[0][0]) return `rgb(${COLORES[0][1].join(',')})`
  for (let i = 1; i < COLORES.length; i++) {
    const [t1, c1] = COLORES[i]
    if (t <= t1) {
      const [t0, c0] = COLORES[i - 1]
      const f = (t - t0) / (t1 - t0)
      return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(',')})`
    }
  }
  return `rgb(${COLORES[COLORES.length - 1][1].join(',')})`
}

function nombreColor(t) {
  if (t < 110) return 'verde'
  if (t < 160) return 'amarillo pajizo'
  if (t < 190) return 'canela'
  if (t < 210) return 'café medio'
  if (t < 230) return 'café oscuro'
  return 'muy oscuro (casi quemado)'
}

// Posiciones fijas de los granos dentro del tambor (patrón en espiral)
const GRANOS = Array.from({ length: 30 }, (_, i) => {
  const a = i * 2.399963
  const r = 4 + 40 * Math.sqrt(i / 30)
  return { x: 250 + r * Math.cos(a), y: 230 + r * Math.sin(a), rot: (i * 47) % 180 }
})

// Granos que caen en la bandeja de enfriamiento
const GRANOS_BANDEJA = Array.from({ length: 45 }, (_, i) => {
  const a = i * 2.399963
  const r = Math.sqrt(i / 45)
  return { x: 250 + r * 165 * Math.cos(a), y: 425 + r * 28 * Math.sin(a), rot: (i * 61) % 180 }
})

function formatoTiempo(seg) {
  const s = Math.floor(seg)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Piezas de la máquina que se pueden tocar (coordenadas en el dibujo de 500 x 520)
const PIEZAS = [
  { id: 'tolva', nombre: 'Tolva', x: 175, y: 15, w: 150, h: 85, abajo: true },
  { id: 'muestra', nombre: 'Ventana de muestra', x: 195, y: 175, w: 110, h: 110, redondo: true },
  { id: 'encendido', nombre: 'Encendido', x: 367, y: 198, w: 26, h: 26, redondo: true },
  { id: 'tambor', nombre: 'Tambor', x: 409, y: 198, w: 26, h: 26, redondo: true },
  { id: 'quemador', nombre: 'Quemador', x: 451, y: 198, w: 26, h: 26, redondo: true },
  { id: 'compuerta', nombre: 'Compuerta de descarga', x: 224, y: 340, w: 52, h: 34 },
  { id: 'bandeja', nombre: 'Bandeja de enfriamiento', x: 50, y: 385, w: 400, h: 85, redondo: true },
]

const ESTADO_FASE = { espera: 'Listo', tostando: 'Tostando', terminado: 'Terminado' }

const CTL_INICIAL = {
  encendida: false,
  tambor: false,
  quemador: false,
  cargada: false,
  agitador: false,
  fase: 'espera',
  potencia: 70,
  objetivo: 220,
}

const SIM_INICIAL = {
  tiempo: 0,
  grano: AMBIENTE,
  aire: AMBIENTE,
  quemado: 0,
  crack1: null,
  crack2: null,
  hist: [{ t: 0, g: AMBIENTE, a: AMBIENTE }],
  filas: [{ t: 0, g: AMBIENTE, a: AMBIENTE }],
}

export default function SimuladorTueste() {
  const location = useLocation()
  const { desafioActual, nivelDificultad, operador } = location.state || {}

  const [ctl, setCtl] = useState(CTL_INICIAL)
  const [sim, setSim] = useState(SIM_INICIAL)
  const [aviso, setAviso] = useState('')
  const [resultado, setResultado] = useState(null)
  const ctlRef = useRef(ctl)
  const avisoRef = useRef(null)

  // Datos del desafío (vienen de la base de datos)
  const d = desafioActual || {}
  const nivel = nivelDificultad || 'facil'
  const crack1 = Number(d.temp_primer_crack_c) || 196
  const crack2 = Number(d.temp_segundo_crack_c) || crack1 + 28
  const limite = Number(d.tiempo_limite_seg) || 960

  const VENTANAS = {
    facil: [crack1 - 14, crack1],
    medio: [crack1, crack1 + 14],
    dificil: [crack1 + 14, crack2 + 6],
  }
  const PISTAS = {
    facil: `Mantén la temperatura por debajo de ${crack1}°C y descarga justo antes del primer crack.`,
    medio: `Pasa el primer crack (${crack1}°C) y descarga antes de ${crack1 + 14}°C.`,
    dificil: `Supera los ${crack1 + 14}°C y desarrolla el grano hasta el segundo crack con calma.`,
  }

  useEffect(() => {
    ctlRef.current = ctl
  }, [ctl])

  // ===== Motor de la simulación: todo está conectado aquí =====
  useEffect(() => {
    const timer = setInterval(() => {
      const c = ctlRef.current
      setSim((s) => {
        const dt = (PASO_MS / 1000) * VELOCIDAD
        const terminado = c.fase === 'terminado'

        // El quemador calienta el aire; si pasa la temperatura objetivo, baja su fuerza
        const fuerza = c.encendida && c.quemador && !terminado ? c.potencia * (s.aire < c.objetivo ? 1 : 0.35) : 0
        const aireMeta = AMBIENTE + (fuerza / 100) * 235
        const aire = s.aire + (aireMeta - s.aire) * 0.012 * dt

        // El grano se calienta con el aire (más rápido si el tambor gira) y se enfría en la bandeja
        let grano = s.grano
        if (terminado) {
          grano += (AMBIENTE - grano) * (c.agitador ? 0.02 : 0.004) * dt
        } else if (c.cargada) {
          grano += (aire - grano) * (c.tambor ? 0.009 : 0.003) * dt
        }

        const tostando = c.fase === 'tostando'
        const tiempo = tostando ? s.tiempo + dt : s.tiempo

        // Si el tambor no gira con fuego prendido, el grano se quema
        let quemado = s.quemado
        if (tostando && c.cargada && c.encendida && c.quemador && !c.tambor) quemado += dt
        if (tostando && grano > crack2 + 25) quemado += dt

        const crack1T = s.crack1 ?? (tostando && grano >= crack1 ? tiempo : null)
        const crack2T = s.crack2 ?? (tostando && grano >= crack2 ? tiempo : null)

        let hist = s.hist
        let filas = s.filas
        if (tostando) {
          if (Math.floor(tiempo / 5) > Math.floor(s.tiempo / 5)) hist = [...hist, { t: tiempo, g: grano, a: aire }]
          if (Math.floor(tiempo / 60) > Math.floor(s.tiempo / 60)) filas = [...filas, { t: Math.floor(tiempo / 60) * 60, g: grano, a: aire }]
        }

        return { tiempo, grano, aire, quemado, crack1: crack1T, crack2: crack2T, hist, filas }
      })
    }, PASO_MS)
    return () => clearInterval(timer)
  }, [crack1, crack2])

  // Se acabó el tiempo: se descarga solo
  useEffect(() => {
    if (ctl.fase === 'tostando' && sim.tiempo >= limite) descargar('Se acabó el tiempo.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.tiempo])

  function avisar(texto) {
    setAviso(texto)
    clearTimeout(avisoRef.current)
    avisoRef.current = setTimeout(() => setAviso(''), 2200)
  }

  function evaluar(prefijo = '') {
    const [min, max] = VENTANAS[nivel] || VENTANAS.facil
    const t = Math.round(sim.grano)
    let ok = false
    let texto = ''
    if (sim.quemado > 30) texto = 'El grano se quemó: el fuego estuvo prendido con el tambor detenido o te pasaste de temperatura.'
    else if (t < min) texto = `Descargaste muy pronto: el grano quedó en ${t}°C y debía estar entre ${Math.round(min)} y ${Math.round(max)}°C.`
    else if (t > max) texto = `Te pasaste: el grano quedó en ${t}°C y debía estar entre ${Math.round(min)} y ${Math.round(max)}°C.`
    else {
      ok = true
      texto = `Descargaste a ${t}°C, dentro del rango ${Math.round(min)}–${Math.round(max)}°C. Color: ${nombreColor(t)}.`
    }
    setResultado({ ok, texto: `${prefijo} ${texto}`.trim(), tiempo: sim.tiempo })
  }

  function descargar(prefijo) {
    if (ctl.fase !== 'tostando') return
    setCtl((p) => ({ ...p, fase: 'terminado', quemador: false }))
    evaluar(prefijo)
  }

  function reiniciar() {
    setCtl(CTL_INICIAL)
    setSim(SIM_INICIAL)
    setResultado(null)
    setAviso('')
  }

  function iniciar() {
    if (ctl.fase !== 'espera') return
    const falta = []
    if (!ctl.encendida) falta.push('encender la máquina')
    if (!ctl.cargada) falta.push('cargar los granos en la tolva')
    if (falta.length) return avisar(`Primero debes ${falta.join(' y ')}.`)
    setCtl((p) => ({ ...p, fase: 'tostando' }))
    avisar('Tueste iniciado.')
  }

  // ===== Qué hace cada pieza al tocarla =====
  function usar(id) {
    const terminado = ctl.fase === 'terminado'
    if (id === 'bandeja') {
      if (!terminado) return avisar('La bandeja se usa después de descargar los granos.')
      setCtl((p) => ({ ...p, agitador: !p.agitador }))
      return avisar(ctl.agitador ? 'Agitador apagado.' : 'Agitador encendido: los granos se enfrían más rápido.')
    }
    if (terminado) return avisar('El tueste terminó. Pulsa REINICIAR para intentarlo de nuevo.')

    if (id === 'encendido') {
      const on = !ctl.encendida
      setCtl((p) => ({ ...p, encendida: on, tambor: on ? p.tambor : false, quemador: on ? p.quemador : false }))
      return avisar(on ? 'Máquina encendida.' : 'Máquina apagada.')
    }
    if (id === 'tolva') {
      if (ctl.cargada) return avisar('Los granos ya están cargados.')
      setCtl((p) => ({ ...p, cargada: true }))
      setSim((s) => ({ ...s, grano: AMBIENTE }))
      return avisar('Granos verdes cargados en el tambor.')
    }
    if (!ctl.encendida) return avisar('Enciende la máquina primero.')
    if (id === 'tambor') {
      setCtl((p) => ({ ...p, tambor: !p.tambor }))
      return avisar(ctl.tambor ? 'Tambor detenido.' : 'Tambor girando.')
    }
    if (id === 'quemador') {
      setCtl((p) => ({ ...p, quemador: !p.quemador }))
      return avisar(ctl.quemador ? 'Quemador apagado.' : 'Quemador encendido.')
    }
    if (id === 'muestra') {
      if (!ctl.cargada) return avisar('No hay granos en el tambor.')
      return avisar(`Muestra: el grano está ${nombreColor(sim.grano)} (${Math.round(sim.grano)}°C).`)
    }
    if (id === 'compuerta') {
      if (ctl.fase !== 'tostando') return avisar('Inicia el tueste antes de descargar.')
      descargar('Abriste la compuerta.')
    }
  }

  // Descripciones que salen al pasar el cursor
  function descripcion(id) {
    const m = {
      tolva: 'Aquí se cargan los granos verdes antes de empezar.',
      muestra: 'Toma una muestra para revisar el color del grano.',
      encendido: ctl.encendida ? 'Apaga la máquina.' : 'Enciende la máquina.',
      tambor: ctl.tambor ? 'Detiene el giro del tambor.' : 'Hace girar el tambor para mezclar los granos.',
      quemador: ctl.quemador ? 'Apaga el fuego.' : 'Enciende el fuego que calienta el aire.',
      compuerta: 'Descarga los granos a la bandeja y termina el tueste.',
      bandeja: 'Enfría los granos ya tostados. Activa el agitador.',
    }
    return m[id]
  }

  // Si entran sin haber elegido un desafío
  if (!desafioActual) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0c0a] p-10 text-center text-white">
        <p className="text-lg">No has seleccionado ningún desafío de tueste.</p>
        <Link to="/desafio" className="mt-4 text-[#d97706] underline">
          ← Volver a la selección de desafíos
        </Link>
      </div>
    )
  }

  const color = colorGrano(sim.grano)
  const girando = ctl.encendida && ctl.tambor
  const fuegoOn = ctl.encendida && ctl.quemador && ctl.fase !== 'terminado'
  const faseTueste =
    sim.grano >= crack2 ? 'Segundo crack' : sim.grano >= crack1 ? 'Primer crack' : sim.grano >= 150 ? 'Desarrollo' : 'Secado'

  // Gráfica en tiempo real
  const minTotal = limite / 60
  const px = (t) => 34 + (t / 60 / minTotal) * 296
  const py = (temp) => 170 - (temp / 300) * 160
  const linea = (clave) => sim.hist.map((p) => `${px(p.t).toFixed(1)},${py(p[clave]).toFixed(1)}`).join(' ')

  return (
    <main className="min-h-screen bg-[#0e0c0a] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#2a1a10] via-[#120f0d] to-[#0a0908] p-4 font-sans text-[#f5f2eb]">
      <style>{'@keyframes girar{to{transform:rotate(360deg)}}'}</style>
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-4 flex items-center justify-between border-b border-[#2a231d] pb-3">
          <div>
            <Link to="/desafio" className="mb-1 block text-xs uppercase tracking-widest text-[#a89f91] hover:text-white">
              ← Volver a Desafíos
            </Link>
            <h1 className="text-xl font-bold tracking-wide text-[#d97706]">CONSOLA DE TUESTE: {d.nombre_grano}</h1>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-widest text-[#8c8275]">OPERADOR</span>
            <strong className="text-sm">
              {operador?.nombre} ({operador?.rango})
            </strong>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)_340px]">
          {/* ===== REGISTRO ===== */}
          <aside className="flex h-[560px] flex-col rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
            <h3 className="mb-2 border-b border-[#2a221a] pb-2 text-[12px] font-bold uppercase tracking-[0.15em]">Registro de tueste</h3>
            <div className="grid grid-cols-3 border-b border-[#2a221a] pb-1 text-center text-[10px] text-[#8c8275]">
              <span className="text-left">Tiempo</span>
              <span>Grano °C</span>
              <span>Aire °C</span>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto pt-1">
              {sim.filas.map((f, i) => (
                <div
                  key={f.t}
                  className={`grid grid-cols-3 rounded px-1 py-1.5 text-center font-mono text-[12px] ${
                    i === sim.filas.length - 1 ? 'border border-[#d97706]/40 bg-[#2a1d13] font-semibold' : 'text-[#b8afa2]'
                  }`}
                >
                  <span className="text-left">{formatoTiempo(f.t)}</span>
                  <span className="text-[#d97706]">{Math.round(f.g)}</span>
                  <span className="text-sky-400">{Math.round(f.a)}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ===== MÁQUINA ===== */}
          <section className="relative rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
            {aviso && (
              <div className="absolute left-1/2 top-3 z-40 -translate-x-1/2 rounded-lg border border-[#d97706] bg-[#1c1611] px-4 py-2 text-xs shadow-lg">
                {aviso}
              </div>
            )}

            <div className="relative mx-auto w-full max-w-[560px]" style={{ aspectRatio: '500 / 520' }}>
              <svg viewBox="0 0 500 520" className="absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="acero" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#d9d9d4" />
                    <stop offset="0.5" stopColor="#8a8a85" />
                    <stop offset="1" stopColor="#c4c4be" />
                  </linearGradient>
                  <clipPath id="ventana">
                    <circle cx="250" cy="230" r="56" />
                  </clipPath>
                </defs>

                {/* Cuerpo y patas */}
                <rect x="150" y="120" width="200" height="260" rx="10" fill="#1a1613" />
                <rect x="205" y="465" width="90" height="30" fill="#151210" />

                {/* Tolva */}
                <path d="M170 20 L330 20 L290 70 L210 70 Z" fill="url(#acero)" />
                <rect x="238" y="70" width="24" height="40" fill="#9a9a95" />
                {ctl.cargada && <ellipse cx="250" cy="26" rx="60" ry="5" fill={colorGrano(30)} />}

                {/* Tambor */}
                <circle cx="250" cy="230" r="120" fill="#2a2723" stroke="#6f6f6a" strokeWidth="5" />
                <circle cx="250" cy="230" r="100" fill="url(#acero)" />
                <circle cx="250" cy="230" r="60" fill="#0f0c0a" stroke="#d4d4cf" strokeWidth="5" />
                <g clipPath="url(#ventana)">
                  <g
                    style={{
                      transformOrigin: '250px 230px',
                      animation: 'girar 4s linear infinite',
                      animationPlayState: girando ? 'running' : 'paused',
                    }}
                  >
                    {ctl.cargada &&
                      GRANOS.map((g, i) => (
                        <g key={i} transform={`translate(${g.x} ${g.y}) rotate(${g.rot})`}>
                          <ellipse rx="8" ry="5.5" fill={color} />
                          <path d="M-6 0 Q0 -2 6 0" stroke="rgba(0,0,0,0.45)" strokeWidth="1" fill="none" />
                        </g>
                      ))}
                  </g>
                </g>

                {/* Fuego */}
                {fuegoOn && (
                  <>
                    <ellipse cx="200" cy="362" rx="14" ry="9" fill="#f97316" opacity={0.3 + ctl.potencia / 150} />
                    <ellipse cx="300" cy="362" rx="14" ry="9" fill="#f97316" opacity={0.3 + ctl.potencia / 150} />
                  </>
                )}

                {/* Panel de control */}
                <rect x="355" y="190" width="135" height="90" rx="8" fill="#1b1714" stroke="#3a2f26" />
                <circle cx="380" cy="211" r="10" fill={ctl.encendida ? '#22c55e' : '#7f1d1d'} />
                <circle cx="422" cy="211" r="10" fill={girando ? '#38bdf8' : '#3f3f46'} />
                <circle cx="464" cy="211" r="10" fill={fuegoOn ? '#f97316' : '#52331a'} />
                <g fontSize="8" fill="#a89f91" textAnchor="middle">
                  <text x="380" y="235">ON</text>
                  <text x="422" y="235">TAMBOR</text>
                  <text x="464" y="235">FUEGO</text>
                </g>
                <rect x="365" y="242" width="115" height="30" rx="4" fill="#07140e" />
                <text x="372" y="262" fontSize="16" fill="#4ade80" fontFamily="monospace">
                  {ctl.encendida ? `${Math.round(sim.grano)}°C` : '---'}
                </text>
                <text x="475" y="262" fontSize="8" fill="#4ade80" textAnchor="end">
                  {ctl.encendida ? ESTADO_FASE[ctl.fase] : ''}
                </text>

                {/* Compuerta */}
                <rect
                  x="228"
                  y={ctl.fase === 'terminado' ? 350 : 344}
                  width="44"
                  height="20"
                  rx="3"
                  fill="url(#acero)"
                  stroke="#555"
                />

                {/* Bandeja de enfriamiento */}
                <ellipse cx="250" cy="425" rx="200" ry="45" fill="url(#acero)" stroke="#bbb" />
                <ellipse cx="250" cy="425" rx="185" ry="36" fill="#26221e" />
                {ctl.fase === 'terminado' &&
                  GRANOS_BANDEJA.map((g, i) => (
                    <ellipse key={i} cx={g.x} cy={g.y} rx="7" ry="4.5" fill={color} transform={`rotate(${g.rot} ${g.x} ${g.y})`} />
                  ))}
                <g
                  style={{
                    transformOrigin: '250px 425px',
                    animation: 'girar 5s linear infinite',
                    animationPlayState: ctl.agitador ? 'running' : 'paused',
                  }}
                >
                  <line x1="250" y1="425" x2="410" y2="425" stroke="#d4d4cf" strokeWidth="5" strokeLinecap="round" />
                </g>
                <circle cx="250" cy="425" r="8" fill="#d4d4cf" />
              </svg>

              {/* Zonas que se pueden tocar: brillo suave fijo + descripción al pasar el cursor */}
              {PIEZAS.map((p) => {
                const activa =
                  (p.id === 'encendido' && ctl.encendida) ||
                  (p.id === 'tambor' && girando) ||
                  (p.id === 'quemador' && fuegoOn) ||
                  (p.id === 'bandeja' && ctl.agitador)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => usar(p.id)}
                    aria-label={p.nombre}
                    className={`group absolute cursor-pointer border transition-[box-shadow,transform] duration-150 hover:scale-[1.03] active:scale-95 ${
                      p.redondo ? 'rounded-full' : 'rounded-md'
                    } ${
                      activa
                        ? 'border-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.55)] hover:shadow-[0_0_18px_rgba(52,211,153,0.85)]'
                        : 'border-amber-400/60 shadow-[0_0_10px_rgba(217,119,6,0.45)] hover:shadow-[0_0_18px_rgba(251,191,36,0.85)]'
                    }`}
                    style={{
                      left: `${(p.x / 500) * 100}%`,
                      top: `${(p.y / 520) * 100}%`,
                      width: `${(p.w / 500) * 100}%`,
                      height: `${(p.h / 520) * 100}%`,
                    }}
                  >
                    <span
                      role="tooltip"
                      className={`pointer-events-none invisible absolute left-1/2 z-30 w-52 -translate-x-1/2 rounded-lg border border-[#d97706] bg-[#1c1611] px-3 py-2 text-left text-[11px] leading-snug text-[#f5f2eb] opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 ${
                        p.abajo ? 'top-full mt-2' : 'bottom-full mb-2'
                      }`}
                    >
                      <strong className="block text-[#d97706]">{p.nombre}</strong>
                      {descripcion(p.id)}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="mt-2 text-center text-[11px] text-[#a89f91]">
              <span className="text-[#d97706]">Pista:</span> {PISTAS[nivel]}
            </p>
          </section>

          {/* ===== GRÁFICA Y CONTROLES ===== */}
          <div className="space-y-3">
            <div className="rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
              <h3 className="mb-1 text-sm font-semibold">Perfil de tueste</h3>
              <svg viewBox="0 0 340 200" className="w-full">
                {[0, 100, 200, 300].map((v) => (
                  <g key={v}>
                    <line x1="34" x2="330" y1={py(v)} y2={py(v)} stroke="#2a231d" />
                    <text x="28" y={py(v) + 3} fontSize="8" fill="#8c8275" textAnchor="end">{v}</text>
                  </g>
                ))}
                {[0, 0.5, 1].map((f) => (
                  <text key={f} x={34 + f * 296} y="185" fontSize="8" fill="#8c8275" textAnchor="middle">
                    {Math.round(minTotal * f)} min
                  </text>
                ))}
                <line x1="34" x2="330" y1={py(ctl.objetivo)} y2={py(ctl.objetivo)} stroke="#d97706" strokeDasharray="2 3" opacity="0.5" />
                {sim.crack1 != null && (
                  <g>
                    <line x1={px(sim.crack1)} x2={px(sim.crack1)} y1="10" y2="170" stroke="#a89f91" strokeDasharray="3 3" />
                    <text x={px(sim.crack1) + 3} y="20" fontSize="8" fill="#a89f91">1er crack</text>
                  </g>
                )}
                {sim.crack2 != null && (
                  <g>
                    <line x1={px(sim.crack2)} x2={px(sim.crack2)} y1="10" y2="170" stroke="#a89f91" strokeDasharray="3 3" />
                    <text x={px(sim.crack2) + 3} y="30" fontSize="8" fill="#a89f91">2º crack</text>
                  </g>
                )}
                <polyline points={linea('a')} fill="none" stroke="#38bdf8" strokeWidth="2" />
                <polyline points={linea('g')} fill="none" stroke="#fb923c" strokeWidth="2" />
              </svg>
              <div className="flex justify-center gap-4 text-[10px] text-[#a89f91]">
                <span className="text-orange-400">● Grano</span>
                <span className="text-sky-400">● Aire</span>
                <span>Fase: {faseTueste}</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
              <div className="flex justify-between text-sm">
                <span>🌡️ Temperatura objetivo</span>
                <strong className="text-[#d97706]">{ctl.objetivo} °C</strong>
              </div>
              <input
                type="range"
                min="150"
                max="240"
                value={ctl.objetivo}
                disabled={ctl.fase === 'terminado'}
                onChange={(e) => setCtl((p) => ({ ...p, objetivo: Number(e.target.value) }))}
                className="mt-2 w-full cursor-pointer accent-[#d97706]"
              />
              <div className="flex justify-between text-[10px] text-[#8c8275]">
                <span>150 °C</span>
                <span>240 °C</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
              <div className="flex justify-between text-sm">
                <span>🔥 Potencia del quemador</span>
                <strong className="text-[#d97706]">{ctl.potencia} %</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ctl.potencia}
                disabled={ctl.fase === 'terminado'}
                onChange={(e) => setCtl((p) => ({ ...p, potencia: Number(e.target.value) }))}
                className="mt-2 w-full cursor-pointer accent-[#d97706]"
              />
              <div className="flex justify-between text-[10px] text-[#8c8275]">
                <span>0 %</span>
                <span>100 %</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== BARRA INFERIOR ===== */}
        <footer className="mt-4 flex flex-wrap items-center gap-6 rounded-xl border border-[#2d251e] bg-[#120e0b]/90 p-3">
          <div>
            <span className="block text-[10px] uppercase text-[#8c8275]">Tiempo transcurrido</span>
            <strong className="font-mono text-2xl">{formatoTiempo(sim.tiempo)}</strong>
            <span className="text-xs text-[#8c8275]"> / {formatoTiempo(limite)}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-[#8c8275]">Temperatura del grano</span>
            <strong className="font-mono text-2xl text-orange-400">{Math.round(sim.grano)} °C</strong>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-[#8c8275]">Temperatura del aire</span>
            <strong className="font-mono text-2xl text-sky-400">{Math.round(sim.aire)} °C</strong>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={iniciar}
              className="cursor-pointer rounded-lg border border-emerald-500/60 bg-emerald-900/50 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800/60 active:scale-95"
            >
              ▶ Iniciar tueste
            </button>
            <button
              type="button"
              onClick={() => (ctl.fase === 'tostando' ? descargar('Finalizaste el tueste.') : avisar('No hay un tueste en marcha.'))}
              className="cursor-pointer rounded-lg border border-[#d97706]/60 bg-[#3b1f0e] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#5a2f14] active:scale-95"
            >
              ■ Finalizar
            </button>
            <button
              type="button"
              onClick={reiniciar}
              className="cursor-pointer rounded-lg border border-[#3a2f26] bg-[#1c1611] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#2a2018] active:scale-95"
            >
              ↻ Reiniciar
            </button>
          </div>
        </footer>
      </div>

      {/* ===== RESULTADO ===== */}
      {resultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className={`w-full max-w-md rounded-xl border bg-[#120e0b] p-6 text-center ${resultado.ok ? 'border-emerald-500' : 'border-red-500'}`}>
            <h2 className={`text-xl font-bold ${resultado.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {resultado.ok ? '¡Tueste logrado!' : 'Tueste fallido'}
            </h2>
            <p className="mt-3 text-sm text-[#d6cfc4]">{resultado.texto}</p>
            <p className="mt-2 text-xs text-[#8c8275]">Tiempo: {formatoTiempo(resultado.tiempo)}</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={reiniciar}
                className="cursor-pointer rounded-lg bg-[#d97706] px-4 py-2 text-xs font-bold uppercase text-[#0e0c0a] hover:bg-[#b45309] hover:text-white"
              >
                Intentar de nuevo
              </button>
              <button
                type="button"
                onClick={() => setResultado(null)}
                className="cursor-pointer rounded-lg border border-[#3a2f26] px-4 py-2 text-xs font-bold uppercase hover:bg-[#1c1611]"
              >
                Ver máquina
              </button>
              <Link to="/desafio" className="rounded-lg border border-[#3a2f26] px-4 py-2 text-xs font-bold uppercase hover:bg-[#1c1611]">
                Desafíos
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}