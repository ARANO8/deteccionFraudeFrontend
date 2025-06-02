// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const obtenerAlertas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "alertas"));
        const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlertas(datos);
      } catch (error) {
        console.error("Error obteniendo alertas:", error);
      }
    };
    obtenerAlertas();
  }, []);

  return (
    <div className="dash-container">
      <h2>Alertas de Posible Fraude</h2>
      {alertas.length === 0 ? (
        <p>No se han generado alertas.</p>
      ) : (
        alertas.map((alerta, index) => (
          <div
            key={index}
            className={
              alerta.nivelRiesgo === "alto"
                ? "alerta-roja"
                : alerta.nivelRiesgo === "medio"
                ? "alerta-amarilla"
                : "alerta-verde"
            }
          >
            <p><strong>Transacción:</strong> {alerta.transaccionId}</p>
            <p><strong>Usuario:</strong> {alerta.usuarioId}</p>
            <p><strong>Tipo:</strong> {alerta.tipoFraude}</p>
            <p><strong>Nivel:</strong> {alerta.nivelRiesgo}</p>
            <p><strong>Estado:</strong> {alerta.estado}</p>
            <p><strong>Fecha:</strong> {new Date(alerta.fecha?.toDate?.() || alerta.fecha).toLocaleString()}</p>
          </div>
        ))
      )}
      <div className="btn-centro">
        <Link to="/transaccion">
          <button className="btn-volver">Volver al registro</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
