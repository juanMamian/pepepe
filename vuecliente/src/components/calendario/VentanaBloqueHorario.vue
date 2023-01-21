<template>
  <div class="ventanaBloqueHorario" >

    <div id="fondoGris" @click.self.stop="$emit('cerrarme')"></div>
    <div id="laPropiaVentana" :style="[{backgroundColor: miColor}]">

    <div id="titulo">
      {{ esteBloque.nombreEspacio }}
    </div>

    <div class="seccionListaUsuarios">
      <div class="barraListaUsuarios">
        <div class="nombreListaUsuarios">Coordina</div>
      </div>

      <div class="listaPersonas">
        <icono-persona-autonomo :idPersona="esteBloque.idAdministradorEspacio" />
      </div>
    </div>

    <div class="seccionListaUsuarios">
      <div class="barraListaUsuarios">
        <div class="nombreListaUsuarios">Asisten</div>
        <div class="contenedorControles">
          <div class="boton">
            <img src="@/assets/iconos/join.png" alt="Agregar" style="" />
          </div>
        </div>
      </div>

      <div class="listaPersonas">
        <icono-persona-autonomo
          v-for="idAsistente of idsAsistentes"
          :key="idAsistente"
          :idPersona="idAsistente"
          :seleccionado="idAsistente===idPersonaSeleccionado"
          @click.stop="
            idPersonaSeleccionado =
              idPersonaSeleccionado === idAsistente ? null : idAsistente
          "
        />
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import IconoPersonaAutonomo from "../usuario/IconoPersonaAutonomo.vue";
export default {
  components: { IconoPersonaAutonomo },
  name: "VentanaBloqueHorario",
  props:{
    esteBloque: Object,
    miColor:String,
  },
  data(){
    return {
        idPersonaSeleccionado:null,
    }
  },
  computed:{
    idsAsistentes(){
        return this.esteBloque.idsParticipantesConstantes;
    }
  },
  
};
</script>

<style scoped>
#fondoGris{
    position: fixed;
    background-color: rgba(0, 0, 0, 0.411);
    top: 0%;
    left: 0%;
    width: 100vw;
    height: 100vh;
}


#laPropiaVentana{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(700px, 95%);
  min-height: 400px;
  z-index: 1;
  background-color: rgb(197, 197, 197);
}

#titulo{
    padding: 20px 20px;
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 20px;
}

.barraListaUsuarios{
    background-color: rgb(100, 100, 100);
    padding: 10px 10px;
    display: flex;
    align-items: center;
}

.barraListaUsuarios .contenedorControles{
margin-left: auto;
}

.listaPersonas{
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    padding: 20px 20px;
    margin-bottom: 20px;

}
</style>