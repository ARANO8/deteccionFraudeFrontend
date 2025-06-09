// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import "./Dashboard.css";

const Dashboard = () => {
  const [alertas, setAlertas] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Escuchar el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let intervalId;
    const obtenerAlertas = async () => {
      try {
        // SIEMPRE obtener alertas desde Firestore primero
        const alertasRef = collection(db, "alertas");
        const snapshot = await getDocs(alertasRef);
        const todas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("[Dashboard] Total alertas en Firestore (IDs):", todas.map(a => a.id));
        const sinFecha = todas.filter(a => !a.fecha);
        if (sinFecha.length > 0) {
          console.warn(`[Dashboard] Alertas sin campo 'fecha':`, sinFecha.length, sinFecha.map(a => a.id));
        }
        const datos = todas.filter(alerta => user && alerta.usuarioId === user.uid);
        console.log("[Dashboard] Alertas del usuario (IDs):", datos.map(a => a.id));
        // Actualizar Redis con las alertas actuales
        if (datos.length > 0) {
          await fetch("http://localhost:5001/cache-alertas-redis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuarioId: user.uid, alertas: datos })
          });
        }
        setAlertas(datos);
      } catch (error) {
        console.error("Error obteniendo alertas:", error);
      }
    };
    obtenerAlertas();
    intervalId = setInterval(obtenerAlertas, 3000); // refresca cada 3 segundos
    return () => clearInterval(intervalId);
  }, [user]);

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
