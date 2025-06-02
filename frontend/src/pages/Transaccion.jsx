import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./Transaccion.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../components/Spinner";
import InputField from "../components/InputField";

const Transaccion = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [monto, setMonto] = useState("");
  const [ip, setIp] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [dispositivo, setDispositivo] = useState("");
  const [ubicacionLatLong, setUbicacionLatLong] = useState("");
  const [simulada, setSimulada] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchNombreUsuario = async () => {
      if (auth.currentUser) {
        // Buscar el usuario en la colección usuarios por UID
        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const usuarioDoc = usuariosSnap.docs.find(doc => doc.data().uid === auth.currentUser.uid);
        if (usuarioDoc) {
          setNombreUsuario(usuarioDoc.data().nombre || "");
        } else {
          setNombreUsuario("");
        }
      }
    };
    fetchNombreUsuario();
  }, []);

  useEffect(() => {
    if (location.state && location.state.consejo) {
      toast.info("Verifica que el monto no supere el umbral de riesgo ni repitas transacciones en muy poco tiempo.", {
        position: "top-center",
        autoClose: 6000,
        toastId: "consejo-prioridad"
      });
    }
  }, [location.state]);

  const enviar = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Validar coordenadas
    const partes = ubicacionLatLong.trim().split(",");
    if (
      partes.length !== 2 ||
      isNaN(parseFloat(partes[0])) ||
      isNaN(parseFloat(partes[1]))
    ) {
      toast.error("⚠️ Coordenadas inválidas. Usa el formato: latitud,longitud (ej: -16.5,-68.15)");
      setLoading(false);
      return;
    }
    // Validar campos obligatorios
    if (!nombreUsuario || !monto || !ip || !ubicacion || !dispositivo) {
      toast.error("⚠️ Por favor completa todos los campos antes de registrar.");
      setLoading(false);
      return;
    }
    // Validar monto positivo
    if (Number(monto) <= 0) {
      toast.error("El monto debe ser un número positivo.");
      setLoading(false);
      return;
    }
    // Validar que usuarioId exista en la colección de usuarios
    try {
      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      const existeUsuario = usuariosSnap.docs.some(doc => doc.data().uid === auth.currentUser.uid);
      if (!existeUsuario) {
        toast.error("El usuarioId no existe en la base de datos.");
        setLoading(false);
        return;
      }
      const fecha = Timestamp.now();
      const nuevaTransaccion = {
        usuarioId: auth.currentUser ? auth.currentUser.uid : "",
        nombreUsuario,
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
      const transRef = await addDoc(collection(db, "transacciones"), nuevaTransaccion);
      // Esperar a que la función cloud procese la transacción y cree la alerta si corresponde
      setTimeout(async () => {
        // Buscar si se generó una alerta para esta transacción
        const alertasSnap = await getDocs(collection(db, "alertas"));
        // Buscar alerta asociada a este transaccionId (el id de la transacción creada)
        const alerta = alertasSnap.docs.find(doc => {
          const data = doc.data();
          return data.transaccionId === transRef.id;
        });
        if (alerta) {
          toast.error("Transacción Incorrecta\nConsulte el dashboard para más detalles", {
            position: "top-center",
            autoClose: 6000,
            style: { fontSize: "1.2rem", textAlign: "center", whiteSpace: "pre-line" }
          });
        } else {
          toast.success("Transacción correcta.", {
            position: "top-center",
            autoClose: 4000,
            style: { fontSize: "1.2rem", textAlign: "center" }
          });
        }
        // Limpiar campos del formulario
        setMonto("");
        setIp("");
        setUbicacion("");
        setDispositivo("");
        setUbicacionLatLong("");
        setSimulada(false);
      }, 2000); // Aumenta el tiempo de espera para asegurar que la función cloud termine
    } catch (error) {
      toast.error("❌ Error al guardar transacción: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trans-wrapper">
      <div className="trans-form">
        <h2>Registrar Transacción</h2>
        <button
          type="button"
          className="dashboard-btn"
          style={{ marginBottom: '1rem', background: '#3f87a6', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          Ir al Dashboard
        </button>
        <form onSubmit={enviar}>
          <InputField label="Nombre de usuario" type="text" name="nombreUsuario" placeholder="Nombre de usuario" value={nombreUsuario} readOnly required className="login-input" />
          <InputField label="Dispositivo" type="text" name="dispositivo" placeholder="Dispositivo" value={dispositivo} onChange={(e) => setDispositivo(e.target.value)} required />
          <InputField label="Monto" type="number" name="monto" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} required />
          <InputField label="IP" type="text" name="ip" placeholder="IP" value={ip} onChange={(e) => setIp(e.target.value)} required />
          <InputField label="Ubicación (ciudad)" type="text" name="ubicacion" placeholder="Ubicación (ciudad)" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} required />
          <InputField label="Latitud,Longitud (ej: -16.5,-68.15)" type="text" name="ubicacionLatLong" placeholder="Latitud,Longitud (ej: -16.5,-68.15)" value={ubicacionLatLong} onChange={(e) => setUbicacionLatLong(e.target.value)} required />
          <label className="checkbox">
            <input type="checkbox" checked={simulada} onChange={(e) => setSimulada(e.target.checked)} />
            &nbsp;Transacción simulada
          </label>
          {loading ? <Spinner /> : <button type="submit">Registrar</button>}
        </form>
        <ToastContainer position="top-center" autoClose={3000} />
      </div>
      {/* <div className="trans-info">
        <h3>Consejo</h3>
        <p>Verifica que el monto no supere el umbral de riesgo ni repitas transacciones en muy poco tiempo.</p>
      </div> */}
    </div>
  );
};

export default Transaccion;
