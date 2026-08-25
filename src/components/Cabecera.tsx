import { Link } from 'react-router-dom';
import './Cabecera.css';

const Cabecera = () => {
    const opcionesNormales = [
        { nombre: 'Introducción', link: '/introduccion' },
        { nombre: 'Algoritmos', link: '/algoritmos' },
        { nombre: 'Asignación', link: '/asignacion' },
        { nombre: 'Rutas', link: '/rutas' }
    ];

    return (
        <header className="cabecera-container">
            <Link to="/" className="cabecera-logo">
                GasFlow
            </Link>
            <span style={{
                color: '#25496bff',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: '0px'
            }}>
                Optimizacion de distribucion de gasolina y rutas
            </span>

            <nav className="cabecera-nav">
                {opcionesNormales.map((opc) => (
                    <Link key={opc.nombre} to={opc.link} className="nav-link">
                        {opc.nombre}
                    </Link>
                ))}

                <div className="separador"></div>

                <Link to="/contactos" className="nav-contactos">
                    Contactos
                </Link>
            </nav>
        </header>
    );
};

export default Cabecera;