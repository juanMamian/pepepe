<template>
  <div class="calendarioPersonal">
      <calendario v-if="usuarioLogeado" :enfasis="'eventosPersonales'" :idUsuarioTarget="this.usuario.id"/>
      <router-view />
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