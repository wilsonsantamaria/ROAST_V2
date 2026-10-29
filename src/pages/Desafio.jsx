       
       import { useEffect, useState } from 'react'
        import { Link } from 'react-router-dom'

        // ===== Fotos de los cafeteros (cámbialas por las tuyas cuando las tengas) =====
        // Guarda tus imágenes en src/assets/img/ y cambia solo la ruta del import.
        import fotoJuanito from '../assets/img/juan.png'
        import fotoCamila from '../assets/img/camila.png'
        import fotoMateo from '../assets/img/mateo.png'

        // Un cafetero por cada dificultad
        const PERFILES = {
        facil: { nombre: 'Juanito', rango: 'Aprendiz de tostión', foto: fotoJuanito },
        medio: { nombre: 'Camila', rango: 'Tostadora experta', foto: fotoCamila },
        dificil: { nombre: 'Mateo', rango: 'Maestro tostador', foto: fotoMateo },
        }

        // Textos y colores de cada nivel
        const NIVELES = {
        facil: { texto: 'Fácil', badge: 'bg-[#4a9a2a]', borde: 'border-[#4a9a2a]' },
        medio: { texto: 'Medio', badge: 'bg-[#d68910]', borde: 'border-[#d68910]' },
        dificil: { texto: 'Difícil', badge: 'bg-[#c0392b]', borde: 'border-[#c0392b]' },
        }

        const TUESTES = {
        claro: { titulo: 'Tueste claro', ingles: 'Light roast' },
        medio: { titulo: 'Tueste medio', ingles: 'Medium roast' },
        oscuro: { titulo: 'Tueste oscuro', ingles: 'Dark roast' },
        }

        // Convierte segundos a mm:ss
        function formatoTiempo(seg) {
        const s = Number(seg) || 0
        const m = Math.floor(s / 60)
        const r = String(s % 60).padStart(2, '0')
        return `${m}:${r}`
        }

        // La pista se arma con los datos reales del café y del desafío
        function crearPista(d) {
        const crack = Number(d.temp_primer_crack_c)
        if (!crack) return 'Vigila la temperatura y retira el grano en el momento justo.'
        if (d.tipo_tueste === 'claro')
        return `Mantén la temperatura por debajo de ${crack}°C. Retira el grano justo antes del primer crack.`
        if (d.tipo_tueste === 'medio')
        return `Pasa el primer crack (${crack}°C) y detén el tueste antes de ${crack + 14}°C.`
        return `Supera los ${crack + 14}°C y desarrolla el grano hasta el segundo crack con calma.`
        }

        function Dato({ icono, etiqueta, valor }) {
        return (
        <div className="flex items-center gap-3 rounded-xl border border-[#e0c9ae] bg-[#fdf9f4] px-4 py-3">
        <span className="text-[22px]">{icono}</span>
        <div>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#936e58]">
        {etiqueta}
        </span>
        <strong className="font-titulo text-[17px] text-[#3b1f0e]">{valor}</strong>
        </div>
        </div>
        )
        }

        function Desafio() {
        const [dificultad, setDificultad] = useState('facil')
        const [desafio, setDesafio] = useState(null)
        const [cargando, setCargando] = useState(true)
        const [error, setError] = useState(null)
        const [menuAbierto, setMenuAbierto] = useState(false)

        async function cargarDesafio(nivel) {
        setCargando(true)
        setError(null)
        try {
        const res = await fetch(`/api/desafios?dificultad=${nivel}`)
        if (!res.ok) throw new Error('No se encontraron desafíos para esta dificultad')
        setDesafio(await res.json())
        } catch (err) {
        setError(err.message)
        setDesafio(null)
        } finally {
        setCargando(false)
        }
        }

        useEffect(() => {
        cargarDesafio(dificultad)
        }, [dificultad])

        function elegirNivel(nivel) {
        setDificultad(nivel)
        setMenuAbierto(false)
        }

        function iniciarDesafio() {
        // Aquí se conecta el simulador de tueste (pantalla del tostador).
        console.log('Iniciar desafío', desafio)
        }

        const perfil = PERFILES[dificultad]
        const nivel = NIVELES[dificultad]
        const tueste = desafio ? TUESTES[desafio.tipo_tueste] : null

        return (
        <main className="min-h-screen bg-[#f2e9dc] px-4 pb-12 pt-5 font-cuerpo text-[#3b1f0e] md:px-10 md:pt-7">
        <div className="mx-auto max-w-[1008px]">
        {/* ===== Cabecera: volver + título ===== */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-titulo text-[34px] font-bold">Modo desafío</h1>
        <Link
        to="/"
        state={{ saltarCarga: true }}
        className="inline-flex items-center gap-2 rounded-sm border border-[#3b1f0e] px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#3b1f0e] no-underline hover:bg-[#3b1f0e]/10"
        >
        ← Volver al inicio
        </Link>
        </header>

        {/* ===== Perfil del cafetero (cambia según la dificultad) ===== */}
        <section className="flex items-center gap-5 border-b border-[#e0c9ae] pb-6">
        <div
        className={`grid size-[84px] shrink-0 place-items-center overflow-hidden rounded-full border-[3px] bg-[#f8f4ee] ${nivel.borde}`}
        >
        <img src={perfil.foto} alt={perfil.nombre} className="size-full object-contain p-2" />
        </div>
        <div>
        <h2 className="font-titulo text-[28px] font-bold leading-tight">{perfil.nombre}</h2>
        <p className="text-[14px] text-[#6b3a1f]">{perfil.rango}</p>
        </div>
        </section>

        {cargando && <p className="mt-8 text-[#6b3a1f]">Cargando desafío...</p>}
        {error && !cargando && (
        <p className="mt-8 rounded-lg border border-[#f2c0bb] bg-[#fdecea] px-4 py-3 text-[#c0392b]">
        {error}
        </p>
        )}

        {desafio && !cargando && (
        <div className="animate-video-sube">
        {/* ===== Tarjeta oscura del encargo ===== */}
        <section className="relative mt-8 overflow-hidden rounded-2xl bg-[#3b1f0e] px-6 py-5 text-[#f2e9dc] shadow-lg">
        <div className="absolute -bottom-10 -right-10 size-[150px] rounded-full bg-white/5" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
        <span className="text-[26px]">☕</span>
        <div>
        <h3 className="font-titulo text-[18px] font-bold">
        {tueste?.titulo} · {desafio.nombre_grano}
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9a066]">
        {tueste?.ingles} · Origen: {desafio.origen}
        </span>
        </div>
        </div>
        <span
        className={`rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white ${nivel.badge}`}
        >
        {nivel.texto}
        </span>
        </div>

        <p className="relative mt-4 border-l-[3px] border-[#d9a066] pl-3 text-[14px] leading-relaxed">
        {desafio.descripcion_tarea}
        </p>
        </section>

        {/* ===== Datos del lote ===== */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Dato icono="⚖️" etiqueta="Capacidad" valor={`${desafio.capacidad_kg} kg`} />
        <Dato icono="⏱️" etiqueta="Tiempo límite" valor={formatoTiempo(desafio.tiempo_limite_seg)} />
        <Dato icono="🔥" etiqueta="1er crack" valor={`${desafio.temp_primer_crack_c} °C`} />
        <Dato icono="🫘" etiqueta="Café" valor={desafio.nombre_grano?.replace('Café ', '')} />
        </section>

        {/* ===== Pista ===== */}
        <section className="mt-4 flex items-center gap-3 rounded-lg border border-[#b7dcc4] bg-[#eef7f1] px-4 py-3 text-[13px] text-[#1e5b34]">
        <span className="grid size-5 shrink-0 place-items-center rounded-full border border-[#27ae60] text-[11px] font-bold text-[#27ae60]">
        !
        </span>
        <p>
        <strong>Pista:</strong> {crearPista(desafio)}
        </p>
        </section>
        </div>
        )}

        {/* Iniciar */}
        <section className="mt-8 flex flex-col items-center gap-3">
        <button
        onClick={iniciarDesafio}
        disabled={!desafio || cargando}
        className="w-full max-w-[270px] cursor-pointer rounded-md bg-[#3b1f0e] px-8 py-4 font-titulo text-[20px] font-bold text-[#f2e9dc] shadow-[0_8px_20px_rgba(59,31,14,0.35)] transition hover:-translate-y-0.5 hover:bg-[#6b3a1f] disabled:cursor-not-allowed disabled:opacity-40"
        >
        Iniciar desafío
        </button>

        {/* Menú de dificultad */}
        <div className="relative w-[224px]">
        <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="flex w-full cursor-pointer items-center justify-between rounded-md bg-[#3b1f0e] px-4 py-3 text-[14px] font-bold text-[#f2e9dc]"
        >
        {nivel.texto}
        <span className={`text-[11px] transition ${menuAbierto ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {menuAbierto && (
        <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-[#e0c9ae] bg-[#fdf9f4] shadow-lg">
        {Object.entries(NIVELES)
        .filter(([clave]) => clave !== dificultad)
        .map(([clave, n]) => (
        <li key={clave}>
        <button
        onClick={() => elegirNivel(clave)}
        className="w-full cursor-pointer border-b border-[#e0c9ae] px-4 py-3 text-left text-[14px] text-[#3b1f0e] last:border-b-0 hover:bg-[#f2e9dc]"
        >
        {n.texto}
        </button>
        </li>
        ))}
        </ul>
        )}
        </div>

        <button
        onClick={() => cargarDesafio(dificultad)}
        className="cursor-pointer text-[12px] font-semibold uppercase tracking-[0.14em] text-[#936e58] underline-offset-4 hover:underline"
        >
        ↻ Otro desafío
        </button>
        </section>
        </div>
        </main>
        )
        }

        export default Desafio