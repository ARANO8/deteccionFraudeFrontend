// Cloud Function para cachear alertas en Redis al crear una alerta en Firestore
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { cacheAlerta } = require("./index");

exports.onAlertaCreate = functions.firestore
  .document("alertas/{alertaId}")
  .onCreate(async (snap, context) => {
    const alerta = snap.data();
    await cacheAlerta({ ...alerta, alertaId: context.params.alertaId });
  });
