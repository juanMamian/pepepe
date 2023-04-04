<template>
  <div
    class="nodoConocimientoVistaArbol nodoConocimientoConBola"
    :class="[
      { seleccionado, accesible },
      datosUsuarioEsteNodo.estadoAprendizaje.toLowerCase(),
    ]"
    @click.stop="
      $emit('clickEnNodo', idNodo);
      refreshLineaHorizontal++;
    "
  >
    <div
      id="lineaReceptora"
      :style="[estiloLineaReceptora]"
      v-show="idNodoTarget && nivelArbol > 0"
    ></div>
    <div class="boton" id="botonRastrear" v-show="seleccionado || targeted">
      <img
        src="@/assets/iconos/crosshairsSolid.svg"
        alt="Rastrear"
        :style="[
          {
            filter: targeted ? 'var(--filtroAtlasSeleccion)' : 'none',
          },
        ]"
        @click.stop="$emit('accionTargetNodo', idNodo)"
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

      <div class="boton" v-show="seleccionado" id="botonAbrir">
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
      id="contenedorArbol"
      :ref="'contenedorArbol'+idNodo"
      v-if="idNodoTarget && nivelArbol < 1"
      :style="[estiloContenedorArbol]"
      @click.stop=""
    >
      <div
        id="lineaHorizontal"
        v-if="montado"
        :style="[estiloLineaHorizontalContenedorArbol]"
      ></div>
      <nodo-conocimiento-vista-arbol
        ref="subnodo"
        v-for="idSubnodo of idsDependencias"
        :key="idSubnodo"
        :idNodo="idSubnodo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :idNodoTarget="idNodoTarget"
        :yo="yo"
        :nivelArbol="nivelArbol + 1"
        @componentUpdated="nodosUpdated"
        @accionTargetNodo="$emit('accionTargetNodo', $event)"
        @clickEnNodo="$emit('clickEnNodo', $event)"
      />
    </div>
  </div>
</template>
<script lang="js">
import { gql } from "@apollo/client/core"
import debounce from "debounce"

const QUERY_NODO = gql`
    query($idNodo:ID!){
        nodo(idNodo:$idNodo){
            id
            nombre
            vinculos{
                id
                tipo
                rol
                idRef
                nodoContraparte{
                    id
                }
            }
        }
    }

`


export default {

  name: "NodoConocimientoVistaArbol",
  props: {
    idNodo: {
      type: String,
      required: true,
    },
    idNodoSeleccionado: {
      type: String,
      default: null,
    },
    idNodoTarget: {
      type: String,
      default: null,
    },
    yo: {
      type: Object,
      required: true,
    },
    nivelArbol: {
      type: Number,
      default: 0,
    }
  },
  apollo: {
    elNodo: {
      query: QUERY_NODO,
      variables() {
        return {
          idNodo: this.idNodo
        }
      },
      update({ nodo }) {
        return nodo
      },
      skip() {
        return !this.idNodo
      },
      fetchPolicy: "cacheFirst",

    }

  },
  data() {
    return {
      elNodo: {
        vinculos: []
      },
      paddingTopArbol: 50,
      paddingLateralArbol:30,
      montado: false,
      refreshLineaHorizontal: 0,
      anchoArbol: 0,
      
    }
  },

  methods: {
    nodosUpdated: debounce(function () {
      console.log("nodosUpdated");
      if (this.$refs?.['contenedorArbol'+this.idNodo]?.scrollWidth != this.anchoArbol) {
        this.anchoArbol = this.$refs['contenedorArbol' + this.idNodo].scrollWidth;
      }
    }, 300),

  },
  computed: {
    estiloLineaReceptora() {
      let heightLinea = this.paddingTopArbol;
      return {
        height: heightLinea + 'px',
      }
    },
    estiloLineaHorizontalContenedorArbol() {
      let anchoArbol = this.anchoArbol;
      if (!this.$refs?.subnodo) {
        return {
          width: '0px',
        }
      }
      let widthPrimero = this.$refs.subnodo[0].$el.offsetWidth;
      let widthUltimo = this.$refs.subnodo[this.$refs.subnodo.length - 1].$el.offsetWidth;
      let widthLinea =anchoArbol - (widthPrimero / 2) - (widthUltimo / 2) - (2*this.paddingLateralArbol);
      console.log("recalculando ancho de linea horizontal");
      return {
        width: widthLinea + 'px',
        left: (widthPrimero / 2) + this.paddingLateralArbol + 'px',
      }
    },
    estiloContenedorArbol() {
      let paddingTop = this.paddingTopArbol;
      let paddingBottom = 100;
      let paddingLeft=this.paddingLateralArbol;
      let paddingRight=this.paddingLateralArbol;

      return {
        paddingTop: paddingTop + 'px',
        paddingBottom: paddingBottom + 'px',
        paddingLeft: paddingLeft+'px',
        paddingRight: paddingRight + 'px',
      }
    },
    idsDependencias() {
      return this.elNodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
    },
    idsNodosVerdes() {
      if (!this.yo?.atlas?.datosNodos) {
        return [];
      }
      return this.yo.atlas.datosNodos.filter(dn => dn.estadoAprendizaje === 'ESTUDIADO' || dn.estadoAprendizaje === 'APRENDIDO').map(dn => dn.idNodo);
    },
    seleccionado() {
      return this.idNodoSeleccionado === this.idNodo;
    },
    targeted() {
      return this.idNodoTarget === this.idNodo;
    },
    accesible() {
      return !this.elNodo.vinculos.some(v => v.tipo === 'continuacion' && v.rol === 'target' && !this.idsNodosVerdes.includes(v.idRef));
    },
    datosUsuarioEsteNodo() {
      if (!this.yo.atlas.datosNodos) {
        return null
      }
      return this.yo.atlas.datosNodos.find(dn => dn.idNodo === this.idNodo);
    },
  },
  watch: {
    "$refs.contenedorArbol" : function () {
      console.log("Cargado el contenedor del árbol");
      if (this.$refs?.contenedorArbol) {
        this.nextTick(()=>{
          console.log(`setting ancho árbol`);
          this.anchoArbol = this.$refs['contenedorArbol' + this.idNodo].scrollWidth;
        })
      }
    }
  },
  mounted() {
    this.montado = true;
    setTimeout(() => {
      this.refreshLineaHorizontal++;
    }, 1000);
  },
  updated() {
    this.$emit("componentUpdated");
  }

}
</script>
<style scoped lang="css">
@import url("@/assets/estilos/nodoConocimientoBola.css");

.nodoConocimientoVistaArbol {
  position: relative;
  align-items: safe center;
  --sizeBola: 50;
}

.nodoConocimientoVistaArbol > #lineaReceptora {
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  width: 2px;
  background-color: black;
}

#contenedorArbol {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 100px;
}

#contenedorArbol > #lineaHorizontal {
  position: absolute;
  top: 0%;
  height: 2px;
  background-color: black;
}

#contenedorArbol > .nodoConocimientoVistaArbol {
  flex-shrink: 0;
  margin: 0px auto;
}
</style>
