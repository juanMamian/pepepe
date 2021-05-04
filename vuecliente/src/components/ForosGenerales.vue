<template>
  <div class="forosGenerales">
          <br>

      <div id="anuncioBienvenida">
          <center><h3> ¡Bienvenides a los foros generales! </h3></center>
        En esta sección podemos crear conversaciones de temas generales y compartir opiniones entre todos.
      </div>
          <br>

      <foro idForo="6091672b943ffd1da10e832a" :parent="parent"/>
  </div>
</template>

<script>
import Foro from './Foro.vue'
export default {
  components: { Foro },
    name:"ForosGenerales",
    data(){
        return {
            parent:{
                tipo:"forosGenerales",
                nombre:"offTopic",
                id:"89a7fbe0-acf8-11eb-8529-0242ac130003"
            }
        }
    }
}
</script>

<style scoped>
    #anuncioBienvenida{
        border-radius: 20px;
        border: 2px solid rgb(136 84 43);
        padding: 15px 20px;
        width: min(600px, 90%);
        margin: 20px auto;
        background-color: rgb(239 158 93);
    }
</style>