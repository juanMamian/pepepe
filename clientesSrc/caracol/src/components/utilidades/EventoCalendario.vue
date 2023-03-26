<template>
  <div
    class="eventoCalendario"
    :style="[offset]"
    :class="{
      seleccionado,
      inmovible: enviandoQueryTotal || enviandoTiempos,
      primario: nivel === 'primario',
      secundario: nivel === 'secundario',
      participando: usuarioParticipanteEvento,
    }"
    @mousedown.left="grabbing = usuarioResponsableEvento ? true : false"
    @mousemove="desplazar"
    @mouseup.left.capture="
      grabDesplazamiento = 0;
      grabbing = false;
      soltarTodo();
    "
    @touchend="
      grabbingMinutosFinalMobile = false;
      grabbingMinutosInicioMobile = false;
    "
  >
    <img
      src="@/assets/iconos/maximizar.png"
      alt="Maximizar"
      id="botonAbrirEvento"
      v-show="seleccionado"
      @mousedown.left.stop="$emit('abrirEsteEvento')"
    />
    <div id="nombre">
      {{ esteEvento.nombre }}
    </div>

    <div
      id="botonEliminarEvento"
      class="botonEquis"
      @mousedown.left.stop=""
      @click.stop="eliminarse"
      v-if="usuarioResponsableEvento"
      v-show="
        seleccionado &&
        nivel === 'primario' &&
        !grabbing &&
        !grabbingMinutosInicio &&
        !grabbingMinutosFinal
      "
    >
      <div class="linea1"></div>
      <div class="linea2"></div>
    </div>
    <div
      class="agarraderoTiempo"
      id="agarraderoInicio"
      v-if="usuarioResponsableEvento"
      v-show="seleccionado && nivel === 'primario'"
      :style="[{ backgroundColor: grabbingMinutosInicio ? 'red' : '#9c4471' }]"
      @mousedown.left.stop="grabbingMinutosInicio = true"
      @touchstart.stop="setAgarraderoTiempoMobile('inicio')"
    >
      <div
        class="bloqueMovedorTiempoMobile"
        v-show="agarraderoTiempoSelectedMobile === 'inicio'"
        :class="{ deshabilitado: enviandoTiempos }"
        @dblclick.stop=""
      >
        <div
          class="movedorTiempoAdelante movedorTiempo"
          @click.stop="minutosInicioDesplazadoTentativo += 5"
        ></div>
        <div
          class="movedorTiempoAtras movedorTiempo"
          @click.stop="minutosInicioDesplazadoTentativo -= 5"
        ></div>
      </div>
    </div>
    <div
      class="agarraderoTiempo"
      id="agarraderoFinal"
      v-if="usuarioResponsableEvento"
      v-show="seleccionado && nivel === 'primario'"
      :style="[{ backgroundColor: grabbingMinutosFinal ? 'red' : '#9c4471' }]"
      @mousedown.left.stop="grabbingMinutosFinal = true"
      @click.stop=""
      @touchstart.stop="setAgarraderoTiempoMobile('final')"
    >
      <div
        class="bloqueMovedorTiempoMobile"
        v-show="agarraderoTiempoSelectedMobile === 'final'"
        :class="{ deshabilitado: enviandoTiempos }"
        @dblclick.stop=""
      >
        <div
          class="movedorTiempoAdelante movedorTiempo"
          @click.stop="minutosFinalDesplazadoTentativo += 5"
        ></div>
        <div
          class="movedorTiempoAtras movedorTiempo"
          @click.stop="minutosFinalDesplazadoTentativo -= 5"
        ></div>
      </div>
    </div>
    <div id="zonaArrastre" v-show="grabbing"></div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import debounce from "debounce";

