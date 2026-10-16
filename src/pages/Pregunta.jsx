import '../styles/pregunta.css'

// Por ahora son 5 tarjetas de ejemplo (igual que la versión original).
// El backend ya expone GET /api/preguntas para reemplazarlas por datos reales.
const TARJETAS = [1, 2, 3, 4, 5]
const OPCIONES = [1, 2, 3, 4]

function Pregunta() {
  return (
    <main className="pagina">
      <header>
        <h1>Modo Aprendizaje</h1>
      </header>

      <div className="contenido">
        {TARJETAS.map((numero) => (
          <section className="tarjeta-pregunta" key={numero}>
            <p className="enunciado">{numero}</p>
            {OPCIONES.map((opcion) => (
              <button key={opcion}>{opcion}</button>
            ))}
          </section>
        ))}
      </div>
    </main>
  )
}

export default Pregunta
