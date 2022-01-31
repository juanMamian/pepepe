<template>
  <div class="calendario" :class="{ eventoSiendoCreado }">
    <div id="contenedorControlesCalendario" class="contenedorControles">
      <div
        class="boton"
        v-show="enfasis === 'eventosPublicos'"
        v-if="
          usuarioLogeado &&
          usuario.permisos &&
          usuario.permisos.includes('maestraVida-profesor')
        "
        @click="
          modoEventosPublicosExtranjeros === 'invisibles'
            ? (modoEventosPublicosExtranjeros = 'full')
            : modoEventosPublicosExtranjeros === 'full'
            ? (modoEventosPublicosExtranjeros = 'barra')
            : (modoEventosPublicosExtranjeros = 'invisibles')
        "
        :style="{
          opacity:
            modoEventosPublicosExtranjeros === 'invisibles'
              ? 0.4
              : modoEventosPublicosExtranjeros === 'full'
              ? 1
              : 0.7,
        }"
        :title="
          modoEventosPublicosExtranjeros === 'invisibles'
            ? 'Mostrar todos los eventos públicos'
            : modoEventosPublicosExtranjeros === 'full'
            ? 'Minimizar otros eventos públicos'
            : 'Ocultar otros eventos públicos'
        "
      >
        <img src="@/assets/iconos/calendarPublic.svg" alt="Evento publico" />
      </div>

      <div
        class="boton"
        v-if="enfasis==='eventosPersonales'"
        @click="usuarioVeEventosPublicos = !usuarioVeEventosPublicos"
        :title="
          usuarioVeEventosPublicos
            ? 'Ocultar eventos públicos'
            : 'Mostrar eventos públicos'
        "
        :style="[{opacity: usuarioVeEventosPublicos?1:0.5}]"
      >
        <img src="@/assets/iconos/calendarPublic.svg" alt="Evento publico" />
      </div>
    </div>
    <div id="zonaScroll" ref="zonaScroll" @scroll="scrollingCalendario">
      <div id="barraHoras">
        <div
          class="hora"
          :style="[estiloSizeHora]"
          v-for="hora of 24"
          :key="'hora' + (hora - 1)"
        >
          {{ hora - 1 }}:00
        </div>
      </div>

      <div id="contenedorDias" :style="[estiloAnchoTiempo]">
        <div
          class="boton botonCargarDias"
          @click="addSemanaBefore"
          :style="[offsetScroll]"
        >
          <img src="@/assets/iconos/plusCircle.svg" alt="Mas" />
        </div>
        <dia-calendario
          :eventoSiendoCreado="eventoSiendoCreado"
          ref="diasCalendario"
          v-for="dia of diasRendered"
          :hoy="Date.parse(dateHoy) === Date.parse(dia.date)"
          :key="'dia' + Date.parse(dia.date)"
          :esteDia="dia"
          :horaPx="horaPx"
          :scrollXCalendario="scrollX"
          :idParent="idParent"
          :idEventoSeleccionado="idEventoSeleccionado"
          :idUsuarioTarget="idUsuarioTarget"
          :tipoParent="tipoParent"
          :enfasis="enfasis"
          :modoEventosPublicosExtranjeros="modoEventosPublicosExtranjeros"
          :usuarioVeEventosPublicos="usuarioVeEventosPublicos"
          @iniciaCreacionEvento="$emit('iniciaCreacionEvento')"
          @clickEnEvento="idEventoSeleccionado = $event.id"
          @desSeleccionDeEvento="idEventoSeleccionado = null"
          @eventoCreado="
            sendEventoCreadoToDias($event);
            $emit('eventoCreado', $event);
          "
          @eventoEliminado="
            sendEventoEliminadoToDias($event);
            $emit('eventoEliminado', $event);
          "
        />
        <div
          class="boton botonCargarDias"
          @click="addSemanaAfter"
          :style="[offsetScroll]"
        >
          <img src="@/assets/iconos/plusCircle.svg" alt="Mas" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import gql from 'graphql-tag';
import DiaCalendario from "./DiaCalendario.vue";

