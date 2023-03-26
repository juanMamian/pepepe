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
          <template v-slot:alertas> </template>
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
            usuario.permisos.includes(
              'actividadesEstudiantiles-guia'
            ) ||
            usuario.permisos.includes(
              'actividadesEstudiantiles-profe'
            )
          "
          v-show="!loadingMisActividadesCreadas"
          @click="
            verTodasActividades = !verTodasActividades;
            activarTodasActividades = true;
          "
        >
          {{
            verTodasActividades == true
              ? "Ver sólo mis actividades"
              : "Ver todas las actividades"
          }}
        </div>
        <div
          class="controlesActividades botonesControles hoverGris"
          :class="{ deshabilitado: creandoActividad }"
          v-if="usuarioProfe"
          v-show="!loadingMisActividadesCreadas"
          @click="crearNuevaActividad"
        >
          Crear actividad
        </div>
        <loading
          texto="cargandoActividades..."
          v-show="loadingMisActividadesCreadas"
        />
      </div>
      <div
        id="listaMisActividades"
        class="listaActividades"
        @click.self="idActividadSeleccionada = null"
        v-if="!loadingMisActividadesCreadas"
        v-show="!verTodasActividades"
      >
        <actividad
          v-for="actividad of misActividadesCreadas.actividades"
          :key="actividad.id"
          :idActividad="actividad.id"
          :seleccionada="idActividadSeleccionada == actividad.id"
          :idGrupo="esteGrupo.id"
          :idEstudianteSeleccionadoGrupo="idEstudianteSeleccionado"
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
          @meElimine="eliminarActividadCache"
        >
        </actividad>
        <loading
          texto="Cargando más actividades"
          v-show="loadingMasMisActividades"
        />

        <div
          id="finMisActividades"
          class="bCargarMas"
          v-show="misActividadesCreadas.hayMas && !loadingMasMisActividades"
          @click="getMoreMisActividades"
        >
          Más...
        </div>
      </div>
      <div
        id="listaTodasActividades"
        class="listaActividades"
        @click.self="idActividadSeleccionada = null"
        v-if="!loadingTodasActividades"
        v-show="
          verTodasActividades == true &&
          (usuarioAdministradorActividadesEstudiantiles == true ||
            usuario.permisos.includes(
              'actividadesEstudiantiles-guia'
            ) ||
            usuario.permisos.includes(
              'actividadesEstudiantiles-profe'
            ))
        "
      >
        <actividad
          v-for="actividad of todasActividades.actividades"
          :key="actividad.id"
          :idActividad="actividad.id"
          :seleccionada="idActividadSeleccionada == actividad.id"
          :idGrupo="esteGrupo.id"
          :idEstudianteSeleccionadoGrupo="idEstudianteSeleccionado"
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
          @meElimine="eliminarActividadCache"
        >
        </actividad>
        <div
          id="finTodasActividades"
          class="bCargarMas"
          v-show="todasActividades.hayMas && !loadingMasTodasActividades"
          @click="getMoreTodasActividades"
        >
          Más...
        </div>
        <loading
          texto="Cargando más actividades"
          v-show="loadingMasTodasActividades"
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
import Loading from "../utilidades/Loading.vue";

const QUERY_TODAS_ACTIVIDADES = gql`
  query($idGrupo: ID!, $pagina: Int!) {
    todasActividadesGrupoEstudiantil(idGrupo: $idGrupo, pagina: $pagina) {
      hayMas
      actividades {
        id
        nombre
      }
    }
  }
`;

const QUERY_MIS_ACTIVIDADES_CREADAS = gql`
  query($idGrupo: ID!, $pagina: Int!) {
    misActividadesCreadasGrupoEstudiantil(idGrupo: $idGrupo, pagina: $pagina) {
      hayMas
      actividades {
        id
        nombre
      }
    }
  }
`;

const QUERY_GRUPO = gql`
  query($idGrupo: ID!) {
    grupoEstudiantil(idGrupo: $idGrupo) {
      id
      nombre
      estudiantes {
        ...fragResponsables
      }
    }
  }
  ${fragmentoResponsables}
`;

