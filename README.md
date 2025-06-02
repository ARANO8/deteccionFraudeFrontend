# Detección de Fraude - Proyecto Fullstack

Este proyecto es una aplicación fullstack para la detección de fraude en transacciones, usando React, Firebase, Redis y Node.js (Express).

## Requisitos previos
- Node.js (v16+ recomendado)
- npm
- Redis instalado localmente
- Firebase CLI (opcional, para funciones)

---

## 1. Clonar el repositorio
```bash
# Clona el repositorio y entra a la carpeta
 git clone <URL_DEL_REPO>
 cd deteccion_fraude
```

---

## 2. Configurar y correr Redis localmente

### Iniciar el servidor Redis
```bash
redis-server
```

### (Opcional) Usar redis-cli para inspeccionar datos
```bash
redis-cli
```

---

## 3. Backend (Express + Redis)

### Instalar dependencias
```bash
cd backend
npm install
```

### Iniciar el servidor backend
```bash
node server.js
```
El backend escuchará en [http://localhost:5001](http://localhost:5001)

---

## 4. Frontend (React)

### Instalar dependencias
```bash
cd ../frontend
npm install
```

### Iniciar la app React
```bash
npm start
```
La app estará disponible en [http://localhost:3000](http://localhost:3000)

---

## 5. Firebase Functions (opcional, si usas Cloud Functions)

### Instalar dependencias
```bash
cd ../functions
npm install
```

### Desplegar o correr localmente las funciones
```bash
firebase emulators:start
# o para desplegar
firebase deploy --only functions
```

---

## Notas importantes
- Asegúrate de que Redis esté corriendo antes de iniciar el backend y el frontend.
- El frontend intentará obtener las alertas primero desde Redis (vía backend Express) y luego desde Firestore si Redis está vacío.
- Si tienes problemas de mayúsculas/minúsculas en imports, revisa que los nombres de archivos y las importaciones coincidan exactamente.

---

## Estructura de carpetas
```
deteccion_fraude/
├── backend/         # Servidor Express + Redis
├── frontend/        # React + Firebase
├── functions/       # (Opcional) Cloud Functions
└── ...
```

---

## Contacto
Para dudas o soporte, contacta al responsable del repositorio.
