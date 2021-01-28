<template>
  <div
    class="grupoEstudiantil"
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
        >
          <template v-slot:alertas>
            <img
              v-if="esteGrupo.estudiantesIdle.some((ei) => ei.id == persona.id)"
              id="alertaEstudianteIdle"
              class="alertas"
              src="@/assets/iconos/idle.png"
              title="Estudiante desocupado"
            />
          </template>
        </icono-persona>
      </div>
    </div>

    <div id="zonaActividades" class="zonaPrimerNivel">
      <div class="nombreZona">Actividades</div>
      <div id="controlesActividades" class="controlesZona">
        <div
          class="controlesActividades botonesControles hoverGris"
          v-if="
            usuarioAdministradorActividadesEstudiantiles ||
            $store.state.usuario.permisos.includes(
              'actividadesEstudiantiles-guia'
            ) ||
            $store.state.usuario.permisos.includes(
              'actividadesEstudiantiles-profe'
            )
          "
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
          v-show="
            (verTodasActividades == true &&
              (usuarioAdministradorActividadesEstudiantiles == true ||
                $store.state.usuario.permisos.includes(
                  'actividadesEstudiantiles-guia'
                ) ||
                $store.state.usuario.permisos.includes(
                  'actividadesEstudiantiles-profe'
                ))) ||
            actividad.creador.id == $store.state.usuario.id
          "
          @participacionEliminada="eliminarParticipacionDeCache"
          @posibleCambioEstudiantesIdle="reloadEstudiantesIdle()"
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
  fragmentoParticipacion,
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
      estudiantesIdle {
        id
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
      fetchPolicy: "cache-and-network",
      subscribeToMore: {
        document: gql`
          subscription($idGrupo: ID) {
            nuevaRespuestaDesarrolloEstudiantil(idGrupo: $idGrupo) {
              idDesarrollo
              participacion {
                ...fragParticipacion
              }
            }
          }
          ${fragmentoParticipacion}
        `,
        variables() {
          return { idGrupo: this.$route.params.idGrupo };
        },
        updateQuery: (previousResult, { subscriptionData: { data } }) => {
          console.log(`Subscription response nueva respuesta`);
          let indexActividad = previousResult.grupoEstudiantil.actividades.findIndex(
            (a) =>
              a.desarrollos.some(
                (d) =>
                  d.id == data.nuevaRespuestaDesarrolloEstudiantil.idDesarrollo
              )
          );
          if (indexActividad > -1) {
            console.log(
              `En ${previousResult.grupoEstudiantil.actividades[indexActividad].nombre}`
            );
            let elDesarrollo = previousResult.grupoEstudiantil.actividades[
              indexActividad
            ].desarrollos.find(
              (d) =>
                d.id == data.nuevaRespuestaDesarrolloEstudiantil.idDesarrollo
            );

            if (!elDesarrollo) {
              console.log(`El desarrollo no estaba en estaba actividad`);
            } else {
              //Verificar si esta respuesta no ha llegado de algún otro lado
              if (
                !elDesarrollo.participaciones.some(
                  (p) =>
                    p.id ==
                    data.nuevaRespuestaDesarrolloEstudiantil.participacion.id
                )
              ) {
                elDesarrollo.participaciones.push(
                  data.nuevaRespuestaDesarrolloEstudiantil.participacion
                );
              }
            }
          } else {
            console.log(
              `Subscripcion response no encontró actividad que tuviera ese desarrollo`
            );
          }

          return previousResult;
        },
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
    eliminarParticipacionDeCache({
      idParticipacion,
      idDesarrollo,
      idActividad,
    }) {
      console.log(
        `Eliminando participacion ${idParticipacion} del desarrollo ${idDesarrollo} de la actividad ${idActividad} de cache`
      );
      let apolloProv = this.$apollo.provider.defaultClient;
      let data = apolloProv.readQuery({
        query: QUERY_GRUPO,
        variables: {
          idGrupo: this.$route.params.idGrupo,
        },
      });
      console.log(`data: ${JSON.stringify(data.grupoEstudiantil).length}`);

      let elDesarrollo = data.grupoEstudiantil.actividades
        .find((a) => a.id == idActividad)
        .desarrollos.find((d) => d.id == idDesarrollo);
      let index = elDesarrollo.participaciones.findIndex(
        (p) => p.id == idParticipacion
      );
      elDesarrollo.participaciones.splice(index, 1);
      console.log(`data: ${JSON.stringify(data.grupoEstudiantil).length}`);
      if (elDesarrollo.participaciones.length < 1) {
        console.log(`Este desarrollo se quedó sin participaciones`);
        let laActividad = data.grupoEstudiantil.actividades.find(
          (a) => a.id == idActividad
        );
        let indexA = laActividad.desarrollos.findIndex(
          (d) => d.id == idDesarrollo
        );
        laActividad.desarrollos.splice(indexA, 1);
      }
      apolloProv.writeQuery({
        query: QUERY_GRUPO,
        variables: {
          idGrupo: this.$route.params.idGrupo,
        },
        data,
      });
    },
    reloadEstudiantesIdle() {
      console.log(`Reloading estudiantes idle`);
      this.$apollo.query({
        query: gql`
          query($idGrupo: ID!) {
            grupoEstudiantil(idGrupo: $idGrupo) {
              id
              estudiantesIdle {
                id
              }
            }
          }
        `,
        fetchPolicy: "network-only",
        variables: {
          idGrupo: this.$route.params.idGrupo,
        },
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
  margin-top: 15px;
  margin-left: auto;
  margin-right: auto;
  max-width: 700px;
  border-radius: 10px;
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
  flex-flow: row wrap;
}

.iconoPersona {
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 65px;
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

.alertas {
  border-radius: 50%;
}
#alertaEstudianteIdle {
  background-color: rgb(255, 219, 152);
  width: 20px;
  height: 20px;
  border: 1px solid rgb(255, 115, 0);
  border-radius: 50%;
}
</style>