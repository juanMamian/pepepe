<template>
  <div class="contenidoGrupoProfe">
<div id="zonaEstudiantes" class="zonaPrimerNivel">
        <div class="nombreZona">Estudiantes</div>
        <div id="controlesEstudiantes" class="controlesZona">
          <div
            class="controlesEstudiantes hoverGris botonesControles"
            v-if="usuarioSuperadministrador == true"
            @click="addEstudianteGrupo"
          >
            Añadir estudiante
          </div>

          <div
            class="controlesEstudiantes hoverGris botonesControles"
            v-if="usuarioSuperadministrador == true"
            @click="removeEstudianteGrupo"
          >
            Retirar estudiante
          </div>
        </div>
        <div id="listaEstudiantes">
          <icono-persona
            :estaPersona="persona"
            :key="persona.id"
            v-for="persona of esteGrupo.estudiantes"
          />
        </div>
      </div>

  </div>
  
</template>

<script>
import IconoPersona from "../proyecto/IconoPersona"

export default {
    name: "ContenidoGrupoProfe",
    component:{
        IconoPersona
    },
    props:{
        esteGrupo:Object
    }

}
</script>

<style scoped>

.contenidoGrupoProfe {
  border: 2px solid blue;
  border-radius: 5px;
  min-height: 50px;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 20px;
  background-color: rgb(230, 247, 247);
}

.zonaPrimerNivel {
  border:2px solid rgb(199, 110, 8);
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.nombreZona {
  font-size: 18px;
  background-color: rgb(199, 110, 8);
  padding: 3px 5px;
  border-width: 0px;
}
</style>