export default {
  name: "EventoCalendario",
  props: {
    esteEvento: Object,
    widthHoraPx: Number,
    primerMinutoMediaHora: Number,
    minutoInicial: Number,
    milisDia: Number,
    seleccionado: Boolean,
    idEventoAbierto: String,
    nivel: String,
  },
  data() {
    return {
      grabbing: false,
      grabDesplazamiento: 0,
      grabbingMinutosInicio: false,
      grabbingMinutosFinal: false,
      grabbingMinutosInicioMobile: false,
      grabbingMinutosFinalMobile: false,
      minutosInicioDesplazadoTentativo: 0,
      minutosFinalDesplazadoTentativo: 0,

      enviandoTiempos: false,
      enviandoQueryTotal: false,

      agarraderoTiempoSelectedMobile: null,
      ultimoTouchX: 0,
    };
  },
  methods: {
    desplazarMinutos(minutos) {
      const milisUnMinuto = 60000;
      const milisDesplazados = minutos * milisUnMinuto;
      this.enviandoTiempos = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idEvento: ID!
              $nuevoHorarioInicio: Date!
              $nuevoHorarioFinal: Date!
            ) {
              setHorariosEvento(
                idEvento: $idEvento
                nuevoHorarioInicio: $nuevoHorarioInicio
                nuevoHorarioFinal: $nuevoHorarioFinal
              ) {
                id
                horarioInicio
                horarioFinal
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            nuevoHorarioInicio: new Date(
              this.milisDia +
                this.actualMinutosInicio * 60000 +
                milisDesplazados
            ),
            nuevoHorarioFinal: new Date(
              this.milisDia + this.actualMinutosFinal * 60000 + milisDesplazados
            ),
          },
        })
        .then(() => {
          this.enviandoTiempos = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoTiempos = false;
        });
    },
    desplazar(e) {
      if (!this.grabbing || this.enviandoTiempos || this.nivel != "primario")
        return;
      this.grabDesplazamiento++;
      if (this.grabDesplazamiento < 8) return;
      const parent = this.$el.closest(".zonaEventos");
      const posParent = parent.getBoundingClientRect();
      const leftMouse = e.clientX - posParent.left;
      const minutosMouse = (leftMouse * 60) / this.widthHoraPx;
      this.minutosInicioDesplazadoTentativo =
        this.minutoInicial + minutosMouse - this.duracionMinutos / 2;

      this.minutosFinalDesplazadoTentativo =
        this.minutosInicioDesplazadoTentativo + this.duracionMinutos;
    },
    modificarMinutos(e) {
      if (this.enviandoTiempos || this.enviandoQueryTotal) return;
      const parent = this.$el.closest(".zonaEventos");
      const posParent = parent.getBoundingClientRect();

      var leftEvent = 0;
      // if (this.grabbingMinutosInicioMobile || this.grabbingMinutosFinalMobile) {
      //   leftEvent = e.changedTouches[0].clientX-posParent.left;
      // }
      // else
      if (this.grabbingMinutosInicio || this.grabbingMinutosFinal) {
        leftEvent = e.clientX - posParent.left;
      } else {
        return;
      }

      const minutosEvent = (leftEvent * 60) / this.widthHoraPx;

      if (this.grabbingMinutosInicio || this.grabbingMinutosInicioMobile) {
        this.minutosInicioDesplazadoTentativo =
          this.minutoInicial + minutosEvent;
      }
      if (this.grabbingMinutosFinal || this.grabbingMinutosFinalMobile) {
        this.minutosFinalDesplazadoTentativo =
          this.minutoInicial + minutosEvent;
      }
    },
    resetVariablesEditarTiempos() {
      this.minutosInicioDesplazadoTentativo = this.actualMinutosInicio;
      this.minutosFinalDesplazadoTentativo = this.actualMinutosFinal;
    },
    guardarTiempos(e) {
      if (
        this.minutosInicioDesplazado === this.actualMinutosInicio &&
        this.minutosFinalDesplazado === this.actualMinutosFinal
      )
        return;

      if (this.enviandoTiempos) return;
      console.log(`Guardando nuevos tiempos`);
      if (e) e.stopPropagation();
      this.enviandoTiempos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idEvento: ID!
              $nuevoHorarioInicio: Date!
              $nuevoHorarioFinal: Date!
            ) {
              setHorariosEvento(
                idEvento: $idEvento
                nuevoHorarioInicio: $nuevoHorarioInicio
                nuevoHorarioFinal: $nuevoHorarioFinal
              ) {
                id
                horarioInicio
                horarioFinal
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            nuevoHorarioInicio: new Date(
              this.minutosInicioDesplazado * 60000 + this.milisDia
            ),
            nuevoHorarioFinal: new Date(
              this.minutosFinalDesplazado * 60000 + this.milisDia
            ),
          },
        })
        .then(() => {
          this.enviandoTiempos = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoTiempos = false;
        });
    },
    debGuardarTiempos: debounce(function () {
      this.guardarTiempos();
    }, 3000),
    eliminarse() {
      console.log(`Eliminando`);
      if (
        !confirm(
          "¿Confirmar la eliminación del evento? (Esta acción no se puede deshacer)"
        )
      )
        return;

      this.enviandoQueryTotal = true;
      this.$emit("desmarcarInicio");
      this.$emit("desmarcarFinal");
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!) {
              eliminarEventoCalendario(idEvento: $idEvento)
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
          },
        })
        .then(({ data: { eliminarEventoCalendario } }) => {
          this.enviandoQueryTotal = false;
          if (eliminarEventoCalendario) {
            this.$emit("meElimine", this.esteEvento.id);
          }
        })
        .catch((error) => {
          console.log(`Error eliminando evento: ${error}`);
          this.enviandoQueryTotal = false;
        });
    },
    teclaPresionada(e) {
      if (
        !this.seleccionado ||
        this.enviandoTiempos ||
        this.enviandoQueryTotal ||
        this.idEventoAbierto
      )
        return;

      const teclasUsadas = [37, 38, 39, 40];
      if (!teclasUsadas.includes(e.which)) return;
      e.stopPropagation();
      e.preventDefault();
      const minutosDia = 1440;
      switch (e.which) {
        case 37: //Flecha izquierda
          this.desplazarMinutos(-30);
          break;
        case 38: //Flecha arriba
          this.desplazarMinutos(-minutosDia);
          break;
        case 39: //Flecha derecha
          this.desplazarMinutos(30);
          break;
        case 40: //Flecha abajo
          this.desplazarMinutos(minutosDia);
          break;
      }
    },
    soltarTodo(e) {
      this.grabbingMinutosInicio = false;
      this.grabbingMinutosFinal = false;

      if (
        this.minutosInicioDesplazado != this.actualMinutosInicio ||
        this.minutosFinalDesplazado != this.actualMinutosFinal
      ) {
        if (this.agarraderoTiempoSelectedMobile === null) {
          console.log(`Guardando tiempos directamente`);
          this.guardarTiempos(e);
        } else {
          console.log(`Debounce guardar tiempos`);
          this.debGuardarTiempos();
        }
      }
    },
    setAgarraderoTiempoMobile(agarradero) {
      this.agarraderoTiempoSelectedMobile = agarradero;
    },
  },
  computed: {
    minutosInicioDesplazado() {
      const cincoMinutos = Math.round(
        this.minutosInicioDesplazadoTentativo / 5
      );
      var ajustado = cincoMinutos * 5;
      if (ajustado < 0) ajustado = 0;
      if (ajustado > 1410) ajustado = 1410;
      //if(ajustado>(this.minutosFinalDesplazado-5))ajustado=this.minutosFinalDesplazado-5;
      return ajustado;
    },
    // minutosInicioModificado() {
    //   const cincoMinutos = Math.round(
    //     this.minutosInicioModificadoTentativo / 5
    //   );
    //   var ajustado = cincoMinutos * 5;
    //   if (ajustado < 0) ajustado = 0;
    //   if (ajustado > 1410) ajustado = 1410;
    //   if(ajustado > this.actualMinutosFinal)ajustado=this.actualMinutosFinal-5;
    //   return ajustado;
    // },
    minutosFinalDesplazado() {
      const cincoMinutos = Math.round(this.minutosFinalDesplazadoTentativo / 5);
      var ajustado = cincoMinutos * 5;
      if (ajustado < 0) ajustado = 0;
      if (ajustado > 1410) ajustado = 1410;
      //if (ajustado<(this.minutosInicioDesplazado+5))ajustado=this.minutosInicioDesplazado+5;
      return ajustado;
    },
    duracionMinutos() {
      return this.actualMinutosFinal - this.actualMinutosInicio;
    },
    offset() {
      return {
        width:
          ((this.minutosFinalDesplazado - this.minutosInicioDesplazado) *
            this.widthHoraPx) /
            60 +
          "px",
        left:
          (this.minutosInicioDesplazado - this.minutoInicial) *
            (this.widthHoraPx / 60) +
          "px",
      };
    },
    actualMinutosInicio() {
      const inicioDate = new Date(this.esteEvento.horarioInicio);
      return inicioDate.getHours() * 60 + inicioDate.getMinutes();
    },
    actualMinutosFinal() {
      const finalDate = new Date(this.esteEvento.horarioFinal);
      return finalDate.getHours() * 60 + finalDate.getMinutes();
    },
    deltaTiempoInicio() {
      return this.actualMinutosInicio - this.minutosInicioDesplazado;
    },
    deltaTiempoFinal() {
      return this.actualMinutosFinal - this.minutosFinalDesplazado;
    },
    usuarioResponsableEvento() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteEvento.responsables.includes(this.usuario.id);
    },
    usuarioParticipanteEvento() {
      if (!this.usuario || !this.usuario.id) {
        return false;
      }

      return this.esteEvento.participantes.includes(this.usuario.id);
    },
  },
  watch: {
    esteEvento() {
      this.resetVariablesEditarTiempos();
    },
    seleccionado(nuevo) {
      this.agarraderoTiempoSelectedMobile = null;
      if (nuevo) {
        window.addEventListener("keydown", this.teclaPresionada);
        this.$emit("marcarInicio", this.minutosInicioDesplazado);
        this.$emit("marcarFinal", this.minutosFinalDesplazado);

        document
          .getElementById("graficoDias")
          .addEventListener("mouseup", this.soltarTodo);
        document
          .getElementById("graficoDias")
          .addEventListener("mousemove", this.modificarMinutos);
      } else {
        this.soltarTodo();
        this.$emit("desmarcarInicio");
        this.$emit("desmarcarFinal");
        window.removeEventListener("keydown", this.teclaPresionada);
        window.removeEventListener("mouseup", this.soltarTodo);
        document
          .getElementById("graficoDias")
          .removeEventListener("mousemove", this.modificarMinutos);
        document
          .getElementById("graficoDias")
          .removeEventListener("mouseup", this.soltarTodo);
      }
    },
    deltaTiempoInicio() {
      if (
        this.grabbingMinutosInicio ||
        this.grabbing ||
        this.agarraderoTiempoSelectedMobile != null
      )
        this.$emit("marcarInicio", this.minutosInicioDesplazado);
    },
    deltaTiempoFinal() {
      if (
        this.grabbingMinutosFinal ||
        this.grabbing ||
        this.agarraderoTiempoSelectedMobile != null
      )
        this.$emit("marcarFinal", this.minutosFinalDesplazado);
    },
  },
  mounted() {
    this.resetVariablesEditarTiempos();
    if (this.seleccionado) {
      window.addEventListener("keydown", this.teclaPresionada);
      window.addEventListener("mouseup", this.soltarTodo);
      document
        .getElementById("graficoDias")
        .addEventListener("mousemove", this.modificarMinutos);
    }
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.teclaPresionada);
    window.removeEventListener("mouseup", this.soltarTodo);
    document
      .getElementById("graficoDias")
      .removeEventListener("mousemove", this.modificarMinutos);
  },
};
</script>

