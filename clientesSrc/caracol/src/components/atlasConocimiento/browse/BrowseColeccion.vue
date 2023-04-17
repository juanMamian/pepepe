<template>
  <div class="browseColeccion">
    <div
      id="iconoProgresoUsuario"
      :style="[estiloIconoProgresoUsuario]"
      v-if="coleccionSeleccionadaNullificable"
    >
      <pie-progreso
        :progreso="coleccionSeleccionadaNullificable.progreso"
        :size="120"
        :factorArco="0.1"
        v-if="usuario?.id"
        colorFondo="transparent"
      >
        <div id="contenedorFotoUsuario">
          <img
            ref="imagenUsuario"
            :src="serverUrl + '/api/usuarios/fotografias/' + usuario?.id"
            alt="Fotografía"
          />
        </div>
      </pie-progreso>
      <div
        id="indicadorProgreso"
        v-if="coleccionSeleccionadaNullificable"
        v-show="coleccionSeleccionadaNullificable?.progreso"
      >
        {{ coleccionSeleccionadaNullificable.progreso }}%
      </div>
    </div>
    <diagrama-arbol
      v-if="coleccionSeleccionadaNullificable"
      ref="diagramaArbol"
      :idsRoot="coleccionSeleccionadaNullificable.idsNodos"
      :idsRed="coleccionSeleccionadaNullificable.idsRed"
      :idNodoSeleccionado="idNodoSeleccionado"
      @seleccionNodo="$emit('seleccionNodo', $event)"
    ></diagrama-arbol>
  </div>
</template>

<script>
import diagramaArbol from "../diagramaArbol.vue";
import PieProgreso from "../../utilidades/PieProgreso.vue";
import GestorColecciones from "../GestorColecciones.vue";

import { gql } from "@apollo/client/core";
const QUERY_COLECCION = gql`
  query ($idColeccion: ID!, $idUsuario: ID!) {
    coleccionNodosConocimiento(
      idUsuario: $idUsuario
      idColeccion: $idColeccion
    ) {
      id
      nombre
      idsNodos
      idsRed
      progreso
    }
  }
`;

export default {
  name: "BrowseColeccion",
  components: {
    PieProgreso,
    diagramaArbol,
    GestorColecciones,
  },
  props: {
    idColeccion: {
      type: String,
    },
    idNodoSeleccionado:{
      type: String,
    }
  },
  apollo: {
    coleccionSeleccionada: {
      query: QUERY_COLECCION,
      variables() {
        return {
          idColeccion: this.idColeccion,
          idUsuario: this.usuario?.id,
        };
      },
      skip() {
        return !this.usuario?.id || !this.idColeccion;
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento;
      },
      fetchPolicy: "cache-first",
    },
  },
  data() {
    return {
      coleccionSeleccionada: {
        idsNodos: [],
        idsRed: [],
      },
      anchoContenedorArbol: null,
    };
  },
  computed: {
    coleccionSeleccionadaNullificable() {
      if (this.$apollo.queries?.coleccionSeleccionada?.skip) {
        return null;
      }
      return this.coleccionSeleccionada;
    },
    estiloIconoProgresoUsuario() {
      let left = "50%";
      let anchoAjustado = this.anchoContenedorArbol;
      if (anchoAjustado) {
        left = anchoAjustado / 2 + "px";
      }
      return {
        left: left,
      };
    },
  },
  methods: {},
  watch: {
    coleccionSeleccionadaNullificable: {
      handler: function (col) {
        if (col?.nombre) {
          document.title = col.nombre;
        }
      },
      immediate: true,
    },
  },
};
</script>
<style scoped>
.browseColeccion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding-top:100px;
  position: relative;
  z-index: 1;
}
#iconoProgresoUsuario {
  align-self: flex-start;
  width: fit-content;
  position: relative;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;

}
#contenedorFotoUsuario {
  border-radius: 50%;
  height: 100px;
  width: 100px;
  overflow: hidden;
}
#contenedorFotoUsuario img {
  height: 100%;
}
#nombreColeccion {
  padding: 10px 20px;
  border-radius: 9px;
  background-color: var(--atlasConocimientoSeleccion);
  text-align: center;
  cursor: pointer;
  margin: 10px auto;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
#nombreColeccion img {
  height: 20px;
}
.diagramaArbol {
  width: 100%;
  align-self: flex-start;
}
</style>
