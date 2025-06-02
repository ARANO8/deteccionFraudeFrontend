import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Transaccion.css";

const Transaccion = () => {
  const [usuarioId, setUsuarioId] = useState("");
  const [monto, setMonto] = useState("");
  const [ip, setIp] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [dispositivo, setDispositivo] = useState("");
  const [ubicacionLatLong, setUbicacionLatLong] = useState("");
  const [simulada, setSimulada] = useState(false);
  const navigate = useNavigate();

  const enviar = async (e) => {
    e.preventDefault();

    // Validar coordenadas
    const partes = ubicacionLatLong.trim().split(",");
    if (
      partes.length !== 2 ||
      isNaN(parseFloat(partes[0])) ||
      isNaN(parseFloat(partes[1]))
    ) {
      alert("⚠️ Coordenadas inválidas. Usa el formato: latitud,longitud (ej: -16.5,-68.15)");
      return;
    }

    // Validar campos obligatorios
    if (!usuarioId || !monto || !ip || !ubicacion || !dispositivo) {
      alert("⚠️ Por favor completa todos los campos antes de registrar.");
      return;
    }

    const fecha = new Date();
    const nuevaTransaccion = {
      usuarioId,
      monto: Number(monto),
      ip,
      ubicacion,
      dispositivo,
      simulada,
      ubicacionLatLong: {
        lat: parseFloat(partes[0]),
        lon: parseFloat(partes[1])
      },
      fecha: fecha
    };

    try {
      await addDoc(collection(db, "transacciones"), nuevaTransaccion);
      alert("✅ Transacción registrada correctamente");
      navigate("/dashboard");
    } catch (error) {
      alert("❌ Error al guardar transacción: " + error.message);
    }
  };

  return (
    <div className="trans-wrapper">
      <div className="trans-form">
        <h2>Registrar Transacción</h2>
        <form onSubmit={enviar}>
          <input type="text" placeholder="Usuario ID" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} />
          <input type="text" placeholder="Dispositivo" value={dispositivo} onChange={(e) => setDispositivo(e.target.value)} />
          <input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <input type="text" placeholder="IP" value={ip} onChange={(e) => setIp(e.target.value)} />
          <input type="text" placeholder="Ubicación (ciudad)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
          <input type="text" placeholder="Latitud,Longitud (ej: -16.5,-68.15)" value={ubicacionLatLong} onChange={(e) => setUbicacionLatLong(e.target.value)} />
          <label className="checkbox">
            <input type="checkbox" checked={simulada} onChange={(e) => setSimulada(e.target.checked)} />
            &nbsp;Transacción simulada
          </label>
          <button type="submit">Registrar</button>
        </form>
      </div>
      <div className="trans-info">
        <h3>Consejo</h3>
        <p>Verifica que el monto no supere el umbral de riesgo ni repitas transacciones en muy poco tiempo.</p>
      </div>
    </div>
  );
};

export default Transaccion;
