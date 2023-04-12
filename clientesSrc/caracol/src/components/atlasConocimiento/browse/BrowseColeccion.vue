<template>
  <div class="browseColeccion">
    <gestor-colecciones
      v-if="idColeccion"
      :idColeccionInicial="idColeccion"
      @coleccionSeleccionada="cambiarDeColeccion"
    >
    </gestor-colecciones>
    <div
      id="iconoProgresoUsuario"
      :style="[estiloIconoProgresoUsuario]"
      v-if="coleccionSeleccionada"
    >
      <pie-progreso
        :progreso="coleccionSeleccionada.progreso"
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
        v-if="coleccionSeleccionada"
        v-show="coleccionSeleccionada?.progreso"
      >
        {{ coleccionSeleccionada.progreso }}%
      </div>
    </div>
    <diagrama-arbol
      v-if="coleccionSeleccionada"
      ref="diagramaArbol"
      :idsRoot="coleccionSeleccionada.idsNodos"
      :idsRed="coleccionSeleccionada.idsRed"
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
  },
  apollo: {},
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
  methods: {
    cambiarDeColeccion(coleccion) {
      if (coleccion?.id) {
        this.coleccionSeleccionada = coleccion;
        this.$router.push({
          name: "browseColeccion",
          params: { idColeccion: coleccion.id },
        });
      } else {
      }
    },
  },
  watch: {
    coleccionSeleccionada: {
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
}
#iconoProgresoUsuario {
  align-self: flex-start;
  width: fit-content;
  position: relative;
  transform: translateX(-50%);
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
