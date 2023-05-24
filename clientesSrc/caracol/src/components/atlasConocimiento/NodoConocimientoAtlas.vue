<template>
    <div class="nodoConocimientoAtlas nodoConocimientoConBola" v-if="elNodo && elNodo.id" :class="{
            // fantasmeado:
            //   idNodoSeleccionado &&
            //   nivelesConexion &&
            //   !idsRedSeleccion.includes(elNodo.id),
            seleccionado,
            estudiable,
            aprendido: idsNodosAprendidos.includes(elNodo.id),
            estudiado: idsNodosEstudiados.includes(elNodo.id),
            olvidado: idsNodosOlvidados.includes(elNodo.id),
            targeted,
        }">
        <img id="iconoTargeted" src="@/assets/iconos/crosshairsSolid.svg" alt="Mira" v-if="idNodoTarget === elNodo.id" />
        <div class="bolita">
            <slot name="imagenBolita">
                <img v-if="elNodo.tipoNodo === 'concepto'" src="@/assets/iconos/atlas/lightbulbEmpty.svg" alt="Skill" />
                <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" />
            </slot>
        </div>

        <div class="cajaTexto">
            {{ elNodo.nombre }}
            <div class="boton" id="botonAbrirOpciones" @click.stop="$emit('abrirMyControles')" v-show="seleccionado">
                <img src="@/assets/iconos/ellipsisVertical.svg" alt="Ellipsis">
            </div>
        </div>

        <div class="lineaVinculo" v-for="vinculo of vinculosConEstilo.filter((v) => v.estilo)" :key="vinculo.id"
            :style="[vinculo.estilo]">
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
            id
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
        idsNodosEstudiables: {
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
        yo: {
            query: QUERY_DATOS_USUARIO_NODOS,
            fetchPolicy: "cache-first",
            skip() {
                return !this.usuario?.id
            }
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
        estudiable() {
            return !this.elNodo.vinculos.some(v => v.tipo === 'continuacion' && v.rol === "target" && !this.idsNodosAprendidos.includes(v.idRef) && !this.idsNodosEstudiados.includes(v.idRef));
        },
        targeted() {
            return this.idNodoTarget === this.elNodo.id;
        },
        idNodoTarget() {
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
                //Solo se dibujaran los vínculos entrantes. Que tienen rol "target"

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
                    opacity: "1",
                };
                if (
                    !this.idsNodosAprendidos.includes(vinculo.idRef) &&
                    !this.idsNodosEstudiados.includes(vinculo.idRef)
                ) {
                    estilo.opacity = 0.2;
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

.nodoConocimientoAtlas.targeted #iconoTargeted {
    width: 50px;
    height: 50px;
}
</style>
