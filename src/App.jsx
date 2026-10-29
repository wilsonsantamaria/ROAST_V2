   
   
   import { BrowserRouter, Route, Routes } from 'react-router-dom'
    import Inicio from './pages/Inicio.jsx'
    import Pregunta from './pages/Pregunta.jsx'
    import Desafio from './pages/Desafio.jsx'

    function App() {
    return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Inicio />} />
    <Route path="/pregunta" element={<Pregunta />} />
    <Route path="/desafio" element={<Desafio />} />
    </Routes>
    </BrowserRouter>
    )
    }

    export default App