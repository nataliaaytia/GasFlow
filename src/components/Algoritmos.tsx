import React from 'react';
import Cabecera from './Cabecera';
import Folder from './Folder';
import './Algoritmos.css';

const PaperContent = ({ titulo, tipo, link }: { titulo: string; tipo: 'youtube' | 'doc'; link: string }) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="paper-content-link"
    >
        <div className={`paper-content-icon ${tipo === 'youtube' ? 'paper-content-youtube' : 'paper-content-doc'}`}>
            {tipo === 'youtube' ? 'Y' : 'D'}
        </div>
        <span className="paper-content-text">{titulo}</span>
    </a>
);

const Algoritmos = () => {

    const recursosNorthwest = [
        <PaperContent titulo="Introduccion" tipo="youtube" link="https://www.youtube.com/watch?v=cGqiHqxKI0w" />,
        <PaperContent titulo="Metodo Paso a Paso" tipo="youtube" link="https://www.youtube.com/watch?v=IyogQ4noci0" />,
        <PaperContent titulo="Explicacion" tipo="youtube" link="https://www.youtube.com/watch?v=HjXWStUh0yE" />
    ];

    const recursosDijkstra = [
        <PaperContent titulo="Explicacion" tipo="youtube" link="https://www.youtube.com/watch?v=LLx0QVMZVkk" />,
        <PaperContent titulo="Ejemplo Practico" tipo="youtube" link="https://www.youtube.com/watch?v=AU1wAHzkkMI" />,
        <PaperContent titulo="Metodo paso a paso" tipo="youtube" link="https://www.youtube.com/watch?v=zwZ6hpaWIds" />
    ];

    return (
        <div className="algoritmos-container">
            <Cabecera />

            <div className="algoritmos-content">

                <div className="algoritmos-header">
                    <h1 className="algoritmos-title">Algoritmos A Usar</h1>
                    <p className="algoritmos-subtitle">
                        La optimizacion de recursos en GasFlow se basa en 2 algortimos matematicos fundamentales. Conoce ambos Algortimos
                    </p>
                </div>

                <div className="algoritmos-cards-wrapper">

                    <div className="algoritmos-card">
                        <div className="algoritmos-card-text">
                            <h2 className="algoritmos-card-title">Metodo de la Esquina Noroeste (Northwest)</h2>
                            <p className="algoritmos-card-desc">
                                Es un metodo utilizado para encontrar una solucion factible en problemas de transporte. Distribuye sistematicamente los recursos desde la esquina superior izquierda (noroeste) de una matriz de costos hasta satisfacer la demanda. Aparte, encuentra la solucion optima despues de varias iteraciones
                            </p>
                            <h3 className="algoritmos-card-subtitle">Aplicaciones Practicas:</h3>
                            <ul className="algoritmos-card-list">
                                <li><strong>Gestion:</strong> Movilizacion de productos desde multiples fabricas hacia diferentes almacenes.</li>
                                <li><strong>Distribucion:</strong> Asignacion de recursos en situaciones de forma optima despues de varias iteraciones.</li>
                                <li><strong>Equilibrio de Surtidores:</strong> Balance inicial entre el combustible disponible en plantas y el requerido por las gasolineras.</li>
                            </ul>
                        </div>

                        <div className="algoritmos-card-folder">
                            <h3 className="algoritmos-folder-title noroeste">Material de Apoyo</h3>
                            <div className="algoritmos-folder-wrapper">
                                <Folder size={2.5} color="#d9825b" items={recursosNorthwest} />
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta Dijkstra (Colocada en segundo lugar) */}
                    <div className="algoritmos-card">
                        <div className="algoritmos-card-text">
                            <h2 className="algoritmos-card-title">Algoritmo de Dijkstra</h2>
                            <p className="algoritmos-card-desc">
                                Concebido por Edsger W. Dijkstra en 1956, este algoritmo determina la ruta mas corta desde un nodo origen hacia todos los demas nodos en un grafo con pesos positivos. Es el nucleo de nuestra optimizacion de rutas viales.
                            </p>
                            <h3 className="algoritmos-card-subtitle">Aplicaciones Practicas:</h3>
                            <ul className="algoritmos-card-list">
                                <li><strong>Sistemas GPS:</strong> Calculo instantaneo de la via mas rapida evitando congestionamiento.</li>
                                <li><strong>Enrutamiento de Redes:</strong> Direccionamiento eficiente de paquetes de datos en internet (protocolos OSPF).</li>
                                <li><strong>Logistica de Combustible:</strong> Trazado del recorrido exacto que minimiza el gasto operativo de las cisternas.</li>
                            </ul>
                        </div>

                        <div className="algoritmos-card-folder">
                            <h3 className="algoritmos-folder-title dijkstra">Material de Apoyo</h3>
                            <div className="algoritmos-folder-wrapper">
                                <Folder size={2.5} color="#213552" items={recursosDijkstra} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Algoritmos;