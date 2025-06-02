import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../components/Spinner";
import InputField from "../components/InputField";

const Registro = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, correo, contrasena);

      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: cred.user.uid,
        correo,
        nombre,
        rol: "admin",
        fechaRegistro: Timestamp.now(),
      });

      toast.success("Usuario registrado con éxito");
      navigate("/login");
    } catch (error) {
      toast.error("Error al registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={manejarRegistro}>
        <InputField
          label="Nombre"
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <InputField
          label="Correo"
          type="email"
          name="correo"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <InputField
          label="Contraseña"
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        {loading ? <Spinner /> : <button type="submit">Registrarse</button>}
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default Registro;
