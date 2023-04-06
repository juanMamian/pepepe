<template>
  <div
    class="nodoConocimientoAtlas nodoConocimientoConBola"
    v-if="elNodo && elNodo.id"
    :class="{
      // fantasmeado:
      //   idNodoSeleccionado &&
      //   nivelesConexion &&
      //   !idsRedSeleccion.includes(elNodo.id),
      seleccionado,
      accesible: idsNodosAccesibles.includes(elNodo.id),
      aprendido: idsNodosAprendidos.includes(elNodo.id),
      estudiado: idsNodosEstudiados.includes(elNodo.id),
      olvidado: idsNodosOlvidados.includes(elNodo.id),
    }"
  >
    <div class="bolita">
      <img
        src="@/assets/iconos/crosshairsSolid.svg"
        alt="Mira"
        style="
          filter: var(--filtroAtlasSeleccion);
          transform: translate(-50%, -50%) scale(1.9);
          position: absolute;
          top: 50%;
          left: 50%;
          opacity: 1;
        "
        v-if="idNodoTarget === elNodo.id"
      />
      <slot name="imagenBolita">
        <img
          v-if="elNodo.tipoNodo === 'concepto'"
          src="@/assets/iconos/atlas/lightbulbEmpty.svg"
          alt="Skill"
        />
        <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" />
      </slot>
    </div>

    <div class="cajaTexto">
      {{ elNodo.nombre }}
    </div>

    <div
      class="lineaVinculo"
      v-for="vinculo of vinculosConEstilo.filter((v) => v.estilo)"
      :key="vinculo.id"
      :style="[vinculo.estilo]"
    >
      <div class="laLinea"></div>
    </div>
  </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import { QUERY_DATOS_USUARIO_NODOS } from "./fragsAtlasConocimiento";

const QUERY_ESTE_NODO = gql`
  query ($idNodo: ID!) {
    nodo(idNodo: $idNodo) {
      id
      nombre
      tipoNodo
      autoCoords {
        x
        y
      }
      vinculos {
        id
        idRef
        rol
        tipo
        nodoContraparte {
          autoCoords {
            x
            y
          }
        }
      }
    }
  }
`;

export default {
  name: "NodoConocimientoAtlas",
  props: {
    idNodo: {
      type: String,
      required: true,
    },
    yo: {
      type: Object,
      required: true,
    },
    seleccionado: {
      type: Boolean,
    },
    idNodoSeleccionado: {
      type: String,
    },
    idsNodosAprendidos: {
      type: Array,
      default: () => [],
    },
    idsNodosEstudiados: {
      type: Array,
      default: () => [],
    },
    idsNodosOlvidados: {
      type: Array,
      default: () => [],
    },
    idsNodosAccesibles: {
      type: Array,
      default: [],
    },
    idsUnderTargetActivos: {
      type: Array,
    },
  },
  apollo: {
    elNodo: {
      query: QUERY_ESTE_NODO,
      variables() {
        return {
          idNodo: this.idNodo,
        };
      },
      update({ nodo }) {
        return nodo;
      },
      fetchPolicy: "cache-first",
    },
    yo:{
      query: QUERY_DATOS_USUARIO_NODOS,
      fetchPolicy: "cache-first"
    }
  },
  data() {
    return {
      elNodo: {
        vinculos: [],
      },
    };
  },
  computed: {
    idNodoTarget(){
      return this.yo?.atlas?.idNodoTarget;
    },
    vinculosConEstilo() {
      if (!this.elNodo?.vinculos) return [];

      return this.elNodo.vinculos.map((vinculo) => {
        if (vinculo.rol === "source") {
          return {
            ...vinculo,
          };
        }

        if (!vinculo.nodoContraparte?.autoCoords) {
          return {
            ...vinculo,
          };
        }

        let nodoFrom = this.elNodo;
        let nodoTo = vinculo.nodoContraparte;

        let posFrom = nodoFrom.autoCoords;
        let posTo = nodoTo.autoCoords;

        //Calc angle in radians
        let angle = Math.atan2(posTo.y - posFrom.y, posTo.x - posFrom.x);

        //Calc distance
        let distance = Math.sqrt(
          Math.pow(posTo.y - posFrom.y, 2) + Math.pow(posTo.x - posFrom.x, 2)
        );

        let diametroBolitas = 100;
        let largoLinea = distance;

        let estilo = {
          paddingLeft: Math.round(diametroBolitas / 2) + "px",
          paddingRight: Math.round(diametroBolitas / 2) + "px",
          width: Math.round(largoLinea) + "px",
          transform: "rotate(" + angle + "rad)",
        };
        if (
          this.idNodoTarget &&
          this.idsUnderTargetActivos &&
          !this.idsUnderTargetActivos.includes(vinculo.idRef)
        ) {
          estilo.opacity = 0.1;
        }

        return {
          ...vinculo,
          estilo,
        };
      });
    },
  },
};
</script>
<style scoped>
@import url("@/assets/estilos/nodoConocimientoBola.css");
</style>
