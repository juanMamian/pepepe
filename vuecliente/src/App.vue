<template>
  <div id="app">
    <div id="navBar">
      <!-- <div class="botonNav" id="navHome" to="/">Home</div> -->
      <router-link
        to="/actividadesVirtuales2021"
        v-if="usuarioLogeado == true"
        class="hoverNegro"
      >
        <div class="botonNav" id="navActividadesVirtuales">
          Actividades virtuales
        </div>
      </router-link>

      <router-link to="/proyectos" class="hoverNegro">
        <div class="botonNav" id="navProyectos">Proyectos</div>
      </router-link>

      <router-link to="/atlas" class="hoverNegro disabled">
        <div class="botonNav" id="navAtlas">Atlas de conocimientos</div>
      </router-link>

      <router-link to="/trabajos" class="hoverNegro disabled">
        <div class="botonNav" id="navTrabajos">Trabajos</div>
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
        <div
          id="bloqueNotificaciones"
          v-if="usuarioLogeado"
          v-show="yo.notificaciones.length > 0"
        >
          <span id="numeroNotificaciones">{{ yo.notificaciones.length }}</span>
          <img
            src="@/assets/iconos/campanita.png"
            alt="Notificaciones"
            :title="yo.notificaciones.length + 'Notificaciones'"
            id="imagenCampanita"
            @click="mostrandoNotificaciones = !mostrandoNotificaciones"
          />
          <div id="contenedorNotificaciones" v-show="mostrandoNotificaciones">
            <notificacion
              :key="notificacion.id"
              v-for="notificacion of notificacionesOrdenadas"
              :estaNotificacion="notificacion"
            />
          </div>
        </div>
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
import Notificacion from "./components/usuario/Notificacion.vue";

export const QUERY_YO = gql`
  query {
    yo {
      id
      nombres
      apellidos
      notificaciones {
        id
        fecha
        texto
        elementoTarget {
          tipo
          id
          nombre
        }
        causante {
          id
          tipo
        }
      }
      permisos
    }
  }
`;

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
  apollo: {
    yo: {
      query: QUERY_YO,
      fetchPolicy: "network-only",
      skip() {
        return !this.usuarioLogeado;
      },
      subscribeToMore: {
        document: gql`
          subscription {
            nuevaNotificacion {
              id
              fecha
              texto
              elementoTarget {
                tipo
                id
                nombre
              }
              causante {
                id
                tipo
              }
            }
          }
        `,
        updateQuery: (previousResult, { subscriptionData: { data } }) => {
          if (
            !previousResult.yo.notificaciones.some(
              (n) => n.id == data.nuevaNotificacion.id
            )
          ) {
            previousResult.yo.notificaciones.push(data.nuevaNotificacion);
          }
          return previousResult;
        },
        skip() {
          return !this.usuarioLogeado;
        },
      },
    },
  },
  components: { Notificacion },
  data() {
    return {
      accionesLogeado: false,
      mostrandoNotificaciones: false,
      yo: {
        notificaciones: [],
      },
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
    notificacionesOrdenadas: function () {
      let lasNotificaciones = this.yo.notificaciones;
      return lasNotificaciones.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
      });
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
      console.log(``);
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
  font-family: "Varela Round", sans-serif;
}

textarea {
  font-family: "Varela Round", sans-serif;
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

a {
  text-decoration: none;
  color: black;
}
input {
  border: 1px solid black;
}
.letrasRojas{
  color:red;
}
.bordeAbajo{
  border-bottom: 2px solid black;
}
.deshabilitado {
  opacity: 0.5;
  user-select: none;
  pointer-events: none;
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
@media only screen and (max-width: 1150px) {
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
  background: linear-gradient(
    to right,
    rgb(239, 174, 74) 0%,
    rgb(243, 138, 58) 100%
  );
}
#navLogged {
  position: relative;
}
.botonNav {
  padding-top: 13px;
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
  user-select: none;
  font-size: 18px;
  font-family: "Poppins", sans-serif;
  color: white;
}
#botonesNavDerecha {
  margin-left: auto;
  display: flex;
}
#bloqueNotificaciones {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 10px;
}
#contenedorNotificaciones {
  position: absolute;
  top: 100%;
  right: 0%;
  align-items: center;
}
#numeroNotificaciones {
  font-size: 20px;
  color: white;
  margin-right: 3px;
}
#imagenCampanita {
  width: 25px;
  height: 25px;
  background-color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
}
#botonesLogeado {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: rgb(243, 138, 58);
}
.botonesLogeado {
  padding-top: 10px;
  padding-left: 15px;
  padding-bottom: 5px;
  padding-right: 35px;
  min-width: 150px;
}
.hoverNegro:hover {
  background-color: rgba(0, 0, 0, 0.315);
}
.disabled {
  opacity: 0.8;
  pointer-events: none;
}
</style>
