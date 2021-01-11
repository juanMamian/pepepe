<template>
  <div class="registro">
    <div id="zonaDatosPersonales">
      <h3>Información Personal</h3>
      <input
        v-model="datosRegistro.nombres"
        type="text"
        name="nombres"
        placeholder="Nombres"
      /><br />
      <input
        v-model="datosRegistro.apellidos"
        type="text"
        name="apellidos"
        placeholder="Apellidos"
      /><br /><br />
      <label for="fechaNacimiento">Fecha de nacimiento</label><br />
      <input
        v-model="datosRegistro.fechaNacimiento"
        type="date"
        name="fechaNacimiento"
      /><br />
    </div>

    <div id="zonaContacto">
      <h3>Datos de contacto</h3>
      <input
        v-model="datosRegistro.email"
        type="email"
        placeholder="Correo electrónico"
      /><br /><br />
      <label for="numeroTel">Número telefónico</label><br />
      <input v-model="datosRegistro.numeroTel" type="text" name="numeroTel" /><br /><br />
      <label for="lugarResidencia">Lugar de residencia</label><br />
      <input
        v-model="datosRegistro.lugarResidencia"
        type="text"
        placeholder="Lugar de residencia"
      />
    </div>

    <div id="zonaLogin">
      <h3>Datos de login</h3>
      <input
        type="text"
        placeholder="nombre de usuario"
        name="username"
        v-model="datosRegistro.username"
      /><br />
      <input
        type="password"
        placeholder="password"
        name="password"
        v-model="datosRegistro.password"
      /><br />
    </div>

    <button @click="enviarRegistro">Enviar</button>
  </div>
</template>

<script>
var charProhibidos = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
var charProhibidosNombre = /[^ a-zA-ZÀ-ž]/g;
var charProhibidosNumeroTel = /[^0-9+-]/g;
var emailChars = /\S+@\S+\.\S+/;
var dateChars = /[12][90][0-9][0-9]-[01][0-9]-[0-3][0-9]/;
import axios from "axios";
import { validarDatosUsuario } from "./utilidades/validacionDatosUsuario";

export default {
  name: "Registro",
  data() {
    return {
      datosRegistro: {
        nombres: null,
        apellidos: null,
        fechaNacimiento: null,
        email: null,
        numeroTel: null,
        lugarResidencia: null,
        username: null,
        password: null,
      },
    }
  },
  methods: {
    enviarRegistro() {
      let dis = this;
      let errores = validarDatosUsuario(this.datosRegistro);
      if (errores.length<1) {
        axios
          .post(this.serverUrl + "/api/usuarios/registro", {
            usuario: this.datosRegistro,
          })
          .then(function (respuesta) {
            console.log(`respuesta: ${JSON.stringify(respuesta.data)}`);
            if (respuesta.data.registro) {
              console.log(`Registro ok`);
              dis.$router.push("/login");
            }
          })
          .catch(function (error) {
            console.log(`error: ${error}`);
          });
      }
      else{
        console.log(`Errores: ${errores}`);
      }
    },
    validarDatos() {
      var errores = 0;

      this.nombres = this.nombres.trim();
      this.apellidos = this.apellidos.trim();
      this.fechaNacimiento = this.fechaNacimiento.trim();
      this.email = this.email.trim();
      this.numeroTel = this.numeroTel.trim();
      this.lugarResidencia = this.lugarResidencia.trim();

      if (this.nombres.length < 2) {
        this.alertar("Tu nombre es muy corto");
        errores++;
      }
      if (charProhibidosNombre.test(this.nombres)) {
        this.alertar("Tu nombre contiene caracteres no permitidos");
        errores++;
      }
      if (this.apellidos.length < 2) {
        this.alertar("Tu apellido es muy corto");
        errores++;
      }
      if (charProhibidosNombre.test(this.apellidos)) {
        this.alertar("Tu apellido contiene caracteres no permitidos");
        errores++;
      }

      if (!dateChars.test(this.fechaNacimiento)) {
        this.alertar("Tu fecha de nacimiento es incorrecta");
        errores++;
      }

      if (this.email.length > 0 && !emailChars.test(this.email)) {
        this.alertar("Tu e-mail no es válido");
        errores++;
      }

      if (charProhibidosNumeroTel.test(this.numeroTel)) {
        this.alertar("Tu número telefónico no es válido");
        errores++;
      }

      if (this.lugarResidencia.length < 2) {
        this.alertar("Tu lugar de residencia es muy corto");
        errores++;
      }
      if (charProhibidos.test(this.lugarResidencia)) {
        this.alertar(
          "Tu lugar de residencia contiene caracteres no permitidos"
        );
        errores++;
      }
      if (this.username.length < 4) {
        this.alertar("Tu nombre de usuario es muy corto");
        errores++;
      }
      if (charProhibidos.test(this.username)) {
        this.alertar("Tu nombre de usuario contiene caracteres no permitidos");
        errores++;
      }
      if (this.password.length < 6 || this.password.length > 32) {
        this.alertar("Tu contraseña debe contener entre 6 y 32 caracteres");
        errores++;
      }

      if (errores > 0) {
        return false;
      }
      return true;
    },
    alertar(msj) {
      console.log(msj);
    },
  },
};
</script>

<style scoped>
.registro {
  padding-left: 15%;
  padding-top: 5%;
}
</style>