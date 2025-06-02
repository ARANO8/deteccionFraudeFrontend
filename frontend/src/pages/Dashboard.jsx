// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const obtenerAlertas = async () => {
      try {
        const user = auth.currentUser;
        let datos = [];
        let fromRedis = false;
        // Intentar obtener alertas desde Redis vía endpoint local
        try {
          const res = await fetch(`http://localhost:5001/alertas-redis/${user.uid}`);
          if (res.ok) {
            datos = await res.json();
            if (Array.isArray(datos) && datos.length > 0) {
              fromRedis = true;
            }
          }
        } catch (e) { /* ignorar */ }
        // Si no hay datos en Redis, obtener de Firestore y cachear en Redis
        if (!fromRedis) {
          const snapshot = await getDocs(collection(db, "alertas"));
          datos = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(alerta => user && alerta.usuarioId === user.uid);
          // Cachear en Redis vía endpoint local
          if (datos.length > 0) {
            await fetch("http://localhost:5001/cache-alertas-redis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ usuarioId: user.uid, alertas: datos })
            });
          }
        }
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
      <div className="alertas-scroll">
        {alertas.length === 0 ? (
          <p>No se han generado alertas.</p>
        ) : (
          alertas.map((alerta, index) => {
            const nivelClass = alerta.nivelRiesgo === "alto"
              ? "rojo"
              : alerta.nivelRiesgo === "medio"
              ? "amarillo"
              : "verde";
            return (
              <div key={index} className={nivelClass}>
                <p><strong>Transacción:</strong> {alerta.transaccionId}</p>
                <p><strong>Usuario:</strong> {alerta.usuarioId}</p>
                <p><strong>Tipo:</strong> {alerta.tipoFraude}</p>
                <p><strong>Nivel:</strong> {alerta.nivelRiesgo}</p>
                <p><strong>Estado:</strong> {alerta.estado}</p>
                <p><strong>Fecha:</strong> {new Date(alerta.fecha?.toDate?.() || alerta.fecha).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>
      <div className="btn-centro">
        <Link to="/transaccion">
          <button className="btn-volver">Volver al registro</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
