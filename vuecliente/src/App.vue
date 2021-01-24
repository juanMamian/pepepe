<template>
  <div id="app">
    <div id="navBar">
      <!-- <div class="botonNav" id="navHome" to="/">Home</div> -->
      
      <!-- <router-link to="/atlas" class="hoverNegro">
        <div class="botonNav" id="navAtlas">Atlas de conocimientos</div>
      </router-link> -->
      
      <!-- <router-link to="/proyectos" class="hoverNegro">
        <div class="botonNav" id="navProyectos">Proyectos</div>
      </router-link> -->
      
      <!-- <div class="botonNav" id="navTrabajos">Trabajos</div> -->
      
      <router-link
        to="/actividadesVirtuales2021"
        v-if="usuarioLogeado == true"
        class="hoverNegro"
      >
        <div class="botonNav" id="navActividadesVirtuales">
          Actividades virtuales
        </div>
      </router-link>
      <router-link
        to="/personas"
        v-if="usuarioAdministrador || usuarioSuperadministrador"
        class="hoverNegro"
      >
        <div class="botonNav" id="navActividadesVirtuales">Personas</div>
      </router-link>
      <router-link
        to="/registro"
        class="botonNav hoverNegro"
        id="navRegistro"
        v-if="usuarioSuperadministrador"
      >
        <div>Registrar usuario</div></router-link
      >
      <div id="botonesNavDerecha">
        <template v-if="logeado">
          <div
            class="botonNav navLogin hoverNegro"
            id="navLogged"
            @click="accionesLogeado = !accionesLogeado"
            @mouseleave="accionesLogeado = false"
          >
            {{ username }}
            <div id="botonesLogeado" v-if="accionesLogeado">
              <router-link to="/miperfil">
                <div class="botonesLogeado hoverNegro" id="Perfil">Perfil</div>
              </router-link>
              <div
                class="botonesLogeado hoverNegro"
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
            to="/login"
            class="botonNav navLogin hoverNegro"
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
import gql from "graphql-tag";

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
    let token = localStorage.getItem("token");
    //let reloj=new Date();
    if (!token) {
      console.log(`no habia token`);
    } else {
      let datosU = parseJwt(token);
      let secsActual = parseInt(Date.now() / 1000);

      if (secsActual < datosU.exp) {
        this.$store.commit("logearse", token);
        this.$apollo
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
            console.log(`Datos personales: ${JSON.stringify(yo)}`);
            this.$store.commit("setDatosUsuario", yo);
          })
          .catch((error) => {
            console.log(`Error descargando datos gql. E: ${error}`);
          });
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
  font-family: "Brush Script MT", "Lucida Handwriting", cursive;
}

textarea{
  font-family: "Brush Script MT", "Lucida Handwriting", cursive;
}

.botonNav {
  padding-top: 13px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  font-family:"Poppins",sans-serif;
  color:white;
}

.hoverGris:hover {
  background-color: rgb(201, 201, 201);
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text */
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;

  /* Fade in tooltip */
  opacity: 0;
  transition: opacity 0.3s;
}

/* Tooltip arrow */
.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.noUserSelect {
  user-select: none;
}

a{
  text-decoration: none;
  color: black;
}
input {
  border: 1px solid black;
}
</style>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 45px 1fr 5px;
  grid-template-columns: 1fr;
  padding-left: 5px;
  padding-right: 5px;
  box-sizing: border-box;
  z-index: 0;
}
@media only screen and (max-width: 600px) {
  #app {
    grid-template-rows: 65px 1fr 5px;
  }
}
.router-link-active {
  background-color: rgba(0, 0, 0, 0.247);
}
#visorRouter {
  grid-column: 1/2;
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
  grid-column: 1/2;
  grid-row: 1/2;
  display: flex;
  z-index: 100;
  background: linear-gradient(to right, rgb(239, 174, 74) 0%, rgb(243, 138, 58) 100%);
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
    background-color:rgb(243, 138, 58);

}
.botonesLogeado {
  padding-top: 10px;
  padding-left: 15px;
  padding-bottom: 5px;
  padding-right: 35px;
  min-width: 150px;

}
.hoverNegro:hover{
  background-color: rgba(0, 0, 0, 0.315);
}
</style>
