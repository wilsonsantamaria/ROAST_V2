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


const BOTON =
  'inline-flex h-[69px] animate-girar-borde cursor-pointer items-center justify-center rounded-sm border-[3px] border-transparent px-14 font-titulo text-[20px] font-bold tracking-[0.075em] shadow-[0_9px_22px_rgba(59,31,14,0.24)] transition-[background-color,color,border-color,translate] duration-200 ease-[ease] active:translate-y-px'

const BOTON_PRINCIPAL = `${BOTON} text-crema [background:linear-gradient(var(--color-cafe-oscuro),var(--color-cafe-oscuro))_padding-box,conic-gradient(from_var(--h),transparent_0%,transparent_55%,var(--color-dorado)_80%,#895e40_100%)_border-box] hover:border-cafe-medio hover:[background:var(--color-cafe-medio)]`

const BOTON_SECUNDARIO = `${BOTON} text-cafe-oscuro [background:linear-gradient(var(--color-crema),var(--color-crema))_padding-box,conic-gradient(from_var(--h),transparent_0%,transparent_55%,var(--color-cafe-suave)_80%,var(--color-dorado)_100%)_border-box] hover:text-crema hover:[background:var(--color-cafe-oscuro)]`

//  Mensaje que aparece al pasar el cursor sobre Pregunta / Desafío 
const MODO_INFO =
  'pointer-events-none invisible absolute top-[calc(100%+14px)] left-1/2 z-20 flex w-[280px] -translate-x-1/2 -translate-y-1.5 flex-col gap-1.5 rounded-lg border border-dorado bg-cafe-oscuro/96 px-4 py-3.5 text-left text-[13px] leading-normal text-crema opacity-0 shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-[opacity,translate,visibility] duration-200 ease-[ease] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 before:absolute before:bottom-full before:left-1/2 before:-ml-[7px] before:border-[7px] before:border-transparent before:border-b-dorado'

const MODO_INFO_TITULO = 'font-titulo text-[15px] tracking-[0.04em] text-dorado'

function PantallaInicio({ onPregunta, onVideo, botonVideoRef }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black bg-[url(../assets/img/wwww.jpg)] bg-size-[100%_100%] font-cuerpo text-cafe-oscuro">
      <div className="flex flex-col items-center justify-center px-5 pt-[25px] pb-[18px] text-center">
        <div>
          <LogoRoast />
        </div>

        <p className="mt-[18px] indent-[0.32em] text-[length:clamp(11px,2vw,15px)] font-normal tracking-[0.32em] text-crema uppercase">
          Elige tu modo de juego
        </p>

        <nav className="mt-[38px] flex flex-wrap justify-center gap-[25px]">
          <div className="group relative flex">
            <button
              className={BOTON_PRINCIPAL}
              type="button"
              aria-describedby="info-pregunta"
              onClick={onPregunta}
            >
              Pregunta
            </button>
            <div className={MODO_INFO} id="info-pregunta" role="tooltip">
              <strong className={MODO_INFO_TITULO}>{DESCRIPCIONES.pregunta.titulo}</strong>
              <span>{DESCRIPCIONES.pregunta.texto}</span>
            </div>
          </div>

          <div className="group relative flex">
            <button
              className={BOTON_SECUNDARIO}
              type="button"
              aria-describedby="info-desafio"
            >
              Desafío
            </button>
            <div className={MODO_INFO} id="info-desafio" role="tooltip">
              <strong className={MODO_INFO_TITULO}>{DESCRIPCIONES.desafio.titulo}</strong>
              <span>{DESCRIPCIONES.desafio.texto}</span>
            </div>
          </div>
        </nav>
      </div>

      <div className="fixed right-[26px] bottom-[15px] flex gap-[15px]">
        <button
          className="grid size-[45px] cursor-pointer place-items-center rounded-full border border-cafe-suave bg-transparent p-0 text-[18px] text-cafe-suave transition-[background-color,color,border-color] duration-200 ease-[ease] hover:border-cafe-oscuro hover:bg-cafe-oscuro/8 hover:text-cafe-oscuro"
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