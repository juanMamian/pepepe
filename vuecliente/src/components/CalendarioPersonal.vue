<template>
  <div class="calendarioPersonal">
      <div id="titulo">Mi Calendario</div>
      <calendario :configCalendario="{tipo:'personal'}"/>
  </div>
</template>

<script>
import Calendario from "./utilidades/Calendario.vue"

export default{
  components: { Calendario },
  name: "CalendarioPersonal"

}
</script>

<style scoped>
    .calendarioPersonal{

    }
    #titulo{
        text-align: center;
        font-size: 22px;
        font-weight: bold;
    }

</style>