import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Inicio from './pages/Inicio.jsx'
import Pregunta from './pages/Pregunta.jsx'
import Desafio from './pages/Desafio.jsx'
import SimuladorTueste from './pages/SimuladorTueste.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/pregunta" element={<Pregunta />} />
        <Route path="/desafio" element={<Desafio />} />
        <Route path="/simulador" element={<SimuladorTueste />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App