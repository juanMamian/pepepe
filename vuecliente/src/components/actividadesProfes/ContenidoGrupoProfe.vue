<template>
  <div class="contenidoGrupoProfe">
    <div id="zonaEstudiantes" class="zonaPrimerNivel">
      <div class="nombreZona">Estudiantes</div>
      <div id="controlesEstudiantes" class="controlesZona">
        <input
          type="text"
          ref="idEstudianteAñadir"
          v-model="idEstudianteAñadir"
          placeholder="id de estudiante"
        />
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
          :class="{desactivado: idEstudianteSeleccionado==null}"
          @click="removeEstudianteGrupo(idEstudianteSeleccionado)"
        >
          Retirar estudiante
        </div>
      </div>
      <div id="listaEstudiantes" @click.self="idEstudianteSeleccionado=null">
        <icono-persona
          :estaPersona="persona"
          :key="persona.id"
          v-for="persona of esteGrupo.estudiantes"
          :seleccionado="idEstudianteSeleccionado == persona.id ? true :false"
          @click.native="idEstudianteSeleccionado=persona.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import IconoPersona from "../proyecto/IconoPersona";
import gql from "graphql-tag";
import { fragmentoResponsables } from "../utilidades/recursosGql";

export default {
  name: "ContenidoGrupoProfe",
  components: {
    IconoPersona,
  },
  data() {
    return { idEstudianteAñadir: null, idEstudianteSeleccionado: null };
  },
  props: {
    esteGrupo: Object,
  },
  methods: {
    addEstudianteGrupo() {
      console.log(`añadiendo usuario a un grupo estudiantil`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idGrupoEstudiantil: ID!, $idEstudiante: ID!) {
              addEstudianteGrupoEstudiantil(
                idGrupoEstudiantil: $idGrupoEstudiantil
                idEstudiante: $idEstudiante
              ) {
                id
                estudiantes {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idGrupoEstudiantil: this.esteGrupo.id,
            idEstudiante: this.idEstudianteAñadir,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    removeEstudianteGrupo(idEstudiante) {
      console.log(`Retirando el estudiante con id ${idEstudiante} del grupo con id ${this.esteGrupo.id}`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idGrupo: ID!, $idEstudiante: ID!) {
              removeEstudianteGrupoEstudiantil(
                idGrupo: $idGrupo
                idEstudiante: $idEstudiante
              ) {
                id
                estudiantes {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idGrupo: this.esteGrupo.id,
            idEstudiante,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    }
  },
};

</script>

<style scoped>
.contenidoGrupoProfe {
  border: 2px solid blue;
  border-radius: 5px;
  min-height: 50px;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  background-color: rgb(230, 247, 247);
}
#listaEstudiantes {
  padding-bottom: 40px;
  display: flex;
}

.iconoPersona{
  margin-left: 10px;
  margin-right: 10px;
}

.zonaPrimerNivel {
  border: 2px solid rgb(199, 110, 8);
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
.desactivado{
  opacity: 0.5;
  pointer-events: none;
}
</style>