import { useEffect, useRef, useState } from 'react'
import { LOGO_GRANO } from '../assets/imagenes.js'
import videoTueste from '../assets/Video/VideoInformativoDeTueste.mp4'

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
      className={`video-modal${abierto ? ' abierto' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Video del proceso de tueste"
      aria-hidden={!abierto}
    >
      <div className={`video-marco${conVideo ? ' con-video' : ''}`}>
        <div className="video-cabecera">
          <div className="video-identidad">
            <img className="video-logo" src={LOGO_GRANO} alt="" />
            <div className="video-titulos">
              <span className="video-etiqueta">ROAST · Video de apoyo</span>
              {/* Cambia aquí el título de tu video */}
              <span className="video-titulo">El proceso de tueste</span>
            </div>
          </div>
          <button
            className="video-cerrar"
            type="button"
            aria-label="Cerrar video"
            onClick={onCerrar}
            ref={cerrarRef}
          >
            ✕
          </button>
        </div>

        <div className="video-pantalla">
          {/* Se ve mientras NO hay video. Cuando el video carga, se oculta sola. */}
          <div className="video-vacio">
            <div className="video-vacio-icono">▶</div>
            <div className="video-vacio-titulo">Aquí va tu video</div>
            <div className="video-vacio-ayuda">
              Guárdalo en <b>src/assets/Video/</b>
            </div>
          </div>

          <video
            className="video-reproductor"
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

        <div className="video-pie">
          {/* Cambia aquí la descripción de tu video */}
          <span>Descubre cómo se transforma el grano durante el tueste.</span>
          <span className="video-pie-nota">Esc para cerrar</span>
        </div>
      </div>
    </div>
  )
}

export default ModalVideo
