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
    throw new Error("Falta --email. Ejemplo: npm run clear-admin-claim -- --email tu-correo@dominio.com");
  }

  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const userRecord = await admin.auth().getUserByEmail(email);
  const currentClaims = { ...(userRecord.customClaims || {}) };

  delete currentClaims.admin;

  await admin.auth().setCustomUserClaims(userRecord.uid, currentClaims);

  console.log(`OK: claim admin removido para ${email} (uid: ${userRecord.uid})`);
}

run().catch((error) => {
  console.error("Error removiendo claim admin:", error.message || error);
  process.exitCode = 1;
});
