import LogoRoast from './LogoRoast.jsx'

function PantallaInicio({ onPregunta, onAyuda, onVideo, botonVideoRef }) {
  return (
    <div className="pantalla-inicio">
      <div className="portada">
        <div className="logo-inicio">
          <LogoRoast />
        </div>

        <p className="lema">Elige tu modo de juego</p>

        <nav className="modos">
          <button
            className="boton boton-principal"
            type="button"
            onClick={onPregunta}
          >
            Pregunta
          </button>
          <button className="boton boton-secundario" type="button">
            Desafío
          </button>
        </nav>
      </div>

      <div className="herramientas">
        <button
          className="boton-icono btn-ayuda"
          type="button"
          aria-label="Ayuda"
          onClick={onAyuda}
        >
          ?
        </button>
        <button
          className="boton-icono btn-sonido"
          type="button"
          aria-label="Sonido"
          onClick={onVideo}
          ref={botonVideoRef}
        >
          ▶
        </button>
      </div>
    </div>
  )
}

export default PantallaInicio
