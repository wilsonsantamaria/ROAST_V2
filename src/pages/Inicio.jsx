import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Chispas from '../components/Chispas.jsx'
import PantallaCarga from '../components/PantallaCarga.jsx'
import PantallaInicio from '../components/PantallaInicio.jsx'
import PanelInformacion from '../components/PanelInformacion.jsx'
import ModalVideo from '../components/ModalVideo.jsx'
import '../styles/inicio.css'

function Inicio() {
  const navigate = useNavigate()
   const location = useLocation()  
  const botonVideoRef = useRef(null)

  const [cargando, setCargando] = useState(!location.state?.saltarCarga)
  const [infoAbierta, setInfoAbierta] = useState(false)
  const [videoAbierto, setVideoAbierto] = useState(false)

  const terminarCarga = useCallback(() => setCargando(false), [])

  const cerrarVideo = useCallback(() => {
    setVideoAbierto(false)
    botonVideoRef.current?.focus()
  }, [])

  return (
    <main className="contenedor-principal">
{cargando && <Chispas />}

      {cargando ? (
        <PantallaCarga onTerminar={terminarCarga} />
      ) : (
        <PantallaInicio
          onPregunta={() => navigate('/pregunta')}
          onAyuda={() => setInfoAbierta(true)}
          onVideo={() => setVideoAbierto(true)}
          botonVideoRef={botonVideoRef}
        />
      )}

      {infoAbierta && <PanelInformacion onCerrar={() => setInfoAbierta(false)} />}

      <ModalVideo abierto={videoAbierto} onCerrar={cerrarVideo} />
    </main>
  )
}

export default Inicio
