<template>
  <div class="loginScreen">
    <div id="tituloZona">Autenticación</div>
    <div
      id="bloqueInputUsername"
      class="bloqueInput"
      :class="{ activo: inputUsernameActivo || inputUsername }"
    >
      <input
        type="text"
        ref="campoUsername"
        id="inputUsername"
        class="inputLogin"
        v-model="inputUsername"
        @focus="inputUsernameActivo = true"
        @blur="inputUsernameActivo = false"
      />
    </div>
    <div
      id="bloqueInputPassword"
      class="bloqueInput"
      :class="{ activo: inputPasswordActivo || inputPassword }"
    >
      <input
        :type="mostrandoPassword ? 'text' : 'password'"
        ref="campoPassword"
        id="inputPassword"
        class="inputLogin"
        v-model="inputPassword"
        @keypress.enter="$refs.botonEnviarLogin.click()"
        @focus="inputPasswordActivo = true"
        @blur="inputPasswordActivo = false"
      />
    </div>
    <div
      class="botonTexto"
      id="botonEnviarLogin"
      ref="botonEnviarLogin"
      :class="{ deshabilitado: enviandoLogin }"
      @click.stop="enviarLogin"
    >
      Enviar
    </div>
    <Loading v-show="enviandoLogin" />
  </div>
</template>
<script>
import Loading from "../components/utilidades/Loading.vue";
import { gql } from "@apollo/client/core";

export default {
  name: "LoginScreen",
  components: { Loading },
  data() {
    return {
      mostrandoPassword: false,

      enviandoLogin: false,
      inputUsernameActivo: false,
      inputPasswordActivo: false,

      inputUsername: "",
      inputPassword: "",
    };
  },
  methods: {
    enviarLogin() {
      let username = this.validarUsername();
      let password = this.validarPassword();
      if (!username || !password) {
        return;
      }

      this.enviandoLogin = true;
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
            console.log("logeado");
          this.$emit("logearse", login);
          this.$router.push({ name: "home" });
          this.enviandoLogin = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.$refs.campoPassword.select();
          this.enviandoLogin = false;
        });
    },
    validarUsername() {
      let username = this.$refs.campoUsername.value.trim();
      const maxUsername = 30;
      const minUsername = 6;
      const charProhibidosNombreCosa = /[^ a-zA-ZÀ-ž0-9_()-]/;
      if (username.length < minUsername || username.length > maxUsername) {
        this.raiseAccion("Nombre de usuario no válido", "error");
        return;
      }
      if (charProhibidosNombreCosa.test(username)) {
        this.raiseAccion(
          "Nombre de usuario contiene caracteres no válidos",
          "error"
        );
        return;
      }
      return username;
    },
    validarPassword() {
      let password = this.$refs.campoPassword.value.trim();
      const minPassword = 6;
      const maxPassword = 30;
      if (password.length < minPassword || password.length > maxPassword) {
        this.raiseAccion("Contraseña no válida");
        return;
      }
      return password;
    },
  },
  mounted(){
    this.$apollo.skipAll=false;
  }
};
</script>
<style scoped>
.loginScreen {
  display: flex;
  flex-direction: column;
  gap: 50px;
  margin-bottom: 90px;
}
#tituloZona {
  font-size: 1em;
  margin: 30px 0px;
  text-align: center;
  margin-bottom: 20px;
}

.bloqueInput {
  position: relative;
  width: min(600px, 70%);
  
  margin: 0px auto;
}
#bloqueInputUsername::after {
  content: "Nombre de usuario";
}
#bloqueInputPassword::after {
  content: "Contraseña";
}

.bloqueInput::after {
  position: absolute;
  left: 10px;
  bottom: 10px;
  font-size: 0.7em;
  transition: bottom 0.3s ease-out, opacity 0.3s, font-size 0.3s;
  pointer-events: none;
  color: gray;
}
.bloqueInput.activo::after {
  bottom: calc(100% + 5px);
  opacity: 0;
  font-size: 0.5em;
}
.inputLogin {
  background-color: transparent;
  border: 2px solid transparent;
  border-bottom-color: gray;
  text-decoration: none;
  outline: none;
  display: block;
  margin: 0px auto;
  width: 100%;
}

#botonEnviarLogin {
  margin: 0px auto;
  width: fit-content;
}

@media screen and (min-width: 900px) {
  .loginScreen {
    align-self: center;
    width: 40vw;
    flex-grow: 0;
    margin-left:auto;
    gap: 100px;
  }
  #tituloZona{
    margin-bottom: 30px;
    text-align: center;
  }
}
</style>
