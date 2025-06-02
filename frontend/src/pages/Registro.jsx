import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, correo, contrasena);

      // Guardar datos adicionales en Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: cred.user.uid,
        correo,
        nombre,
        rol: "admin",
        fechaRegistro: new Date().toLocaleString(),
      });

      alert("Usuario registrado con éxito");
      navigate("/login");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };

  return (
    <form onSubmit={manejarRegistro}>
      <input type="text" placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} />
      <input type="email" placeholder="Correo" onChange={(e) => setCorreo(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={(e) => setContrasena(e.target.value)} />
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Registro;
