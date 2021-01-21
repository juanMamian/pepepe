const { google } = require("googleapis");
const scopes = ['https://www.googleapis.com/auth/drive'];
const credenciales = "" + process.env.CREDENCIALES_SERVICIO_GOOGLE_DRIVE;
const serviceAccount = JSON.parse(credenciales);

export var jwToken = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes, null);

export const drive = google.drive({
    version: "v3"
});