<template>
  <div
    class="actividadesDeProfe"
    :class="{ deshabilitada: ventanaDeshabilitada }"
  >
    <loading v-show="ventanaDeshabilitada" />
    <icono-persona
      v-show="!ventanaDeshabilitada"
      :estaPersona="esteProfe"
    ></icono-persona>
    <div id="listaActividades" @click.self="idActividadSeleccionada = null">
      <actividad
        v-for="actividad of actividadesOrdenadas"
        :key="actividad.id"
        :idActividad="actividad.id"
        :idGrupo="actividad.idGrupo"
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
        :seleccionada="idActividadSeleccionada == actividad.id"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersona from "../proyecto/IconoPersona";
import {fragmentoResponsables} from "../utilidades/recursosGql";
import Actividad from "./Actividad.vue";
import Loading from "../utilidades/Loading.vue";

const QUERY_MIS_ACTIVIDADES_PROFE = gql`
  query($idProfe: ID!) {
    misActividadesEstudiantilesDeProfe(idProfe: $idProfe) {
      id
      nombre
      idGrupo
    }
  }
`;

export default {
  name: "ActividadesDeProfe",
  components: {
    IconoPersona,
    Actividad,
    Loading,
  },
  apollo: {
    esteProfe: {
      query: gql`
        query($idProfe: ID!) {
          Usuario(idUsuario: $idProfe) {
            ...fragResponsables
          }
        }
        ${fragmentoResponsables}
      `,
      variables() {
        return { idProfe: this.$route.params.idProfe };
      },
      update: ({ Usuario }) => Usuario,
    },
    actividades: {
      query: QUERY_MIS_ACTIVIDADES_PROFE,
      variables() {
        return { idProfe: this.$route.params.idProfe };
      },
      update: function ({ misActividadesEstudiantilesDeProfe }) {
        this.ventanaDeshabilitada = false;
        return misActividadesEstudiantilesDeProfe;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    return {
      idActividadSeleccionada: null,
      actividades: [],
      ventanaDeshabilitada: true,
    };
  },
  computed: {
    actividadesParaMiGrupo: function () {
      console.log(``);
      return false;
    },
    actividadesOrdenadas: function () {
      let lasActividades = this.actividades;
      lasActividades.sort((a, b) => {
        return new Date(b.fechaUpload) - new Date(a.fechaUpload);
      });
      return lasActividades;
    },
  },
  methods: {
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
        query: QUERY_MIS_ACTIVIDADES_PROFE,
        variables: {
          idProfe: this.$route.params.idProfe,
        },
      });
      console.log(
        `data: ${
          JSON.stringify(data.misActividadesEstudiantilesDeProfe).length
        }`
      );

      let elDesarrollo = data.misActividadesEstudiantilesDeProfe
        .find((a) => a.id == idActividad)
        .desarrollos.find((d) => d.id == idDesarrollo);
      let index = elDesarrollo.participaciones.findIndex(
        (p) => p.id == idParticipacion
      );
      elDesarrollo.participaciones.splice(index, 1);
      console.log(
        `data: ${
          JSON.stringify(data.misActividadesEstudiantilesDeProfe).length
        }`
      );
      if (elDesarrollo.participaciones.length < 1) {
        console.log(`Este desarrollo se quedó sin participaciones`);
        let laActividad = data.misActividadesEstudiantilesDeProfe.find(
          (a) => a.id == idActividad
        );
        let indexA = laActividad.desarrollos.findIndex(
          (d) => d.id == idDesarrollo
        );
        laActividad.desarrollos.splice(indexA, 1);
      }
      apolloProv.writeQuery({
        query: QUERY_MIS_ACTIVIDADES_PROFE,
        variables: {
          idProfe: this.$route.params.idProfe,
        },
        data,
      });
    },
    addDesarrolloActividad(nuevoDesarrollo, idActividad) {
      console.log(
        `En la actividad ${idActividad} se añadirá un desarrollo: ${JSON.stringify(
          nuevoDesarrollo
        )}`
      );
    },
    addRespuestaActividad({ nuevaRespuesta, idDesarrollo }, idActividad) {
      console.log(
        `Adding nueva respuesta ${JSON.stringify(
          nuevaRespuesta
        )} al desarrollo ${idDesarrollo} de la actividad ${idActividad}`
      );
      let store = this.$apollo.provider.defaultClient;
      var cache = store.readQuery({
        query: QUERY_MIS_ACTIVIDADES_PROFE,
        variables: { idProfe: this.$route.params.idProfe },
      });
      var lasActividades = cache.misActividadesEstudiantilesDeProfe;

      var laActividad = lasActividades.find((a) => a.id == idActividad);
      if (!laActividad) {
        console.log(`No existía la actividad`);
        return;
      }

      var elDesarrollo = laActividad.desarrollos.find(
        (d) => d.id == idDesarrollo
      );
      if (!elDesarrollo) {
        console.log(`No existía el desarollo`);
        return;
      }

      if (
        !elDesarrollo.participaciones.some((p) => p.id == nuevaRespuesta.id)
      ) {
        elDesarrollo.participaciones.push(nuevaRespuesta);
        console.log(`Nueva respuesta insertada`);
      }
      store.writeQuery({
        query: QUERY_MIS_ACTIVIDADES_PROFE,
        variables: { idProfe: this.$route.params.idProfe },
        data: cache,
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
      this.esteProfe.nombre = "Profe";
    }
    next();
  },
};
</script>

<style scoped>
.actividadesDeProfe {
  position: relative;
}
.actividad {
  margin: 20px auto;
  max-width: 700px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
}
.deshabilitada {
  pointer-events: none;
  opacity: 0.5;
}
.iconoPersona {
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 80px;
}
.loading {
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}
</style>