<template>
  <div id="loginArea">
    <div id="paraElLogeado" v-if="usuarioConectado">
      <div id="nombreUsuario">{{ nombreUsuario }}</div>
      <button @click="deslogearse">Deslogearse</button>
    </div>
    <div id="paraElDeslogeado" v-else>
      <input
        type="text"
        name="username"
        :style="colorUsername"
        v-model="username"
        placeholder="Nombre de usuario"
      />
      <input
        type="password"
        name="password"
        :style="colorPassword"
        v-model="password"
        placeholder="password"
        @keypress.enter="iniciarSesion"
      />
      <button @click.stop="iniciarSesion">Conectarse</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

var charProhibidosUsername = /[^a-zA-Z0-9_]/g;
var charProhibidosPassword = /[^a-zA-Z0-9*@_-]/g;
const minPassword = 6;
const minUsername = 4;

export default {
  name: "LoginArea",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  computed: {
    usuarioConectado() {
      return this.$store.state.usuario.username != null ? true : false;
    },
    nombreUsuario() {
      return this.$store.state.usuario.username;
    },
    colorUsername() {
      return {
        color:
          charProhibidosUsername.test(this.username) ||
          this.username.length < minUsername
            ? "red"
            : "black",
      };
    },
    colorPassword() {
      return {
        color:
          charProhibidosPassword.test(this.password) ||
          this.password.length < minPassword
            ? "red"
            : "black",
      };
    },
  },
  methods: {
    iniciarSesion: function () {
      //Validacion de caracteres
      if (
        charProhibidosUsername.test(this.username) ||
        charProhibidosPassword.test(this.password) ||
        this.password.length < minPassword ||
        this.username.length < minUsername
      )
        return;
      let dis = this;

      axios
        .post(this.serverUrl + "/api/usuarios/login", {
          username: this.username,
          password: this.password,
        })
        .then(function (respuesta) {
          if (respuesta.data.username == dis.username) {
            let usuario = respuesta.data;
            console.log(`Sesion iniciada`);
            localStorage.setItem(
              "sesionUsuario",
              JSON.stringify(respuesta.data)
            );
            //Login en vuex y en apollo
            dis.$store.commit("logearse", {
              username: usuario.username,
              permisos: usuario.permisos,
            });
            localStorage.setItem(process.env.TOKEN_KEY, usuario.token);
            ////////////
          }
        })
        .catch(function (error) {
          console.log(`error: ${error}`);
          //Logout en vuex y en apollo
          dis.$store.commit("deslogearse");
          localStorage.removeItem(process.env.TOKEN_KEY);
          /////
        });
    },
    deslogearse: function () {
      //Logout en vuex y en apollo
      this.$store.commit("deslogearse");
      localStorage.removeItem(process.env.TOKEN_KEY);
      /////////
    },
  },
};
</script>

<style>
</style>