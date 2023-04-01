<template>
  <div
    class="nodoConocimientoAtlas"
    v-if="elNodo && elNodo.id"
    :class="{
      // fantasmeado:
      //   idNodoSeleccionado &&
      //   nivelesConexion &&
      //   !idsRedSeleccion.includes(elNodo.id),      
      seleccionado,
      aprendido: idsNodosAprendidos.includes(elNodo.id),
      estudiado: idsNodosEstudiados.includes(elNodo.id),
      fresco: idsNodosFrescos.includes(elNodo.id),
      aprendible:
        idsNodosEstudiables.includes(elNodo.id) ||
        !elNodo.vinculos.some(
          (v) => v.tipo === 'continuacion' && v.rol === 'target'
        ),
      repasar: idsNodosRepasar.includes(elNodo.id),
    }"
  >
    <div
      class="boton"
      id="botonRastrear"
      v-show="idNodoSeleccionado === elNodo.id || idNodoTarget == elNodo.id"
    >
      <img
        src="@/assets/iconos/crosshairsSolid.svg"
        alt="Rastrear"
        :style="[
          {
            filter:
              idNodoTarget === elNodo.id
                ? 'var(--filtroAtlasSeleccion)'
                : 'none',
          },
        ]"
        @click.stop="
          $emit('setNodoTarget', idNodoTarget === elNodo.id ? null : elNodo.id)
        "
      />
    </div>
    <div class="bolita">
      <img
        v-if="elNodo.tipoNodo === 'concepto'"
        src="@/assets/iconos/atlas/lightbulbEmpty.svg"
        alt="Skill"
      />
      <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" />
    </div>

    <div class="cajaTexto">
      {{ elNodo.nombre }}

      <div
        class="boton"
        v-show="idNodoSeleccionado == elNodo.id"
        id="botonAbrir"
      >
        <img
          src="@/assets/iconos/expandSolid.svg"
          alt="Abrir"
          @click.stop="
            $router.push({
              name: 'visorNodoConocimiento',
              params: { idNodo: elNodo.id },
            })
          "
        />
      </div>
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
    idsNodosFrescos: {
      type: Array,
      default: () => [],
    },
    idsNodosEstudiables: {
      type: Array,
      default: () => [],
    },
    idsNodosRepasar: {
      type: Array,
      default: () => [],
    },
    idNodoTarget: {
      type: String,
      default: null,
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
  },
  data() {
    return {
      elNodo: {
        vinculos: [],
      },
    };
  },
  computed: {
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
.nodoConocimientoAtlas {
  position: absolute;
  cursor: pointer;
}
.nodoConocimientoAtlas #botonRastrear {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
}

.nodoConocimientoAtlas .bolita {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f2f2f2;
  padding: 22px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.nodoConocimientoAtlas .bolita img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.3;
}

.nodoConocimientoAtlas .cajaTexto {
  position: absolute;
  top: calc(100% + 20px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.2em;
  padding: 10px 10px;
  border-radius: 5px;
  text-align: center;
  width: 200%;
  z-index: 1;
  color: #030303;
  background-color: #f2f2f2;
}

.nodoConocimientoAtlas .cajaTexto #botonAbrir {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
}

/* #region conexiones con seleccionado */
.nodoConocimientoAtlas.fantasmeado {
  opacity: 0.1;
}

.nodoConocimientoAtlas.continuacionSeleccionado .bolita {
  border: 2px solid var(--atlasConocimientoSeleccion);
}

.nodoConocimientoAtlas.previoSeleccionado .bolita {
  border: 2px solid var(--atlasConocimientoSeleccion);
}

/* #endregion */

/* #region aprendible */
.nodoConocimientoAtlas.aprendible .bolita {
}
.nodoConocimientoAtlas.aprendible .bolita img {
  opacity: 1;
}

/* #endregion */

/* #region estudiado */
.nodoConocimientoAtlas.estudiado .bolita {
  background-color: var(--atlasConocimientoCheck);
}
/* #endregion */

/* #region repasar */
.nodoConocimientoAtlas.repasar .bolita {
  background-color: var(--atlasConocimientoRepasar);
}

/* #endregion */

/* #region Aprendido */
.nodoConocimientoAtlas.aprendido .bolita {
  background-color: var(--atlasConocimientoCheck);
}

.nodoConocimientoAtlas.aprendido .bolita img {
  /* filter to white */
  filter: invert(1);
}
/* #endregion */

/* #region seleccionado */
.nodoConocimientoAtlas.seleccionado .bolita {
  border: 3px solid var(--atlasConocimientoSeleccion);
}

.nodoConocimientoAtlas.seleccionado .cajaTexto {
  background-color: var(--atlasConocimientoSeleccion);
  color: white;
}

/* #endregion */

/* #region vinculos */

.nodoConocimientoAtlas .lineaVinculo {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 2px;
  opacity: 1;
  transform-origin: left center;
  z-index: 0;
  box-sizing: border-box;
  opacity: 0.8;
  pointer-events: none;
}
.nodoConocimientoAtlas .lineaVinculo .laLinea {
  background-color: black;
  height: 100%;
  width: 100%;
  margin: 0px auto;
  position: relative;
}

.nodoConocimientoAtlas.seleccionado .lineaVinculo .laLinea {
  background-color: var(--atlasConocimientoSeleccion);
}

.nodoConocimientoAtlas .lineaVinculo .laLinea::after {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  content: "";
  width: 1px;
  border: 10px solid transparent;
  border-right: 10px solid black;
}
.nodoConocimientoAtlas.seleccionado .lineaVinculo .laLinea::after {
  border-right: 10px solid var(--atlasConocimientoSeleccion);
}

/* #endregion */
</style>
