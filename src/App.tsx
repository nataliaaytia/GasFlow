import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './components/Inicio';
import Contactos from './components/Contactos';
import Rutas from './components/Rutas';
import Introduccion from './components/Introduccion';
import Algoritmos from './components/Algoritmos';
import Asignacion from './components/Asignacion';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/introduccion" element={<Introduccion />} />
        <Route path="/algoritmos" element={<Algoritmos />} />
        <Route path='/asignacion' element={<Asignacion />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="/contactos" element={<Contactos />} />
      </Routes>
    </Router>
  );
}

export default App;