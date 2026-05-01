const admin = require('firebase-admin');
const serviceAccount = require('../.secret.local.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];
if (!email) {
  console.error('ERROR: Por favor, proporciona un email como argumento.\nUso: npm run clear-admin -- TU_EMAIL@example.com');
  process.exit(1);
}

console.log(`Buscando usuario: ${email}...`);

admin.auth().getUserByEmail(email)
  .then(user => {
    if (!user.customClaims || !user.customClaims.admin) {
      console.log(`El usuario ${email} no tiene un claim de admin para revocar.`);
      process.exit(0);
    }
    console.log(`Revocando claim de admin al usuario ${user.uid}...`);
    return admin.auth().setCustomUserClaims(user.uid, null);
  })
  .then(() => {
    console.log(`\nÉXITO! Se revocaron los claims de ${email}.`);
    console.log('El usuario debe cerrar y volver a iniciar sesión para que el cambio tome efecto.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error procesando la solicitud:', error.message);
    process.exit(1);
  });