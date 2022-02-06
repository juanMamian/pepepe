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
        v-if="enfasis === 'eventosPersonales'"
        @click="usuarioVeEventosPublicos = !usuarioVeEventosPublicos"
        :title="
          usuarioVeEventosPublicos
            ? 'Ocultar eventos públicos'
            : 'Mostrar eventos públicos'
        "
        :style="[{ opacity: usuarioVeEventosPublicos ? 1 : 0.5 }]"
      >
        <img src="@/assets/iconos/calendarPublic.svg" alt="Evento publico" />
      </div>
    </div>

    <div id="bloqueSelect" v-show="!diaSeleccionado">
      <div id="barraFecha">
        <div id="bloqueMes">
          <div id="nombreMes">{{ nombreMesSeleccionado }}</div>
          <select name="" id="selectMes" v-model="numeroMesSeleccionado">
            <option :value="index" v-for="(mes, index) of nombresMeses" :key="'selector'+mes">{{mes}}</option>
            
          </select>
        </div>

        <div id="bloqueYear" style="margin-left: auto">
          <div id="nombreYear">
            {{ yearSeleccionado }}
          </div>
        </div>
      </div>

      <div id="barraDiasSemana">
        <div class="diaSemana" v-for="dia of 7" :key="'diaSemana' + dia">
          {{ nombresDiasSemana[dia - 1].charAt(0) }}
        </div>
      </div>

      <div id="contenedorMesh">
        <div id="margenInicio" :style="[estiloMargenInicio]"></div>
        <div
          class="selectorDia"
          v-for="dia of lengthMonthSeleccionado"
          :key="'selectorDia' + dia"
          :class="{hoy: dateHoy.getFullYear()===yearSeleccionado && dateHoy.getMonth()===parseInt(numeroMesSeleccionado) && dateHoy.getDate()===dia}"
          @click="numeroDiaSeleccionado = dia"
        >
          <div class="numeroDia">{{ dia }}</div>
          <div
            class="bolitaCantidadEventosRelevantes"
            v-if="cantidadEventosRelevantesMes.some((info) => info.dia === dia)"
          >
            <div class="laCantidad">
              {{
                cantidadEventosRelevantesMes.find((info) => info.dia === dia).cantidadEventos
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <dia-calendario
      v-if="diaSeleccionado"
      :eventoSiendoCreado="eventoSiendoCreado"
      :hoy="Date.parse(dateHoy) === Date.parse(diaSeleccionado.date)"
      :key="'dia' + Date.parse(diaSeleccionado.date)"
      :esteDia="diaSeleccionado"
      :horaPx="horaPx"
      :scrollXCalendario="scrollX"
      :idParent="idParent"
      :idEventoSeleccionado="idEventoSeleccionado"
      :idUsuarioTarget="idUsuarioTarget"
      :tipoParent="tipoParent"
      :enfasis="enfasis"
      :modoEventosPublicosExtranjeros="modoEventosPublicosExtranjeros"
      :usuarioVeEventosPublicos="usuarioVeEventosPublicos"
      @regresar="numeroDiaSeleccionado = null"
      @iniciaCreacionEvento="$emit('iniciaCreacionEvento')"
      @clickEnEvento="idEventoSeleccionado = $event.id"
      @desSeleccionDeEvento="idEventoSeleccionado = null"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
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
  apollo: {
    cantidadEventosRelevantesMes: {
      query: gql`
        query ($year: Int!, $mes: Int!, $idParent: ID!, $tipoParent: String!, $timeZoneOffset:Int!,) {
          cantidadEventosRelevantesMes(
            year: $year
            mes: $mes
            idParent: $idParent
            tipoParent: $tipoParent
            timeZoneOffset: $timeZoneOffset
          ) {
            dia
            cantidadEventos
          }
        }
      `,
      variables() {
        return {
          year: this.yearSeleccionado,
          mes: parseInt(this.numeroMesSeleccionado),
          idParent:
            this.idParent
              ? this.idParent
              : this.idUsuarioTarget,
          tipoParent:
            this.tipoParent?this.tipoParent:'usuario',
          timeZoneOffset:new Date().getTimezoneOffset(),
        };
      },
      fetchPolicy: "cache-and-network"
    },
  },
  data() {
    const dateHoy = new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);

    return {
      cantidadEventosRelevantesMes:[],
      nombresDiasSemana: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sabado",
        "Domingo",
      ],

      nombresMeses: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],

      dateHoy,
      primerDia: {
        date: dateHoy,
        horaActual: new Date(Date.now()).getHours(),
      },
      numeroMesSeleccionado: dateHoy.getMonth(),
      yearSeleccionado: dateHoy.getFullYear(),
      numeroDiaSeleccionado: null,

      eventoSiendoCreado: null,

      horaPx: 100,
      scrollX: 0,

      idEventoSeleccionado: null,
      modoEventosPublicosExtranjeros: "invisibles",

      diasRendered: [{ date: dateHoy }],

      usuarioVeEventosPublicos: false,
    };
  },
  computed: {
    tipoEventoSiendoCreado() {
      if (!this.eventoSiendoCreado) return null;

      return this.eventoSiendoCreado.tipoEvento;
    },
    offsetScroll() {
      const left = 10 + this.scrollX;
      return {
        left: left + "px",
      };
    },
    nombreMesSeleccionado() {
      return this.nombresMeses[parseInt(this.numeroMesSeleccionado)];
    },
    lengthMonthSeleccionado() {
      return new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado+1),
        0
      ).getDate();
    },
    diasMargenInicio() {
      return new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado),
        0
      ).getDay();
    },
    estiloMargenInicio() {
      return {
        width: this.diasMargenInicio * 14 + "%",
      };
    },
    diaSeleccionado() {
      if (!this.numeroDiaSeleccionado) return null;
      const dateDiaSeleccionado = new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado),
        this.numeroDiaSeleccionado,
        0
      );
      return {
        date: dateDiaSeleccionado,
      };
    },
  },
};
</script>

<style scoped>
.calendario {
  width: min(100vw, 900px);
  background-color: #ecebe4;
  position: relative;
  max-height: 100vh;
  margin: 0px auto;
}
.calendario.eventoSiendoCreado {
  border: 1px solid var(--paletaSelect);
}
.botonCargarDias {
  position: relative;
  width: 15px;
  height: 15px;
}
#barraFecha {
  display: flex;
  color: #6d6d6d;
}
#barraDiasSemana {
  margin-top: 25px;
  display: flex;
  width: 100%;
  color: #6d6d6d;
}
.diaSemana {
  width: 14.3%;
  text-align: center;
}
.numeroDia {
  font-size: 11px;
  color: #6d6d6d;
}
#contenedorMesh {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
}
#margenInicio {
  height: 10px;
}
.selectorDia {
  width: 14%;
  height: 12vh;
  border: 0.5px solid rgb(204, 204, 204);
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
  position:relative
}
.selectorDia:hover {
  background-color: var(--paletaMain);
}
.selectorDia.hoy{
  background-color: var(--paletaMain);

}

.bolitaCantidadEventosRelevantes{
  border-radius: 50%;
  width: 25px;
  height: 25px;
  background-color: var(--mainColor);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
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