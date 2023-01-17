<template>
  <div class="diaOrganizadorHorario">
    <div id="nombreDia">
      {{ nombreDia }}
    </div>

    <div
      id="zonaBloques"
      :style="[{ width: Math.round(1440 * factorZoom) + 'px' }]"
      @dblclick.self="crearBloqueHorario"
    >
      <bloque-horario
        v-for="bloque of bloquesHorario"
        :key="bloque.id"
        :esteBloque="bloque"
        :factorZoom="factorZoom"
        :style="[{ left: (((bloque.millisInicio / 60000) - offset) * factorZoom) + 'px' }]"
      />
    </div>
    <div id="barraHoras">
      <div
        class="marcaTiempo"
        v-for="minutos of minutosRelevantes"
        :key="'minuto' + minutos"
        :style="[{ left: Math.round((minutos - offset) * factorZoom) + 'px' }]"
      >
        {{ toTiempoFormateado(minutos) }}
      </div>
    </div>
  </div>
</template>

<script>
export const fragmentoBloqueHorario = gql`
  fragment fragBloqueHorario on IteracionSemanalEspacio {
    id
    millisInicio
    millisFinal
    idsParticipantesConstantes
    diaSemana
  }
`;

import gql from "graphql-tag";
import BloqueHorario from "./BloqueHorario.vue";
export default {
  components: { BloqueHorario },
  name: "DiaOrganizadorHorario",
  props: {
    nombreDia: String,
    numeroDia: Number,
    idEspacioCrear: String,
    bloquesHorario: Array,
    factorZoom: {
      type: Number,
      default() {
        return 1;
      },
    },
    offset: Number,
  },
  data() {
    return {
      minutosRelevantesBase: [480, 630, 660, 750, 810, 930],
      creandoBloqueHorario: false,
    };
  },
  computed: {
    minutosRelevantes() {
      return this.minutosRelevantesBase;
    },
  },
  methods: {
    toTiempoFormateado(minutos) {
      var horas = Math.floor(minutos / 60);
      if (horas.length < 2) {
        horas = "0" + horas;
      }

      var minutosSolos = String(Math.round(minutos - horas * 60));

      if (minutosSolos.length < 2) {
        minutosSolos = "0" + minutosSolos;
      }

      return horas + ":" + minutosSolos;
    },

    crearBloqueHorario(e) {
      if (!this.idEspacioCrear) {
        return;
      }
      const posDia = this.$el.getBoundingClientRect();
      const xMouse = e.clientX;

      const xRes = xMouse - posDia.left;

      const minutosInicio = (1440 / posDia.width) * xRes + this.offset;

      console.log(
        "Creando bloque de horario en " + this.toTiempoFormateado(minutosInicio)
      );

      var minutosInicioCorregido = minutosInicio;
      var minutosFinalCorregido = minutosInicioCorregido + 60;

      if (minutosInicio >= 480 && minutosInicio < 570) {
        //Estamos en el primer bloque
        minutosInicioCorregido = 480;
        minutosFinalCorregido = 570;
      } else if (minutosInicio >= 570 && minutosInicio < 630) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 570;
        minutosFinalCorregido = 630;
      } else if (minutosInicio >= 660 && minutosInicio < 750) {
        //Bloque intermedio.
        minutosInicioCorregido = 660;
        minutosFinalCorregido = 750;
      } else if (minutosInicio >= 810 && minutosInicio < 870) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 810;
        minutosFinalCorregido = 870;
      } else if (minutosInicio >= 870 && minutosInicio < 930) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 870;
        minutosFinalCorregido = 930;
      }

      console.log(
        `Corregido a ${this.toTiempoFormateado(minutosInicioCorregido)}`
      );

      var millisInicio = minutosInicioCorregido * 60000;
      var millisFinal = minutosFinalCorregido * 60000;

      this.creandoBloqueHorario = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idEspacio: ID!
              $millisInicio: Int!
              $diaSemana: Int!
              $millisFinal: Int!
            ) {
              crearBloqueHorario(
                idEspacio: $idEspacio
                millisInicio: $millisInicio
                diaSemana: $diaSemana
                millisFinal: $millisFinal
              ) {
                ...fragBloqueHorario
              }
            }
            ${fragmentoBloqueHorario}
          `,
          variables: {
            idEspacio: this.idEspacioCrear,
            millisInicio,
            millisFinal,
            diaSemana: this.numeroDia,
          },
        })
        .then(() => {
          this.creandoBloqueHorario = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.creandoBloqueHorario = false;
        });
    },
  },
};
</script>

<style scoped>
.diaOrganizadorHorario {
  width: 100%;
  position: relative;
  min-height: 100px;
  margin: 30px 0px;
}
#nombreDia {
  position: absolute;
  bottom: calc(100% + 10px);
  font-size: 12px;
  color: rgb(51, 51, 51);
}
#zonaBloques {
  height: 100%;
  background-color: rgb(218, 218, 218);
  min-height: 100px;
}
#barraHoras {
  position: absolute;
  top: 100%;
}

.marcaTiempo {
  position: absolute;
}
</style>