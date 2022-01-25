<template>
  <div class="calendarioPersonal">
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
    

</style>