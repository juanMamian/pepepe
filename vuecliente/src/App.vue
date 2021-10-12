<template>
  <div id="app">
    <div id="navBar">
      <!-- <div class="botonNav" id="navHome" to="/">Home</div> -->
      <img
        id="botonDesplegarNav"
        src="@/assets/iconos/menuMobile.png"
        alt="Menu"
        @click="mostrandoNav = !mostrandoNav"
      />
      <div id="botonesNavEnlaces" :class="{enlacesOcultos:!mostrandoNav}" @click="mostrandoNav=false">
        <router-link
          to="/actividadesVirtuales2021"
          v-if="usuarioLogeado == true && usuario.permisos && usuario.permisos.includes('maestraVida')"
        >
          <div
            class="botonNavBarra botonNav hoverNegro"
            id="navActividadesVirtuales"
          >
            Actividades virtuales
          </div>
        </router-link>

        <router-link to="/foros" v-if="usuarioLogeado == true && usuario.permisos && usuario.permisos.includes('maestraVida')">
          <div
            class="botonNavBarra botonNav hoverNegro"
            id="navActividadesVirtuales"
          >
            Foros
          </div>
        </router-link>

        <div id="bloqueProyectos" class="bloqueBotones" v-if="usuario && usuario.permisos && usuario.permisos.includes('maestraVida')">
          <router-link to="/proyectos" v-if="usuarioLogeado == true">
            <div class="botonNavBarra botonNav hoverNegro" id="navProyectos">
              Grupos
            </div>
          </router-link>
          <!-- <div id="enlacesHijosProyectos" class="contenedorHijos">
            <router-link to="/trabajos" v-if="usuarioLogeado == true">
              <div
                class="botonNavHijo botonNav hoverNegro botonNavHijo"
                id="navTrabajos"
              >
                Trabajos
              </div>
            </router-link>
            <router-link to="/materiales" v-if="usuarioLogeado == true">
              <div
                class="botonNavHijo botonNav hoverNegro botonNavHijo"
                id="navMateriales"
              >
                Materiales
              </div>
            </router-link>
          </div> -->
        </div>

       <div id="bloqueSolidaridad" class="bloqueBotones">
          <div class="botonNavBarra botonNav hoverNegro" id="navAtlas">
            Solidaridad
          </div>
          <div id="enlacesHijosSolidaridad" class="contenedorHijos">
            <router-link to="/atlasSolidaridad">
              <div
                class="botonNavBarra botonNav hoverNegro botonNavHijo"
                id="navAtlasSolidaridad"
              >
                Atlas de solidaridad
              </div>
            </router-link>
            
          </div>
        </div>

        <div id="bloqueHerramientas" class="bloqueBotones">
          <div class="botonNavBarra botonNav hoverNegro" id="navAtlas">
            Herramientas
          </div>
          <div id="enlacesHijosHerramientas" class="contenedorHijos">
            <router-link to="/atlas">
              <div
                class="botonNavBarra botonNav hoverNegro botonNavHijo"
                id="navAtlas"
              >
                Atlas de conocimientos
              </div>
            </router-link>
            <a
              target="_blank"
              :href="tallerCuentosUrl + '?t=' + $store.state.token"
              v-show="usuarioLogeado"
            >
              <div
                class="botonNavBarra botonNav hoverNegro botonNavHijo"
                id="navAtlas"
              >
                Taller de creación de cuentos
              </div>
            </a>
          </div>
        </div>

        <router-link
          to="/personas"
          v-if="usuarioAdministrador || usuarioSuperadministrador"
        >
          <div
            class="botonNavBarra botonNav hoverNegro"
            id="navActividadesVirtuales"
          >
            Personas
          </div>
        </router-link>

        <router-link
          to="/registro"
          id="navRegistro"
          v-if="usuarioSuperadministrador"
        >
          <div class="botonNavBarra botonNav hoverNegro">
            Registrar usuario
          </div></router-link
        >
      </div>
      <div id="botonesNavDerecha">
        <div
          id="bloqueNotificaciones"
          v-if="usuarioLogeado"
          v-show="
            yo.notificaciones.length > 0 ||
            yo.notificacionesActividadForos.length > 0
          "
        >
          <span id="numeroNotificaciones">{{
            yo.notificaciones.length + yo.notificacionesActividadForos.length
          }}</span>
          <img
            src="@/assets/iconos/campanita.png"
            alt="Notificaciones"
            :title="yo.notificaciones.length + 'Notificaciones'"
            id="imagenCampanita"
            @click="mostrandoNotificaciones = !mostrandoNotificaciones"
          />
          <div id="contenedorNotificaciones" v-show="mostrandoNotificaciones">
            <notificacion-actividad-foros
              :estaNotificacion="notificacionActividadForos"
              :key="notificacionActividadForos.id"
              v-for="notificacionActividadForos of yo.notificacionesActividadForos"
            />
            <notificacion
              :key="notificacion.id"
              v-for="notificacion of notificacionesOrdenadas"
              :estaNotificacion="notificacion"
            />
          </div>
        </div>
        <template v-if="logeado">
          <div
            class="botonNavBarra botonNav navLogin hoverNegro"
            id="navLogged"
            @click="accionesLogeado = !accionesLogeado"
            @mouseleave="accionesLogeado = false"
          >
            {{ username }}
            <div id="botonesLogeado" v-if="accionesLogeado">
              <router-link to="/miperfil">
                <div class="botonesLogeado hoverNegro" id="Perfil">Perfil</div>
              </router-link>
              <router-link to="/calendarioPersonal">
                <div class="botonesLogeado hoverNegro" id="botonCalendarioPersonal">Mi calendario</div>
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
            class="botonNavBarra botonNav navLogin hoverNegro"
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
import NotificacionActividadForos from "./components/usuario/NotificacionActividadForos.vue";

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
      notificacionesActividadForos {
        idParent
        tipoParent
        numeroRespuestasNuevas
        nombreParent
      }
      permisos
      foros {
        idForo
        conversaciones {
          idConversacion
          respuestasLeidas
        }
      }
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
      update({ yo }) {
        this.$store.commit("setInfoForosUsuario", yo.foros);
        return yo;
      },
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
          var nuevoCache=JSON.parse(JSON.stringify(previousResult));
          if (
            !nuevoCache.yo.notificaciones.some(
              (n) => n.id == data.nuevaNotificacion.id
            )
          ) {
            nuevoCache.yo.notificaciones.push(data.nuevaNotificacion);
          }
          return nuevoCache;
        },
        skip() {
          return !this.usuarioLogeado;
        },
      },
    },
  },
  components: { Notificacion, NotificacionActividadForos },
  data() {
    return {
      accionesLogeado: false,
      mostrandoNotificaciones: false,
      yo: {
        notificaciones: [],
        notificacionesActividadForos: [],
      },

      mostrandoNav: false,
      navSeleccionado: "home",
    };
  },
  computed: {
    tallerCuentosUrl() {
      return process.env.NODE_ENV === "production"
        ? "https://pe-pe-pe.herokuapp.com/tallerCuentos"
        : "http://localhost:8081";
    },
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
      var lasNotificaciones = JSON.parse(JSON.stringify(this.yo.notificaciones));
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

      if(!datosU.version || datosU.version<1){
        console.log(`Versión de token caducada`);
        this.$store.commit("deslogearse");
        return;
      }

      if (secsActual < datosU.exp || !datosU.exp) {
        this.$store.commit("logearse", token);
      } else {
        console.log(`Token expirado: exp: ${datosU.exp}`);
        this.$store.commit("deslogearse");
      }
    }
  },
};
</script>

