<template>
  <div id="tablaAdministracion">
    <div id="barraSuperior">
      <div id="contenedorBotonesCrear">
        <div id="bloqueMovimientosDinero" class="bloqueCrearItems">
          <div
            class="botonBarraSuperior boton"
            :style="{ opacity: mostrarMovimientosDinero ? 1 : 0.5 }"
            :title="
              mostrarMovimientosDinero
                ? 'Ocultar movimientos de dinero'
                : 'Mostrar movimientos de dinero'
            "
            @click.stop="mostrarMovimientosDinero = !mostrarMovimientosDinero"
          >
            <img src="@/assets/iconos/receipt.svg" alt="Factura" />
          </div>
          <div
            class="botonBarraSuperior boton"
            :style="{ opacity: mostrarMovimientosArbol ? 1 : 0.5 }"
            :title="
              mostrarMovimientosDinero
                ? 'Ocultar movimientos de sub-nodos'
                : 'Mostrar movimientos de sub-nodos'
            "
            @click.stop="mostrarMovimientosArbol = !mostrarMovimientosArbol"
          >
            <img src="@/assets/iconos/network.svg" alt="Arbol" />
          </div>
          <div
            class="botonBarraSuperior boton"
            v-show="!creandoNuevoMovimiento"
          >
            <img
              src="@/assets/iconos/plusCircle.svg"
              alt="Mas"
              title="Crear nuevo movimiento de dinero"
              @click.stop="crearNuevoItemMovimientoDinero"
            />
          </div>
          <loading texto="" v-show="creandoNuevoMovimiento" />
        </div>

        <div id="bloqueEventos" class="bloqueCrearItems">
          <div
            class="botonBarraSuperior boton"
            :style="{ opacity: mostrarEventos ? 1 : 0.5 }"
            :title="mostrarEventos ? 'Ocultar eventos' : 'Mostrar eventos'"
            @click.stop="mostrarEventos = !mostrarEventos"
          >
            <img
              src="@/assets/iconos/exclamationCircle.svg"
              alt="Exclamación"
            />
          </div>
          <div
            class="botonBarraSuperior boton"
            :style="{ opacity: mostrarEventosArbol ? 1 : 0.5 }"
            :title="
              mostrarEventos
                ? 'Ocultar eventos de sub-nodos'
                : 'Mostrar eventos de sub-nodos'
            "
            @click.stop="mostrarEventosArbol = !mostrarEventosArbol"
          >
            <img src="@/assets/iconos/network.svg" alt="Arbol" />
          </div>
          <div class="botonBarraSuperior boton" v-show="!creandoNuevoEvento">
            <img
              src="@/assets/iconos/plusCircle.svg"
              alt="Mas"
              title="Crear nuevo evento"
              @click.stop="crearNuevoItemEvento"
            />
          </div>
          <loading texto="" v-show="creandoNuevoEvento" />
        </div>
      </div>
    </div>

    <div id="laTabla">
      <div class="campoItem" v-for="item of items" :key="item.id">
        <item-tabla-movimiento-dinero
          :usuarioResponsableAmplioNodo="usuarioResponsableAmplioNodo"
          :idNodo="idNodo"
          :esteMovimiento="item"
          v-if="item.__typename === 'MovimientoDineroNodoSolidaridad'"
          @meElimine="eliminarMovimientoCache(item.id)"
        />
        <item-tabla-evento
          :esteEvento="item"
          :usuarioResponsableAmplioNodo="usuarioResponsableAmplioNodo"
          :idNodo="idNodo"
          :esteMovimiento="item"
          v-if="item.__typename === 'EventoNodoSolidaridad'"
          @meElimine="eliminarEventoCache(item.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import {
  fragmentoEventoNodoSolidaridad,
  fragmentoMovimientoDineroNodoSolidaridad,
} from "../../frags";
import ItemTablaMovimientoDinero from "../tablaAdministracion/ItemTablaMovimientoDinero.vue";
import Loading from "../../../utilidades/Loading.vue";
import ItemTablaEvento from "../tablaAdministracion/ItemTablaEvento.vue";
import {QUERY_ESTE_NODO} from "../HomeNodo.vue"
export default {
  components: { ItemTablaMovimientoDinero, Loading, ItemTablaEvento },
  name: "TablaAdministracion",

  props: {
    movimientos: Array,
    eventos: Array,
    idNodo: String,
    usuarioResponsableAmplioNodo: Boolean,
    subNodos: Array,
  },
  data() {
    return {
      mostrarMovimientosDinero: true,
      creandoNuevoMovimiento: false,
      mostrarMovimientosArbol:true,

      mostrarEventos: true,
      creandoNuevoEvento: false,
      mostrarEventosArbol:true,
      
    };
  },
  methods: {
    crearNuevoItemMovimientoDinero() {
      this.creandoNuevoMovimiento = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              crearNuevoMovimientoDineroNodoSolidaridad(idNodo: $idNodo) {
                ...fragMovimientoDineroNodoSolidaridad
              }
            }
            ${fragmentoMovimientoDineroNodoSolidaridad}
          `,
          variables: {
            idNodo: this.$route.params.id,
          },
        })
        .then(({ data: { crearNuevoMovimientoDineroNodoSolidaridad } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_ESTE_NODO,
            variables: {
              idNodo: this.idNodo
            },
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var movimientosDinero = nuevoCache.nodoSolidaridad.movimientosDinero;

          const indexN = movimientosDinero.findIndex(
            (mv) => mv.id === crearNuevoMovimientoDineroNodoSolidaridad.id
          );
          if (indexN === -1) {
            movimientosDinero.push(crearNuevoMovimientoDineroNodoSolidaridad);
            store.writeQuery({
              query: QUERY_ESTE_NODO,
              variables: {
                idNodo: this.idNodo
              },
              data: nuevoCache,
            });
          }
          this.creandoNuevoMovimiento = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoNuevoMovimiento = false;
        });
    },
    crearNuevoItemEvento() {
      this.creandoNuevoEvento = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              crearNuevoEventoNodoSolidaridad(idNodo: $idNodo) {
                ...fragEventoNodoSolidaridad
              }
            }
            ${fragmentoEventoNodoSolidaridad}
          `,
          variables: {
            idNodo: this.$route.params.id,
          },
        })
        .then(({ data: { crearNuevoEventoNodoSolidaridad } }) => {
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_ESTE_NODO,
            variables: {
              idNodo: this.idNodo
            },
          });

          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var eventos = nuevoCache.nodoSolidaridad.eventos;

          const indexN = eventos.findIndex(
            (ev) => ev.id === crearNuevoEventoNodoSolidaridad.id
          );
          if (indexN === -1) {
            eventos.push(crearNuevoEventoNodoSolidaridad);
            store.writeQuery({
              query: QUERY_ESTE_NODO,
              variables: {
                idNodo: this.idNodo
              },
              data: nuevoCache,
            });
          }
          this.creandoNuevoEvento = false;

        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoNuevoEvento = false;
        });
    },
    eliminarMovimientoCache(idMovimientoEliminado){
      console.log(`Eliminando mov de cache`);
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESTE_NODO,
        variables: {
          idNodo: this.idNodo,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var movimientosDinero = nuevoCache.nodoSolidaridad.movimientosDinero;

      const indexN = movimientosDinero.findIndex(
        (md) => md.id === idMovimientoEliminado
      );
      if (indexN > -1) {
        movimientosDinero.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_ESTE_NODO,
          variables: {
            idNodo: this.idNodo,
          },
          data: nuevoCache,
        });
      }
      
    },
    eliminarEventoCache(idEventoEliminado){
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_ESTE_NODO,
        variables: {
          idNodo: this.idNodo,
        },
      });

      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var eventos = nuevoCache.nodoSolidaridad.eventos;

      const indexN = eventos.findIndex(
        (e) => e.id === idEventoEliminado
      );
      if (indexN > -1) {
        eventos.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_ESTE_NODO,
          variables: {
            idNodo: this.idNodo,
          },
          data: nuevoCache,
        });
      }
      
    }
  },
  computed: {
    items() {
      var items = [];
      if (this.mostrarMovimientosDinero) {
        items = items.concat(this.movimientos);
        if(this.mostrarMovimientosArbol){
          items=items.concat(this.movimientosDineroSubnodos);
        }
      }
      if (this.mostrarEventos) {
        items = items.concat(this.eventos);
        if(this.mostrarEventosArbol){
          items=items.concat(this.eventosSubnodos);
        }
      }
      items.sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha));
      return items;
    },
    movimientosDineroSubnodos() {
      var todosMovimientos = [];
      this.subNodos.forEach((subnodo) => {
        todosMovimientos.push(
          ...subnodo.movimientosDinero.map((md) => {
            return {
              ...md,
              nodoOwner: {
                id: subnodo.id,
                nombre: subnodo.nombre,
                tipoNodo: subnodo.tipoNodo,
              },
            };
          })
        );
      });

      return todosMovimientos;
    },
    eventosSubnodos() {
      var todosEventos = [];
      this.subNodos.forEach((subnodo) => {
        todosEventos.push(
          ...subnodo.eventos.map((ev) => {
            return {
              ...ev,
              nodoOwner: {
                id: subnodo.id,
                nombre: subnodo.nombre,
                tipoNodo: subnodo.tipoNodo,
              },
            };
          })
        );
      });

      return todosEventos;
    },
  },
};
</script>

<style scoped>
#barraSuperior {
  display: flex;
  margin-bottom: 25px;
}
.botonBarraSuperior {
  margin: 0px 10px;
  width: 15px;
  height: 15px;
  cursor: pointer;
  opacity: 0.7;
}
.botonBarraSuperior:hover {
  opacity: 1;
}
.botonBarraSuperior img {
  width: 100%;
  height: 100%;
}
#contenedorBotonesCrear {
  margin-left: auto;
}
.bloqueCrearItems {
  display: flex;
  margin-bottom: 10px;
  padding-right: 1vw;
}

.bloqueCrearItems .boton {
  margin: 0px 5px;
}
</style>