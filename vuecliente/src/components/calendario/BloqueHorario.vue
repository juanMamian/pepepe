<template>
  <div
    class="bloqueHorario"
    :class="{
      seleccionado,
      deshabilitado: eliminandose || settingTiempos,
      usuarioAsiste,
    }"
    :style="[
      { width: duracionMinutos * factorZoom + 'px', backgroundColor: miColor },
    ]"
    @contextmenu.exact.prevent.stop="$emit('menuContextual', esteBloque.id)"
    @dblclick="toggleDuracionBloque"
    @click.left="$emit('seleccionado')"
  >
    <div
      class="boton"
      v-show="seleccionado"
      @click.stop="$emit('menuContextual', esteBloque.id)"
      id="botonOpciones"
    >
      <img src="@/assets/iconos/ellipsisVertical.svg" alt="Opciones" />
    </div>
    <div id="barraTag" :style="[colorBarraTag]">
      <div id="nombre">
        <img
          src="@/assets/iconos/babySolid.svg"
          v-if="esteBloque.paraChiquis"
          alt="bebé"
          style="height: 15px"
        />{{ esteBloque.nombreEspacio }}
      </div>
    </div>

    <div
      id="cantidadAsistentes"
      v-if="
        esteBloque.idsParticipantesConstantes &&
        esteBloque.idsParticipantesConstantes.length > 0 &&
        mostrarCantidadAsistentes
      "
      v-show="!seleccionado"
    >
      Asistentes: {{ esteBloque.idsParticipantesConstantes.length }}
    </div>

    <div
      id="botonExpandir"
      class="boton"
      style="margin: 0px auto"
      @click.stop="expandir"
      v-show="seleccionado"
    >
      <img src="@/assets/iconos/expand.svg" alt="expandir" style="" />
    </div>

    <loading v-show="eliminandose || settingTiempos" />

    <div
      id="menuContextual"
      :class="{ seleccionado }"
      @click.stop=""
      @dblclick.stop=""
      v-show="mostrandoMenuContextual"
    >
      <div
        class="itemMenuContextual"
        v-if="usuarioAdministrador || usuarioSuperadministrador"
        @click="eliminarse"
      >
        Eliminar
      </div>
      <div class="itemMenuContextual" @click="$refs.inputColor.click()">
        Seleccionar color
      </div>
      <div
        class="itemMenuContextual"
        v-if="usuarioAdministrador || usuarioSuperadministrador"
        @click="iniciarSetHoraInicio"
      >
        Fijar hora de inicio
      </div>
      <input
        type="time"
        :value="tiempoInicioFormateado"
        v-show="editandoHoraInicio"
        ref="inputHoraInicio"
        id="inputHoraInicio"
        @change="setHoraInicio"
      />

      <div
        class="itemMenuContextual"
        v-if="usuarioAdministrador || usuarioSuperadministrador"
        @click="iniciarSetHoraFinal"
      >
        Fijar hora de finalización
      </div>
      <input
        type="time"
        :value="tiempoFinalFormateado"
        v-show="editandoHoraFinal"
        ref="inputHoraFinal"
        id="inputHoraFinal"
        @change="setHoraFinal"
      />

      <input
        type="color"
        ref="inputColor"
        @change="setColorEspacio"
        v-show="false"
        id="inputColor"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";
