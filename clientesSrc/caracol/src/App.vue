<template>
  <div id="app">
    <div id="navBar">
      <!-- <div class="botonNav" id="navHome" to="/">Home</div> -->
      <div id="zonaIcono" @click="mostrandoNav = !mostrandoNav">
        <img id="botonDesplegarNav" src="@/assets/iconos/stream.svg" alt="Menu" />
        <div id="logoPepepe">Pepepe</div>
      </div>
      <div id="botonesNavEnlaces" :class="{ enlacesOcultos: !mostrandoNav }" @click="mostrandoNav = false">
        <!-- <router-link
          to="/actividadesVirtuales2021"
          v-if="
            usuarioLogeado == true &&
            usuario.permisos &&
            usuario.permisos.includes('maestraVida')
          "
        >
          <div
            class="botonNavBarra botonNav hoverNegro"
            id="navActividadesVirtuales"
          >
            Actividades virtuales
          </div>
        </router-link> -->

        <router-link to="/foros" v-if="
          usuarioLogeado == true &&
          usuario.permisos &&
          usuario.permisos.includes('maestraVida')
        ">
          <div class="botonNavBarra botonNav hoverNegro" id="navActividadesVirtuales">
            Foros
          </div>
        </router-link>

        <!-- <div
          id="bloqueProyectos"
          class="bloqueBotones"
          v-if="
            usuario &&
            usuario.permisos &&
            usuario.permisos.includes('maestraVida')
          "
        >
          <router-link to="/proyectos" v-if="usuarioLogeado == true">
            <div class="botonNavBarra botonNav hoverNegro" id="navProyectos">
              Grupos
            </div>
          </router-link>       
        </div> -->

        <!-- <div id="bloqueSolidaridad" class="bloqueBotones">
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
        </div> -->

        <div id="bloqueHerramientas" class="bloqueBotones">
          <div class="botonNavBarra botonNav hoverNegro" id="navAtlas">
            Herramientas
          </div>
          <div id="enlacesHijosHerramientas" class="contenedorHijos">
            <router-link to="/atlas">
              <div class="botonNavBarra botonNav hoverNegro botonNavHijo" id="navAtlas">
                Atlas de conocimientos
              </div>
            </router-link>
           
          </div>
        </div>

        <router-link to="/personas" v-if="usuarioLogeado">
          <div class="botonNavBarra botonNav hoverNegro" id="navActividadesVirtuales">
            Personas
          </div>
        </router-link>
        <router-link to="/espacios">
          <div class="botonNavBarra botonNav hoverNegro" id="navActividadesVirtuales">
            Horario semanal
          </div>
        </router-link>
        <router-link v-if="yo && yo.id" :to="'/rutaGrado/' + yo.id">
          <div class="botonNavBarra botonNav hoverNegro" id="navRutaGrado">
            Mi ruta de grado
          </div>
        </router-link>
        <router-link to="/registro" id="navRegistro" v-if="usuarioSuperadministrador">
          <div class="botonNavBarra botonNav hoverNegro">
            Registrar usuario
          </div>
        </router-link>
      </div>
      <div id="botonesNavDerecha">
        <div id="bloqueNotificaciones" v-if="usuarioLogeado" v-show="
          yo.notificaciones.length > 0 ||
          yo.notificacionesActividadForos.length > 0
        ">
          <span id="numeroNotificaciones">{{
            yo.notificaciones.length + yo.notificacionesActividadForos.length
          }}</span>
          <img src="@/assets/iconos/campanita.png" alt="Notificaciones"
            :title="yo.notificaciones.length + 'Notificaciones'" id="imagenCampanita"
            @click="mostrandoNotificaciones = !mostrandoNotificaciones" />
          <div id="contenedorNotificaciones" v-show="mostrandoNotificaciones">
            <notificacion-actividad-foros :estaNotificacion="notificacionActividadForos"
              :key="notificacionActividadForos.id"
              v-for="notificacionActividadForos of yo.notificacionesActividadForos" />
            <notificacion :key="notificacion.id" v-for="notificacion of notificacionesOrdenadas"
              :estaNotificacion="notificacion" />
          </div>
        </div>
        <template v-if="usuarioLogeado">
          <div class="botonNavBarra botonNav navLogin hoverNegro" id="navLogged"
            @click="accionesLogeado = !accionesLogeado" @mouseleave="accionesLogeado = false">
            {{ username }}
            <div id="botonesLogeado" v-if="accionesLogeado">
              <router-link to="/miperfil">
                <div class="botonesLogeado hoverNegro" id="Perfil">Perfil</div>
              </router-link>
              <div class="botonesLogeado hoverNegro" id="desconexion" @click="deslogearse">
                Desconexion
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="botonNavBarra botonNav navLogin hoverNegro" id="navLogin">
            <div>Login</div>
          </router-link>
        </template>
      </div>
    </div>
    <router-view @logearse="logearUsuario" id="visorRouter" :yo="yo"></router-view>
    <cuadrito-mensaje-usuario style="z-index: 100" :mensajes="this.errores" />
  </div>
