const admin = require("firebase-admin");

function loadServiceAccountCredentials() {
  const rawCredentials =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ||
    process.env.VERTEX_SERVICE_ACCOUNT_JSON;

  if (!rawCredentials) {
    return null;
  }

  try {
    const credentials = JSON.parse(rawCredentials);

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("El JSON no contiene client_email/private_key.");
    }

    return admin.credential.cert(credentials);
  } catch (error) {
    throw new Error(
      "La variable FIREBASE_SERVICE_ACCOUNT_JSON, GOOGLE_APPLICATION_CREDENTIALS_JSON o VERTEX_SERVICE_ACCOUNT_JSON no contiene un service account JSON valido.",
    );
  }
}

function getArg(flag) {
  const flagIndex = process.argv.indexOf(flag);
  if (flagIndex < 0) {
    return "";
  }

  return String(process.argv[flagIndex + 1] || "").trim();
}

async function run() {
  const email = getArg("--email");

  if (!email) {
    throw new Error("Falta --email. Ejemplo: npm run set-admin-claim -- --email tu-correo@dominio.com");
  }

  if (!admin.apps.length) {
    const credential = loadServiceAccountCredentials();

    admin.initializeApp(
      credential
        ? {
            credential,
          }
        : {
            projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "life--plants-app",
          },
    );
  }

  const userRecord = await admin.auth().getUserByEmail(email);
  const currentClaims = userRecord.customClaims || {};

  await admin.auth().setCustomUserClaims(userRecord.uid, {
    ...currentClaims,
    admin: true,
  });

  console.log(`OK: claim admin=true asignado a ${email} (uid: ${userRecord.uid})`);
  console.log("Nota: el usuario debe cerrar y abrir sesion para refrescar token.");
}

run().catch((error) => {
  console.error("Error asignando claim admin:", error.message || error);
  process.exitCode = 1;
});
