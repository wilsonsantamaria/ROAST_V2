import { LETRAS_ROAST } from '../assets/imagenes.js'

function LogoRoast({ ref }) {
  return (
    <div className="flex gap-2.5" ref={ref}>
      {LETRAS_ROAST.map(({ letra, src }) => (
        <img className="size-[70px]" key={letra} src={src} alt={letra} />
      ))}
    </div>
  )
}

export default LogoRoast