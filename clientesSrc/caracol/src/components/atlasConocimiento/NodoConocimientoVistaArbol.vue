<template>
  <div
    class="nodoConocimientoVistaArbol nodoConocimientoConBola"
    :class="[
      { seleccionado, accesible },
      (datosUsuarioEsteNodo?.estadoAprendizaje || '').toLowerCase(),
    ]"
    @click.stop="$emit('clickEnNodo', idNodo)"
  >
    <div
      id="lineaReceptora"
      :style="[estiloLineaReceptora]"
      v-show="cadenaTarget.length > 0 && nivelArbol > 0"
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
        @click.stop="toggleInCadenaTarget"
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
      :ref="'contenedorArbol' + idNodo"
      v-if="targeted"
      :style="[estiloContenedorArbol]"
      @click.stop=""
    >
      <div
        id="lineaHorizontal"
        :style="[estiloLineaHorizontalContenedorArbol]"
      ></div>
      <nodo-conocimiento-vista-arbol
        ref="subnodo"
        v-for="idSubnodo of idsDependencias"
        :key="idSubnodo"
        :idNodo="idSubnodo"
        :idNodoSeleccionado="idNodoSeleccionado"
        :cadenaTarget="cadenaTarget"
        :yo="yo"
        :nivelArbol="nivelArbol + 1"
        :idNodoUp="idNodo"
        :refreshLineaHorizontal="refreshLineaHorizontal"
        @componentUpdated="$emit('componentUpdated')"
        @accionTargetNodo="updateCadenaTarget(idNodo)"
        @clickEnNodo="$emit('clickEnNodo', $event)"
        @updateCadenaTarget="$emit('updateCadenaTarget', $event)"
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
    idNodoUp: {
      type: String,
    },
    idNodo: {
      type: String,
      required: true,
    },
    idNodoSeleccionado: {
      type: String,
      default: null,
    },
    cadenaTarget: {
      type: Array,
      default: [],
    },
    yo: {
      type: Object,
      required: true,
    },
    nivelArbol: {
      type: Number,
      default: 0,
    },
    refreshLineaHorizontal: {
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
      paddingLateralArbol: 30,
      montado: false,
      anchoArbol: 0,

    }
  },

  methods: {
    toggleInCadenaTarget() {
      let indexT = this.cadenaTarget.indexOf(this.idNodo);
      let nuevaCadena = [...this.cadenaTarget];
      if (indexT > -1) {
        nuevaCadena = nuevaCadena.slice(0, indexT);
      }
      else {//Entrando a la cadena. Solo lo puede hacer si su nodo up está en la cadena. O si es el primer nodo del árbol.
        if (this.cadenaTarget.length > 0) {
          let indexUp = this.cadenaTarget.indexOf(this.idNodoUp);
          if (indexUp < 0) {//Este nodo se está intentando introducir a la cadena target pero su nodo up no está en la cadena.
            console.log('Error. tratando de push nuevo target que no estaba bajo un nodo de la cadena');
            return;
          }
          nuevaCadena = nuevaCadena.slice(0, indexUp + 1);
        }
        else {//La cadena estaba vacía. Sólo debería poder entrar el primer nodo del árbol.
          if (this.nivelArbol > 0) { //Está entrando un nodo que no es el primero.
            console.log("Error: tratando de introducir a la cadena target un nodo que no es el primero cuando la cadena estaba vacía");
            return;
          }
        }
        nuevaCadena.push(this.idNodo);
      }

      this.$emit('updateCadenaTarget', nuevaCadena);
    },


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
      let widthLinea = anchoArbol - (widthPrimero / 2) - (widthUltimo / 2) - (2 * this.paddingLateralArbol);
      return {
        width: widthLinea + 'px',
        left: (widthPrimero / 2) + this.paddingLateralArbol + 'px',
      }
    },
    estiloContenedorArbol() {
      let paddingTop = this.paddingTopArbol;
      let paddingBottom = 100;
      let paddingLeft = this.paddingLateralArbol;
      let paddingRight = this.paddingLateralArbol;

      return {
        paddingTop: paddingTop + 'px',
        paddingBottom: paddingBottom + 'px',
        paddingLeft: paddingLeft + 'px',
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
      return this.cadenaTarget.includes(this.idNodo);
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
    refreshLineaHorizontal() {
      if (!this.$refs) {
        return;
      }
      let elementoArbol = this.$refs['contenedorArbol' + this.idNodo];
      if (elementoArbol && elementoArbol.scrollWidth != this.anchoArbol) {
        console.log(`${this.elNodo.nombre} refreshing its linea horizontal`);
        this.$nextTick(() => {
          this.anchoArbol = elementoArbol.scrollWidth;
        })
      }

      setTimeout(() => {
        let elementoArbol = this.$refs['contenedorArbol' + this.idNodo];
        if (elementoArbol) {
          this.anchoArbol = elementoArbol.scrollWidth;
        }
      }, 700);
    },
  },

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
