import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Chispas from '../components/Chispas.jsx'
import PantallaCarga from '../components/PantallaCarga.jsx'
import PantallaInicio from '../components/PantallaInicio.jsx'
import ModalVideo from '../components/ModalVideo.jsx'

function Inicio() {
  const navigate = useNavigate()
  const location = useLocation()
  const botonVideoRef = useRef(null)

  const [cargando, setCargando] = useState(!location.state?.saltarCarga)
  const [videoAbierto, setVideoAbierto] = useState(false)

  const terminarCarga = useCallback(() => setCargando(false), [])

  const cerrarVideo = useCallback(() => {
    setVideoAbierto(false)
    botonVideoRef.current?.focus()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7.5">
      {cargando && <Chispas />}

      {cargando ? (
        <PantallaCarga onTerminar={terminarCarga} />
      ) : (
        <PantallaInicio
          onPregunta={() => navigate('/pregunta')}
          onVideo={() => setVideoAbierto(true)}
          botonVideoRef={botonVideoRef}
        />
      )}

      <ModalVideo abierto={videoAbierto} onCerrar={cerrarVideo} />
    </main>
  )
}

export default Inicio