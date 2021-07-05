<template>
  <div
    class="eventoCalendario"
    :style="[offset]"
    @mousedown.left="grabbing = true"
    @mousemove="desplazar"
    @mouseup.left="
      grabbing = false;
      guardarTiempos();      
    "
  >
    <div id="nombre">
      {{ esteEvento.nombre }}
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";


export default {
  name: "EventoCalendario",
  props: {
    esteEvento: Object,
    widthHoraPx: Number,
    primerMinutoMediaHora: Number,
    minutoInicial: Number,
    dateDia: Number,
  },
  data() {
    return {
      grabbing: false,
      nuevoMinutosInicioTentativo: 0,
      enviandoTiempos: false,
    };
  },
  methods: {
    desplazar(e) {
      if (!this.grabbing) return;
      console.log(`Desplazandose`);
      const parent = this.$el.closest(".zonaEventos");
      const posParent = parent.getBoundingClientRect();
      const leftMouse = e.clientX - posParent.left;
      const minutosMouse = (leftMouse * 60) / this.widthHoraPx;
      this.nuevoMinutosInicioTentativo =
        this.minutoInicial + minutosMouse - this.duracionMinutos / 2;
    },
    resetNuevoMinutosInicio() {
      this.nuevoMinutosInicioTentativo = this.actualMinutosInicio;
    },
    guardarTiempos() {
      if (this.nuevoMinutosInicio === this.actualMinutosInicio) return;
      console.log(`Guardando nuevo tiempo inicio`);
      this.enviandoTiempos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!, $nuevoHorarioInicio: Date!) {
              setHorarioInicioEvento(
                idEvento: $idEvento
                nuevoHorarioInicio: $nuevoHorarioInicio
              ) {
                id
                horarioInicio
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            nuevoHorarioInicio: new Date((this.nuevoMinutosInicio*60000)+this.dateDia),
          },
        })
        .then(() => {
          this.enviandoTiempos = false;
          this.resetNuevoMinutosInicio();
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoTiempos = false;
          this.resetNuevoMinutosInicio();
        });
    },
  },
  computed: {
    nuevoMinutosInicio() {
      const mediasHoras = Math.round(this.nuevoMinutosInicioTentativo / 30);
      return mediasHoras * 30;
    },    
    duracionMinutos() {
      return Math.round(
        (Date.parse(this.esteEvento.horarioFinal) -
          Date.parse(this.esteEvento.horarioInicio)) /
          60000
      );
    },
    offset() {
      return {
        width: (this.duracionMinutos * this.widthHoraPx) / 60 + "px",
        left:
          (this.nuevoMinutosInicio - this.minutoInicial) *
            (this.widthHoraPx / 60) +
          "px",
      };
    },
    actualMinutosInicio() {
      const inicioDate = new Date(this.esteEvento.horarioInicio);
      return inicioDate.getHours() * 60;
    },
  },
  mounted() {
    this.resetNuevoMinutosInicio();
  },
};
</script>

<style scoped>
.eventoCalendario {
  background-color: cornflowerblue;
  height: 20px;
  min-width: 10px;
  cursor: pointer;
}
#nombre {
  background-color: cornflowerblue;
  margin: 3px 5px;
  font-size: 12px;
  user-select: none;
}
</style>