<template>
  <div id="app">
    <div id="navBar">
      <div class="botonNav hoverGris" id="navHome" to="/">Home</div>
      <router-link to="/atlas">
        <div class="botonNav hoverGris" id="navAtlas">
          Atlas de conocimientos
        </div>
      </router-link>
      <router-link to="/proyectos">
        <div class="botonNav hoverGris" id="navProyectos">Proyectos</div>
      </router-link>
      <div class="botonNav hoverGris" id="navTrabajos">Trabajos</div>
      <div id="botonesNavDerecha">
        <template v-if="logeado">
          <div
            class="botonNav navLogin hoverGris"
            id="navLogged"
            :style="[colorBlancoAccionLogeado]"
            @click="accionesLogeado = !accionesLogeado"
          >
            {{ username }}
            <div id="botonesLogeado" v-if="accionesLogeado">
              <router-link to="/miperfil">
                <div class="botonesLogeado hoverGris" id="Perfil">Perfil</div>
              </router-link>
              <div
                class="botonesLogeado hoverGris"
                id="desconexion"
                @click="deslogeo"
              >
                Desconexion
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link
            to="/registro"
            class="botonNav hoverGris"
            id="navRegistro"
          >
            <div>Registro</div></router-link
          >
          <router-link
            to="/login"
            class="botonNav navLogin hoverGris"
            id="navLogin"
          >
            <div>Login</div></router-link
          >
        </template>
      </div>
    </div>
    <router-view id="visorRouter">asd</router-view>
  </div>
</template>

<script>
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

export default {
  name: "App",
  components: {},
  data() {
    return {
      accionesLogeado: false,
    };
  },
  computed: {
    username: function () {
      return this.$store.state.usuario.username;
    },
    logeado: function () {
      if (
        this.username != undefined &&
        this.username != null &&
        this.username.length > 2
      ) {
        return true;
      }
      return false;
    },
    colorBlancoAccionLogeado: function () {
      if (this.accionesLogeado) {
        return {
          backgroundColor: "white",
        };
      }
      return {};
    },
  },
  methods: {
    deslogeo() {
      this.$store.commit("deslogearse");
      this.$router.push("/login");
    },
  },
  mounted() {
    let token = localStorage.getItem(process.env.TOKEN_KEY);
    //let reloj=new Date();
    if (!token) {
      console.log(`no habia token`);
    } else {
      let datosU = parseJwt(token);
      let secsActual = parseInt(Date.now() / 1000);

      if (secsActual < datosU.exp) {
        this.$store.commit("logearse", token);
      } else {
        this.$store.commit("deslogearse");
      }
    }
  },
};
</script>

<style>
body {
  margin: 0px;
  width: 100%;
  height: 100vh;
  background: #edebe9 linear-gradient(to bottom, #dbd7d1, #edebe9 116px)
    no-repeat;
}
#app {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 40px 1fr 5px;
  row-gap: 5px;
  padding-left: 5px;
  padding-right: 5px;
  box-sizing: border-box;
  z-index: 0;
}
#visorRouter {
  grid-row: 2/3;
  background-color: "#fab467";
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  z-index: 10;
}
#atlasConocimiento {
  grid-row: 3/4;
  background-color: "#fab467";
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
#navBar {
  grid-row: 1/2;
  display: flex;
  z-index: 100;
}
.botonNav {
  padding-top: 10px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  font-family: Avenir, helvetica;
}
#navLogged {
  position: relative;
}
#botonesNavDerecha {
  margin-left: auto;
  display: flex;
}
#botonesLogeado {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
}
.botonesLogeado {
  padding-top: 10px;
  padding-left: 15px;
  padding-bottom: 5px;
  padding-right: 35px;
  min-width: 150px;
}
.hoverGris:hover {
  background-color: rgb(201, 201, 201);
}
</style>
