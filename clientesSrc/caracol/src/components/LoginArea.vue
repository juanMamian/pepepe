<template>
  <div id="loginArea">
    <div id="ventanaCentral">
      <form>
        <p id="tituloVentana">¡Bienvenidx!</p>
        <br />
        <div class="instruccion">Escribe tus datos de login</div>
        <input
          type="text"
          name="username"
          :style="colorUsername"
          v-model="username"
          ref="inputUsername"
          placeholder="Nombre de usuario"
          class="inputs"
          @input="loginFail = false"
        />
        <br />
        <input
          type="password"
          name="password"
          ref="inputPassword"
          class="inputs"
          v-model="password"
          placeholder="password"
          @input="loginFail = false"
          @keypress.enter="iniciarSesion"
        />
        <br />
        <br />
        <loading v-show="enviandoDatos" :texto="'Conectando...'" />
        <div
          class="botonEnviar"
          @click.stop.prevent="iniciarSesion"
          :class="{
            loginFail,
            desaparecido: enviandoDatos,
            deshabilitado: passIlegal,
          }"
        >
          {{ loginFail ? loginFailMsg : "Ingresar" }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Loading from "./utilidades/Loading.vue";
import { gql } from "@apollo/client/core"

var charProhibidosUsername = /[^a-zA-Z0-9_ñÑ]/g;
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
      return this.usuario.username != null ? true : false;
    },
    nombreUsuario() {
      return this.usuario.username;
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
    passIlegal() {
      if (this.password.length < minPassword) {
        return true;
      }
      return false;
    },
    usernameIlegal() {
      if (
        !this.username ||
        charProhibidosUsername.test(this.username) ||
        this.username.length < minUsername
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    iniciarSesion: function () {
      console.log(`Iniciando login`);
      let dis = this;

      var password = this.$refs.inputPassword.value;
      var username = this.$refs.inputUsername.value;
      console.log("Con pass length: "+this.password.length)
      if (this.password.length < minPassword) {
        console.log(`Password ilegal`);
        return;
      }

      if (
        charProhibidosUsername.test(this.username) ||
        this.username.length < minUsername
      ) {
        console.log(`Username ilegal`);
        return;
      }

      this.enviandoDatos = true;
      console.log("query");
      this.$apollo
        .query({
          query: gql`
            query ($username: String!, $password: String!) {
              login(username: $username, password: $password)
            }
          `,
          variables: {
            username,
            password,
          },
        })
        .then(({ data: { login } }) => {
          this.$emit("logearse", login);
          dis.$router.push("/");

          this.enviandoDatos = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoDatos = false;
        });

      // axios
      //   .post(this.serverUrl + "/api/usuarios/login", {
      //     username: this.username,
      //     password: this.password,
      //   })
      //   .then(function (respuesta) {
      //     console.log(`Logeado`);

      //     if (respuesta.data.username == dis.username) {
      //       dis.$store.commit("logearse", respuesta.data.token);
      //       // window.location.href = dis.clienteUrl;
      //       dis.enviandoDatos = false;
      //       dis.$router.push("/");
      //     }
      //   })
      //   .catch(function (error) {
      //     dis.enviandoDatos = false;
      //     dis.$store.commit("deslogearse");

      //     if (error.response && error.response.data.error) {
      //       if (error.response.data.error == "badLogin") {
      //         dis.loginFail = true;
      //         dis.loginFailMsg = "Datos inválidos";
      //         return;
      //       }
      //       if (error.response.data.error == "sebastian") {
      //         console.log(`Usuario bloqueado temporalmente`);
      //       }
      //     }
      //     if (error.response && error.response.data.msjUsuario) {
      //       alert(error.response.data.msjUsuario);
      //     }
      //     console.log(`error: ${error}`);
      //   });
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
.instruccion {
  font-size: 18;
  text-align: center;
  margin: 40px 0px;
  margin-bottom: 0px;
}
.inputs {
  font-size: 20px;
  padding: 10px 20px;
  border-radius: 10px;
  margin-right: auto;
  margin-left: auto;
  margin-top: 15px;
  display: block;
}
#ventanaCentral {
  margin: 5% auto;
  padding: 20px;
  width: min(550px, 90%);
}
.botonEnviar {
  width: min(300px, 90vw);
  text-align: center;
  display: block;
  margin-left: auto;
  margin-right: auto;
  font-size: 20px;
  padding: 15px 5px;
  background-color: var(--mainColor);
  border-radius: 30px;
  cursor: pointer;
}
.loginFail {
  color: red;
  pointer-events: none;
  opacity: 0.5;
  font-style: italic;
  font-size: 12px;
}
.desaparecido {
  display: none;
  pointer-events: none;
}
</style>