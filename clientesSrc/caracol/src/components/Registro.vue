<template>
  <div class="registro">
    <form>
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
        <input
          v-model="datosRegistro.numeroTel"
          type="text"
          name="numeroTel"
        /><br /><br />
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

      <button @click.prevent="enviarRegistro">Enviar</button>
    </form>
  </div>
</template>

<script>
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
      camposObligatorios: ["nombres", "apellidos", "username", "password"],
    };
  },
  methods: {
    enviarRegistro() {
      let datosIntroducidos = new Object();
      if (!this.datosRegistro.username) {
        this.datosRegistro.username =
          this.datosRegistro.nombres.split(" ")[0] +
          this.datosRegistro.apellidos.split(" ")[0];
      }
      if (!this.datosRegistro.password) {
        this.datosRegistro.password =
          this.datosRegistro.nombres.split(" ")[0] +
          this.datosRegistro.apellidos.split(" ")[0];
      }

      for (let campo in this.datosRegistro) {
        if (!this.datosRegistro[campo]) {
          console.log(`campo ${campo} vacio`);
        } else {
          datosIntroducidos[campo] = this.datosRegistro[campo];
        }
      }

      this.camposObligatorios.forEach((campoObligatorio) => {
        if (!datosIntroducidos[campoObligatorio]) {
          console.log(`Faltaba el campo ${campoObligatorio}`);
          return;
        }
      });
      let dis = this;

      let errores = validarDatosUsuario(datosIntroducidos);
      if (errores.length < 1) {
        axios
          .post(this.serverUrl + "/api/usuarios/registro", {
            usuario: datosIntroducidos,
          })
          .then(function (respuesta) {
            console.log(`respuesta: ${JSON.stringify(respuesta.data)}`);
            if (respuesta.data.registro) {
              alert("Registro ok");
            }
            dis.vaciarCampos();
          })
          .catch(function (error) {
            console.log(`error: ${error}`);
          });
      } else {
        console.log(`Errores: ${errores}`);
      }
    },
    vaciarCampos() {
      console.log(`Vaciando campos`);
      this.datosRegistro = {
        nombres: null,
        apellidos: null,
        fechaNacimiento: null,
        email: null,
        numeroTel: null,
        lugarResidencia: null,
        username: null,
        password: null,
      };
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
input {
  padding: 5px;
}
</style>