<style scoped>
.eventoCalendario {
  min-height: 20px;
  height: 100%;
  min-width: 10px;
  cursor: pointer;
}
.eventoCalendario:not(.participando) {
  opacity: 0.5;
}
.eventoCalendario.seleccionado{
  z-index: 10;
}
.participando {
}
.inmovible {
  background-color: rgb(76, 99, 100);
  pointer-events: none;
}
/* .seleccionado {
  border: 1px dotted purple;
} */
.primario {
  background-color: cornflowerblue;
}
.secundario {
  background-color: darkorange;
}
#botonAbrirEvento {
  position: absolute;
  bottom: 105%;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  cursor: pointer;
  border: 1px solid black;
  border-radius: 50%;
}
#nombre {
  padding: 3px;
  font-size: 12px;
  user-select: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
#nombre:hover {
  overflow: visible;
}
#botonEliminarEvento {
  right: -24px;
  top: -24px;
}
.agarraderoTiempo {
  position: absolute;
  bottom: 0%;
  /* transform: translateX(-50%); */
  width: 10px;
  height: 10px;
  background-color: #9c4471;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}

#agarraderoInicio {
  left: 0%;
}
#agarraderoFinal {
  right: 0%;
}
.bloqueMovedorTiempoMobile {
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translateX(-50%);
  height: 100px;
  width: 200px;
  z-index: 1;
}
.movedorTiempo {
  position: absolute;
  cursor: pointer;
  bottom: 0%;
}
.movedorTiempoAdelante {
  width: 1px;
  height: 1px;
  border: 10px solid transparent;
  border-left-color: black;
  right: 65px;
}
.movedorTiempoAtras {
  width: 1px;
  height: 1px;
  border: 10px solid transparent;
  border-left-color: black;
  left: 65px;
  transform: rotateZ(180deg);
}
#zonaArrastre {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700%;
  height: 1800%;
  z-index: 100;
}
</style>