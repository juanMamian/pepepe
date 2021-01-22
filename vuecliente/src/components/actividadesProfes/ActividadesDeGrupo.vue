<template>
  <div
    class="GrupoEstudiantil"
    :class="{ deshabilitada: ventanaDeshabilitada }"
  >
    <div class="nombreGrupo">{{ esteGrupo.nombre }}</div>
    <div id="zonaEstudiantes" class="zonaPrimerNivel">
      <div class="nombreZona">Estudiantes</div>
      <div id="controlesEstudiantes" class="controlesZona">
        <input
          type="text"
          ref="idEstudianteAñadir"
          v-model="idEstudianteAñadir"
          placeholder="id de estudiante"
          v-if="
            usuarioSuperadministrador == true ||
            usuarioAdministradorActividadesEstudiantiles == true
          "
        />
        <div
          class="controlesEstudiantes hoverGris botonesControles"
          v-if="
            usuarioSuperadministrador == true ||
            usuarioAdministradorActividadesEstudiantiles == true
          "
          @click="addEstudianteGrupo"
        >
          Añadir estudiante
        </div>

        <div
          class="controlesEstudiantes hoverGris botonesControles"
          v-if="
            usuarioSuperadministrador == true ||
            usuarioAdministradorActividadesEstudiantiles == true
          "
          :class="{ desactivado: idEstudianteSeleccionado == null }"
          @click="removeEstudianteGrupo(idEstudianteSeleccionado)"
        >
          Retirar estudiante
        </div>
      </div>
      <div id="listaEstudiantes" @click.self="idEstudianteSeleccionado = null">
        <icono-persona
          :estaPersona="persona"
          :key="persona.id"
          v-for="persona of esteGrupo.estudiantes"
          :seleccionado="idEstudianteSeleccionado == persona.id ? true : false"
          @click.native="idEstudianteSeleccionado = persona.id"
        />
      </div>
    </div>

    <div id="zonaActividades" class="zonaPrimerNivel">
      <div class="nombreZona">Actividades</div>
      <div id="controlesActividades" class="controlesZona">
        <div
          class="controlesActividades botonesControles hoverGris"
          v-if="usuarioAdministradorActividadesEstudiantiles"
          @click="verTodasActividades = !verTodasActividades"
        >
          {{
            verTodasActividades == true
              ? "Ver sólo mis actividades"
              : "Ver todas las actividades"
          }}
        </div>
        <div
          class="controlesActividades botonesControles hoverGris"
          v-if="usuarioProfe"
          @click="crearNuevaActividad"
        >
          Crear actividad
        </div>
      </div>
      <div id="listaActividades" @click.self="idActividadSeleccionada = null">
        <actividad
          v-for="actividad of actividadesOrdenadas"
          :key="actividad.id"
          :estaActividad="actividad"
          :seleccionada="idActividadSeleccionada == actividad.id"
          :idGrupo="esteGrupo.id"
          @click.native="
            idActividadSeleccionada != actividad.id
              ? (idActividadSeleccionada = actividad.id)
              : null
          "
          @clickTrianguloSeleccion="
            idActividadSeleccionada == actividad.id
              ? (idActividadSeleccionada = null)
              : (idActividadSeleccionada = actividad.id)
          "
          @eliminandose="eliminarActividad"
          @cambiandoNombre="cambiarNombreActividad"
          v-show="
            (verTodasActividades == true &&
              usuarioAdministradorActividadesEstudiantiles == true) ||
            actividad.creador.id == $store.state.usuario.id
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import IconoPersona from "../proyecto/IconoPersona";
import gql from "graphql-tag";
import {
  fragmentoActividad,
  fragmentoResponsables,
} from "../utilidades/recursosGql";
import Actividad from "./Actividad.vue";

const QUERY_GRUPO = gql`
  query($idGrupo: ID!) {
    grupoEstudiantil(idGrupo: $idGrupo) {
      id
      nombre
      estudiantes {
        ...fragResponsables
      }
      actividades {
        ...fragActividad
      }
    }
  }
  ${fragmentoResponsables}
  ${fragmentoActividad}
`;

