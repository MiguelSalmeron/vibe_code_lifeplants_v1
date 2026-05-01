const admin = require('firebase-admin');
// Asumimos que el script se corre desde el directorio 'functions'
// y que el service account está en 'functions/.secret.local.json'
const serviceAccount = require('../.secret.local.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.argv[2];
if (!email) {
  console.error('ERROR: Por favor, proporciona un email como argumento.\nUso: npm run set-admin -- TU_EMAIL@example.com');
  process.exit(1);
}

console.log(`Buscando usuario: ${email}...`);

admin.auth().getUserByEmail(email)
  .then(user => {
    if (user.customClaims && user.customClaims.admin === true) {
      console.log(`El usuario ${email} ya tiene el claim de admin.`);
      process.exit(0);
    }
    console.log(`Asignando claim admin:true al usuario ${user.uid}...`);
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`\nÉXITO! Se asignó el claim admin:true a ${email}.`);
    console.log('El usuario debe cerrar y volver a iniciar sesión para que el cambio tome efecto.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error procesando la solicitud:', error.message);
    process.exit(1);
  });