
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pregunta.css'

function Pregunta() {
  const [preguntas, setPreguntas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const [respuestas, setRespuestas] = useState({})

  // false = está respondiendo | true = ya envió y ve los resultados
  const [enviado, setEnviado] = useState(false)


  useEffect(() => {
    // fetch sirve para hacer peticiones a un servidor

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

  // ----- Cuentas -----
  const total = preguntas.length
  const respondidas = Object.keys(respuestas).length
  const todasRespondidas = total > 0 && respondidas === total


    const aciertos = preguntas.filter((p) => {
    const elegida = p.opciones.find((o) => o.letra === respuestas[p.id])
    return elegida?.correcta
  }).length
  

  const fallos = total - aciertos
  const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0


  //  VISTA 2: RESULTADOS (después de dar "Enviar respuestas")
  if (enviado) {
    return (
      <main className="pagina">
        <header className="cabecera">
          <h1>Resultados del aprendizaje</h1>

          <div className="resumen">
            <div className="dato dato-bien">
              <strong>{aciertos}</strong>
              <span>Correctas</span>
            </div>
            <div className="dato dato-mal">
              <strong>{fallos}</strong>
              <span>Incorrectas</span>
            </div>
            <div className="dato dato-puntaje">
              <strong>{porcentaje}%</strong>
              <span>Puntaje</span>
            </div>
          </div>
        </header>

        {preguntas.map((p, i) => {
          const elegida = p.opciones.find((o) => o.letra === respuestas[p.id])
          const correcta = p.opciones.find((o) => o.correcta)
          const acerto = Boolean(elegida?.correcta)
          const numero = String(i + 1).padStart(2, '0')

          return (
            <article
              className={`resultado ${acerto ? 'acierto' : 'fallo'}`}
              key={p.id}
            >
              <div className="resultado-cabecera">
                <span className="resultado-icono">{acerto ? '✓' : '✗'}</span>
                <div>
                  <span className="resultado-estado">
                    Pregunta {numero} — {acerto ? 'Correcta' : 'Incorrecta'}
                  </span>
                  <h2 className="resultado-pregunta">{p.enunciado}</h2>
                </div>
              </div>

              <div className="resultado-cuerpo">
                <div className={`caja ${acerto ? 'caja-bien' : 'caja-mal'}`}>
                  <span className="caja-etiqueta">
                    {acerto ? '✓ Tu respuesta (correcta)' : '✗ Tu respuesta'}
                  </span>
                  <span className="caja-texto">
                    {elegida.letra}) {elegida.texto}
                  </span>
                </div>

                {!acerto && correcta && (
                  <div className="caja caja-bien">
                    <span className="caja-etiqueta">✓ Respuesta correcta</span>
                    <span className="caja-texto">
                      {correcta.letra}) {correcta.texto}
                    </span>
                  </div>
                )}
              </div>
            </article>
          )
        })}

      <footer className="acciones">
  <Link to="/" state={{ saltarCarga: true }} className="pg-boton pg-volver">
    Volver al inicio
  </Link>
</footer>
      </main>
    )
  }

  //  VISTA 1:  (solono dice si está bien)
  return (
    <main className="pagina">
      <header className="cabecera">
        <h1>Modo aprendizaje</h1>

        {total > 0 && (
          <div className="progreso">
            <span>
              Respondidas {respondidas} de {total}
            </span>
            <div className="barra">
              <div
                className="barra-relleno"
                style={{ width: `${(respondidas / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {cargando && <p>Cargando preguntas...</p>}
      {error && <p>No se pudieron cargar las preguntas.</p>}

      <div className="contenido">
        {preguntas.map((p, i) => (
          <section className="tarjeta-pregunta" key={p.id}>
            <div className="pregunta-titulo">
              <span className="numero">{String(i + 1).padStart(2, '0')}</span>
              <p className="enunciado">{p.enunciado}</p>
            </div>

            <div className="opciones">
              {p.opciones.map((o) => (
                <button
                  type="button"
                  key={o.letra}
                  className={`opcion${respuestas[p.id] === o.letra ? ' seleccionada' : ''}`}
                  aria-pressed={respuestas[p.id] === o.letra}
                  onClick={() => elegir(p.id, o.letra)}
                >
                  <span className="letra">{o.letra}</span>
                  <span className="opcion-texto">{o.texto}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {total > 0 && (
        <footer className="acciones">
          <Link to="/" state={{ saltarCarga: true }} className="pg-boton pg-volver">
            Volver
          </Link>
          <button
            type="button"
            className="pg-boton pg-enviar"
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