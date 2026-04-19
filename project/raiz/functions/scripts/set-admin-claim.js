const admin = require("firebase-admin");

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
    admin.initializeApp();
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
