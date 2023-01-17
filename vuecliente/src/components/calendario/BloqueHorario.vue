<template>
  <div class="bloqueHorario" :style="[{width: (duracionMinutos*factorZoom)+'px'}]">
    <div id="nombre">
        {{esteBloque.nombre}}
    </div>
  </div>
</template>

<script>
export default {
    name: "BloqueHorario",
    props:{
        esteBloque: Object,
        factorZoom: Number,
    },
    data(){
        return {

        }
    },
    computed:{
        duracionMinutos(){
            return Math.round((this.esteBloque.millisFinal-this.esteBloque.millisInicio)/60000);
        }
    }
}
</script>

<style scoped>
    .bloqueHorario{
        height: 100px;
        background-color: rgb(160, 77, 77);
        position: absolute;
        top: 0px;

    }
</style>