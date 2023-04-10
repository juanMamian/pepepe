<template>
  <div class="coleccionNodosConocimiento" @click="idNodoMenuCx = null">
    <div
      id="zonaBarraProgreso"
      v-show="!$apollo.queries.progresoColeccion.loading"
      @mouseenter="mostrarPorcentajesNodos = true"
      @mouseleave="mostrarPorcentajesNodos = false"
    >
      <div id="barraProgreso">
        <div
          id="barraProgresoVerde"
          :style="[{ width: progresoColeccion + '%' }]"
        ></div>
      </div>

      <div id="numeroProgreso">{{ progresoColeccion }}%</div>
    </div>

    <loading v-show="$apollo.queries.progresoColeccion.loading" />

    <div class="barraSeccion" id="barraSuperior">
      <div
        id="elTitulo"
        v-show="!editandoTitulo"
        @click.stop="iniciarEdicionTitulo"
      >
        {{ estaColeccion.titulo }}
      </div>

      <input
        :class="{ deshabilitado: guardandoNuevoTitulo }"
        type="text"
        id="inputNuevoTitulo"
        style="text-align: center"
        ref="inputNuevoTitulo"
        v-show="editandoTitulo"
        @keypress.enter="guardarNuevoTitulo"
      />
    </div>

    <div class="listaNodos">
      <icono-nodo-conocimiento
        v-for="nodo of nodosConocimiento"
        :key="nodo.id"
        :esteNodo="nodo"
        :seleccionado="idNodoSeleccionado === nodo.id"
        :datosEsteNodo="yo.atlas.datosNodos.find((dn) => dn.idNodo === nodo.id)"
        :mostrarPorcentajeCompletado="mostrarPorcentajesNodos"
        :siendoRemovido="idNodoSiendoRemovido===nodo.id"
        :porcentajeCompletado="
          (progresoNodos.find((info) => info.id === nodo.id) || {})
            .porcentajeCompletado
        "
        :menuCx="idNodoMenuCx === nodo.id"
        :opcionesMenuCx="opcionesMenuCxNodos"
        @contextmenu.native.stop.prevent="idNodoMenuCx = nodo.id"
        @click.self.stop="
          idNodoSeleccionado = idNodoSeleccionado === nodo.id ? null : nodo.id
        "
        @removerme="removerNodo(nodo.id)"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoNodoConocimiento from "./IconoNodoConocimiento.vue";
import Loading from "../utilidades/Loading.vue";
import { charProhibidosNombreCosa } from "../configs";

const QUERY_NODOS_COLECCION = gql`
  query ($idsNodos: [ID!]!) {
    nodosConocimientoByIds(idsNodos: $idsNodos) {
      id
      nombre
      descripcion
      tipoNodo
    }
  }
`;

export default {
  name: "ColeccionNodosConocimiento",
  components: { IconoNodoConocimiento, Loading },
  apollo: {
    nodosConocimiento: {
      query: QUERY_NODOS_COLECCION,
      variables() {
        return {
          idsNodos: this.estaColeccion.idsNodos,
        };
      },
      skip() {
        return !this.estaColeccion?.idsNodos.length > 0;
      },
      update({ nodosConocimientoByIds }) {
        return nodosConocimientoByIds;
      },
    },
    progresoNodos: {
      query: gql`
        query ($idsNodos: [ID!]!) {
          nodosConocimientoByIds(idsNodos: $idsNodos) {
            id
            porcentajeCompletado
          }
        }
      `,
      variables() {
        return {
          idsNodos: this.estaColeccion.idsNodos,
        };
      },
      skip() {
        return !this.nodosConocimiento?.length > 0;
      },
      update({ nodosConocimientoByIds }) {
        return nodosConocimientoByIds;
      },
    },
    progresoColeccion: {
      query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            progreso
          }
        }
      `,
      variables() {
        return {
          idColeccion: this.estaColeccion.id,
          idUsuario: this.yo.id,
        };
      },
      skip() {
        return !this.yo?.id || !this.estaColeccion?.id;
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento.progreso;
      },
    },
  },
  props: {
    estaColeccion: Object,
    yo: Object,
  },
  data() {
    return {
      idNodoSeleccionado: null,
      idNodoMenuCx: null,
      idNodoSiendoRemovido:null,
      nodosConocimiento: [],
      progresoNodos: [],
      progresoColeccion: null,

      editandoTitulo: false,
      guardandoNuevoTitulo: false,

      mostrarPorcentajesNodos: false,

      opcionesMenuCxNodos: [
        {
          texto: "Remover",
          accion: "removerme",
        },
      ],
    };
  },
  methods: {
    iniciarEdicionTitulo() {
      this.$refs.inputNuevoTitulo.value = this.estaColeccion.titulo;
      this.editandoTitulo = true;
    },
    guardarNuevoTitulo() {
      var nuevoNombre = this.$refs.inputNuevoTitulo.value;
      console.log(`seting nombre de coleccion con value: ${nuevoNombre}`);
      if (charProhibidosNombreCosa.test(nuevoNombre)) {
        alert("¡El nombre contenía caracteres ilegales!");
        return true;
      }
      this.guardandoNuevoTitulo = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $nuevoNombre: String!) {
              setNombreColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                nuevoNombre: $nuevoNombre
              ) {
                id
                atlas {
                  colecciones {
                    id
                    nombre
                  }
                }
              }
            }
          `,
          variables: {
            idColeccion: this.estaColeccion.id,
            nuevoNombre,
          },
        })
        .then(() => {
          this.guardandoNuevoTitulo = false;
          this.editandoTitulo = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.guardandoNuevoTitulo = false;
        });
    },
    removerNodo(idNodo) {
      this.idNodoSiendoRemovido = idNodo;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idColeccion: ID!, $idNodo: ID!) {
              removeNodoColeccionNodosAtlasConocimientoUsuario(
                idColeccion: $idColeccion
                idNodo: $idNodo
              )
            }
          `,
          variables: {
            idColeccion: this.estaColeccion.id,
            idNodo,
          },
        })
        .then(() => {
          this.idNodoSiendoRemovido = null;
          this.idNodoSeleccionado = null;

          const store=this.$apollo.provider.defaultClient;
          const cache=store.readQuery({
            query: QUERY_NODOS_COLECCION,
            variables:{
              idsNodos: this.estaColeccion.idsNodos,
            }
          });

          let nuevoCache=JSON.parse(JSON.stringify(cache));

          const indexN=nuevoCache.nodosConocimientoByIds.findIndex(n=>n.id===idNodo);

          if(indexN>-1){
            nuevoCache.nodosConocimientoByIds.splice(indexN, 1);

            store.writeQuery({
              query: QUERY_NODOS_COLECCION,
              variables:{
                idsNodos: this.estaColeccion.idsNodos,
              },
              data: nuevoCache
            })
          }
          else{
            console.log(`El nodo no estaba en la colección.`);
          }


        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.idNodoSiendoRemovido = null;
        });
    },
  },
};
</script>

<style scoped>
.listaNodos {
  display: flex;
  padding: 20px 20px;
  padding-bottom: 90px;
  gap: 60px;
  flex-wrap: wrap;
}

#barraProgreso {
  background-color: gray;
  height: 12px;
  width: 100%;
}
#barraProgresoVerde {
  background-color: green;
  height: 100%;
}

#numeroProgreso {
  width: 100%;
  text-align: center;
}

#barraSuperior {
  display: flex;
  justify-content: center;
}
</style>