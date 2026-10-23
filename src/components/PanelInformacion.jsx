// ===== Clases del panel "¿Qué es ROAST?" =====
const TITULO = 'flex justify-center text-cafe-oscuro'
const TEXTO = 'my-5 flex justify-center text-center text-black'
const TARJETA =
  'my-5 h-[220px] w-[300px] cursor-pointer rounded-[10px] bg-beige p-2.5 hover:-translate-y-2'

function PanelInformacion({ onCerrar }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-crema">
      <div className="w-full max-w-[700px] px-[30px] py-10">
        <header className="fixed top-0 left-0 z-1000 flex h-[60px] w-full items-center justify-start bg-cafe-oscuro p-0">
          <button
            className="flex h-full w-[100px] cursor-pointer flex-col items-center justify-center bg-[#703e21] font-cuerpo font-semibold tracking-[2px] text-white hover:bg-[#7b5843]"
            type="button"
            aria-label="Cerrar"
            onClick={onCerrar}
          >
            <span>✕</span>
            <span>SALIR</span>
          </button>
        </header>

        <div>
          <h1 className={`${TITULO} text-[2em] font-bold`}>Qué es ROAST?</h1>
        </div>

        <div className="animate-sombra-pulse-alterna cursor-pointer rounded-[10px] bg-beige hover:-translate-y-2">
          <p className={`${TEXTO} p-[15px]`}>
            ROAST es un simulador interactivo de tueste de café diseñado para
            apoyar el aprendizaje y la práctica del proceso de tostión. La
            herramienta permite al usuario experimentar de manera controlada
            con diferentes variables del tueste, como el tiempo y la
            temperatura, sin necesidad de utilizar café físico durante las
            etapas iniciales de aprendizaje. De esta manera, ROAST busca
            reducir las pérdidas de materia prima ocasionadas por errores
            durante la práctica y facilitar una mejor comprensión de cómo las
            decisiones tomadas durante el proceso influyen en el resultado
            final del café. Además, el sistema integra preguntas y actividades
            prácticas que permiten reforzar los conocimientos adquiridos y
            desarrollar una mayor familiaridad con el proceso de tueste.
          </p>
        </div>

        <section className="mt-10 grid grid-cols-3 justify-center gap-10">
          <article className={`${TARJETA} animate-sombra-pulse`}>
            <div>
              <h3 className={`${TITULO} text-[1.17em] font-bold`}>Modos de juego</h3>
            </div>
            <p className={TEXTO}>
              ROAST cuenta con dos modos diseñados para aprender y poner a
              prueba tus conocimientos sobre el tueste de café. Elige entre
              Pregunta, para reforzar tus conocimientos, o Desafío, para poner
              a prueba tus habilidades dentro del simulador.
            </p>
          </article>

          <article className={`${TARJETA} animate-sombra-pulse [animation-delay:0.5s]`}>
            <div>
              <h3 className={`${TITULO} text-[1.17em] font-bold`}>Pregunta</h3>
            </div>
            <p className={TEXTO}>
              Pon a prueba tus conocimientos sobre el café y el proceso de
              tueste mediante preguntas relacionadas con temperatura, tiempo,
              tipos de tueste, características del grano y otros conceptos
              importantes.
            </p>
          </article>

          <article className={`${TARJETA} animate-sombra-pulse [animation-delay:1s]`}>
            <div>
              <h3 className={`${TITULO} text-[1.17em] font-bold`}>Desafío</h3>
            </div>
            <p className={TEXTO}>
              Enfréntate a una tarea aleatoria dentro del simulador y demuestra
              tus habilidades de tueste. Elige entre tres niveles de
              dificultad: fácil, medio y difícil, y cumple correctamente las
              condiciones del desafío para superarlo.
            </p>
          </article>
        </section>
      </div>
    </div>
  )
}

export default PanelInformacion
