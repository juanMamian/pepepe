<template>
  <div class="diaOrganizadorHorario" >
    <div id="nombreDia">
      {{ nombreDia }}
    </div>

    

    <div
      id="zonaBloques"
      ref="zonaBloques"
      :style="[
        {
          width: Math.round(anchoDiaMinutos * factorZoom) + 'px',
          height: maxFila * (heightBloques + 6 * gapFilas) + 'px',
        },
      ]"
      @dblclick.self="iniciarCreacionBloqueHorario"
      @click.self="bloqueCreacionHorario=null"
    >
    <bloque-creacion-horario
    v-if="bloqueCreacionHorario"
    style="z-index: 100000"
      :style="[
        {
          left: (bloqueCreacionHorario.millisInicio / 60000 - offset) * factorZoom + 'px',
          top:
            ((1 * gapFilas) - 5) +
            'px',          
        },
      ]"
      :esteBloque="bloqueCreacionHorario"
      @espacioSeleccionado="crearBloqueHorario"
    />
      <bloque-horario
        v-for="bloque of bloquesHorarioEnriquecidos"
        :key="bloque.id"
        :esteBloque="bloque"
        :factorZoom="factorZoom"
        :style="[
          {
            left: (bloque.millisInicio / 60000 - offset) * factorZoom + 'px',
            top:
              1 * gapFilas +
              (bloque.fila - 1) * (heightBloques + gapFilas) +
              'px',
            zIndex:
              bloque.id === idBloqueMenuContextual
                ? 10000
                : bloque.id === idBloqueSeleccionado
                ? 1000
                : 100 - bloque.fila,
          },
        ]"
        :idBloqueMenuContextual="idBloqueMenuContextual"
        :idBloqueSeleccionado="idBloqueSeleccionado"
        :mostrarCantidadAsistentes="mostrarCantidadAsistentes"
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
    paraChiquis
  }
`;

import gql from "graphql-tag";
import BloqueHorario from "./BloqueHorario.vue";
import BloqueCreacionHorario from "./BloqueCreacionHorario.vue";
export default {
  components: { BloqueHorario, BloqueCreacionHorario },
  name: "DiaOrganizadorHorario",
  props: {
    mostrarCantidadAsistentes:Boolean,
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

      heightBloques: 100,
      gapFilas: 10,

      bloqueCreacionHorario: null,
    };
  },
  computed: {
    minutosRelevantes() {
      return this.minutosRelevantesBase;
    },
    bloquesHorarioPriorizados() {
      var listaFinal = [...this.bloquesHorario].sort((a, b) => {
        var res = 0;

        if (a.idAdministradorEspacio === this.usuario.id) {
          res++;
        }

        if (b.idAdministradorEspacio === this.usuario.id) {
          res--;
        }

        return -res;
      });

      return listaFinal;
    },
    bloquesHorarioEnriquecidos() {
      var listaFinal = [
        ...this.bloquesHorarioPriorizados.map((bloque) => {
          return {
            ...bloque,
            fila: 0,
          };
        }),
      ];
      for (var i = 0; i < listaFinal.length; i++) {
        //Check anteriores para saber si hay choque
        let esteBloque = listaFinal[i];
        for (var j = i; j >= 0; j--) {
          let bloqueAnterior = listaFinal[j];
          let colision =
            (bloqueAnterior.millisInicio >= esteBloque.millisInicio &&
              bloqueAnterior.millisInicio < esteBloque.millisFinal) ||
            (bloqueAnterior.millisFinal > esteBloque.millisInicio &&
              bloqueAnterior.millisFinal <= esteBloque.millisFinal) ||
            (bloqueAnterior.millisInicio <= esteBloque.millisInicio &&
              bloqueAnterior.millisFinal >= esteBloque.millisFinal);
          if (colision && bloqueAnterior.fila >= esteBloque.fila) {
            let nuevaFila = bloqueAnterior.fila + 1;
            esteBloque.fila = nuevaFila;
          }
        }
      }

      return listaFinal;
    },

    maxFila() {
      var maxFila = this.bloquesHorarioEnriquecidos.reduce((acc, bloque) => {
        if (bloque.fila > acc) {
          return bloque.fila;
        }

        return acc;
      }, 0);

      return maxFila;
    },
  },
  methods: {
    toTiempoFormateado(minutos) {
      var horas = Math.floor(minutos / 60);
      if (String(horas).length < 2) {
        horas = "0" + horas;
      }

      var minutosSolos = String(Math.round(minutos - horas * 60));

      if (minutosSolos.length < 2) {
        minutosSolos = "0" + minutosSolos;
      }

      return horas + ":" + minutosSolos;
    },

    mostrarCalculoMinutos() {},

    iniciarCreacionBloqueHorario(e) {
      const posDia = this.$refs.zonaBloques.getBoundingClientRect();
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

      this.bloqueCreacionHorario = {
        millisInicio,
        millisFinal,
      };
    },

    crearBloqueHorario(idEspacioCrear) {
      if (!this.idEspacioCrear || !this.bloqueCreacionHorario) {
        return;
      }

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
            idEspacio: idEspacioCrear,
            millisInicio: this.bloqueCreacionHorario.millisInicio,
            millisFinal: this.bloqueCreacionHorario.millisFinal,
            diaSemana: this.numeroDia,
          },
        })
        .then(({ data: { crearBloqueHorario } }) => {
          this.creandoBloqueHorario = false;
          this.$emit("bloqueHorarioCreado", crearBloqueHorario);
          this.bloqueCreacionHorario=null;
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
  bottom: 100%;
  font-size: 18px;
  background-color: gray;
  color: white;
  width: 100%;
  padding: 5px 10px;
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