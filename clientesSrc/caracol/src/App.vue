<template>
  <div
    id="app"
    @click="cerrarMenus"
    :class="{
      landing: $route.name === 'home' || $route.name === 'loginScreen',
    }"
  >
    <div id="navBar">
      <!-- <div class="botonNav" id="navHome" to="/">Home</div> -->
      <div
        id="botonMenuNav"
        class="boton"
        @click.stop="mostrandoNav = !mostrandoNav"
      >
        <img
          id="botonDesplegarNav"
          src="@/assets/iconos/stream.svg"
          alt="Menu"
        />
      </div>
      <div
        id="contenedorBotonesNav"
        class="menuNavDesplegable"
        @click.stop="cerrarMenus"
        :class="{ desplegado: mostrandoNav }"
      >
        <router-link to="/" class="botonNav" id="navHome">
          <img src="@/assets/iconos/home.svg" alt="Compás" />
          Inicio
        </router-link>
        <router-link to="/atlas" class="botonNav" id="navAtlas">
          <img src="@/assets/iconos/compassRegular.svg" alt="Compás" />
          Atlas de conocimientos
        </router-link>

        <router-link
          to="/personas"
          v-if="usuarioLogeado"
          class="botonNav"
          id="navActividadesVirtuales"
        >
          <img src="@/assets/iconos/users.svg" alt="Usuarios" />
          Personas
        </router-link>

        <div
          class="bloqueNav"
          v-if="usuarioLogeado && usuarioEscuelaMaestraVida"
        >
          <div class="tituloBloqueNav">Escuela</div>
          <router-link
            to="/espacios"
            class="botonNav"
            id="navActividadesVirtuales"
          >
            <img src="@/assets/iconos/calendarWeek.svg" alt="Calendario" />
            Horario semanal
          </router-link>
          <router-link
            v-if="yo && yo.id"
            :to="'/rutaGrado/' + yo.id"
            class="botonNav"
            id="navRutaGrado"
          >
            <img src="@/assets/iconos/routeSolid.svg" alt="Calendario" />
            Mi ruta de grado
          </router-link>
        </div>

        <div class="bloqueNav" v-if="usuarioSuperadministrador">
          <div class="tituloBloqueNav">Administración</div>

          <router-link
            to="/registro"
            id="navRegistro"
            class="botonNav"
            v-if="usuarioSuperadministrador"
          >
            <img src="@/assets/iconos/userPlus.svg" alt="Crear usuario" />
            Registrar usuario
          </router-link>
        </div>
      </div>

      <div
        id="botonMenuNavUsuario"
        @click.stop="mostrandoNavUsuario = !mostrandoNavUsuario"
        v-if="usuarioLogeado"
      >
        <span>{{ yo.nombres }}</span>
        <img src="@/assets/iconos/user.svg" alt="Usuario" />
      </div>
      <div
        v-if="usuarioLogeado"
        id="contenedorBotonesUsuario"
        class="menuNavDesplegable"
        :class="{ desplegado: mostrandoNavUsuario }"
        @click.stop="cerrarMenus"
      >
        <router-link :to="{ name: 'perfilPersonal' }" class="botonNav">
          <img src="@/assets/iconos/idBadge.svg" alt="Identificación" /> Perfil
          personal
        </router-link>
        <div class="botonNav" @click="deslogearse">
          <img src="@/assets/iconos/xMark.svg" alt="Identificación" /> Salir
        </div>
      </div>
    </div>

    <router-view
      @logearse="logearUsuario"
      @alienandoPersona="alienarPersona"
      id="visorRouter"
      :yo="yo"
    ></router-view>
    <gestor-acciones />
  </div>
</template>

<script>
import gql from "graphql-tag";
import { QUERY_AUTH_USUARIO } from "./globalMixin.js";
import GestorAcciones from "./components/gestorAcciones/GestorAcciones.vue";

