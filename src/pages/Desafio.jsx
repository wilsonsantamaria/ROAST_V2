import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Importaciones de las fotos de los cafeteros
import fotoJuanito from '../assets/img/juan.png'
import fotoCamila from '../assets/img/camila.png'
import fotoMateo from '../assets/img/mateo.png'

// Configuración visual por dificultad (asociada a los cafeteros)
const NIVELES = {
facil: { 
nombre: 'Juanito', 
rango: 'Aprendiz de tostión', 
foto: fotoJuanito,
texto: 'FÁCIL', 
},
medio: { 
nombre: 'Camila', 
rango: 'Tostadora experta', 
foto: fotoCamila,
texto: 'MEDIO', 
},
dificil: { 
nombre: 'Mateo', 
rango: 'Maestro tostador', 
foto: fotoMateo,
texto: 'DIFÍCIL', 
},
}

// Convierte segundos a formato mm:ss
function formatoTiempo(seg) {
const s = Number(seg) || 0
const m = Math.floor(s / 60)
const r = String(s % 60).padStart(2, '0')
return `${m}:${r}`
}

// Genera una pista basada en los datos reales del desafío de la base de datos
function crearPista(d) {
const crack = Number(d.temp_primer_crack_c)
if (!crack) return 'Vigila la temperatura y retira el grano en el momento justo.'
if (d.dificultad === 'facil')
return `Mantén la temperatura por debajo de ${crack}°C. Retira el grano justo antes del primer crack.`
if (d.dificultad === 'medio')
return `Pasa el primer crack (${crack}°C) y detén el tueste antes de ${crack + 14}°C.`
return `Supera los ${crack + 14}°C y desarrolla el grano hasta el segundo crack con calma.`
}