export default {
  components: { Loading },
  name: "BloqueHorario",
  props: {
    esteBloque: Object,
    idBloqueSeleccionado: String,
    factorZoom: Number,
    idBloqueMenuContextual: String,
    mostrarCantidadAsistentes: Boolean,
  },

  data() {
    var coloresEspacios = localStorage.getItem("coloresEspacios")
      ? JSON.parse(localStorage.getItem("coloresEspacios"))
      : [];

    return {
      coloresEspacios,
      eliminandose: false,
      settingTiempos: false,
      mostrarVentana: false,

      editandoHoraInicio: false,
      editandoHoraFinal: false,
    };
  },
  computed: {
    duracionMinutos() {
      return Math.round(
        (this.esteBloque.millisFinal - this.esteBloque.millisInicio) / 60000
      );
    },
    mostrandoMenuContextual() {
      return this.idBloqueMenuContextual === this.esteBloque.id;
    },
    miColor() {
      if (!this.coloresEspacios) {
        return "#a04d4d";
      }
      const miIndex = this.coloresEspacios.findIndex(
        (d) => d[0] === this.esteBloque.idEspacio
      );

      if (miIndex > -1) {
        return this.coloresEspacios[miIndex][1];
      }

      return "#a04d4d";
    },
    seleccionado() {
      return this.idBloqueSeleccionado === this.esteBloque.id;
    },
    usuarioAdministrador() {
      return this.usuario.id === this.esteBloque.idAdministradorEspacio;
    },
    minutosInicio() {
      return Math.round(this.esteBloque.millisInicio / 60000);
    },
    minutosFinal() {
      return Math.round(this.esteBloque.millisFinal / 60000);
    },
    tiempoInicioFormateado() {
      return this.toTiempoFormateado(this.minutosInicio);
    },
    tiempoFinalFormateado() {
      return this.toTiempoFormateado(this.minutosFinal);
    },
    usuarioAsiste() {
      return (
        this.usuarioAdministrador ||
        this.esteBloque.idsParticipantesConstantes.includes(this.usuario.id)
      );
    },
    colorBarraTag() {
      var color = "rgb(182 182 182)";

      if (this.usuarioAsiste) {
        color = "var(--calendarioUsuario)";
      }
      if (this.usuarioAdministrador) {
        color = "var(--calendarioUsuarioStrong)";
      }
      return {
        backgroundColor: color,
      };
    },
  },
  methods: {
    setColorEspacio() {
      const inputColor = this.$refs.inputColor;
      console.log(
        `Setting color en ${inputColor.value} para el espacio ${this.esteBloque.nombreEspacio} con id ${this.esteBloque.idEspacio}`
      );

      const indexDupla = this.coloresEspacios.findIndex(
        (d) => d[0] === this.esteBloque.idEspacio
      );

      if (indexDupla > -1) {
        this.$set(this.coloresEspacios, indexDupla, [
          this.esteBloque.idEspacio,
          inputColor.value,
        ]);
      } else {
        this.coloresEspacios.push([
          this.esteBloque.idEspacio,
          inputColor.value,
        ]);
      }

      localStorage.setItem(
        "coloresEspacios",
        JSON.stringify(this.coloresEspacios)
      );
    },
    eliminarse() {
      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        console.log("No autorizado");
        return;
      }

      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEspacio: ID!, $idIteracion: ID!) {
              eliminarIteracionSemanalEspacio(
                idEspacio: $idEspacio
                idIteracion: $idIteracion
              )
            }
          `,
          variables: {
            idEspacio: this.esteBloque.idEspacio,
            idIteracion: this.esteBloque.id,
          },
        })
        .then(() => {
          this.eliminandose = false;
          this.$emit("meElimine");
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.eliminandose = false;
        });
    },
    toggleDuracionBloque() {
      console.log(
        `Toggleando bloque que tiene minutosInicio ${this.minutosInicio} y minutosFinal ${this.minutosFinal}`
      );

      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        console.log("No autorizado");
        return;
      }

      if (this.minutosInicio === 480) {
        if (this.minutosFinal === 600) {
          this.setMinutos(480, 540);
        } else {
          this.setMinutos(480, 600);
        }
      } else if (this.minutosInicio === 540) {
        this.setMinutos(480, 600);
      } else if (this.minutosInicio === 630) {
        if (this.minutosFinal === 750) {
          this.setMinutos(630, 690);
        } else {
          this.setMinutos(630, 750);
        }
      } else if (this.minutosInicio === 690) {
        this.setMinutos(630, 750);
      } else if (this.minutosInicio === 810) {
        if (this.minutosFinal === 930) {
          this.setMinutos(810, 870);
        } else {
          this.setMinutos(810, 930);
        }
      } else if (this.minutosInicio === 870) {
        this.setMinutos(870, 930);
      } else {
        console.log(`No se pudo togglear el bloque`);
      }
    },
    setMinutos(minutosInicio, minutosFinal) {
      const millisInicio = minutosInicio * 60000;
      const millisFinal = minutosFinal * 60000;

      this.settingTiempos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idEspacio: ID!
              $idIteracion: ID!
              $millisInicio: Int!
              $millisFinal: Int!
            ) {
              setTiemposIteracionSemanalEspacio(
                idEspacio: $idEspacio
                idIteracion: $idIteracion
                millisInicio: $millisInicio
                millisFinal: $millisFinal
              ) {
                id
                millisInicio
                millisFinal
              }
            }
          `,
          variables: {
            idEspacio: this.esteBloque.idEspacio,
            idIteracion: this.esteBloque.id,
            millisInicio,
            millisFinal,
          },
        })
        .then(() => {
          this.settingTiempos = false;
        })
        .catch((error) => {
          console.log("Error: " + error);
          this.settingTiempos = false;
        });
    },
    expandir() {
      this.$emit("expandirme");
    },
    iniciarSetHoraInicio() {
      this.$refs.inputHoraInicio.value = this.toTiempoFormateado(
        this.minutosInicio
      );
      this.editandoHoraInicio = true;
      this.editandoHoraFinal = false;
    },
    iniciarSetHoraFinal() {
      this.$refs.inputHoraFinal.value = this.toTiempoFormateado(
        this.minutosFinal
      );
      this.editandoHoraFinal = true;
      this.editandoHoraInicio = false;
    },
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
    setHoraInicio() {
      console.log(`Setting hora inicio`);
      const inputTime = this.$refs.inputHoraInicio.value.split(":");
      const inputHoras = parseInt(inputTime[0]);
      const inputMinutos = parseInt(inputTime[1]);

      const minutosTotal = inputHoras * 60 + inputMinutos;

      console.log("Nuevo minutos inicio: " + minutosTotal);
      this.setMinutos(minutosTotal, this.minutosFinal);
    },
    setHoraFinal() {
      console.log(`Setting hora final`);
      const inputTime = this.$refs.inputHoraFinal.value.split(":");
      const inputHoras = parseInt(inputTime[0]);
      const inputMinutos = parseInt(inputTime[1]);

      const minutosTotal = inputHoras * 60 + inputMinutos;

      console.log("Nuevo minutos final: " + minutosTotal);
      this.setMinutos(this.minutosInicio, minutosTotal);
    },
  },
};
</script>

<style scoped>
.bloqueHorario {
  height: 100px;
  background-color: #a04d4d;
  position: absolute;
  top: 0px;
  box-sizing: border-box;
  border: 1px solid rgb(110, 110, 110);
}
.bloqueHorario.seleccionado {
  filter: brightness(1.7);
  border: 2px solid white;
}
.bloqueHorario.usuarioAsiste {
}
#botonOpciones {
  position: absolute;
  top: 10px;
  left: calc(100% + 0px);
}
#barraTag {
  min-height: 20px;
  width: 100%;
  border-bottom: 1px solid rgb(204, 204, 204);
  padding: 5px 10px;
  box-sizing: border-box;
}
#nombre {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}
#cantidadAsistentes {
  width: 100%;
  text-align: center;
  font-size: 13px;
}
#menuContextual {
  position: absolute;
  top: 0%;
  left: 50%;
}

#menuContextual.seleccionado {
  color: black;
}

#menuContextual:not(.seleccionado) {
  color: antiquewhite;
}
.itemMenuContextual {
  padding: 10px 10px;
  font-size: 12px;
  cursor: pointer;
}
.itemMenuContextual:hover {
  background-color: rgb(59, 59, 59);
}
</style>