export default {
  name: "ActividadesDeGrupo",
  apollo: {
    esteGrupo: {
      query: QUERY_GRUPO,
      variables() {
        return { idGrupo: this.$route.params.idGrupo };
      },
      update: function ({ grupoEstudiantil }) {
        this.ventanaDeshabilitada = false;
        return grupoEstudiantil;
      },
    },
  },
  components: {
    IconoPersona,
    Actividad,
  },
  data() {
    return {
      idEstudianteAñadir: null,
      idEstudianteSeleccionado: null,
      idActividadSeleccionada: null,
      esteGrupo: {
        estudiantes: [],
        actividades: [],
      },
      verTodasActividades: false,
      ventanaDeshabilitada: true,
    };
  },
  computed: {
    usuarioProfe: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes(
        "actividadesEstudiantiles-profe"
      );
    },
    actividadesOrdenadas: function () {
      let lasActividades = this.esteGrupo.actividades;
      lasActividades.sort((a, b) => {        
        return new Date(b.fechaUpload) - new Date(a.fechaUpload);
      });
      return lasActividades;
    },
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
      console.log(
        `Retirando el estudiante con id ${idEstudiante} del grupo con id ${this.esteGrupo.id}`
      );
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
    },
    crearNuevaActividad() {
      console.log(`enviando mutacion de crear nueva actividad`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idGrupo: ID!) {
              crearActividadEnGrupoEstudiantil(idGrupo: $idGrupo) {
                ...fragActividad
              }
            }
            ${fragmentoActividad}
          `,
          variables: {
            idGrupo: this.esteGrupo.id,
          },
          update: (store, { data: { crearActividadEnGrupoEstudiantil } }) => {
            console.log(
              `respuesta: ${JSON.stringify(crearActividadEnGrupoEstudiantil)}`
            );
            const nuevaActividad = crearActividadEnGrupoEstudiantil;
            try {
              let cache = store.readQuery({
                query: QUERY_GRUPO,
                variables: { idGrupo: this.esteGrupo.id },
              });
              cache.grupoEstudiantil.actividades.push(nuevaActividad);
              store.writeQuery({
                query: QUERY_GRUPO,
                variables: { idGrupo: this.esteGrupo.id },
                data: cache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          console.log(`respuesta. ${respuesta}`);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    eliminarActividad(idActividad) {
      console.log(`Evento de eliminar actividad ${idActividad}`);
      if (!this.esteGrupo.actividades.some((a) => a.id == idActividad)) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idActividad: ID!, $idGrupo: ID!) {
              eliminarActividadDeGrupoEstudiantil(
                idGrupo: $idGrupo
                idActividad: $idActividad
              )
            }
          `,
          variables: {
            idActividad,
            idGrupo: this.esteGrupo.id,
          },
          update: (
            store,
            { data: { eliminarActividadDeGrupoEstudiantil } }
          ) => {
            console.log(
              `data: ${JSON.stringify(eliminarActividadDeGrupoEstudiantil)}`
            );
            let eliminado = eliminarActividadDeGrupoEstudiantil;

            if (eliminado) {
              try {
                let cache = store.readQuery({
                  query: QUERY_GRUPO,
                  variables: { idGrupo: this.esteGrupo.id },
                });
                let indexE = cache.grupoEstudiantil.actividades.findIndex(
                  (a) => a.id == idActividad
                );
                if (indexE > -1) {
                  cache.grupoEstudiantil.actividades.splice(indexE, 1);
                }
                store.writeQuery({
                  query: QUERY_GRUPO,
                  variables: { idGrupo: this.esteGrupo.id },
                  data: cache,
                });
              } catch (error) {
                console.log(`Error actualizando cache`);
              }
            }
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    cambiarNombreActividad({ idActividad, nuevoNombre }) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idGrupo: ID!, $idActividad: ID!, $nuevoNombre: String!) {
              cambiarNombreActividadGrupoEstudiantil(
                idGrupo: $idGrupo
                idActividad: $idActividad
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idGrupo: this.esteGrupo.id,
            idActividad,
            nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
  },
  beforeRouteUpdate(to, from, next) {
    console.log(`Saliendo de ${from.name} hacia ${to.name} `);
    if (
      from.name == "ActividadesDeGrupo" ||
      from.name == "ActividadesDeProfe"
    ) {
      this.ventanaDeshabilitada = true;
    }
    next();
  },
};
</script>

<style scoped>
.actividad {
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
}
.deshabilitada {
  pointer-events: none;
  opacity: 0.5;
}
.contenidoGrupoProfe {
  border: 2px solid blue;
  border-radius: 5px;
  min-height: 50px;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  background-color: rgb(230, 247, 247);
}

.nombreGrupo {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  background-color: cornsilk;
}

#listaEstudiantes {
  padding-top: 10px;
  padding-bottom: 40px;
  display: flex;
}

.iconoPersona {
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
.desactivado {
  opacity: 0.5;
  pointer-events: none;
}

#listaActividades {
  padding: 20px 50px;
}

.actividad {
  margin-top: 15px;
  margin-left: auto;
  margin-right: auto;
  max-width: 700px;
  border-radius: 10px;
}
</style>