export const QUERY_ESTADO_RED = gql`
  query {
    estadoRed
  }
`;
export const QUERY_YO = gql`
  query {
    yo {
      id
      nombres
      apellidos
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
    },
  },
  components: {
    GestorAcciones,
  },
  data() {
    return {
      mostrandoNavUsuario: false,
      accionesLogeado: false,

      yo: {
        atlas: {
          colecciones: [],
          datosNodo: [],
        },
      },

      mostrandoNav: false,
      navSeleccionado: "home",

      errores: [],
    };
  },
  computed: {
    estiloBackground() {
      let primerColor = "#fcff77";

      let segundoColor = "rgba(235, 85, 21, 0.75) 73.16%";

      return {
        background:
          "linear-gradient( 190.19deg, " +
          primerColor +
          " 7.52%, " +
          segundoColor +
          " 73.16%)",
      };
    },
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
  },
  methods: {
    alienarPersona(token) {
      console.log("alienando persona");
      this.$router.push("/home");
      this.logearUsuario(token);
    },
    cerrarMenus() {
      this.mostrandoNav = false;
      this.mostrandoNavUsuario = false;
    },
    setEstadoRed() {
      console.log(`Detectado estado de red en ${navigator.onLine}`);
      const store = this.$apollo.provider.defaultClient;

      store.writeQuery({
        query: QUERY_ESTADO_RED,
        data: {
          estadoRed: navigator.onLine,
        },
      });
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
      };

      store.writeQuery({
        query: QUERY_AUTH_USUARIO,
        data: { auth_usuario: nuevosDatos },
      });

      this.$router.push({ name: "perfilPersonal" });

      this.setEstadoRed();
    },
    async deslogearse() {
      console.log("Navegando a loginArea");
      this.$router.push({ name: "loginScreen" });
      setTimeout(() => {
        this.$nextTick(() => {
          const store = this.$apollo.provider.defaultClient;
          store.writeQuery({
            query: QUERY_AUTH_USUARIO,
            data: { auth_usuario: null },
          });

          store
            .resetStore()
            .then(() => {
              console.log("Store reset");
              this.setEstadoRed();
              this.$router.push({name: "loginScreen"});
            })
            .catch((error) => {
              console.log("Error resetting store: " + error);
              this.setEstadoRed();
            });
        });
      }, 1000);
    },
  },
  watch: {
    mostrandoNav(mostrando) {
      if (mostrando) {
        this.mostrandoNavUsuario = false;
      }
    },
    mostrandoNavUsuario(mostrando) {
      if (mostrando) {
        this.mostrandoNav = false;
      }
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
  overflow-y: scroll;

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  z-index: 0;
}
#app.landing {
  background: linear-gradient(
    190.19deg,
    var(--gradienteFondo1Start) 7.52%,
    var(--gradienteFondo1End) 73.16%
  );
}
#app:not(.landing) {
  background: "unset";
  background-color: whitesmoke;
}

#navBar {
  width: 100%;
  height: 50px;
  align-items: center;
  display: flex;
  z-index: 100;
  position: relative;
  padding: 10px 10px;
  flex-shrink: 0;
}
#botonDesplegarNav {
  width: 20px;
  height: 20px;
}
#botonDesplegarNav img {
  height: 100%;
}
.menuNavDesplegable {
  display: none;
  position: absolute;
  top: 100%;
  flex-direction: column;
  background-color: var(--mainColor);
  box-shadow: 2px 2px 2px 2px rgba(128, 128, 128, 0.493);
}
.menuNavDesplegable.desplegado {
  display: flex;
}
#contenedorBotonesNav {
  flex-direction: column;
  left: 0px;
}

.bloqueNav {
  display: flex;
  flex-direction: column;
}
.tituloBloqueNav {
  font-size: 0.9em;
  text-align: center;
  font-style: italic;
}
.botonNav {
  padding: 25px 33px;
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1.1em;
  max-width: 90vw;
}
.botonNav img {
  height: 19px;
}
#botonMenuNavUsuario {
  margin-left: auto;
  margin-right: 5px;
  font-size: 0.7em;
  display: flex;
  align-items: center;
  gap: 10px;
}
#botonMenuNavUsuario img {
  height: 18px;
}
#contenedorBotonesUsuario {
  right: 0px;
}

#visorRouter {
  width: 100%;
  flex-grow: 1;
  background-color: "#fab467";
  z-index: 10;
}

#atlasConocimiento {
  background-color: "#fab467";
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.disabled {
  opacity: 0.8;
  pointer-events: none;
}

@media screen and (min-width: 900px){
  
}
</style>
