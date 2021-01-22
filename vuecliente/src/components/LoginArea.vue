<template>
  <div id="loginArea">
    <div id="ventanaCentral">
      <p id="tituloVentana">Iniciar sesion</p>
      <br />
      <input
        type="text"
        name="username"
        :style="colorUsername"
        v-model="username"
        placeholder="Nombre de usuario"
        class="inputs"
        @input="loginFail = false"
      />
      <br />
      <input
        type="password"
        name="password"
        class="inputs"
        :style="colorPassword"
        v-model="password"
        placeholder="password"
        @keypress.enter="iniciarSesion"
        @input="loginFail = false"
      />
      <br />
      <br />
      <loading v-show="enviandoDatos" :texto="'Conectando...'" />
      <button
        class="botonEnviar"
        @click.stop="iniciarSesion"
        :class="{ loginFail, deshabilitado: enviandoDatos }"
      >
        {{ loginFail ? loginFailMsg : "Conectarse" }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import gql from "graphql-tag";
import Loading from "./utilidades/Loading.vue";

var charProhibidosUsername = /[^a-zA-Z0-9_]/g;
var charProhibidosPassword = /[^a-zA-Z0-9*@_-]/g;
const minPassword = 6;
const minUsername = 4;

export default {
  name: "LoginArea",
  components: { Loading },
  data() {
    return {
      username: "",
      password: "",
      loginFail: false,
      loginFailMsg: "",
      enviandoDatos: false,
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
      let dis = this;
      //Validacion de caracteres
      if (
        charProhibidosUsername.test(this.username) ||
        charProhibidosPassword.test(this.password) ||
        this.password.length < minPassword ||
        this.username.length < minUsername
      )
        return;
      this.enviandoDatos = true;
      axios
        .post(this.serverUrl + "/api/usuarios/login", {
          username: this.username,
          password: this.password,
        })
        .then(function (respuesta) {
          if (respuesta.data.username == dis.username) {
            dis.$store.commit("logearse", respuesta.data.token);
            dis.$apollo
              .query({
                query: gql`
                  query {
                    yo {
                      id
                      idGrupoEstudiantil
                      nombreGrupoEstudiantil
                      nombres
                      apellidos
                    }
                  }
                `,
                fetchPolicy: "network-only",
              })
              .then(({ data: { yo } }) => {
                dis.enviandoDatos = false;

                console.log(`Datos personales: ${JSON.stringify(yo)}`);
                dis.$store.commit("setDatosUsuario", yo);
                dis.$router.push("/miperfil");
              })
              .catch((error) => {
                dis.enviandoDatos = false;
                console.log(`Error descargando datos gql. E: ${error}`);
              });
          }
        })
        .catch(function (error) {
          dis.enviandoDatos = false;
          console.log(`response: ${JSON.stringify(error.response)}`);
          dis.$store.commit("deslogearse");

          if (error.response.data.error) {
            if (error.response.data.error == "badLogin") {
              dis.loginFail = true;
              dis.loginFailMsg = "Datos inválidos";
              return;
            }
          }
          if (error.response.data.msjUsuario) {
            alert(error.response.data.msjUsuario);
          }
          console.log(`error: ${error}`);
        });
    },
    deslogearse: function () {
      //Logout en vuex y en apollo
      this.$store.commit("deslogearse");
      /////////
    },
  },
};
</script>

<style scoped>
#tituloVentana {
  font-size: 35px;
  margin: 5px auto;
  text-align: center;
  font-family: sans-serif;
}
.inputs {
  font-size: 20px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 15px;
  display: block;
  padding: 5px;
}
#ventanaCentral {
  margin: 5% auto;
  padding: 20px;
  width: 50%;
  min-width: 550px;
  box-shadow: 3px 3px grey, 3px 3px 3px 3px grey;
  background-color: rgb(248, 248, 248);
}
.botonEnviar {
  display: block;
  margin-left: auto;
  margin-right: auto;
  font-size: 20px;
}
.loginFail {
  color: red;
  pointer-events: none;
  opacity: 0.5;
  font-style: italic;
  font-size: 12px;
}
.deshabilitado {
  display: none;
  pointer-events: none;
}
</style>