<template>
  <div
    class="nodoConocimientoVistaArbol nodoConocimientoConBola"
    :class="[
      { seleccionado, accesible, targeted },
      (datosUsuarioEsteNodo?.estadoAprendizaje || '').toLowerCase(),
    ]"
    @click.stop="$emit('clickEnNodo', idNodo)"
    @dblclick.stop="
      $router.push({
        name: 'visorNodoConocimiento',
        params: { idNodo: idNodo },
      })
    "
  >
    <div
      id="lineaReceptora"
      :style="[estiloLineaReceptora]"
      v-show="nivelArbol > 0"
    ></div>
    <img
      src="@/assets/iconos/crosshairsSolid.svg"
      alt="Mira"
      id="iconoTargeted"
      v-if="targeted"
    />

    <div class="bolita">
      <img
        src="@/assets/iconos/lockSolid.svg"
        alt="Lock"
        id="iconoInaccesible"
        v-if="!accesible"
      />
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
        src="@/assets/iconos/ellipsisVertical.svg"
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
      :name="
        idsDependencias.length > 1 ? 'unfoldHorizontally' : 'unfoldVertically'
      "
      @before-enter="prepareDataScroll"
      @enter="
        askScrollMe();
        calcularAnchoMiArbol();
      "
      @before-leave="prepareDataScroll"
      @after-leave="
        askScrollMe();
        calcularAnchoMiArbol();
      "
    >
      <div
        id="contenedorArbol"
        ref="contenedorArbol"
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
          @enter="calcularAnchoMiArbol"
          @afterLeave="calcularAnchoMiArbol"
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
            @scrollMe="forwardScrollMe"
            @componentUpdated="$emit('componentUpdated')"
            @clickEnNodo="$emit('clickEnNodo', $event)"
            @anchoUpdated="calcularAnchoMiArbol"
          />
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang="js">
import { gql } from "@apollo/client/core"
import debounce from "debounce"
import { QUERY_DATOS_USUARIO_NODOS } from "./fragsAtlasConocimiento"

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
      query: QUERY_DATOS_USUARIO_NODOS,
      fetchPolicy: "cache-first",
      skip() {
        return !this.usuario?.id

      }
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

      selfUnfolded: false,

      xCentro: 0,
      yCentro: 0,

      anchosSubnodos: [],
      gapSubnodos: 100,
      anchoMiArbol: 100,
      anchoMiLinea: 0,
      leftMiLinea: 0,

    }

  },

  methods: {
    updateMeasurements() {
      if (!this.$refs?.contenedorArbol) {
        this.anchoMiArbol = 0;
        return
      }

      this.anchoMiArbol = this.$refs.contenedorArbol.offsetWidth;

      if (!this.$refs?.subnodo) {
        return;
      }
      let subnodos = this.$refs.subnodo;

      if (subnodos.length < 2) {
        this.anchoMiLinea = 0;
        return
      }

      let primero = subnodos[0];
      let segundo = subnodos[subnodos.length - 1];
      let anchoPrimero = primero.$el.offsetWidth;
      let anchoSegundo = segundo.$el.offsetWidth;
      this.anchoMiLinea = this.anchoMiArbol - (anchoPrimero / 2) - (anchoSegundo / 2) - (2 * this.paddingLateralArbol);
      this.leftMiLinea = (anchoPrimero / 2) + this.paddingLateralArbol;

    },
    calcularAnchoMiArbol:debounce(function() {
      this.updateMeasurements();

      this.$nextTick(() => {
        this.$emit('anchoUpdated');
      })
    }, 300),
    prepareDataScroll() {
      let layoutElem = this.$el.getBoundingClientRect();
      this.xCentro = layoutElem.left + (layoutElem.width / 2);
      this.yCentro = layoutElem.top + (layoutElem.height / 2);
    },
    forwardScrollMe(elem) {
      this.$emit('scrollMe', elem);
    },
    askScrollMe() {
      let elem = this;

      this.$emit('scrollMe', {
        elem,
        xCentro: this.xCentro,
        yCentro: this.yCentro,

      });
    },
    toggleSelfUnfolded() {

      this.selfUnfolded = !this.selfUnfolded;

    },
  },
  computed: {
    targeted() {
      return this.yo?.atlas?.idNodoTarget === this.elNodo.id;
    },
    estiloLineaReceptora() {
      let heightLinea = this.paddingTopArbol;
      return {
        height: heightLinea + 'px',
      }
    },
    estiloLineaHorizontalContenedorArbol() {

      return {
        width: this.anchoMiLinea + 'px',
        left: this.leftMiLinea + 'px',
      }
    },
    estiloContenedorArbol() {
      let paddingTop = this.paddingTopArbol;
      let paddingBottom = 100;
      let paddingLeft = this.paddingLateralArbol;
      let paddingRight = this.paddingLateralArbol;
      let gap = this.gapSubnodos;

      return {
        paddingTop: paddingTop + 'px',
        paddingBottom: paddingBottom + 'px',
        paddingLeft: paddingLeft + 'px',
        paddingRight: paddingRight + 'px',
        gap: gap + 'px',
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
<style scoped>
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
