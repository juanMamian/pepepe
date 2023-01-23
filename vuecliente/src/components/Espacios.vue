<template>
  <div class="espacios">
    <router-view
      id="visorVentanaEventoPublico"
      @meRepetiPeriodicamente="manejarCreacionEventos"
      @eventoCambioFecha="manejarCreacionEventos([$event])"
    >
    </router-view>
    

    <div class="barraSeccion" @click="mostrandoEspacios = !mostrandoEspacios">
      <img
        src="@/assets/iconos/angleDown.svg"
        style="height: 20px"
        alt="Abrir"
        :style="[{ transform: mostrandoEspacios ? 'none' : 'rotate(-90deg)' }]"
      />
      Espacios

      <div class="contenedorControles" v-show="mostrandoEspacios" @click.stop="" style="margin-left: auto">
        <div
          class="boton"
          @click="mostrandoConfiguracion = !mostrandoConfiguracion"
        >
          <img src="@/assets/iconos/cog.svg" alt="Config" style="" />
        </div>
        <div
          class="boton"
          @click.stop="crearNuevoEspacio"
          v-show="mostrandoEspacios && !creandoEspacio"
        >
          <img src="@/assets/iconos/plusCircle.svg" alt="Crear" style="" />
        </div>
        <loading texto="" v-show="creandoEspacio" />
      </div>
    </div>

    <div class="zonaConfiguracion" v-show="mostrandoConfiguracion && mostrandoEspacios">
      <div class="barraSeccion">
        Configuración
      </div>
      <div class="contenedorBloquesConfiguracion">
        <div class="bloqueConfiguracion">
          <div class="campoConfiguracion">
            Mostrar: 
            <label for="checkMostrarTodosEspacios"
              >Mis espacios</label
            >
            <input
              type="radio"
              name="checkMostrarTodosEspacios"
              id="checkMostrarTodosEspacios"
              ref="checkMostrarTodosEspacios"
              value="mios"
              v-model="tipoMostrarEspacios"
            />

            <label for="checkMostrarTodosEspacios"
              >Todos los espacios</label
            >
            <input
              type="radio"
              name="checkMostrarTodosEspacios"
              id="checkMostrarTodosEspacios"
              ref="checkMostrarTodosEspacios"
              value="todos"
              v-model="tipoMostrarEspacios"
            />
          </div>
        </div>
      </div>
    </div>
    <div id="listaEspacios" v-show="mostrandoEspacios">
      <div
        class="anuncioZonaVacia"
        v-if="!espaciosVisibles || espaciosVisibles.length < 1"
      >
        Aún no hay espacios
      </div>
      <espacio
        v-for="espacio of espaciosVisibles"
        ref="espacios"
        :key="espacio.id"
        :esteEspacio="espacio"
        @meElimine="eliminarEspacioCache(espacio.id)"
      />
    </div>

    <div
      class="barraSeccion"
      @click="mostrandoOrganizadorSemanal = !mostrandoOrganizadorSemanal"
    >
      <img
        src="@/assets/iconos/angleDown.svg"
        style="height: 20px"
        alt="Abrir"
        :style="[
          {
            transform: mostrandoOrganizadorSemanal ? 'none' : 'rotate(-90deg)',
          },
        ]"
      />
      Calendario semanal
    </div>

    <organizador-horario-semanal
      v-show="mostrandoOrganizadorSemanal"
      ref="organizadorSemanal"
      :yo="yo"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import Espacio from "./Espacio.vue";
import Loading from "./utilidades/Loading.vue";
import OrganizadorHorarioSemanal from "./calendario/OrganizadorHorarioSemanal.vue";
import { fragmentoEspacio } from "./frags";

const QUERY_ESPACIOS = gql`
  query {
    todosEspacios {
      ...fragEspacio
    }
  }
  ${fragmentoEspacio}
`;

export default {
  components: { Espacio, Loading, OrganizadorHorarioSemanal },
  props: {
    yo: Object,
  },
  apollo: {
    todosEspacios: {
      query: QUERY_ESPACIOS,
    },
  },
  name: "Espacios",
  data() {
    return {
      todosEspacios: [],

      verTodos: false,
      creandoEspacio: false,

      mostrandoEspacios: false,
      mostrandoOrganizadorSemanal: false,

      mostrandoConfiguracion: false,
      tipoMostrarEspacios: "mios",
    };
  },
  methods: {
    crearNuevoEspacio() {
      this.creandoEspacio = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($info: InputCrearEspacio) {
              crearEspacio(info: $info) {
                ...fragEspacio
              }
            }
            ${fragmentoEspacio}
          `,
          variables: {
            info: {
              idAdministrador: this.usuario.id,
            },
          },
        })
        .then(({ data: { crearEspacio } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_ESPACIOS,
          });
          const nuevoCache = JSON.parse(JSON.stringify(cache));

          const indexE = nuevoCache.todosEspacios.findIndex(
            (e) => e.id === crearEspacio.id
          );
          if (indexE === -1) {
            nuevoCache.todosEspacios.push(crearEspacio);
            store.writeQuery({
              query: QUERY_ESPACIOS,
              data: nuevoCache,
            });
          } else {
            console.log(`El espacio ya estaba en caché`);
          }
          this.creandoEspacio = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoEspacio = false;
        });
    },
    eliminarEspacioCache(idEspacio) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESPACIOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexE = nuevoCache.todosEspacios.findIndex(
        (e) => e.id === idEspacio
      );
      if (indexE > -1) {
        nuevoCache.todosEspacios.splice(indexE, 1);
        store.writeQuery({
          query: QUERY_ESPACIOS,
          data: nuevoCache,
        });
      }
    },
    manejarCreacionEventos(eventos) {
      console.log(
        `Manejando la repeticion de los eventos de un espacio con id ${eventos[0].idParent}`
      );
    },
    handleCambioFechaEvento() {
      console.log(`Handling`);
    },
  },
  computed: {
    usuarioProfe() {
      if (!this.usuarioLogeado) return false;

      return this.usuario.permisos.includes("maestraVida-profesor");
    },
    espaciosVisibles() {
      if (this.tipoMostrarEspacios==='todos')
        return this.espaciosUsuario.concat(this.espaciosNoUsuario);
      return this.espaciosUsuario;
    },
    espaciosUsuario() {
      if (!this.usuarioLogeado) return [];
      return this.todosEspacios.filter(
        (e) => e.idAdministrador === this.usuario.id
      );
    },
    espaciosNoUsuario() {
      if (!this.usuarioLogeado) return this.todosEspacios;
      return this.todosEspacios.filter(
        (e) => e.idAdministrador != this.usuario.id
      );
    },
  },
  watch: {
    mostrandoOrganizadorSemanal(mostrando) {
      if (mostrando) {
        this.$refs.organizadorSemanal.$apollo.queries.espacios.refetch();
      }
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.$refs.organizadorSemanal.checkVentanaBloque()) {
      console.log("Había bloque en ventana");
      return;
    }

    next();
  },
};
</script>

<style scoped>
#barraControles {
  display: flex;
  flex-direction: row-reverse;
  padding: 10px 20px;
}

.botonControl {
  width: 20px;
  height: 20px;
}
#listaEspacios {
  margin: 20px;
  width: min(600px, 95vw);
  margin-bottom: 100px;
}
.espacio {
  margin: 10px 0px;
}
.espacio:hover {
  background-color: var(--grisHover);
}
</style>