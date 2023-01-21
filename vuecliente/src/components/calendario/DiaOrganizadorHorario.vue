<template>
  <div class="diaOrganizadorHorario">
    <div id="nombreDia">
      {{ nombreDia }}
    </div>

    <div
      id="zonaBloques"
      :style="[{ width: Math.round(anchoDiaMinutos * factorZoom) + 'px' }]"
      @dblclick.self="crearBloqueHorario"
    >
      <bloque-horario
        v-for="bloque of bloquesHorario"
        :key="bloque.id"
        :esteBloque="bloque"
        :factorZoom="factorZoom"
        :style="[
          { left: (bloque.millisInicio / 60000 - offset) * factorZoom + 'px' },
        ]"
        :idBloqueMenuContextual="idBloqueMenuContextual"
        :idBloqueSeleccionado="idBloqueSeleccionado"
        @meElimine="$emit('bloqueEliminado', bloque.id)"
        @menuContextual="$emit('menuContextualBloque', $event)"
        @seleccionado="$emit('bloqueSeleccionado', bloque.id)"
        @expandirme="$emit('expandirBloque', bloque.id)"
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
    nombreEspacio
    idAdministradorEspacio
    idEspacio
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
    idBloqueSeleccionado: String,
    bloquesHorario: Array,
    idBloqueMenuContextual: String,
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
      minutosRelevantesBase: [480, 540, 600, 630, 750, 810, 870, 930],
      creandoBloqueHorario: false,
      anchoDiaMinutos: 490,
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

      const minutosInicio =
        (this.anchoDiaMinutos / posDia.width) * xRes + this.offset;

      console.log(
        "Creando bloque de horario en " + this.toTiempoFormateado(minutosInicio)
      );

      var minutosInicioCorregido = minutosInicio;
      var minutosFinalCorregido = minutosInicioCorregido + 60;

      if (minutosInicio >= 480 && minutosInicio < 540) {
        //Estamos en el primer bloque
        minutosInicioCorregido = 480;
        minutosFinalCorregido = 540;
      } else if (minutosInicio >= 540 && minutosInicio < 600) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 540;
        minutosFinalCorregido = 600;
      } else if (minutosInicio >= 630 && minutosInicio < 750) {
        //Bloque intermedio.
        minutosInicioCorregido = 630;
        minutosFinalCorregido = 750;
      } else if (minutosInicio >= 810 && minutosInicio < 870) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 810;
        minutosFinalCorregido = 870;
      } else if (minutosInicio >= 870 && minutosInicio < 930) {
        //Segundo bloque pero antes de refrigerio.
        minutosInicioCorregido = 870;
        minutosFinalCorregido = 930;
      } else {
        console.log("En zona no considerada");
        return;
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
        .then(({ data: { crearBloqueHorario } }) => {
          this.creandoBloqueHorario = false;
          this.$emit("bloqueHorarioCreado", crearBloqueHorario);
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
  z-index: 1;
}
#barraHoras {
  position: absolute;
  top: 100%;
  z-index: 0;
}

.marcaTiempo {
  position: absolute;
}
</style>