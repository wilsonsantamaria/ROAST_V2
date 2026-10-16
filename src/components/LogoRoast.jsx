import { LETRAS_ROAST } from '../assets/imagenes.js'

function LogoRoast({ ref }) {
  return (
    <div className="roast" ref={ref}>
      {LETRAS_ROAST.map(({ letra, src }) => (
        <img key={letra} src={src} alt={letra} />
      ))}
    </div>
  )
}

export default LogoRoast