export default function Desafio() {
const [dificultad, setDificultad] = useState('facil')
const [desafio, setDesafio] = useState(null)
const [cargando, setCargando] = useState(true)
const [error, setError] = useState(null)

const navigate = useNavigate() // Hook para navegar entre pantallas
const perfilActual = NIVELES[dificultad]

// Función para conectar con tu backend y traer un desafío aleatorio de la BD
async function cargarDesafio(nivel) {
setCargando(true)
setError(null)
try {
const res = await fetch(`http://localhost:3000/api/desafios?dificultad=${nivel}`)
if (!res.ok) throw new Error('No se encontraron desafíos para esta dificultad en la base de datos')
const data = await res.json()
setDesafio(data)
} catch (err) {
console.error(err)
setError(err.message)
setDesafio(null)
} finally {
setCargando(false)
}
}

// Cada vez que cambie la dificultad, se consulta la base de datos
useEffect(() => {
cargarDesafio(dificultad)
}, [dificultad])

// Función para enviar los datos al simulador de la máquina
function iniciarTueste() {
if (!desafio) return

navigate('/simulador', { 
state: { 
desafioActual: desafio, 
nivelDificultad: dificultad,
operador: perfilActual 
} 
})
}

return (
<main className="min-h-screen bg-[#12100e] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1e1612] via-[#12100e] to-[#0b0a09] px-4 pb-12 pt-5 font-sans text-[#f5f2eb] md:px-10 md:pt-7">
<div className="mx-auto max-w-[1200px]">

{/* ===== Cabecera Superior ===== */}
<header className="mb-10 flex items-center justify-between border-b border-[#2a231d] pb-4 text-xs tracking-widest text-[#a89f91]">
<Link
to="/"
state={{ saltarCarga: true }}
className="flex items-center gap-2 font-bold uppercase no-underline hover:text-white transition-colors"
>
<svg className="size-6 text-[#d97706]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="12" cy="12" r="9" />
<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" strokeWidth="1.5" strokeOpacity="0.4" />
<path d="M12 8l-2 4h4l-2 4" fill="currentColor" />
</svg>
<span>VOLVER</span>
</Link>

<div className="flex items-center gap-4">
<div className="h-[1px] w-12 bg-[#2a231d]" />
<span className="font-bold tracking-[0.25em] text-[#d97706]">ROAST</span>
<div className="h-[1px] w-12 bg-[#2a231d]" />
</div>

<span className="text-[#a89f91]">MODO DESAFIO </span>
</header>

{/* ===== Contenedor Principal en 2 Columnas ===== */}
<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

{/* ===== Columna Izquierda: Operador y Misión Activa ===== */}
<div className="flex flex-col justify-between lg:col-span-5 space-y-6">

{/* Operador Asignado */}
<div className="border-b border-[#2a231d] pb-6 ">
<span className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275] mb-3">
OPERADOR ASIGNADO
</span>
<div className="flex items-center gap-4">
<div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-[#d97706]/40 bg-[#1a1512]">
<img 
src={perfilActual.foto} 
alt={perfilActual.nombre} 
className="size-full object-cover p-1 rounded-full" 
/>
</div>
<div>
<h2 className="font-bold text-[18px] tracking-wide text-[#f5f2eb]">{perfilActual.nombre}</h2>
<p className="text-[12px] text-[#d97706] font-medium">{perfilActual.rango}</p>
</div>
</div>
</div>

{/* Misión Activa */}
<div className="space-y-4">
<span className="block text-[10px] uppercase tracking-[0.2em] text-[#d97706] font-semibold">
MISIÓN ACTIVA
</span>
<h1 className="font-serif text-[32px] font-extrabold leading-tight tracking-tight text-[#f5f2eb]">
DOMINA LA CURVA.<br />
<span className="text-[#d97706]">DEFINE EL SABOR.</span>
</h1>
<p className="text-[13px] leading-relaxed text-[#a89f91]">
Ajusta la potencia del quemador en tiempo real y mantén el perfil dentro del rango objetivo. Cada segundo modifica el resultado.
</p>
</div>

{/* Tarjetas de Tiempo y Objetivo */}
<div className="grid grid-cols-2 gap-4 pt-2">
<div className="rounded-xl border border-[#2a231d] bg-[#14100e]/80 p-4 shadow-inner">
<span className="block text-[10px] uppercase tracking-[0.15em] text-[#8c8275] mb-1">
⏱️ TIEMPO
</span>
<strong className="text-[20px] font-bold tracking-wider">
{desafio ? formatoTiempo(desafio.tiempo_limite_seg) : '--:--'}
</strong>
</div>
<div className="rounded-xl border border-[#2a231d] bg-[#14100e]/80 p-4 shadow-inner">
<span className="block text-[10px] uppercase tracking-[0.15em] text-[#8c8275] mb-1">
🎯 OBJETIVO (1er Crack)
</span>
<strong className="text-[18px] font-bold tracking-wider text-[#d97706]">
{desafio ? `${desafio.temp_primer_crack_c} °C` : '-- °C'}
</strong>
</div>
</div>

</div>

{/* ===== Columna Derecha: Selección de Protocolo y Datos del Desafío ===== */}
<div className="lg:col-span-7 rounded-2xl border border-[#2a231d] bg-[#15110e]/90 p-6 shadow-2xl flex flex-col justify-between backdrop-blur-sm">

<div>
{/* Cabecera del selector */}
<div className="flex items-center justify-between border-b border-[#2a231d] pb-4 mb-6">
<div>
<span className="block text-[10px] uppercase tracking-[0.2em] text-[#8c8275]">
SELECCIONA PROTOCOLO
</span>
<h3 className="text-[16px] font-bold tracking-wider text-[#f5f2eb]">
NIVEL DE DIFICULTAD
</h3>
</div>

<button
onClick={() => cargarDesafio(dificultad)}
disabled={cargando}
className="inline-flex items-center gap-1.5 rounded-md border border-[#3a2f26] bg-[#1c1612] px-3 py-1.5 text-[11px] font-semibold text-[#a89f91] hover:border-[#d97706] hover:text-[#d97706] transition-all cursor-pointer disabled:opacity-50"
title="Buscar otra tarea al azar"
>
<span className={cargando ? 'animate-spin inline-block' : ''}>↻</span>
<span>Restablecer</span>
</button>
</div>

{/* Botones de Dificultad */}
<div className="grid grid-cols-3 gap-3 mb-8">
{Object.entries(NIVELES).map(([clave, datos]) => {
const activo = dificultad === clave
return (
<button
key={clave}
onClick={() => setDificultad(clave)}
className={`relative cursor-pointer text-left rounded-lg p-6 transition-all border ${
activo 
? 'bg-[#221a14] border-[#d97706]' 
: 'bg-[#120e0c] border-[#2a231d] hover:border-[#3d3128]'
}`}
>
<div className="flex justify-between items-center mb-2">
<span className={`text-[12px] font-bold ${activo ? 'text-[#d97706]' : 'text-[#f5f2eb]'}`}>
{datos.texto}
</span>
<img 
src={datos.foto} 
alt={datos.nombre} 
className="size-6 rounded-full object-cover border border-[#3a2f26]" 
/>
</div>
<p className="text-[11px] text-[#8c8275] truncate">{datos.rango}</p>
{activo && (
<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d97706] rounded-b-lg" />
)}
</button>
)
})}
</div>

{/* Estados de Carga y Error */}
{cargando && (
<div className="py-12 text-center text-[#d97706] text-sm font-medium animate-pulse">
Cargando desafío desde la base de datos...
</div>
)}

{error && !cargando && (
<div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-red-400 text-xs mb-6">
{error}
</div>
)}

{/* Detalles del Desafío */}
{desafio && !cargando && (
<div className="space-y-4 mb-8">
<div className="flex items-start gap-3 border-l-2 border-[#d97706] pl-4">
<div>
<h4 className="text-[16px] font-bold tracking-wide text-[#f5f2eb]">
{desafio.nombre_grano}
</h4>
<span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d97706]">
ORIGEN: {desafio.origen}
</span>
</div>
</div>

<p className="text-[13px] leading-relaxed text-[#c4bcae] pt-2">
{desafio.descripcion_tarea}
</p>

<div className="rounded-lg border border-[#3a2f26] bg-[#1c1612]/60 px-3 py-2 text-[12px] text-[#d97706]">
💡 <strong>Pista:</strong> {crearPista(desafio)}
</div>
</div>
)}
</div>

{/* Acciones Inferiores */}
<div className="pt-4 border-t border-[#2a231d] flex items-center justify-between">
<span className="text-[11px] text-[#8c8275]">
Operador activo: <strong className="text-[#f5f2eb]">{perfilActual.nombre}</strong>
</span>

<button
onClick={iniciarTueste}
disabled={!desafio || cargando}
className="cursor-pointer rounded-lg bg-[#d97706] px-8 py-3.5 text-[14px] font-bold text-[#0e0c0a] shadow-lg transition hover:bg-[#b45309] hover:text-white disabled:opacity-50"
>
INICIAR TUESTE →
</button>
</div>

</div>

</div>
</div>

</main>
)
}