<template>
  
    <div class="eventoCalendarioCruzado" :style="[offset]">

    </div>
</template>

<script>
export default {
    name: "EventoCalendarioCruzado",
    props:{
        esteEvento: Object,
        minutoInicial: Number,
        widthHoraPx: Number,
    },
    computed:{
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
    }
}
</script>

<style scoped>
.eventoCalendarioCruzado { 
  min-height: 20px;
  height: 100%;
  min-width: 10px;
  cursor: pointer;
  background-color: rgba(128, 128, 128, 0.377);
  position:absolute
}
</style>