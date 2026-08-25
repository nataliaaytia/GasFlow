import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Cabecera from './Cabecera';
import CountUp from './CountUp';
import CircularGallery from './CircularGallery';

const Introduccion = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const galleryItems = [
        { image: '/images/gasolinanegra.jpeg', text: 'Mala Gasolina' },
        { image: '/images/surtidorvacio.jpeg', text: 'Surtidores Vacíos' },
        { image: '/images/mecanico.jpeg', text: 'Autos dañados' },
        { image: '/images/gasolineravacia.jpeg', text: 'Gasolineras cerradas' },
        { image: '/images/fila.jpeg', text: 'Filas Interminables' },


        { image: '/images/gasolinanegra.jpeg', text: 'Gasolina alterada' },

        { image: '/images/nuevagvacia.jpeg', text: 'Sin servicio' },
        { image: '/images/nuevafila2.jpeg', text: 'Filas de horas' },
        { image: '/images/nuevomecanico.jpeg', text: 'autos sin funcionar' },

        { image: '/images/nuevafila.jpeg', text: 'Filas enormes' }
    ];

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                overflowY: 'auto',
                overflowX: 'hidden',
                backgroundColor: '#FDFBF7',
                margin: 0,
                padding: 0,
                fontFamily: "'Poppins', sans-serif"
            }}
        >
            <Cabecera />

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '140px 20px 60px 20px',
                gap: '40px',
                flexWrap: 'wrap'
            }}>
                {/* Imagen de la ciudad colapsada */}
                <div style={{ flex: '1 1 400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <img
                        src="public/images/nohaygasolina.jpeg"
                        alt="Crisis de combustible en Bolivia"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }}
                    />
                </div>

                {/* Texto del relato */}
                <div style={{ flex: '1 1 400px' }}>
                    <h1 style={{ color: '#213552', fontSize: '3rem', marginBottom: '20px', lineHeight: '1.2' }}>
                        Cuando la nación <span style={{ color: '#3f7095' }}>se detuvo.</span>
                    </h1>
                    <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        Bolivia se paralizó. Las calles, antes llenas de vida, se convirtieron en un laberinto interminable de motores apagados y desesperación. Días enteros y noches heladas se perdían en filas kilométricas esperando por una gota de combustible que parecía no llegar nunca.
                    </p>
                    <p style={{ color: '#555', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '20px', textAlign: 'justify' }}>
                        La logística colapsó; los camiones cisterna deambulaban a ciegas, ignorando las rutas óptimas y abasteciendo solo a un puñado de surtidores privilegiados, dejando a ciudades enteras desabastecidas. Y cuando la esperanza parecía resurgir, llegó combustible adulterado: una solución envenenada que destrozó los motores de una infinidad de autos en el país.
                    </p>
                </div>
            </div>

            {/* Animación del Contador de Afectados */}
            <div style={{
                backgroundColor: 'rgba(63, 112, 149, 0.08)',
                padding: '60px 20px',
                textAlign: 'center',
                margin: '20px 0'
            }}>
                <h2 style={{ color: '#213552', fontSize: '1.6rem', marginBottom: '10px', fontWeight: 500 }}>
                    Personas afectadas por la crisis en Bolivia
                </h2>
                <div style={{ color: '#3f7095', fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
                    +<CountUp
                        from={0}
                        to={2500000} //ni idea d cuanto es la velda
                        separator="."
                        direction="up"
                        duration={2.5}
                        delay={0.2}
                    />
                </div>
                <p style={{ color: '#666', fontSize: '1rem', marginTop: '5px' }}>
                    Conductores, transportistas y familias atrapadas en el desabastecimiento.
                </p>
            </div>

            <div style={{ height: '600px', position: 'relative', margin: '40px 0', backgroundColor: '#213552', padding: '20px 0' }}>
                <h2 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 400 }}>
                    Memorias visuales del colapso
                </h2>
                <div style={{ height: '500px', position: 'relative' }}>
                    <CircularGallery
                        items={galleryItems}
                        bend={2}
                        textColor="#ffffff"
                        borderRadius={0.05}
                        scrollEase={0.05}
                        scrollSpeed={1}
                    />
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '60px auto',
                padding: '0 20px',
                gap: '40px',
                flexWrap: 'wrap-reverse'
            }}>
                {/* Texto del Objetivo a la Izquierda */}
                <div style={{ flex: '1 1 400px' }}>
                    <h2 style={{ color: '#213552', fontSize: '2.5rem', marginBottom: '20px', lineHeight: '1.2' }}>
                        Nuestro <span style={{ color: '#3f7095' }}>Objetivo</span>
                    </h2>
                    <p style={{ color: '#555', fontSize: '1.2rem', lineHeight: '1.8', textAlign: 'justify', fontWeight: 400 }}>
                        Diseñar un <strong style={{ color: '#3f7095' }}>algoritmo matemático eficiente</strong> orientado a optimizar la distribución de combustible, con el propósito de apoyar a la sociedad boliviana frente a la severa crisis de abastecimiento de gasolina
                    </p>
                </div>

                {/* Imagen del Objetivo a la Derecha */}
                <div style={{ flex: '1 1 400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                    <img
                        src="/public/images/gasolineravacia.jpeg"
                        alt="Solución y optimización matemática"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }}
                    />
                </div>
            </div>

            {/* Algoritmos para la solución */}
            <div style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
                <h2 style={{ color: '#213552', fontSize: '2.3rem', marginBottom: '10px' }}>
                    Algoritmos para la Solución
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '40px' }}>
                    La crisis exige soluciones precisas. Así es como la matemática y la programación resuelven el caos logístico:
                </p>

                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>

                    {/* Tarjeta 1: Esquina Noroeste */}
                    <Link to="/asignacion" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 300px', maxWidth: '420px' }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', transition: 'transform 0.3s', cursor: 'pointer', height: '100%'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <img src="/public/images/northwest.webp" alt="Asignación Northwest" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', height: '180px', objectFit: 'cover' }} />
                            <h3 style={{ color: '#3f7095', fontSize: '1.4rem', marginBottom: '10px', fontWeight: 600 }}>Esquina Noroeste</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Algoritmo de asignación que equilibra la <strong style={{ color: '#213552' }}>oferta</strong> de las plantas de suministro y la <strong style={{ color: '#213552' }}>demanda</strong> de las gasolineras de forma estructurada.
                            </p>
                        </div>
                    </Link>

                    {/* Tarjeta 2: Dijkstra */}
                    <Link to="/rutas" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 300px', maxWidth: '420px' }}>
                        <div style={{
                            backgroundColor: '#fff', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)', transition: 'transform 0.3s', cursor: 'pointer', height: '100%'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <img src="/public/images/dijkstra.jpg" alt="Optimización Dijkstra" style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', height: '180px', objectFit: 'cover' }} />
                            <h3 style={{ color: '#3f7095', fontSize: '1.4rem', marginBottom: '10px', fontWeight: 600 }}>Algoritmo de Dijkstra</h3>
                            <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Cálculo matemático del <strong style={{ color: '#213552' }}>camino más corto</strong> para garantizar que los camiones cisterna lleguen a su destino en el menor tiempo posible.
                            </p>
                        </div>
                    </Link>

                </div>
            </div>
            {/* Boton de Empezar */}
            <div style={{ textAlign: 'center', padding: '20px 20px 100px 20px' }}>
                <p style={{ color: '#213552', fontSize: '1.1rem', marginBottom: '15px', fontWeight: 500 }}>
                    ¿Listo para optimizar la logística?
                </p>
                <Link to="/asignacion" style={{
                    display: 'inline-block',
                    padding: '16px 44px',
                    backgroundColor: '#213552',
                    color: '#fff',
                    borderRadius: '40px',
                    textDecoration: 'none',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px rgba(33, 53, 82, 0.25)',
                    transition: 'transform 0.2s'
                }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Empezar Asignación
                </Link>
            </div>

        </div>
    );
};

export default Introduccion;