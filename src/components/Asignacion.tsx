import React, { useState, useRef } from 'react';
import Cabecera from './Cabecera';
import './Asignacion.css';
import html2canvas from 'html2canvas';

type DataMatriz = {
    nombresFilas: string[];
    nombresCols: string[];
    costos: number[][];
    ofertas: number[];
    demandas: number[];
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Asignacion = () => {
    const [filas, setFilas] = useState(3);
    const [cols, setCols] = useState(3);

    const [data, setData] = useState<DataMatriz>({
        nombresFilas: ['Origen 1', 'Origen 2', 'Origen 3'],
        nombresCols: ['Destino 1', 'Destino 2', 'Destino 3'],
        costos: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        ofertas: [10, 10, 10],
        demandas: [10, 10, 10]
    });

    const [solucionFinal, setSolucionFinal] = useState<any>(null);
    const [mensajeBalanceo, setMensajeBalanceo] = useState<string>('');
    const [historialPasoAPaso, setHistorialPasoAPaso] = useState<any[]>([]);

    const [modalAlerta, setModalAlerta] = useState({ open: false, titulo: '', msg: '' });
    const [modalAyuda, setModalAyuda] = useState(false);
    const [modalExport, setModalExport] = useState({ open: false, tipo: '', nombre: '' });

    const matrizRef = useRef<HTMLDivElement>(null);

    const actualizarDimensiones = () => {
        const newData = { ...data };

        while (newData.nombresFilas.length < filas) {
            newData.nombresFilas.push(`Origen ${newData.nombresFilas.length + 1}`);
            newData.costos.push(new Array(newData.nombresCols.length).fill(0));
            newData.ofertas.push(10);
        }
        newData.nombresFilas = newData.nombresFilas.slice(0, filas);
        newData.costos = newData.costos.slice(0, filas);
        newData.ofertas = newData.ofertas.slice(0, filas);

        while (newData.nombresCols.length < cols) {
            newData.nombresCols.push(`Destino ${newData.nombresCols.length + 1}`);
            newData.costos.forEach(row => row.push(0));
            newData.demandas.push(10);
        }
        newData.nombresCols = newData.nombresCols.slice(0, cols);
        newData.costos.forEach(row => { row.length = cols; });
        newData.demandas = newData.demandas.slice(0, cols);

        setData(newData);
        limpiarResultados();
    };

    const updateCell = (tipo: 'costo' | 'oferta' | 'demanda' | 'nomFila' | 'nomCol', r: number, c: number, val: string) => {
        const newData = { ...data };
        if (tipo === 'costo') newData.costos[r][c] = parseFloat(val) || 0;
        if (tipo === 'oferta') newData.ofertas[r] = parseFloat(val) || 0;
        if (tipo === 'demanda') newData.demandas[c] = parseFloat(val) || 0;
        if (tipo === 'nomFila') newData.nombresFilas[r] = val;
        if (tipo === 'nomCol') newData.nombresCols[c] = val;
        setData(newData);
    };

    const limpiarResultados = () => {
        setSolucionFinal(null);
        setMensajeBalanceo('');
        setHistorialPasoAPaso([]);
    };

    const vaciarMatriz = () => {
        const newData = { ...data };
        newData.costos = newData.costos.map(r => r.map(() => 0));
        newData.ofertas = newData.ofertas.map(() => 0);
        newData.demandas = newData.demandas.map(() => 0);
        setData(newData);
        limpiarResultados();
    };

    const balancearProblema = (datosOriginales: DataMatriz) => {
        let d = JSON.parse(JSON.stringify(datosOriginales));
        let sumO = d.ofertas.reduce((a: number, b: number) => a + b, 0);
        let sumD = d.demandas.reduce((a: number, b: number) => a + b, 0);
        let msg = "";

        if (Math.abs(sumO - sumD) < 0.01) return { datosObj: d, msg: "" };

        if (sumO > sumD) {
            let dif = sumO - sumD;
            d.nombresCols.push("Ficticio");
            d.demandas.push(dif);
            for (let i = 0; i < d.costos.length; i++) d.costos[i].push(0);
            msg = `Balanceo: Se agrego Destino Ficticio con Demanda de ${dif}.`;
        } else {
            let dif = sumD - sumO;
            d.nombresFilas.push("Ficticio");
            d.ofertas.push(dif);
            d.costos.push(new Array(d.demandas.length).fill(0));
            msg = `Balanceo: Se agrego Origen Ficticio con Oferta de ${dif}.`;
        }
        return { datosObj: d, msg };
    };

    const findCiclo = (basicas: any[], start: any) => {
        let nodos = [...basicas, start], path: any[] = [];
        function dfs(curr: any, isRow: boolean, goal: any): boolean {
            path.push(curr);
            if (path.length >= 4 && path.length % 2 === 0) {
                if (isRow && curr.r === goal.r) return true;
                if (!isRow && curr.c === goal.c) return true;
            }
            for (let n of nodos) {
                if (n.r === curr.r && n.c === curr.c) continue;
                if (path.some(p => p.r === n.r && p.c === n.c)) continue;
                if (isRow && n.r === curr.r) { if (dfs(n, false, goal)) return true; }
                else if (!isRow && n.c === curr.c) { if (dfs(n, true, goal)) return true; }
            }
            path.pop();
            return false;
        }
        return dfs(start, true, start) ? path : [];
    };

    const optimizarCompleto = (datos: DataMatriz, tipoObj: 'min' | 'max') => {
        let nF = datos.ofertas.length, nC = datos.demandas.length;
        let asig = Array.from({ length: nF }, () => Array(nC).fill(0));
        let of = [...datos.ofertas], dem = [...datos.demandas];
        let basicasPersistentes: any[] = [];

        let i = 0, j = 0;
        while (i < nF && j < nC) {
            let v = Math.min(of[i], dem[j]);
            asig[i][j] = v;
            basicasPersistentes.push({ r: i, c: j });
            of[i] -= v; dem[j] -= v;
            if (tipoObj === 'max' && of[i] === 0 && dem[j] === 0 && (i < nF - 1 || j < nC - 1)) i++;
            else if (of[i] === 0) i++;
            else j++;
        }

        let historial = [];
        let iter = 1;

        while (iter <= 30) {
            let u = Array(nF).fill(null), v = Array(nC).fill(null);
            let basicas = [];

            if (tipoObj === 'min') {
                for (let r = 0; r < nF; r++) for (let c = 0; c < nC; c++) if (asig[r][c] > 0) basicas.push({ r, c });
            } else {
                basicas = [...basicasPersistentes];
            }

            if (basicas.length === 0) break;

            let minC = Infinity;
            for (let b of basicas) if (datos.costos[b.r][b.c] < minC && datos.costos[b.r][b.c] !== 0) minC = datos.costos[b.r][b.c];
            u[basicas[0].r] = (minC === Infinity) ? 0 : minC;

            let l = 0;
            while ((u.includes(null) || v.includes(null)) && l < 100) {
                for (let b of basicas) {
                    if (u[b.r] !== null && v[b.c] === null) v[b.c] = datos.costos[b.r][b.c] - u[b.r];
                    else if (v[b.c] !== null && u[b.r] === null) u[b.r] = datos.costos[b.r][b.c] - v[b.c];
                }
                l++;
            }
            for (let k = 0; k < nF; k++) if (u[k] === null) u[k] = 0;
            for (let k = 0; k < nC; k++) if (v[k] === null) v[k] = 0;

            let mGen = Array.from({ length: nF }, () => Array(nC).fill(0));
            let mRes = Array.from({ length: nF }, () => Array(nC).fill(0));
            let mejorVal = tipoObj === 'min' ? -Infinity : Infinity;
            let celdaE: any = null;

            for (let r = 0; r < nF; r++) {
                for (let c = 0; c < nC; c++) {
                    mGen[r][c] = u[r] + v[c];
                    mRes[r][c] = mGen[r][c] - datos.costos[r][c];
                    if (!basicas.some(b => b.r === r && b.c === c)) {
                        if (tipoObj === 'min' && mRes[r][c] > mejorVal && mRes[r][c] > 0) { mejorVal = mRes[r][c]; celdaE = { r, c }; }
                        else if (tipoObj === 'max' && mRes[r][c] < mejorVal && mRes[r][c] < 0) { mejorVal = mRes[r][c]; celdaE = { r, c }; }
                    }
                }
            }

            let suma = 0, opStr = "";
            for (let r = 0; r < nF; r++) {
                for (let c = 0; c < nC; c++) {
                    if (asig[r][c] > 0) {
                        suma += asig[r][c] * datos.costos[r][c];
                        opStr += `(${asig[r][c]}×${datos.costos[r][c]}) + `;
                    }
                }
            }

            let paso: any = {
                iteracion: iter, asigActual: asig.map(r => [...r]), mGen, mRes, celdaE, u: [...u], v: [...v],
                costoTotal: suma, calculoTexto: opStr ? opStr.slice(0, -3) : "0"
            };

            if (!celdaE) { historial.push(paso); break; }

            let path = findCiclo(basicas, celdaE);
            if (path.length === 0) { historial.push(paso); break; }

            let omega = Infinity;
            let celdaSalida = null;
            for (let k = 1; k < path.length; k += 2) {
                if (asig[path[k].r][path[k].c] < omega) {
                    omega = asig[path[k].r][path[k].c];
                    celdaSalida = { r: path[k].r, c: path[k].c };
                }
            }

            if (omega === Infinity) { historial.push(paso); break; }

            paso.omegaVal = omega;
            paso.omegaPath = path;
            historial.push(paso);

            for (let k = 0; k < path.length; k++) {
                if (k % 2 === 0) asig[path[k].r][path[k].c] += omega;
                else asig[path[k].r][path[k].c] -= omega;
            }

            if (tipoObj === 'max') {
                basicasPersistentes.push(celdaE);
                if (celdaSalida) basicasPersistentes = basicasPersistentes.filter(b => !(b.r === celdaSalida?.r && b.c === celdaSalida?.c));
            }
            iter++;
        }
        return historial;
    };

    const ejecutarResolucion = (tipo: 'min' | 'max') => {
        limpiarResultados();
        const { datosObj, msg } = balancearProblema(data);

        if (msg) {
            setData(datosObj);
            setFilas(datosObj.ofertas.length);
            setCols(datosObj.demandas.length);
            setMensajeBalanceo(msg);
        }

        const h = optimizarCompleto(datosObj, tipo);
        const final = h[h.length - 1];
        setSolucionFinal(final);
    };

    const animarPasoAPaso = async (tipo: 'min' | 'max') => {
        limpiarResultados();
        const { datosObj, msg } = balancearProblema(data);
        if (msg) setMensajeBalanceo(msg);

        const h = optimizarCompleto(datosObj, tipo);
        let acumulado: any[] = [];

        for (let i = 0; i < h.length; i++) {
            acumulado.push(h[i]);
            setHistorialPasoAPaso([...acumulado]);
            await sleep(1500);
        }
    };

    const TablaBloque = ({ matriz, titulo, uArr, vArr, resaltado, path }: any) => (
        <div className="bloque-tabla">
            <h5>{titulo}</h5>
            <table>
                <tbody>
                    {matriz.map((row: any[], i: number) => (
                        <tr key={`r${i}`}>
                            {row.map((val, j) => {
                                let isResaltado = resaltado?.r === i && resaltado?.c === j;
                                let pathIndex = path?.findIndex((p: any) => p.r === i && p.c === j);
                                let inPath = pathIndex !== undefined && pathIndex !== -1;

                                let bColor = isResaltado ? '#d9825b' : (inPath ? '#fffbf9' : 'transparent');
                                let color = isResaltado ? 'white' : '#333';
                                let extraText = inPath ? (pathIndex % 2 === 0 ? " (+ω)" : " (-ω)") : "";
                                let border = inPath ? '2px solid #e8a16c' : '1px solid #f0f0f0';

                                return <td key={`c${j}`} style={{ background: bColor, color, border }}>{val}{extraText}</td>;
                            })}
                            {uArr && <td style={{ background: '#e8a16c', color: 'white', fontWeight: 'bold' }}>{uArr[i]}</td>}
                        </tr>
                    ))}
                    {vArr && (
                        <tr>
                            {vArr.map((v: number, i: number) => <td key={`v${i}`} style={{ background: '#e8a16c', color: 'white', fontWeight: 'bold' }}>{v}</td>)}
                            {uArr && <td style={{ background: 'transparent', border: 'none' }}></td>}
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const confirmarExportarJSON = (nombre: string) => {
        let exportData = JSON.parse(JSON.stringify(data));
        let idxF = exportData.nombresFilas.indexOf("Ficticio");
        if (idxF !== -1) { exportData.nombresFilas.splice(idxF, 1); exportData.ofertas.splice(idxF, 1); exportData.costos.splice(idxF, 1); }
        let idxC = exportData.nombresCols.indexOf("Ficticio");
        if (idxC !== -1) {
            exportData.nombresCols.splice(idxC, 1); exportData.demandas.splice(idxC, 1);
            exportData.costos.forEach((r: any) => r.splice(idxC, 1));
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = (nombre || "matriz_transporte") + ".json";
        a.click();
        setModalExport({ open: false, tipo: '', nombre: '' });
    };

    const confirmarExportarPNG = async (nombre: string) => {
        if (matrizRef.current) {
            const canvas = await html2canvas(matrizRef.current);
            const a = document.createElement('a');
            a.href = canvas.toDataURL();
            a.download = (nombre || "matriz_transporte") + ".png";
            a.click();
        }
        setModalExport({ open: false, tipo: '', nombre: '' });
    };

    const importarJSON = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const d = JSON.parse(event.target?.result as string);
                if (d.nombresFilas && d.costos) {
                    setData(d);
                    setFilas(d.nombresFilas.length);
                    setCols(d.nombresCols.length);
                    limpiarResultados();
                }
            } catch (err) {
                setModalAlerta({ open: true, titulo: 'Formato Invalido', msg: 'El archivo JSON esta corrupto o no corresponde a esta herramienta.' });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const ActionButton = ({ text, onClick, primary = false, style = {} }: any) => (
        <button onClick={onClick} style={{
            padding: '10px 20px', backgroundColor: primary ? '#3f7095' : '#ffffff', color: primary ? '#ffffff' : '#3f7095',
            border: primary ? 'none' : '1px solid #93B9D6', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s', ...style
        }}>{text}</button>
    );

    return (
        <div className="asignacion-container">
            <Cabecera />

            <div className="asignacion-content">

                <h1 style={{ color: '#3f7095', fontSize: '2.8rem', marginBottom: '5px' }}>Metodo de Transporte</h1>
                <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '30px' }}>Algoritmo de Esquina Noroeste y Salto de Piedra</p>

                <div className="nw-controls">
                    <label>Filas: <input type="number" min="1" value={filas} onChange={e => setFilas(parseInt(e.target.value) || 1)} /></label>
                    <label>Columnas: <input type="number" min="1" value={cols} onChange={e => setCols(parseInt(e.target.value) || 1)} /></label>
                    <ActionButton text="Ajustar Tamaño" primary={true} onClick={actualizarDimensiones} style={{ marginLeft: '10px' }} />
                </div>

                <div className="nw-matriz-wrapper" ref={matrizRef}>
                    <table className="tabla-matriz">
                        <thead>
                            <tr>
                                <th className="bg-destino" style={{ background: '#ffffff', border: 'none' }}>Nodos</th>
                                {data.nombresCols.map((c, j) => (
                                    <th key={j} className="bg-destino">
                                        <input value={c} onChange={e => updateCell('nomCol', 0, j, e.target.value)} />
                                    </th>
                                ))}
                                <th className="bg-oferta-header">Oferta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.nombresFilas.map((f, i) => (
                                <tr key={i}>
                                    <th className="bg-origen">
                                        <input value={f} onChange={e => updateCell('nomFila', i, 0, e.target.value)} />
                                    </th>
                                    {data.nombresCols.map((_, j) => {
                                        let valAsig = solucionFinal?.asigActual[i]?.[j];
                                        let isSolucion = valAsig !== undefined && valAsig > 0;

                                        return (
                                            <td key={j} className={`cell-costo ${isSolucion ? 'cell-solucion' : ''}`}>
                                                <input
                                                    type="number"
                                                    value={isSolucion ? valAsig : data.costos[i][j]}
                                                    onChange={e => updateCell('costo', i, j, e.target.value)}
                                                    disabled={isSolucion}
                                                    style={{ color: isSolucion ? 'white' : 'inherit', fontWeight: isSolucion ? 'bold' : 'normal' }}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="bg-oferta-cell">
                                        <input type="number" value={data.ofertas[i]} onChange={e => updateCell('oferta', i, 0, e.target.value)} style={{ color: 'inherit', fontWeight: 'bold' }} />
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <th className="bg-demanda-header">Demanda</th>
                                {data.demandas.map((d, j) => (
                                    <td key={j} className="bg-demanda-cell">
                                        <input type="number" value={d} onChange={e => updateCell('demanda', 0, j, e.target.value)} style={{ color: 'inherit', fontWeight: 'bold' }} />
                                    </td>
                                ))}
                                <td className="bg-neutro">-</td>
                            </tr>
                        </tbody>
                    </table>

                    {solucionFinal && (
                        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.2rem', color: '#d9825b', fontWeight: 'bold' }}>
                            Solucion Optima: {solucionFinal.costoTotal}
                        </div>
                    )}
                    {mensajeBalanceo && (
                        <div style={{ textAlign: 'center', marginTop: '10px', color: '#ed6a5a', fontWeight: 'bold' }}>
                            ⚠ {mensajeBalanceo}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <ActionButton text="Limpiar Resultados" onClick={limpiarResultados} />
                    <ActionButton text="Vaciar Ceros" onClick={vaciarMatriz} />

                    <div style={{ margin: '0 10px', borderLeft: '2px solid #eef3f7' }}></div>

                    <ActionButton text="Minimizar" primary={true} onClick={() => ejecutarResolucion('min')} />
                    <ActionButton text="Maximizar" primary={true} onClick={() => ejecutarResolucion('max')} />
                    <ActionButton text="Animar Paso a Paso" onClick={() => animarPasoAPaso('min')} style={{ backgroundColor: '#2a9d8f', color: 'white', border: 'none' }} />

                    <div style={{ margin: '0 10px', borderLeft: '2px solid #eef3f7' }}></div>

                    <div>
                        <input type="file" accept=".json" id="file-import-json" style={{ display: 'none' }} onChange={importarJSON} />
                        <ActionButton text="Importar JSON" onClick={() => document.getElementById('file-import-json')?.click()} />
                    </div>
                    <ActionButton text="Exportar JSON" onClick={() => setModalExport({ open: true, tipo: 'json', nombre: 'matriz' })} />
                    <ActionButton text="Exportar PNG" onClick={() => setModalExport({ open: true, tipo: 'png', nombre: 'matriz' })} />
                    <ActionButton text="Ayuda" onClick={() => setModalAyuda(true)} style={{ backgroundColor: '#666', color: 'white', border: 'none' }} />
                </div>

                {historialPasoAPaso.length > 0 && (
                    <div style={{ marginTop: '50px', width: '100%' }}>
                        <h2 style={{ textAlign: 'center', color: '#d9825b', marginBottom: '30px' }}>Explicacion de la solucion</h2>
                        {historialPasoAPaso.map((paso, index) => (
                            <div key={index} className="paso-card">
                                <h3 style={{ color: '#3f7095', marginBottom: '20px' }}>Iteracion {paso.iteracion}</h3>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
                                    <TablaBloque matriz={paso.asigActual} titulo="Asignacion Actual" />
                                    <div style={{ fontSize: '24px', color: '#d9825b' }}>➔</div>
                                    <TablaBloque matriz={paso.mGen} titulo="Matriz (U+V)" uArr={paso.u} vArr={paso.v} />
                                    <div style={{ fontSize: '24px', color: '#d9825b' }}>-</div>
                                    <TablaBloque matriz={data.costos} titulo="Original" />
                                    <div style={{ fontSize: '24px', color: '#d9825b' }}>=</div>
                                    <TablaBloque matriz={paso.mRes} titulo="Resta (Indices)" resaltado={paso.celdaE} />
                                </div>

                                {paso.celdaE && paso.omegaPath && (
                                    <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#fffbf9', borderLeft: '4px solid #e8a16c', borderRadius: '8px' }}>
                                        <p style={{ fontWeight: 'bold', margin: '0 0 15px 0' }}>Fase Omega (ω)</p>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            <TablaBloque matriz={paso.asigActual} titulo="Camino Cerrado" path={paso.omegaPath} />
                                            <div>
                                                <p>Valor critico (ω): <strong>{paso.omegaVal}</strong></p>
                                                <p style={{ fontSize: '0.9rem', color: '#666' }}>Se suma o resta este valor a los vertices del camino para optimizar la matriz.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eef3f7', borderRadius: '8px', fontFamily: 'monospace' }}>
                                    <strong>Calculo del Costo de esta iteracion: </strong><br />
                                    {paso.calculoTexto} = <span style={{ color: '#d9825b', fontSize: '1.2rem', fontWeight: 'bold' }}>{paso.costoTotal}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {modalExport.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '300px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '15px' }}>Exportar {modalExport.tipo.toUpperCase()}</h3>
                        <input type="text" value={modalExport.nombre} onChange={(e) => setModalExport({ ...modalExport, nombre: e.target.value })} style={{ width: '90%', padding: '10px', marginBottom: '20px', border: '1px solid #93B9D6', borderRadius: '10px', outline: 'none', textAlign: 'center', fontFamily: 'inherit' }} />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => modalExport.tipo === 'json' ? confirmarExportarJSON(modalExport.nombre) : confirmarExportarPNG(modalExport.nombre)} style={{ padding: '8px 20px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Descargar</button>
                            <button onClick={() => setModalExport({ open: false, tipo: '', nombre: '' })} style={{ padding: '8px 20px', background: '#eef3f7', color: '#3f7095', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAyuda && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '90%', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ color: '#3f7095', marginBottom: '25px', textAlign: 'center', fontSize: '1.4rem' }}>Manual de Usuario</h3>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Editar Matriz</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Escribe directamente sobre cualquier celda de costo, origen, destino, oferta o demanda.</span>
                        </div>

                        <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #eef3f7' }}>
                            <strong style={{ color: '#2a9d8f', display: 'block', marginBottom: '5px' }}>Minimizar / Maximizar</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Aplica el metodo instantaneamente para mostrar la distribucion optima de recursos en las celdas naranjas.</span>
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <strong style={{ color: '#3f7095', display: 'block', marginBottom: '5px' }}>Animar Paso a Paso</strong>
                            <span style={{ color: '#555', fontSize: '0.95rem' }}>Desglosa las iteraciones matematicas generando tablas visuales con los indices U, V, el salto de piedra y la fase Omega.</span>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => setModalAyuda(false)} style={{ padding: '10px 30px', background: '#3f7095', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>Entendido</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAlerta.open && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', width: '320px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ color: '#ed6a5a', marginBottom: '12px', fontSize: '1.25rem' }}>{modalAlerta.titulo}</h3>
                        <p style={{ color: '#213552', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.4' }}>{modalAlerta.msg}</p>
                        <button onClick={() => setModalAlerta({ open: false, titulo: '', msg: '' })} style={{ padding: '8px 25px', background: '#ed6a5a', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>Entendido</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Asignacion;