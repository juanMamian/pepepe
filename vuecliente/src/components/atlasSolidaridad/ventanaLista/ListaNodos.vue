<template>
  <div
    id="listaNodos"
    @mousedown.stop=""
    @touchmove.stop=""
    @touchstart.stop=""
    @touchend.stop=""
    @mouseleave.stop="idNodoEnArrastre = null; tipoNodoSourceArrastre=null;"
    @mouseup.stop="idNodoEnArrastre = null; tipoNodoSourceArrastre=null;"
  >
    <transition-group name="unfoldVertical" tag="div" id="laListaNodos">
      <nodo-vista-lista
        v-for="(nodoPrimerNivel, index) of nodosPrimerNivel"
        ref="nodosEnLista"
        :id="'nodoEnLista' + nodoPrimerNivel.id"
        :key="'nodoLista' + nodoPrimerNivel.id"
        :esteNodo="nodoPrimerNivel"
        :idNodoSeleccionado="idNodoSeleccionado"
        :verCompletados="verCompletados"
        :verAsumidos="verAsumidos"
        :verVacios="verVacios"
        :modoLista="modoLista"
        :indiceNodosUnder="indiceNodosUnder"
        :idsNodosNeedingFetchMore="idsNodosNeedingFetchMore"
        :nodoSiendoArrastrado="idNodoEnArrastre"
        :usuarioResponsableAmplioNodoOver="usuarioResponsableAmplioNodoRoot"
        :idNodoOver="idNodoRoot"
        :tipoNodoOver="tipoNodoRoot"
        :index="index"
        @nodoSeleccionado="$emit('nodoSeleccionado', $event)"
        @nodosRenderizados="$emit('nodosRenderizados', $event)"
        @inicioArrastre="iniciarArrastre($event)"
        @finDeArrastre="finalizarArrastre"
        @toggleContenidoTodos="toggleContenidoTodos"
        @nodoEliminado="$emit('nodoEliminado', $event)"
        @meElimine="$emit('nodoEliminado', nodoPrimerNivel.id)"
        @nodoSolidaridadCreado="$emit('nodoSolidaridadCreado', $event)"
      />
    </transition-group>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { fragmentoNodoSolidaridad, fragmentoPersonaAtlas } from "../frags";
import NodoVistaLista from "./NodoVistaLista.vue";
export default {
  components: { NodoVistaLista },
  name: "ListaNodos",
  props: {
    usuarioResponsableAmplioNodoRoot: Boolean,
    idNodoSeleccionado: String,
    todosNodos: Array,
    verCompletados: Boolean,
    verAsumidos: Boolean,
    verVacios: Boolean,
    idNodoRoot: String,
    tipoNodoRoot:String,
    nodoRoot:Object,
    indiceNodosUnder: Object,
    modoLista: {
      type: String,
      default: "todo",
    },
    idsNodosNeedingFetchMore: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      idNodoEnArrastre: null,
      idNodoSourceArrastre: null,
      tipoNodoSourceArrastre:null,
    };
  },
  methods: {
    guardarChildren(nodo) {
      nodo.children = this.nodosTodos.filter((n) => n.nodoParent === nodo.id);
    },
    desplegarCascadaHaciaNodo(idNodoTarget) {
      this.$refs.nodosEnLista.forEach((nodo) => {
        nodo.desplegarIfTargetUnder(idNodoTarget);
      });
    },
    scrollToNodo(idNodo) {
      const domSeleccionado = document.getElementById("nodoEnLista" + idNodo);
      const topSeleccionado =
        domSeleccionado.getBoundingClientRect().top -
        this.$el.getBoundingClientRect().top;
      this.$el.scrollTop = topSeleccionado;
    },
    centrarEnItem(idNodo) {
      this.desplegarCascadaHaciaNodo(idNodo);
      this.$nextTick(() => {
        this.scrollToNodo(idNodo);
        if (this.idNodoSeleccionado != idNodo) {
          this.$emit("nodoSeleccionado", idNodo);
        }
      });
    },
    iniciarArrastre({ idNodoArrastrado, idNodoSource, tipoNodoSource }) {
      this.idNodoEnArrastre = idNodoArrastrado;
      this.idNodoSourceArrastre = idNodoSource;
      this.tipoNodoSourceArrastre=tipoNodoSource;
    },
    finalizarArrastre({ idNodoTarget, tipoNodoTarget, index }) {
      if (!this.idNodoEnArrastre || !this.tipoNodoSourceArrastre) {
        console.log(`Datos de arrastre insuficientes`);
        return;
      }

      const infoArrastre = {
        idNodoRequerido: this.idNodoEnArrastre,
        idNodoSource: this.idNodoSourceArrastre,
        tipoNodoSource: this.tipoNodoSourceArrastre,
        idNodoTarget,
        tipoNodoTarget,
        index,
      };
      this.idNodoEnArrastre = null;
      this.tipoNodoSourceArrastre=null;
      

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodoRequerido: ID!
              $idNodoSource: ID!
              $tipoNodoSource: String!
              $idNodoTarget: ID!
              $tipoNodoTarget: String!
              $index: Int
            ) {
              transferirRequerimentoBetweenNodosSolidaridad(
                idNodoRequerido: $idNodoRequerido
                idNodoSource: $idNodoSource
                tipoNodoSource: $tipoNodoSource
                idNodoTarget: $idNodoTarget
                tipoNodoTarget: $tipoNodoTarget
                index: $index
              ) {
                nodosModificados{
                  ...fragNodoSolidaridad                
                }
                usuariosModificados{
                  ...fragPersonaAtlas
                }
              }
            }
            ${fragmentoNodoSolidaridad}
            ${fragmentoPersonaAtlas}
          `,
          variables: infoArrastre,
        })
        .then(() => {
          this.$emit("nodoSeleccionado", infoArrastre.idNodoRequerido);
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    toggleContenidoTodos({ contenido, estado }) {
      console.log(`Setting en todos ${contenido}. Mostrar: ${estado}`);
      this.$refs.nodosEnLista.forEach((n) =>
        n.globalSetMostrarContenido(contenido, estado)
      );
    },
  },
  computed: {    
    nodosPrimerNivel() {
      var nodosPrimerNivel = this.todosNodos.filter(
        (n) =>
          this.nodoRoot.vinculos.map(v=>v.idRef).includes(n.id)
      ).sort((a, b)=>this.nodoRoot.vinculos.findIndex(v=>v.idRef===a.id) - this.nodoRoot.vinculos.findIndex(v=>v.idRef===b.id));      
      return nodosPrimerNivel;
    },
  },
  watch: {
    idNodoEnArrastre(idNodoEnArrastre) {
      if (!idNodoEnArrastre) {
        this.idNodoSourceArrastre = null;
        this.tipoNodoSourceArrastre=null;
      }
    },
    nodosPrimerNivel(nodos){
      this.$emit("nodosRenderizados", nodos.map(n=>n.id))
    }
  },
};
</script>

<style scoped>
#listaNodos {
  left: 0%;
  position: relative;
  overflow: scroll;
}
#botonAbrir {
  cursor: pointer;
  opacity: 0.5;
}
#botonAbrir:hover {
  opacity: 1;
}

#activarNodosUsuarioResponsable {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
}
#barraConfiguracionListaNodos {
  padding: 3px 10px;
}
.botonConfiguracion {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid green;
  background-color: green;
  cursor: pointer;
}

.unfoldVertical-enter,
.unfoldVertical-leave-to {
  height: 0px;
}
.unfoldVertical-enter-active,
.unfoldVertical-leave-active {
  transition: height 0.1s;
}
</style>