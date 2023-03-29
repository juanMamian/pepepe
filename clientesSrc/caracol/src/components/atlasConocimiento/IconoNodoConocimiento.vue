<template>
  <div class="iconoNodoConocimiento" @dblclick.stop="abrirPaginaNodo" :class="{ deshabilitado: siendoRemovido }">
    <img
      src="@/assets/iconos/success.png"
      alt="Aprendido"
      title="Este tema ya ha sido aprendido"
      v-if="aprendido"
      id="iconoAprendido"      
    />
    <pie-progreso
      id="piePorcentajeCompletado"
      v-if="porcentajeCompletado"
      :cifrasDecimales="0"
      :progreso="porcentajeCompletado"
      :size="30"
      v-show="mostrarPorcentajeCompletado"
    />
    <loading id="loadingRemovido" v-show="siendoRemovido" />
    <div id="iconoNodo" v-show="!mostrarPorcentajeCompletado && !siendoRemovido">
      <img
        v-if="esteNodo.tipoNodo === 'concepto'"
        src="@/assets/iconos/atlas/lightbulbEmpty.svg"
      />
      <img v-else src="@/assets/iconos/atlas/fireSolid.svg" />
    </div>
    <div
      id="nombre"
      ref="nombre"
      :style="[estiloCartelNombre]"
      :class="{ seleccionado }"
    >
      {{ esteNodo.nombre }}
    </div>

    <div class="menuContextual" v-show="menuCx" @click.stop="">
      <div
        class="botonMenuCx"
        v-for="opcion of opcionesMenuCx"
        :key="opcion.accion"
        @click="$emit(opcion.accion)"
      >
        {{ opcion.texto }}
      </div>
    </div>
  </div>
</template>

<script>
import Loading from "../utilidades/Loading.vue";
import PieProgreso from "../utilidades/PieProgreso.vue";
export default {
  components: { PieProgreso, Loading },
  name: "IconoNodoConocimiento",
  apollo: {},
  data() {
    return {};
  },
  props: {
    esteNodo: Object,
    seleccionado: Boolean,
    datosEsteNodo: Object,

    mostrarPorcentajeCompletado: Boolean,
    porcentajeCompletado: Number,

    opcionesMenuCx: Array,
    menuCx: Boolean,

    siendoRemovido: Boolean,
  },
  computed: {
    estiloCartelNombre() {
      var bColor = "var(--atlasConocimientoBaseNodo)";
      var color = "black";
      if (this.aprendido || this.estudiado) {
        bColor = "var(--atlasConocimientoCheck)";
      } else if (this.nodoRepasar) {
        bColor = "var(--atlasConocimientoRepaso)";
      } else if (this.aprendible) {
        bColor = "var(--atlasConocimientoAvailable)";
      } else {
        color = "#313131";
      }

      return {
        backgroundColor: bColor,
        color,
      };
    },
    estudiado() {
      if (!this.datosEsteNodo?.estudiado) {
        return false;
      }

      return true;
    },
    estudiadoRecientemente() {
      if (!this.estudiado || !this.datosEsteNodo.diasRepaso) {
        return false;
      }
      let dateHoy = new Date();

      let dateHoyMin = dateHoy;
      dateHoyMin.setHours(0);
      dateHoyMin.setMinutes(0);
      dateHoyMin.setSeconds(0);

      let millisEstudiado = new Date(this.datosEsteNodo.estudiado).getTime();
      let millisRepaso = millisEstudiado + (this.datosEsteNodo.diasRepaso * 86400000 ) ;
      let millisHoy = dateHoy.getTime();

      console.log(
        `${this.datosEsteNodo.nombreNodo}: Millis estudiado: ${millisEstudiado}, millisRepaso: ${millisRepaso}, millisHoy ${millisHoy}`
      );
      return millisRepaso > millisHoy;
    },
    repasar() {
      return this.estudiado && !this.estudiadoRecientemente;
    },
    aprendido() {
      return this.datosEsteNodo?.aprendido;
    },
  },
  methods:{
    abrirPaginaNodo() {
      this.$router.push(
        this.$route.path + "/nodoConocimiento/" + this.esteNodo.id
      );
    },
  }
};
</script>

<style scoped>
.iconoNodoConocimiento {
  width: 30px;
  min-width: 30px;
  height: 30px;
  border-radius: 50%;
  background-size: 100% 100%;
  cursor: pointer;
  position: relative;
  pointer-events: all;
  background-color: rgba(128, 128, 128, 0.349);
  user-select: none;
}
#iconoAprendido{
  width: 17px;
  height: 17px;
  position: absolute;
  top: 0px;
  left: 0px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: var(--atlasConocimientoCheck);
}
#loadingRemovido {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}
#iconoNodo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 55%;
  height: 55%;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
}

#iconoNodo img {
  width: 100%;
  height: 100%;
}

#piePorcentajeCompletado {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#nombre {
  font-size: 11px;
  position: absolute;
  top: 105%;
  min-height: 10px;
  min-width: 20px;
  max-width: 280%;
  text-align: center;
  /* width: 160%; */
  padding: 5px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgb(5, 102, 109);
  border-radius: 3px;
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  padding: 5px;
  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.botonMenuCx:hover {
  background-color: gray;
}
</style>