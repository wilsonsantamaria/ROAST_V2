import LogoRoast from './LogoRoast.jsx'

const DESCRIPCIONES = {
  pregunta: {
    titulo: 'Modo aprendizaje',
    texto:
      'Responde 5 preguntas al azar sobre el tueste del café. Al final verás cuántas acertaste y cuál era la respuesta correcta de cada una.',
  },
  desafio: {
    titulo: 'Modo desafío',
    texto:
      'Ponte a prueba en una partida más exigente. Pronto podrás medir tu nivel y competir por el mejor puntaje.',
  },
}

function PantallaInicio({ onPregunta, onVideo, botonVideoRef }) {
  return (
    <div className="pantalla-inicio">
      <div className="portada">
        <div className="logo-inicio">
          <LogoRoast />
        </div>

        <p className="lema">Elige tu modo de juego</p>

        <nav className="modos">
          <div className="modo">
            <button
              className="boton boton-principal"
              type="button"
              aria-describedby="info-pregunta"
              onClick={onPregunta}
            >
              Pregunta
            </button>
            <div className="modo-info" id="info-pregunta" role="tooltip">
              <strong>{DESCRIPCIONES.pregunta.titulo}</strong>
              <span>{DESCRIPCIONES.pregunta.texto}</span>
            </div>
          </div>

          <div className="modo">
            <button
              className="boton boton-secundario"
              type="button"
              aria-describedby="info-desafio"
            >
              Desafío
            </button>
            <div className="modo-info" id="info-desafio" role="tooltip">
              <strong>{DESCRIPCIONES.desafio.titulo}</strong>
              <span>{DESCRIPCIONES.desafio.texto}</span>
            </div>
          </div>
        </nav>
      </div>

      <div className="herramientas">
        <button
          className="boton-icono btn-sonido"
          type="button"
          aria-label="Video del proceso de tueste"
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