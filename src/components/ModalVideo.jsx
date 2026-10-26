import { useEffect, useRef, useState } from 'react'
import { LOGO_GRANO } from '../assets/imagenes.js'
import videoTueste from '../assets/Video/VideoInformativoDeTueste.mp4'

// ===== Clases del modal (en celular, max-[600px]: reduce tamaños) =====
const MODAL =
  'fixed inset-0 z-110 items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(59,31,14,0.82),rgba(20,10,0,0.94))] p-6 font-cuerpo backdrop-blur-[6px] max-[600px]:p-3'

// Marco: madera de café + filete dorado
const MARCO =
  'relative max-h-full w-[min(100%,960px)] animate-video-sube rounded-[18px] bg-[linear-gradient(145deg,var(--color-cafe-medio)_0%,var(--color-cafe-oscuro)_55%,#2a1508_100%)] px-[18px] pt-4 pb-3.5 shadow-[0_0_0_2px_var(--color-dorado),0_0_0_6px_rgba(224,169,109,0.18),0_30px_70px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(242,233,220,0.14)] max-[600px]:rounded-[14px] max-[600px]:px-3 max-[600px]:pt-3 max-[600px]:pb-2.5'

const BOTON_CERRAR =
  'size-10 shrink-0 cursor-pointer rounded-full bg-tostado text-[20px] text-white transition-all duration-300 ease-in-out hover:scale-110 hover:bg-[#d4af37] hover:shadow-[0_0_12px_rgba(212,175,55,0.6)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-dorado'

// Pantalla 16:9 con paspartú crema
const PANTALLA =
  'relative aspect-video overflow-hidden rounded-lg bg-[#140a00] shadow-[0_0_0_7px_rgba(0,0,0,0.35)] outline-3 outline-crema'

// Plantilla: se ve mientras todavía no hay video
const VACIO =
  'absolute inset-0 flex-col items-center justify-center gap-3.5 p-5 text-center text-crema [background:radial-gradient(circle_at_30%_25%,rgba(224,169,109,0.22),transparent_55%),radial-gradient(circle_at_75%_80%,rgba(137,94,64,0.35),transparent_50%),#1b0d03]'

function ModalVideo({ abierto, onCerrar }) {
  const reproductorRef = useRef(null)
  const cerrarRef = useRef(null)
  const [conVideo, setConVideo] = useState(false)

  // Al abrir: foco en el botón de cerrar y reproducción automática.
  // Al cerrar: pausa el video.
  useEffect(() => {
    const reproductor = reproductorRef.current

    if (abierto) {
      cerrarRef.current.focus()
      if (conVideo) reproductor.play().catch(() => {})
    } else {
      reproductor.pause()
    }
  }, [abierto, conVideo])

  // tecla Esc cierra
  useEffect(() => {
    if (!abierto) return

    function alPresionarTecla(e) {
      if (e.key === 'Escape') onCerrar()
    }

    document.addEventListener('keydown', alPresionarTecla)
    return () => document.removeEventListener('keydown', alPresionarTecla)
  }, [abierto, onCerrar])

  return (
    <div
      className={`${MODAL} ${abierto ? 'flex animate-video-aparece' : 'hidden'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Video del proceso de tueste"
      aria-hidden={!abierto}
    >
      <div className={MARCO}>
        <div className="flex items-center justify-between gap-4 px-0.5 pb-3.5">
          <div className="flex min-w-0 items-center gap-3.5">
            <img
              className="size-10 shrink-0 max-[600px]:size-8"
              src={LOGO_GRANO}
              alt=""
            />
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-[11px] tracking-[0.28em] text-dorado uppercase max-[600px]:hidden">
                ROAST · Video de apoyo
              </span>
              {/* Cambia aquí el título de tu video */}
              <span className="font-titulo text-[22px] leading-[1.1] font-bold text-crema max-[600px]:text-[17px]">
                El proceso de tueste
              </span>
            </div>
          </div>
          <button
            className={BOTON_CERRAR}
            type="button"
            aria-label="Cerrar video"
            onClick={onCerrar}
            ref={cerrarRef}
          >
            ✕
          </button>
        </div>

        <div className={PANTALLA}>
          {/* Se ve mientras NO hay video. Cuando el video carga, se oculta sola. */}
          <div className={`${VACIO} ${conVideo ? 'hidden' : 'flex'}`}>
            <div className="grid size-[84px] place-items-center rounded-full border-2 border-dorado pl-1.5 text-[32px] text-dorado max-[600px]:size-[60px] max-[600px]:text-[22px]">
              ▶
            </div>
            <div className="font-titulo text-[26px] font-bold max-[600px]:text-[19px]">
              Aquí va tu video
            </div>
            <div className="text-[13px] tracking-[0.06em] text-crema/75">
              Guárdalo en <b className="font-medium text-dorado">src/assets/Video/</b>
            </div>
          </div>

          <video
            className={`absolute inset-0 size-full bg-black object-contain ${conVideo ? 'visible' : 'invisible'}`}
            controls
            playsInline
            preload="metadata"
            ref={reproductorRef}
            onLoadedMetadata={() => setConVideo(true)}
            onError={() => setConVideo(false)}
          >
            <source src={videoTueste} onError={() => setConVideo(false)} />
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>

        <div className="flex items-center justify-between gap-3 px-0.5 pt-3 text-[13px] tracking-[0.05em] text-crema/82">
          {/* Cambia aquí la descripción de tu video */}
          <span>Descubre cómo se transforma el grano durante el tueste.</span>
          <span className="shrink-0 text-[11px] tracking-[0.22em] text-dorado uppercase max-[600px]:hidden">
            Esc para cerrar
          </span>
        </div>
      </div>
    </div>
  )
}

export default ModalVideo