//const sizePaginaActividades=5;

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
      fetchPolicy: "network-only",
    },
    misActividadesCreadas: {
      query: QUERY_MIS_ACTIVIDADES_CREADAS,
      variables() {
        return {
          idGrupo: this.$route.params.idGrupo,
          pagina: 0,
        };
      },
      update: function ({ misActividadesCreadasGrupoEstudiantil }) {
        this.loadingMasMisActividades = false;
        this.loadingMisActividadesCreadas = false;
        this.ventanaDeshabilitada = false;
        return misActividadesCreadasGrupoEstudiantil;
      },
    },
    todasActividades: {
      query: QUERY_TODAS_ACTIVIDADES,
      variables() {
        return {
          idGrupo: this.$route.params.idGrupo,
          pagina: 0,
        };
      },
      update: function ({ todasActividadesGrupoEstudiantil }) {
        this.loadingMasTodasActividades = false;
        this.loadingTodasActividades = false;
        this.hayMasTodasActividades = todasActividadesGrupoEstudiantil.hayMas;
        return todasActividadesGrupoEstudiantil;
      },
    },
  },
  components: {
    IconoPersona,
    Actividad,
    Loading,
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
      activarTodasActividades: false,
      verTodasActividades: false,
      ventanaDeshabilitada: true,

      misActividadesCreadas: [],
      todasActividades: [],

      paginaMisActividades: 0,
      paginaTodasActividades: 0,

      sizePaginaActividades: 5,

      hayMasMisActividades: true,
      hayMasTodasActividades: true,

      loadingMisActividadesCreadas: true,
      loadingTodasActividades: true,

      loadingMasMisActividades: true,
      loadingMasTodasActividades: true,

      creandoActividad: false,
    };
  },
  computed: {
    usuarioProfe: function () {
      if (!this.usuario.permisos) return false;
      return this.usuario.permisos.includes(
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
      this.creandoActividad = true;
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
              var cache = store.readQuery({
                query: QUERY_MIS_ACTIVIDADES_CREADAS,
                variables: { idGrupo: this.$route.params.idGrupo, pagina: 0 },
              });
              console.log(`Cache: ${JSON.stringify(cache)}`);
              var nuevoCache = JSON.parse(JSON.stringify(cache));
              nuevoCache.misActividadesCreadasGrupoEstudiantil.actividades.unshift(
                nuevaActividad
              );
              console.log(`Unshifted Cache: ${JSON.stringify(nuevoCache)}`);

              if (
                nuevoCache.misActividadesCreadasGrupoEstudiantil.actividades &&
                nuevoCache.misActividadesCreadasGrupoEstudiantil.actividades
                  .length > this.sizePaginaActividades
              ) {
                nuevoCache.misActividadesCreadasGrupoEstudiantil.actividades.pop();
              }

              console.log(`Popped Cache: ${JSON.stringify(nuevoCache)}`);

              store.writeQuery({
                query: QUERY_MIS_ACTIVIDADES_CREADAS,
                variables: { idGrupo: this.$route.params.idGrupo, pagina: 0 },
                data: nuevoCache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          this.creandoActividad = false;
          console.log(`resp. ${respuesta}`);
        })
        .catch((error) => {
          this.creandoActividad = false;
          console.log(`error: ${error}`);
        });
    },
    eliminarActividadCache(idActividad) {
      console.log(`Evento de eliminar actividad ${idActividad}`);
    },
    getMoreMisActividades() {
      this.paginaMisActividades++;
      console.log(`Fetching more`);
      this.loadingMasMisActividades = true;
      this.$apollo.queries.misActividadesCreadas
        .fetchMore({
          variables: {
            pagina: this.paginaMisActividades,
            idGrupo: this.$route.params.idGrupo,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const masActividades =
              fetchMoreResult.misActividadesCreadasGrupoEstudiantil.actividades;
            const hayMas =
              fetchMoreResult.misActividadesCreadasGrupoEstudiantil.hayMas;

            this.hayMasMisActividades = hayMas;

            return {
              misActividadesCreadasGrupoEstudiantil: {
                __typename:
                  previousResult.misActividadesCreadasGrupoEstudiantil
                    .__typename,
                actividades: [
                  ...previousResult.misActividadesCreadasGrupoEstudiantil
                    .actividades,
                  ...masActividades,
                ],
                hayMas,
              },
            };
          },
        })
        .then(() => {
          this.loadingMasMisActividades = false;
        })
        .catch((error) => {
          this.loadingMasMisActividades = false;
          console.log(`Error en fetchMore: E: ${error}`);
        });
    },
    getMoreTodasActividades() {
      this.paginaTodasActividades++;
      console.log(`Fetching more todasActividades`);
      this.loadingMasTodasActividades = true;
      this.$apollo.queries.todasActividades
        .fetchMore({
          variables: {
            pagina: this.paginaTodasActividades,
            idGrupo: this.$route.params.idGrupo,
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const masActividades =
              fetchMoreResult.todasActividadesGrupoEstudiantil.actividades;
            const hayMas =
              fetchMoreResult.todasActividadesGrupoEstudiantil.hayMas;

            this.hayMasTodasActividades = hayMas;

            return {
              todasActividadesGrupoEstudiantil: {
                __typename:
                  previousResult.todasActividadesGrupoEstudiantil.__typename,
                actividades: [
                  ...previousResult.todasActividadesGrupoEstudiantil
                    .actividades,
                  ...masActividades,
                ],
                hayMas,
              },
            };
          },
        })
        .then(() => {
          this.loadingMasTodasActividades = false;
        })
        .catch((error) => {
          this.loadingMasTodasActividades = false;
          console.log(`Error en fetchMore: E: ${error}`);
        });
    },
    addDesarrolloActividad(nuevoDesarrollo, idActividad) {
      console.log(
        `En la actividad ${idActividad} se añadirá un desarrollo: ${nuevoDesarrollo}`
      );
    },
  },
  beforeRouteUpdate(to, from, next) {
    console.log(`Saliendo de ${from.name} hacia ${to.name} `);
    if (
      from.name == "ActividadesDeGrupo" ||
      from.name == "ActividadesDeProfe"
    ) {
      //this.esteGrupo.id = null;
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

.listaActividades {
  padding: 20px 50px;
}

.alertas {
  border-radius: 50%;
}
.bCargarMas {
  cursor: pointer;
  padding: 5px 3px;
}
.bCargarMas:hover {
  background-color: gray;
}
</style>