export default {
  components: { DiaCalendario },
  name: "Calendario",
  props: {
    idParent: String,
    idUsuarioTarget: String,
    tipoParent: String,
    enfasis: String,
  },
  apollo: {},
  data() {
    const dateHoy = new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);

    return {
      dateHoy,
      primerDia: {
        date: dateHoy,
        horaActual: new Date(Date.now()).getHours(),
      },
      diasPrevios: 2,
      diasPosteriores: 7,
      eventoSiendoCreado: null,

      horaPx: 100,
      scrollX: 0,

      idEventoSeleccionado: null,
      modoEventosPublicosExtranjeros: "invisibles",

      diasRendered: [{ date: dateHoy }],

      usuarioVeEventosPublicos:false,
    };
  },
  computed: {
    tipoEventoSiendoCreado() {
      if (!this.eventoSiendoCreado) return null;

      return this.eventoSiendoCreado.tipoEvento;
    },
    estiloSizeHora() {
      return {
        width: this.horaPx + "px",
      };
    },
    estiloAnchoTiempo() {
      return {
        width: this.horaPx * 24 + "px",
      };
    },
    offsetScroll() {
      const left = 10 + this.scrollX;
      return {
        left: left + "px",
      };
    },
  },
  methods: {
    scrollingCalendario() {
      this.scrollX = this.$refs.zonaScroll.scrollLeft;
    },
    scrollToHoraActual() {
      const dateActual = new Date();
      const minutosActual =
        dateActual.getMinutes() + dateActual.getHours() * 60;
      const minutosActualPx = (minutosActual * this.horaPx) / 60;
      this.$refs.zonaScroll.scrollLeft = minutosActualPx;
    },
    addSemanaBefore() {
      const dateFirstDiaRendered = this.diasRendered[0].date;
      const diaMillis = 86400000;

      var nuevosDias = [];
      for (var i = -7; i <= -1; i++) {
        let millisNuevoDia = dateFirstDiaRendered.getTime() + i * diaMillis;
        let nuevoDia = {
          date: new Date(millisNuevoDia),
        };
        nuevosDias.push(nuevoDia);
      }

      this.diasRendered.unshift(...nuevosDias);
    },
    addSemanaAfter() {
      const dateLastDiaRendered =
        this.diasRendered[this.diasRendered.length - 1].date;
      const diaMillis = 86400000;

      var nuevosDias = [];
      for (var i = 1; i <= 7; i++) {
        let millisNuevoDia = dateLastDiaRendered.getTime() + i * diaMillis;
        let nuevoDia = {
          date: new Date(millisNuevoDia),
        };
        nuevosDias.push(nuevoDia);
      }

      this.diasRendered.push(...nuevosDias);
    },
    sendEventoCreadoToDias(evento) {
      this.$refs.diasCalendario.forEach((dc) => {
        dc.addEventoCache(evento);
      });
    },
    sendEventoEliminadoToDias(evento) {
      this.$refs.diasCalendario.forEach((dc) => {
        dc.deleteEventoCache(evento);
      });
    },
  },
  mounted() {
    this.addSemanaAfter();
  },
};
</script>

<style scoped>
.calendario {
  max-width: 100vw;

  position: relative;
  max-height: 100vh;
}
.calendario.eventoSiendoCreado {
  border: 1px solid var(--paletaSelect);
}
.botonCargarDias {
  position: relative;
  width: 15px;
  height: 15px;
}
#zonaScroll {
  overflow-x: scroll;
  overflow-y: hidden;
  position: relative;
}
#barraHoras {
  display: flex;
  overflow: visible;
  padding: 14px 0px;
  position: absolute;
  left: 0px;
}
#barraHoras .hora {
  font-size: 10px;
  opacity: 0.4;
  position: relative;
  overflow: visible;
  flex-shrink: 0;
}
#contenedorDias {
  margin-top: 50px;
  max-height: 90vh;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  max-height: 60vh;
}
.lineaIndicadora {
  height: 100vh;
  position: absolute;
  top: 0px;
  transform: translateX(-50%);
  width: 2px;
  background-color: rgba(0, 0, 0, 0.473);
}

.hora:not(:hover) .lineaIndicadora {
  display: none;
}

.hora:hover .lineaIndicadora {
  display: block;
}

.diaCalendario {
  margin-bottom: 45px;
}
</style>