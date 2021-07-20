<template>
  <div class="eventoCalendarioCruzado" :style="[offset]">
    <img
      src="@/assets/iconos/maximizar.png"
      alt="Maximizar"
      id="botonAbrirEvento"
      v-show="seleccionado"
      @mousedown.left.stop="$emit('abrirEsteEvento')"
    />
    <div id="nombre" v-show="seleccionado">{{ esteEvento.nombre }}</div>
  </div>
</template>

<script>
export default {
  name: "EventoCalendarioCruzado",
  props: {
    esteEvento: Object,
    minutoInicial: Number,
    widthHoraPx: Number,
    seleccionado: Boolean,
  },
  computed: {
    offset() {
      return {
        width:
          ((this.actualMinutosFinal - this.actualMinutosInicio) *
            this.widthHoraPx) /
            60 +
          "px",
        left:
          (this.actualMinutosInicio - this.minutoInicial) *
            (this.widthHoraPx / 60) +
          "px",
      };
    },
    actualMinutosInicio() {
      const inicioDate = new Date(this.esteEvento.horarioInicio);
      return inicioDate.getHours() * 60 + inicioDate.getMinutes();
    },
    actualMinutosFinal() {
      const finalDate = new Date(this.esteEvento.horarioFinal);
      return finalDate.getHours() * 60 + finalDate.getMinutes();
    },
    duracionMinutos() {
      return this.actualMinutosFinal - this.actualMinutosInicio;
    },
  },
};
</script>

<style scoped>
.eventoCalendarioCruzado {
  min-height: 20px;
  height: 100%;
  min-width: 10px;
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.377);
  position: absolute;
  z-index: 0;
}
.eventoCalendarioCruzado:hover {
  background-color: rgb(128, 128, 128);
  z-index: 1;
}
#nombre {
  width: 100%;
  height: 100%;
  font-size: 12px;
}
#botonAbrirEvento {
  position: absolute;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 50%;
}
</style>