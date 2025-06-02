// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import InputField from "../components/InputField";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../components/Spinner";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;
      // Guardar o actualizar usuario en Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,
        correo: user.email,
        nombre: user.displayName || "",
        fechaLogin: Timestamp.now(),
      });
      toast.success("Inicio de sesión exitoso");
      navigate("/transaccion", { state: { consejo: true } });
    } catch (error) {
      toast.error("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Guardar o actualizar usuario en Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,
        correo: user.email,
        nombre: user.displayName || "",
        fechaLogin: Timestamp.now(),
      });
      toast.success("Inicio de sesión con Google exitoso");
      navigate("/transaccion", { state: { consejo: true } });
    } catch (error) {
      toast.error("Error con Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <InputField
          label="Correo"
          type="email"
          name="correo"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="login-input"
        />
        <InputField
          label="Contraseña"
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
          className="login-input"
        />
        {loading ? <Spinner /> : (
          <>
            <button type="submit" className="login-btn">Iniciar sesión</button>
            <button type="button" className="login-btn google-btn" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 48 48" style={{marginRight:8,verticalAlign:'middle'}}>
                <g>
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.36 13.13 17.73 9.5 24 9.5z"/>
                  <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.01l7.2 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/>
                  <path fill="#FBBC05" d="M10.67 28.29A14.5 14.5 0 019.5 24c0-1.49.25-2.93.67-4.29l-7.98-6.2A23.93 23.93 0 000 24c0 3.77.9 7.34 2.69 10.48l7.98-6.19z"/>
                  <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.14-5.57l-7.2-5.6c-2.01 1.35-4.59 2.17-7.94 2.17-6.27 0-11.64-3.63-13.33-8.79l-7.98 6.19C6.71 42.18 14.82 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </g>
              </svg>
              Iniciar sesión con Google
            </button>
          </>
        )}
        <div className="registro-link">
          <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Login;
