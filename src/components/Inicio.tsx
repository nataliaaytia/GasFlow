import Grainient from './Grainient';
import Cabecera from './Cabecera';

const Inicio = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>

            {/* Fondo Animado */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                <Grainient color1="#519acf" color2="#D6EAF8" color3="#ffe68d" timeSpeed={1.50} warpStrength={1} grainAnimated={true} />
            </div>

            <Cabecera />

            {/* Contenido Central */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: "'Poppins', sans-serif", textAlign: 'center', padding: '0 20px' }}>
                <h1 style={{ fontSize: '4.5rem', color: '#3f7095', margin: 0, textShadow: '0 0 2px #fff, 0 0 10px rgba(255,255,255,0.5)' }}>
                    GasFlow
                </h1>
                <p style={{ fontSize: '2.3rem', marginTop: '1rem', color: '#213552', fontWeight: '500', textShadow: '0 0 4px #fff' }}>
                    Optimización de Rutas y Distribución de Gasolina
                </p>
                <button style={{ marginTop: '3rem', padding: '15px 60px', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', background: '#3f7095', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(63, 112, 149, 0.3)' }}>
                    Empezar
                </button>
            </div>
        </div>
    );
};

export default Inicio;