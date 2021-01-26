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
        :estaActividad="actividad"
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
        @participacionEliminada="eliminarParticipacionDeCache"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoPersona from "../proyecto/IconoPersona";
import {
  fragmentoActividad,
  fragmentoResponsables,
  fragmentoParticipacion,
} from "../utilidades/recursosGql";
import Actividad from "./Actividad.vue";
import Loading from "../utilidades/Loading.vue";

const QUERY_MIS_ACTIVIDADES_PROFE = gql`
  query($idProfe: ID!) {
    misActividadesEstudiantilesDeProfe(idProfe: $idProfe) {
      ...fragActividad
    }
  }
  ${fragmentoActividad}
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
          publicUsuario(idUsuario: $idProfe) {
            ...fragResponsables
          }
        }
        ${fragmentoResponsables}
      `,
      variables() {
        return { idProfe: this.$route.params.idProfe };
      },
      update: ({ publicUsuario }) => publicUsuario,
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
      fetchPolicy:"cache-and-network",
      subscribeToMore: {
        document: gql`
          subscription($idProfe: ID) {
            nuevaRespuestaDesarrolloEstudiantil(idProfe: $idProfe) {
              idDesarrollo
              participacion {
                ...fragParticipacion
              }
            }
          }
          ${fragmentoParticipacion}
        `,
        variables() {
          return {
            idProfe: this.$route.params.idProfe,
          };
        },
        updateQuery: (previousResult, { subscriptionData: { data } }) => {
          console.log(`Subscription response de nueva respuesta`);
          
          let indexActividad = previousResult.misActividadesEstudiantilesDeProfe.findIndex(
            (a) =>
              a.desarrollos.some(
                (d) =>
                  d.id == data.nuevaRespuestaDesarrolloEstudiantil.idDesarrollo
              )
          );
          if (indexActividad > -1) {
            console.log(
              `En ${previousResult.misActividadesEstudiantilesDeProfe[indexActividad].nombre}`
            );
            let elDesarrollo = previousResult.misActividadesEstudiantilesDeProfe[
              indexActividad
            ].desarrollos.find(
              (d) =>
                d.id == data.nuevaRespuestaDesarrolloEstudiantil.idDesarrollo
            );

            if (!elDesarrollo) {
              console.log(`El desarrollo no estaba en estaba actividad`);
            } else {
              //Verificar si esta respuesta no ha llegado de algún otro lado.
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
              `Subscription response no encontró actividad que tuviera ese desarrollo`
            );
          }

          return previousResult;
        },
      },
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
  margin: 10px auto;
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