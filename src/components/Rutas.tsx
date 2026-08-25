import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Cabecera from './Cabecera';
import Dock from './Dock';
import { VscAdd, VscEdit, VscReferences, VscTrash } from 'react-icons/vsc';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center: [number, number] = [-16.4956, -68.1336];

const COLOR_EVALUANDO = "#abcbd3";
const COLOR_SOLUCION = "#FF0000";

const generarColorArista = () => {
    const colores = ["#c8c29e", "#abcbd3", "#ffc98d", "#e1d3b6", "#c0a290", "#ffb284", "#2a9d8f", "#ff9f1c"];
    return colores[Math.floor(Math.random() * colores.length)];
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const Rutas = () => {
    const [modoActivo, setModoActivo] = useState<string>('crear');
    const [nodoSeleccionado, setNodoSeleccionado] = useState<string | null>(null);

    const [nodos, setNodos] = useState<any[]>([]);
    const [aristas, setAristas] = useState<any[]>([]);
    const graphRef = useRef({ nodos: [] as any[], aristas: [] as any[] });

    const [modalAlerta, setModalAlerta] = useState({ open: false, titulo: '', mensaje: '' });
    const [modalNodoNuevo, setModalNodoNuevo] = useState({ open: false, lat: 0, lng: 0, nombre: '' });
    const [modalNodoEditar, setModalNodoEditar] = useState({ open: false, id: '', nombre: '' });
    const [modalAristaNueva, setModalAristaNueva] = useState({ open: false, desdeNodo: null as any, hastaNodo: null as any, puntosCalle: [] as any[], distanciaSugerida: 0, peso: '' });
    const [modalAristaEditar, setModalAristaEditar] = useState({ open: false, id: '', peso: '' });
    const [modalDijkstra, setModalDijkstra] = useState({ open: false, tipo: 'min' });
    const [modalExportar, setModalExportar] = useState({ open: false, nombreArchivo: 'grafo_rutas_lapaz' });
    const [modalAyuda, setModalAyuda] = useState(false);

    const [dijOrigen, setDijOrigen] = useState('');
    const [dijDestino, setDijDestino] = useState('');
    const [ultimoCalculo, setUltimoCalculo] = useState<any>(null);

    const updateGraphState = () => {
        setNodos(graphRef.current.nodos.map(n => ({ ...n })));
        setAristas(graphRef.current.aristas.map(a => ({ ...a })));
    };

    const mostrarAviso = (titulo: string, mensaje: string) => {
        setModalAlerta({ open: true, titulo, mensaje });
    };

    const calcularRutaPorCalles = async (desdeNodo: any, hastaNodo: any) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${desdeNodo.lng},${desdeNodo.lat};${hastaNodo.lng},${hastaNodo.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates;
                const distanciaMetros = data.routes[0].distance;
                const puntosCalle = coords.map((c: [number, number]) => [c[1], c[0]]);
                return { puntosCalle, distanciaSugerida: Math.round(distanciaMetros) };
            }
        } catch (e) {
            console.error("Error ruteando calles.", e);
        }
        return { puntosCalle: [[desdeNodo.lat, desdeNodo.lng], [hastaNodo.lat, hastaNodo.lng]], distanciaSugerida: 120 };
    };

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                if (modoActivo === 'crear') {
                    setModalNodoNuevo({
                        open: true,
                        lat: e.latlng.lat,
                        lng: e.latlng.lng,
                        nombre: `Surtidor ${graphRef.current.nodos.length + 1}`
                    });
                } else {
                    setNodoSeleccionado(null);
                }
            },
        });
        return null;
    };

    const confirmarCrearNodo = () => {
        if (!modalNodoNuevo.nombre.trim()) return;
        const nuevoNodo = {
            id: Date.now().toString(),
            lat: modalNodoNuevo.lat,
            lng: modalNodoNuevo.lng,
            nombre: modalNodoNuevo.nombre,
            distMatematica: Infinity,
            distPantalla: undefined,
            visitado: false,
            prev: null
        };
        graphRef.current.nodos.push(nuevoNodo);
        updateGraphState();
        setModalNodoNuevo({ open: false, lat: 0, lng: 0, nombre: '' });
    };

    const handleNodeClick = async (id: string) => {
        const nodo = graphRef.current.nodos.find(n => n.id === id);
        if (!nodo) return;

        if (modoActivo === 'unir') {
            if (!nodoSeleccionado) {
                setNodoSeleccionado(id);
            } else if (nodoSeleccionado !== id) {
                const yaExiste = graphRef.current.aristas.some(a => a.desdeId === nodoSeleccionado && a.hastaId === id);
                if (yaExiste) {
                    setNodoSeleccionado(null);
                    return mostrarAviso('Via Duplicada', 'Ya registraste una conexion en este sentido.');
                }

                const desdeNodo = graphRef.current.nodos.find(n => n.id === nodoSeleccionado);
                const { puntosCalle, distanciaSugerida } = await calcularRutaPorCalles(desdeNodo, nodo);

                setModalAristaNueva({
                    open: true,
                    desdeNodo,
                    hastaNodo: nodo,
                    puntosCalle,
                    distanciaSugerida,
                    peso: distanciaSugerida.toString()
                });
                setNodoSeleccionado(null);
            } else {
                setNodoSeleccionado(null);
            }
        } else if (modoActivo === 'editar') {
            setModalNodoEditar({ open: true, id: nodo.id, nombre: nodo.nombre });
        } else if (modoActivo === 'borrar') {
            graphRef.current.nodos = graphRef.current.nodos.filter(n => n.id !== id);
            graphRef.current.aristas = graphRef.current.aristas.filter(a => a.desdeId !== id && a.hastaId !== id);
            setNodoSeleccionado(null);
            updateGraphState();
        }
    };

    const confirmarCrearArista = () => {
        const pesoNum = parseFloat(modalAristaNueva.peso);
        if (isNaN(pesoNum)) return;

        graphRef.current.aristas.push({
            id: Date.now().toString(),
            desdeId: modalAristaNueva.desdeNodo.id,
            hastaId: modalAristaNueva.hastaNodo.id,
            peso: pesoNum,
            puntos: modalAristaNueva.puntosCalle,
            dirigida: true,
            enSolucion: false,
            evaluando: false,
            color: generarColorArista()
        });
        updateGraphState();
        setModalAristaNueva({ open: false, desdeNodo: null, hastaNodo: null, puntosCalle: [], distanciaSugerida: 0, peso: '' });
    };

    const handleAristaClick = (id: string) => {
        const arista = graphRef.current.aristas.find(a => a.id === id);
        if (!arista) return;

        if (modoActivo === 'editar') {
            setModalAristaEditar({ open: true, id: arista.id, peso: arista.peso.toString() });
        } else if (modoActivo === 'borrar') {
            graphRef.current.aristas = graphRef.current.aristas.filter(a => a.id !== id);
            updateGraphState();
        }
    };

    const confirmarEditarArista = () => {
        const pesoNum = parseFloat(modalAristaEditar.peso);
        if (isNaN(pesoNum)) return;
        const arista = graphRef.current.aristas.find(a => a.id === modalAristaEditar.id);
        if (arista) {
            arista.peso = pesoNum;
            updateGraphState();
        }
        setModalAristaEditar({ open: false, id: '', peso: '' });
    };

    const confirmarEditarNodo = () => {
        if (!modalNodoEditar.nombre.trim()) return;
        const nodo = graphRef.current.nodos.find(n => n.id === modalNodoEditar.id);
        if (nodo) {
            nodo.nombre = modalNodoEditar.nombre;
            updateGraphState();
        }
        setModalNodoEditar({ open: false, id: '', nombre: '' });
    };

    const limpiarCalculosPrevios = () => {
        graphRef.current.nodos.forEach(n => { n.distMatematica = Infinity; n.distPantalla = undefined; n.visitado = false; n.prev = null; });
        graphRef.current.aristas.forEach(a => { a.enSolucion = false; a.evaluando = false; });
        updateGraphState();
    };

    const ejecutarDijkstra = async (tipo: string, animar: boolean) => {
        if (!dijOrigen || !dijDestino) return mostrarAviso('Campos Incompletos', 'Por favor selecciona ambos nodos.');
        if (dijOrigen === dijDestino) return mostrarAviso('Mismo Punto', 'El nodo origen y destino no pueden ser iguales.');

        const origen = graphRef.current.nodos.find(n => n.nombre === dijOrigen);
        const destino = graphRef.current.nodos.find(n => n.nombre === dijDestino);

        if (!origen || !destino) return;

        setModalDijkstra({ open: false, tipo: '' });
        limpiarCalculosPrevios();
        setUltimoCalculo({ origen: dijOrigen, destino: dijDestino, tipo });

        origen.distMatematica = 0;
        origen.distPantalla = 0;
        updateGraphState();

        if (animar) await sleep(500);

        let unvisited = [...graphRef.current.nodos];

        while (unvisited.length > 0) {
            unvisited.sort((a, b) => a.distMatematica - b.distMatematica);
            let u = unvisited.shift();

            if (u.distMatematica === Infinity) break;
            u.visitado = true;
            if (tipo === 'min' && u === destino) break;

            let aristasVecinas = graphRef.current.aristas.filter(a => a.desdeId === u.id);

            for (let a of aristasVecinas) {
                let v = graphRef.current.nodos.find(n => n.id === a.hastaId);
                if (v.visitado) continue;

                if (animar) {
                    a.evaluando = true;
                    updateGraphState();
                    await sleep(700);
                }

                let pesoInterno = tipo === 'max' ? -a.peso : a.peso;
                let alt = u.distMatematica + pesoInterno;

                if (alt < v.distMatematica) {
                    v.distMatematica = alt;
                    v.distPantalla = tipo === 'max' ? -alt : alt;
                    v.prev = { nodoId: u.id, aristaId: a.id };
                }

                if (animar) {
                    a.evaluando = false;
                    updateGraphState();
                    await sleep(200);
                }
            }
        }

        let pathPeso = 0;
        let curr = destino;

        while (curr && curr.prev) {
            const arista = graphRef.current.aristas.find(a => a.id === curr.prev.aristaId);
            if (arista) {
                arista.enSolucion = true;
                pathPeso += arista.peso;
            }
            curr = graphRef.current.nodos.find(n => n.id === curr.prev.nodoId);
            if (animar) {
                updateGraphState();
                await sleep(400);
            }
        }

        updateGraphState();

        if (!curr || destino.distMatematica === Infinity) {
            mostrarAviso('Sin Salida', 'No hay conexion viable respetando el sentido de las vias.');
        } else {
            mostrarAviso('Calculo Finalizado', `Trayecto resuelto de forma exitosa. Costo total de transporte: ${pathPeso} metros.`);
        }
    };

    const confirmarExportar = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graphRef.current));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        let finalName = modalExportar.nombreArchivo.trim() || 'grafo_exportado';
        if (!finalName.endsWith('.json')) finalName += '.json';
        dlAnchorElem.setAttribute("download", finalName);
        dlAnchorElem.click();
        setModalExportar({ open: false, nombreArchivo: '' });
    };

    const importarJSON = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.nodos && data.aristas) {
                    data.aristas.forEach((a: any) => {
                        if (!a.color) {
                            a.color = generarColorArista();
                        }
                    });
                    graphRef.current = data;
                    setUltimoCalculo(null);
                    updateGraphState();
                } else {
                    mostrarAviso('Error Estructural', 'El JSON cargado no posee nodos o aristas legibles.');
                }
            } catch (err) {
                mostrarAviso('Formato Invalido', 'El archivo cargado no es un JSON valido.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const ActionButton = ({ text, onClick, primary = false }: any) => (
        <button onClick={onClick} style={{
            padding: '10px 20px', backgroundColor: primary ? '#3f7095' : '#ffffff', color: primary ? '#ffffff' : '#3f7095',
            border: primary ? 'none' : '1px solid #93B9D6', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s',
        }}>{text}</button>
    );

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#FDFBF7',
            margin: 0,
            padding: 0,
            fontFamily: "'Poppins', sans-serif"
        }}>

            <style>{`
        .contenedor-dock-arriba .dock-panel {
        position: relative !important;
        bottom: auto !important;
        left: auto !important;
        transform: none !important;
        margin: 0 auto !important;
        box-shadow: 0 4px 20px rgba(63, 112, 149, 0.1) !important;
        }
        .contenedor-dock-arriba .dock-outer {
        height: auto !important;
        margin-top: 5px;
        }
        .leaflet-container a:focus, .leaflet-container a:active {
        outline: none;
        }
    `}</style>

            <Cabecera />

            <div style={{ paddingTop: '100px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <h1 style={{ color: '#3f7095', fontSize: '2.8rem', marginBottom: '5px' }}>Optimizacion de Rutas</h1>
                <p style={{ color: '#213552', fontSize: '1.1rem', marginBottom: '20px' }}>Trazado adaptado a calles reales con Dijkstra</p>

                <div className="contenedor-dock-arriba" style={{ zIndex: 10, marginBottom: '25px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '8px', color: '#3f7095', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Herramienta Activa: {modoActivo === 'crear' ? 'Crear Pin' : modoActivo === 'unir' ? 'Trazar Via' : modoActivo === 'editar' ? 'Editar Peso o Nombre' : 'Eliminar Componentes'}
                    </div>
                    <Dock
                        items={[
                            { icon: <VscAdd size={24} color={modoActivo === 'crear' ? '#3f7095' : 'inherit'} />, label: 'Crear', onClick: () => setModoActivo('crear'), className: modoActivo === 'crear' ? 'active-item' : '' },
                            { icon: <VscReferences size={24} color={modoActivo === 'unir' ? '#3f7095' : 'inherit'} />, label: 'Unir', onClick: () => setModoActivo('unir'), className: modoActivo === 'unir' ? 'active-item' : '' },
                            { icon: <VscEdit size={24} color={modoActivo === 'editar' ? '#3f7095' : 'inherit'} />, label: 'Editar', onClick: () => setModoActivo('editar'), className: modoActivo === 'editar' ? 'active-item' : '' },
                            { icon: <VscTrash size={24} color={modoActivo === 'borrar' ? '#ed6a5a' : 'inherit'} />, label: 'Borrar', onClick: () => setModoActivo('borrar'), className: modoActivo === 'borrar' ? 'active-item' : '' },
                        ]}
                        panelHeight={60} baseItemSize={45} magnification={65}
                    />
                </div>

                <div style={{ width: '90%', maxWidth: '1100px', height: '550px', backgroundColor: '#eef3f7', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', border: '4px solid #ffffff', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
                    <MapContainer center={center} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl={false}>
                        {/* Control de Zoom posicionado manualmente en la esquina inferior derecha */}
                        <ZoomControl position="bottomright" />
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <MapClickHandler />

                        {aristas.map(arista => {
                            const fromNode = nodos.find(n => n.id === arista.desdeId);
                            const toNode = nodos.find(n => n.id === arista.hastaId);
                            if (!fromNode || !toNode || !arista.puntos || arista.puntos.length === 0) return null;

                            const colorLinea = arista.enSolucion
                                ? COLOR_SOLUCION
                                : (arista.evaluando ? COLOR_EVALUANDO : (arista.color || '#2a9d8f'));

                            const grosor = arista.enSolucion ? 8 : 4;

                            let angle = 0;
                            if (arista.puntos.length >= 2) {
                                const mid = Math.floor(arista.puntos.length / 2);
                                const p1 = arista.puntos[mid === 0 ? 0 : mid - 1];
                                const p2 = arista.puntos[mid === 0 ? 1 : mid];
                                const dy = p2[0] - p1[0];
                                const dx = p2[1] - p1[1];
                                angle = Math.atan2(-dy, dx) * (180 / Math.PI);
                            }

                            const svgArrow = `
                <svg width="16" height="16" viewBox="0 0 24 24" style="transform: rotate(${angle}deg); flex-shrink: 0; transition: all 0.3s;">
                    <path d="M4 12h16M14 6l6 6-6 6" stroke="${colorLinea}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
            `;

                            return (
                                <React.Fragment key={`${arista.id}-${arista.enSolucion}-${arista.evaluando}`}>
                                    <Polyline
                                        positions={arista.puntos}
                                        color={colorLinea}
                                        weight={grosor}
                                        opacity={arista.enSolucion ? 1.0 : 0.85}
                                        eventHandlers={{ click: () => handleAristaClick(arista.id) }}
                                    />
                                    <Marker
                                        position={arista.puntos[Math.floor(arista.puntos.length / 2)]}
                                        eventHandlers={{ click: () => handleAristaClick(arista.id) }}
                                        icon={L.divIcon({
                                            className: 'custom-div-icon',
                                            html: `<div style="background: white; padding: 3px 8px; border-radius: 20px; border: 2px solid ${colorLinea}; color: #213552; font-weight: bold; font-size: 11px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; gap: 4px; width: max-content; transform: translate(-50%, -50%);">
                                <span>${arista.peso}m</span>
                                ${svgArrow}
                                </div>`,
                                            iconSize: [0, 0],
                                            iconAnchor: [0, 0]
                                        })}
                                    />
                                </React.Fragment>
                            );
                        })}

                        {nodos.map(nodo => {
                            const uniendoEsteNodo = nodoSeleccionado === nodo.id;

                            return (
                                <Marker
                                    key={nodo.id}
                                    position={[nodo.lat, nodo.lng]}
                                    eventHandlers={{ click: () => handleNodeClick(nodo.id) }}
                                >
                                    <Tooltip permanent direction="top" offset={[0, -22]}>
                                        <div style={{ fontFamily: "'Poppins', sans-serif", textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: '#3f7095' }}>
                                            {uniendoEsteNodo ? "CONECTANDO..." : nodo.nombre}
                                            {nodo.distPantalla !== undefined && (
                                                <div style={{ color: COLOR_SOLUCION, fontSize: '11px', marginTop: '2px', fontWeight: '900' }}>Acumulado: {nodo.distPantalla}</div>
                                            )}
                                        </div>
                                    </Tooltip>

                                    <Popup>
                                        <div style={{ fontSize: '12px' }}>
                                            <strong>{nodo.nombre}</strong> <br />
                                            Lat: {nodo.lat.toFixed(5)} <br />
                                            Lng: {nodo.lng.toFixed(5)}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px', alignItems: 'center', zIndex: 2 }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <ActionButton text="Limpiar Todo" onClick={() => { graphRef.current = { nodos: [], aristas: [] }; updateGraphState(); setUltimoCalculo(null); }} />
                        <div>
                            <input type="file" accept=".json" id="file-import-json" style={{ display: 'none' }} onChange={importarJSON} />
                            <ActionButton text="Importar" onClick={() => document.getElementById('file-import-json')?.click()} />
                        </div>
                        <ActionButton text="Exportar" onClick={() => setModalExportar({ open: true, nombreArchivo: 'grafo_rutas_lapaz' })} />

                        <ActionButton text="Minimizar" primary={true} onClick={() => setModalDijkstra({ open: true, tipo: 'min' })} />
                        <ActionButton text="Maximizar" primary={true} onClick={() => setModalDijkstra({ open: true, tipo: 'max' })} />
                        <ActionButton text="Explicar Algoritmo" onClick={() => {
                            if (ultimoCalculo) ejecutarDijkstra(ultimoCalculo.tipo, true);
                            else mostrarAviso('Falta Calculo', 'Primero genera un trayecto con "Distancia Minima" o "Maxima".');
                        }} />
                    </div>
                    <div>
                        <ActionButton text="Manual de Ayuda" onClick={() => setModalAyuda(true)} />
                    </div>
                </div>
            </div>

            {modalAlerta.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '320px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '12px', fontSize: '1.25rem' }}>{modalAlerta.titulo}</h3>
                        <p style={{ color: '#213552', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.4' }}>{modalAlerta.mensaje}</p>
                        <button onClick={() => setModalAlerta({ open: false, titulo: '', mensaje: '' })} style={{ padding: '8px 25px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Entendido</button>
                    </div>
                </div>
            )}

            {modalNodoNuevo.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '15px' }}>Nuevo Punto de Red</h3>
                        <input type="text" value={modalNodoNuevo.nombre} onChange={(e) => setModalNodoNuevo({ ...modalNodoNuevo, nombre: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={confirmarCrearNodo} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                            <button onClick={() => setModalNodoNuevo({ open: false, lat: 0, lng: 0, nombre: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalNodoEditar.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '15px' }}>Editar Nombre del Pin</h3>
                        <input type="text" value={modalNodoEditar.nombre} onChange={(e) => setModalNodoEditar({ ...modalNodoEditar, nombre: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={confirmarEditarNodo} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Actualizar</button>
                            <button onClick={() => setModalNodoEditar({ open: false, id: '', nombre: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAristaNueva.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '330px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '10px' }}>Conectar Tramo Vial</h3>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>Distancia real calculada por calles:<br /><strong style={{ color: '#2a9d8f' }}>{modalAristaNueva.distanciaSugerida} metros</strong></p>
                        <div style={{ textAlign: 'left', fontSize: '0.85rem', fontWeight: 'bold', color: '#3f7095', marginBottom: '4px', paddingLeft: '15px' }}>Peso / Costo del Grafo:</div>
                        <input type="text" value={modalAristaNueva.peso} onChange={(e) => setModalAristaNueva({ ...modalAristaNueva, peso: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={confirmarCrearArista} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Enlazar</button>
                            <button onClick={() => setModalAristaNueva({ open: false, desdeNodo: null, hastaNodo: null, puntosCalle: [], distanciaSugerida: 0, peso: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Descartar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAristaEditar.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '8px' }}>Modificar Peso de Via</h3>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '15px' }}>Establece la nueva carga metrica del enlace</p>
                        <input type="text" value={modalAristaEditar.peso} onChange={(e) => setModalAristaEditar({ ...modalAristaEditar, peso: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={confirmarEditarArista} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar</button>
                            <button onClick={() => setModalAristaEditar({ open: false, id: '', peso: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalDijkstra.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '320px', textAlign: 'center', boxShadow: '0 12px 35px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '20px', fontSize: '1.3rem' }}>Calcular Ruta {modalDijkstra.tipo === 'min' ? 'Minima' : 'Maxima'}</h3>

                        <div style={{ textAlign: 'left', fontSize: '0.85rem', fontWeight: 'bold', color: '#3f7095', marginBottom: '4px', paddingLeft: '5px' }}>Punto Inicial:</div>
                        <select value={dijOrigen} onChange={(e) => setDijOrigen(e.target.value)} style={{ width: '100%', padding: '11px', marginBottom: '15px', border: '1px solid #93B9D6', borderRadius: '10px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#213552', cursor: 'pointer' }}>
                            <option value="">-- Selecciona un pinchito --</option>
                            {nodos.map(n => <option key={n.id} value={n.nombre}>{n.nombre}</option>)}
                        </select>

                        <div style={{ textAlign: 'left', fontSize: '0.85rem', fontWeight: 'bold', color: '#3f7095', marginBottom: '4px', paddingLeft: '5px' }}>Punto Destino:</div>
                        <select value={dijDestino} onChange={(e) => setDijDestino(e.target.value)} style={{ width: '100%', padding: '11px', marginBottom: '25px', border: '1px solid #93B9D6', borderRadius: '10px', fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#213552', cursor: 'pointer' }}>
                            <option value="">-- Selecciona un pinchito --</option>
                            {nodos.map(n => <option key={n.id} value={n.nombre}>{n.nombre}</option>)}
                        </select>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => ejecutarDijkstra(modalDijkstra.tipo, true)} style={{ padding: '10px 22px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Procesar</button>
                            <button onClick={() => setModalDijkstra({ open: false, tipo: '' })} style={{ padding: '10px 22px', background: '#eef3f7', color: '#3f7095', border: '1px solid #93B9D6', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalExportar.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '15px' }}>Exportar Grafo</h3>
                        <div style={{ textAlign: 'left', fontSize: '0.85rem', fontWeight: 'bold', color: '#3f7095', marginBottom: '4px', paddingLeft: '5px' }}>Nombre del archivo:</div>
                        <input type="text" value={modalExportar.nombreArchivo} onChange={(e) => setModalExportar({ ...modalExportar, nombreArchivo: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={confirmarExportar} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Descargar</button>
                            <button onClick={() => setModalExportar({ open: false, nombreArchivo: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAyuda && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '90%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '25px', textAlign: 'center', fontSize: '1.4rem' }}>Manual de Usuario</h3>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Herramienta: Crear Pin</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Haz clic en cualquier lugar del mapa para crear un nuevo punto de red (surtidor).</span>
                        </div>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Herramienta: Trazar Via</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Haz clic en dos pines consecutivamente para unirlos. El sistema calculara la distancia real guiandose por las curvas de las calles de la ciudad.</span>
                        </div>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Herramienta: Editar Peso / Nombre</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Selecciona este modo y haz clic sobre un pin para cambiarle el nombre, o sobre la etiqueta de distancia de una via para modificar su peso manualmente.</span>
                        </div>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Herramienta: Eliminar Componentes</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Permite eliminar cualquier pin o via del mapa haciendo clic directo sobre ellos.</span>
                        </div>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#3f7095', display: 'block', marginBottom: '5px' }}>Accion: Distancia Minima / Maxima</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Selecciona un nodo de inicio y uno de destino. El sistema procesara la red vial y pintara de color rojo la ruta mas optima (o la mas larga) respetando el sentido de las flechas.</span>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <strong style={{ color: '#3f7095', display: 'block', marginBottom: '5px' }}>Accion: Explicar Algoritmo</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Muestra una animacion didactica que ilustra como la logica matematica analiza cada ruta y acumula las distancias progresivamente.</span>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setModalAyuda(false)} style={{ padding: '10px 30px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Manual</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Rutas;