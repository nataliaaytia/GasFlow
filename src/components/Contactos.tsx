import Cabecera from './Cabecera';
import TiltedCard from './TiltedCard';
import CurvedLoop from './CurvedLoop';

const Contactos = () => {
    const equipo = [
        {
            nombreCorto: 'Natalia',
            nombreCompleto: 'Natalia Aytia Morales',
            correo: 'natalia.aytia@gmail.com',
            //imagen: '/images/natalia.png'
            imagen: '/images/gato1.jpg'
        },
        {
            nombreCorto: 'Hans',
            nombreCompleto: 'Hans Karel Carvajal Gutierrez',
            correo: 'hans.carv@gmail.com',
            //imagen: '/images/hans.jpeg'
            imagen: '/images/gato2.jpg'
        },
        {
            nombreCorto: 'Alessandro',
            nombreCompleto: 'Alessandro Ronald Quenallata Condori',
            correo: 'alessandrorqc@gmail.com',
            //imagen: '/images/alessandro.png'
            imagen: '/images/gato3.jpg'
        }
    ];

    return (
        <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#FDFBF7', margin: 0, padding: 0, fontFamily: "'Poppins', sans-serif", position: 'relative', overflowX: 'hidden' }}>

            <Cabecera />

            <div style={{ paddingTop: '120px', paddingBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

                <h1 style={{ color: '#3f7095', fontSize: '3rem', marginBottom: '0px', zIndex: 2 }}>
                    Sobre Nosotros
                </h1>
                <p style={{ color: '#213552', fontSize: '1.2rem', marginBottom: '20px', zIndex: 2 }}>
                    conoce a los miembros de nuestro equipo
                </p>

                <div style={{ position: 'absolute', top: '350px', left: 0, width: '100%', zIndex: 1, opacity: 0.8 }}>
                    <CurvedLoop
                        marqueeText="Los Laris"
                        speed={0.75}
                        curveAmount={220}
                        direction="left"
                        interactive={true}
                    />
                </div>

                <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px', marginTop: '60px', zIndex: 2 }}>
                    {equipo.map((miembro) => (
                        <div key={miembro.nombreCompleto} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                            <TiltedCard
                                imageSrc={miembro.imagen}
                                altText={`Foto de ${miembro.nombreCorto}`}
                                captionText={`¡Hola! Soy ${miembro.nombreCorto}`}
                                containerHeight="300px"
                                containerWidth="300px"
                                imageHeight="300px"
                                imageWidth="300px"
                                rotateAmplitude={12}
                                scaleOnHover={1.05}
                                showMobileWarning={false}
                                showTooltip={true}
                                displayOverlayContent={true}
                                overlayContent={
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'blur(5px)',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        color: '#3f7095',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}>
                                        {miembro.nombreCorto}
                                    </div>
                                }
                            />

                            <h3 style={{ marginTop: '20px', color: '#213552', marginBottom: '5px' }}>
                                {miembro.nombreCompleto}
                            </h3>
                            <p style={{ color: '#519acf', margin: 0, fontWeight: '500' }}>
                                {miembro.correo}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Contactos;