<style>
html {
  height: 100vh;
}
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
.letrasRojas {
  color: red;
}
.bordeAbajo {
  border-bottom: 2px solid black;
}
.deshabilitado {
  opacity: 0.5;
  user-select: none;
  pointer-events: none;
}
.opaco {
  opacity: 0.6;
}

.botonEquis{
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-color: rgb(214, 115, 115);
  border-radius: 50%;
  position: absolute;
}
.botonEquis:hover{
  background-color: rgb(196, 73, 73);
}
.botonEquis>.linea1{
  position: absolute;
  background-color: black;
  height: 2px;
  width: 80%;
  left: 10%;
  top: 50%;
  transform: translateY(-50%) rotateZ(45deg);
}
.botonEquis>.linea2{
  position: absolute;
  background-color: black;
  height: 80%;
  width: 2px;
  top: 10%;
  left: 50%;
  transform: translateX(-50%) rotateZ(45deg);
}
</style>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 65px 1fr 5px;

  grid-template-columns: 1fr;
  
  box-sizing: border-box;
  z-index: 0;
}

#botonDesplegarNav {
  display: block;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  padding: 10px;
  background-color: rgb(228 129 36);
  align-self: center;
}
#botonesNavEnlaces{
  position: relative;
  top: 100%;
  left:-55px;
  background-color: rgb(239, 174, 74);
}
.enlacesOcultos{
  display: none;
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
  font-size: 15px;
  font-family: "Poppins", sans-serif;
  color: white;
  box-sizing: border-box;
  background-color: rgb(239, 174, 74);
}
.botonNavBarra {
  padding: 10px 10px;
}
.botonNavHijo {
  padding-bottom: 30px;
  padding-left: 25px;
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

.disabled {
  opacity: 0.8;
  pointer-events: none;
}
.bloqueBotones {
  position: relative;
}


.contenedorHijos {  
  display: block;
  
}
.botonNavHijo {
  padding-bottom: 15px;
}

@media only screen and (min-width: 768px) {
  #app {
    grid-template-rows: 55px 1fr 5px;
  }
  #botonDesplegarNav {
    display: none;
  }
  .enlacesOcultos{
    display: block;
  }
  #botonesNavEnlaces{
    display: flex;
    background-color:transparent;
    top: 0px;
    left: 0px;
  }
  .botonNav{
    background-color:transparent;
    font-size: 18px;
    height: 100%;
  }
  .botonNavBarra {
    height: 100%;
    padding: 13px 15px;
  }
  .botonNavHijo{
    padding-left:15px;
  }
  .hoverNegro:hover {
  background-color: rgba(0, 0, 0, 0.315);
  }
  .contenedorHijos{
    display: none;
    position: absolute;
    top: 100%;
    left: 0%;
    width: 150px;
    background-color:#f0a446 ;
  }
  .bloqueBotones:hover > .contenedorHijos {
  display: block;
  }
}
</style>
