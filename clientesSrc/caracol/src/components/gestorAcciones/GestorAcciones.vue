<template lang="">
  <div class="gestorAcciones">
    <transition name="fade">
      <div
        id="lastAccion"
        class="anuncio"
        v-if="lastAccion"
        v-show="!mostrandoListaAcciones && poppingLastAccion"
      >
        <accion :estaAccion="lastAccion" />
      </div>
    </transition>
    <div class="listaAcciones" v-if="mostrandoListaAcciones">
      <accion
        v-for="(accion, index) of acciones"
        :key="'accion' + index"
        :estaAccion="accion"
      />
    </div>
  </div>
</template>
<script>
import {gql} from "@apollo/client/core";
import debounce from "debounce"
import Accion from "./Accion.vue"
import { QUERY_ACCIONES } from "./frags";

export default {
  name: "GestorAcciones",
  components:{
    Accion
  },
  apollo: {
    acciones: {
      query: QUERY_ACCIONES,
    },
  },
  data() {
    return {
        mostrandoListaAcciones:false,
      poppingLastAccion: false,
    };
  },
  computed: {
    lastAccion() {
      if (!this.acciones || this.acciones.length < 1) {
        return;
      }
      return this.acciones[this.acciones.length - 1];
    },
  },
  methods: {
    unpop: debounce(function () {
      this.poppingLastAccion = false;
    }, 2600),
  },
  watch: {
    lastAccion() {
      this.poppingLastAccion=true;
      this.unpop();
    },
  },
};
</script>
<style scoped>
.gestorAcciones {
  position: fixed;
  top: 100vh;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}
#lastAccion{
    position: absolute;
    bottom: calc(100% + 40px);
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6em;
    width: max-content;
    text-align: center;
    max-width: 50vw;
}
</style>
