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
      v-show="nivelArbol > 0"
    ></div>

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
    </div>
    <div
      class="boton"
      id="botonDesplegarDependencias"
      v-if="
        this.elNodo.vinculos.some(
          (v) => v.tipo === 'continuacion' && v.rol === 'target'
        )
      "
      @click.stop="toggleSelfUnfolded"
    >
      <img
        style="transform: scale(0.6)"
        src="@/assets/iconos/folderClosed.svg"
        alt="Cerrado"
        v-show="!selfUnfolded"
      />
      <img
        src="@/assets/iconos/longarrowDown.svg"
        alt="Arrow"
        v-show="selfUnfolded"
      />
    </div>
    <transition
      :name="idsDependencias.length>1?'unfoldHorizontally':'unfoldVertically'"
      @before-enter="prepareDataScroll"
      @enter="askScrollMe"
      @before-leave="prepareDataScroll"
      @after-leave="askScrollMe"
    >
      <div
        id="contenedorArbol"
        :ref="'contenedorArbol' + idNodo"
        v-if="selfUnfolded"
        :style="[estiloContenedorArbol]"
        @click.stop=""
      >
        <div
          id="lineaHorizontal"
          v-show="idsDependencias.length > 1"
          :style="[estiloLineaHorizontalContenedorArbol]"
        ></div>
        <transition-group
          style="display: flex; gap: 100px; align-items: flex-start"
          tag="div"
          name="unfoldVertically"
        >
          <nodo-conocimiento-vista-arbol
            ref="subnodo"
            v-for="idSubnodo of idsDependencias"
            :key="idSubnodo"
            :idNodo="idSubnodo"
            :idNodoSeleccionado="idNodoSeleccionado"
            :yo="yo"
            :nivelArbol="nivelArbol + 1"
            :idNodoUp="idNodo"
            :refreshLineaHorizontal="refreshLineaHorizontal"
            :cadenaUnfold="cadenaUnfold"
            @scrollMe="forwardScrollMe"
            @componentUpdated="$emit('componentUpdated')"
            @clickEnNodo="$emit('clickEnNodo', $event)"
            @updateCadenaUnfold="middlewareUpdateCadenaUnfold"
          />
        </transition-group>
      </div>
    </transition>
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
    cadenaUnfold: {
      type: Array,
      default: [],
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
    yo: {
      query: gql`
        query {
          yo {
            atlas {
              datosNodos {
                id
                idNodo
                estadoAprendizaje
              }
            }
          }
        }
      `,
      fetchPolicy: "cache-first",
      skip() {
        return !this.usuarioLogeado;
      },
    },
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

      selfUnfolded:false,

      xCentro:0,
      yCentro:0,
    }

  },

  methods: {
    prepareDataScroll(){
      let layoutElem=this.$el.getBoundingClientRect();
      this.xCentro=layoutElem.left+(layoutElem.width/2);
      this.yCentro=layoutElem.top+(layoutElem.height/2);
    },
    forwardScrollMe(elem){
      console.log("forwarding scroll me");
      this.$emit('scrollMe', elem);
    },
    askScrollMe(){
      let elem=this;
      console.log(`xCentro: ${this.xCentro}`);
      console.log(`yCentro: ${this.yCentro}`);
      console.log("emitiendo scroll me");

      this.$emit('scrollMe', {
        elem,
        xCentro:this.xCentro,
        yCentro: this.yCentro,

      });
    },
    toggleSelfUnfolded(){

      this.selfUnfolded=!this.selfUnfolded;

    },
    middlewareUpdateCadenaUnfold(cadena){
     this.$emit('updateCadenaUnfold', cadena);
    },
    updateCadenaUnfold(){

      let indexT = this.cadenaUnfold.indexOf(this.idNodo);
      let nuevaCadena = [...this.cadenaUnfold];
      if (indexT > -1) {
        nuevaCadena = nuevaCadena.slice(0, indexT);
      }
      else {//Entrando a la cadena. Solo lo puede hacer si su nodo up está en la cadena. O si es el primer nodo del árbol.
        if (this.cadenaUnfold.length > 0) {
          let indexUp = this.cadenaUnfold.indexOf(this.idNodoUp);
          if (indexUp < 0) {//Este nodo se está intentando introducir a la cadena unfold pero su nodo up no está en la cadena.
            console.log('Error. tratando de push nuevo item unfolded que no estaba bajo un nodo de la cadena');
            return;
          }
          nuevaCadena = nuevaCadena.slice(0, indexUp + 1);
        }
        else {//La cadena estaba vacía. Sólo debería poder entrar el primer nodo del árbol.
          if (this.nivelArbol > 0) { //Está entrando un nodo que no es el primero.
            console.log("Error: tratando de introducir a la cadena unfold un nodo que no es el primero cuando la cadena estaba vacía");

            return;
          }
        }
        nuevaCadena.push(this.idNodo);
      }
      this.$emit('updateCadenaUnfold', nuevaCadena);

    },


  },
  computed: {
   passedOver() {

      return this.nivelArbol < this.cadenaUnfold.length - 1; //En el siguiente nivel hay unfolding. Este sólo debe presentar su nodo unfolded.
   },
    estiloLineaReceptora() {
      let heightLinea = this.paddingTopArbol;
      return {
        height: heightLinea + 'px',
      }
    },
    estiloLineaHorizontalContenedorArbol() {
      let anchoArbol = this.anchoArbol;
      if (this.passedOver || !this.$refs?.subnodo?.length >0) {

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
      let idsVinculos = this.elNodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
      return idsVinculos;

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
    unfolded() {
      return this.cadenaUnfold.includes(this.idNodo);
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