</template>

<script>
import gql from "graphql-tag";
import Notificacion from "./components/usuario/Notificacion.vue";
import NotificacionActividadForos from "./components/usuario/NotificacionActividadForos.vue";
import CuadritoMensajeUsuario from './components/utilidades/CuadritoMensajeUsuario.vue';
import {QUERY_AUTH_USUARIO} from "./globalMixin.js";

export const QUERY_ESTADO_RED = gql`
  query{
    estadoRed
  }
`;
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
      skip() {
        return !this.usuarioLogeado;
      },
    },
  },
  components: { Notificacion, NotificacionActividadForos, CuadritoMensajeUsuario },
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

      errores:[],
    };
  },
  computed: {
    tallerCuentosUrl() {
      return process.env.NODE_ENV === "production"
        ? "https://192.168.1.100:3000"
        : "http://localhost:8081";
    },
    username: function () {
      return this.usuario.username;
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
      var lasNotificaciones = JSON.parse(
        JSON.stringify(this.yo.notificaciones)
      );
      return lasNotificaciones.sort((a, b) => {
        return new Date(b.fecha) - new Date(a.fecha);
      });
    },
  },
  methods: {
    setEstadoRed() {
      console.log(`Detectado estado de red en ${navigator.onLine}`);
      const store = this.$apollo.provider.defaultClient;

      store.writeQuery({
        query: QUERY_ESTADO_RED,
        data: {
          estadoRed: navigator.onLine
        }
      })
      // if (navigator.onLine) {
      //   this.sincronizarMovsDineroShifting();
      // }
    },
    logearUsuario(token) {
      console.log("Logeando usuario");
      let datosUsuario = parseJwt(token);

      const store = this.$apollo.provider.defaultClient;


      let nuevosDatos = {
        id: datosUsuario.id,
        username: datosUsuario.username,
        permisos: datosUsuario.permisos,
        token,
      }

      store.writeQuery({
        query: QUERY_AUTH_USUARIO,
        data: { auth_usuario: nuevosDatos },
      });

      this.$router.push({ name: "perfilPersonal" });

      this.setEstadoRed();
    },
    async deslogearse() {
      const store = this.$apollo.provider.defaultClient;
      store.writeQuery({
        query: QUERY_AUTH_USUARIO,
        data: { auth_usuario: null },
      });
      console.log("Navegando a loginScreen");
      await this.$router.push({ name: "loginScreen" });
      console.log("On loginScreen");

      this.$nextTick(() => {
        store.resetStore().then(() => {
          console.log("Store reset");
          this.setEstadoRed();
        }).catch((error) => {
          console.log("Error resetting store: " + error);
          this.setEstadoRed();
        });
      })

    },
  },  
  created() {
    this.setEstadoRed();
    window.addEventListener("online", this.setEstadoRed);
    window.addEventListener("offline", this.setEstadoRed);
  },
  destroyed() {
    window.removeEventListener("online", this.setEstadoRed);
    window.removeEventListener("offline", this.setEstadoRed);
  },
};
</script>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  z-index: 0;
}

#navBar {
  width: 100%;
  height: 60px;
  align-items: center;
  display: flex;
  z-index: 100;
  background-color: var(--mainColor);
  position: relative;
}

#zonaIcono {
  display: flex;
  align-items: center;
  cursor: pointer;
}

#botonDesplegarNav {
  display: block;
  width: 35px;
  height: 35px;
  border-radius: 10px;
  padding: 10px;
}

#logoPepepe {
  font-size: 18px;
  font-family: Salsa, cursive;
}

#botonesNavEnlaces {
  position: absolute;
  top: 100%;
  left: 0px;
  background-color: rgb(239, 174, 74);
}

.enlacesOcultos {
  display: none;
}

.router-link-active {
  background-color: rgba(0, 0, 0, 0.247);
}

#visorRouter {
  width: 100%;
  flex-grow: 1;
  background-color: "#fab467";
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  z-index: 10;
}

#atlasConocimiento {
  background-color: "#fab467";
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
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
  color: black;
  box-sizing: border-box;
  background-color: var(--mainColor);
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
</style>
