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

      <div
        class="boton"
        v-show="(usuario && usuario.id===idUsuarioTarget) || usuarioSuperadministrador || usuarioProfe"
        :title="
          tomandoAccion === 'semana'
            ? 'Cancelar'
            : tomandoAccion === 'dia'
            ? 'Editar semanas'
            : 'Editar días'
        "
        @click="
          tomandoAccion =
            tomandoAccion === 'semana'
              ? null
              : tomandoAccion === 'dia'
              ? 'semana'
              : 'semana'
        "
        :style="[{ opacity: tomandoAccion ? 1 : 0.5 }]"
      >
        <img src="@/assets/iconos/thList.svg" alt="Lista" />
      </div>
    </div>

    <div id="bloqueSelect" v-show="!diaSeleccionado">
      <div id="barraFecha">
        <div id="bloqueMes">
          <div
            id="nombreMes"
            v-show="!seleccionandoMes"
            @click="iniciarSeleccionandoMes"
          >
            {{ nombreMesSeleccionado }}
          </div>
          <select
            ref="selectMes"
            id="selectMes"
            v-model="numeroMesSeleccionado"
            v-show="seleccionandoMes"
          >
            <option
              :value="index"
              v-for="(mes, index) of nombresMeses"
              :key="'selector' + mes"
            >
              {{ mes }}
            </option>
          </select>
        </div>
        <loading texto="" v-show="$apollo.queries.cantidadEventosRelevantesMes.loading" />

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
          :class="{
            hoy:
              dateHoy.getFullYear() === yearSeleccionado &&
              dateHoy.getMonth() === parseInt(numeroMesSeleccionado) &&
              dateHoy.getDate() === dia,
          }"
          @click="numeroDiaSeleccionado = dia"
        >
          <div class="numeroDia" >{{ dia }}{{dateHoy.getFullYear() === yearSeleccionado &&
              dateHoy.getMonth() === parseInt(numeroMesSeleccionado) &&
              dateHoy.getDate() === dia?' Hoy':''}}</div>
          <div
            class="bolitaCantidadEventosRelevantes"
            v-if="cantidadEventosRelevantesMes.some((info) => info.dia === dia)"
            :style="[{opacity: tomandoAccion==='dia'?0.4:1}]"
          >
            <div class="laCantidad">
              {{
                cantidadEventosRelevantesMes.find((info) => info.dia === dia)
                  .cantidadEventos
              }}
            </div>
          </div>
          <div id="contenedorBotonesDia" v-show="tomandoAccion === 'dia'">
            <div class="boton" title="Repetir los eventos de este día">
              <img src="@/assets/iconos/relojArena.svg" alt="Reloj" />
            </div>
            <div class="boton" title="Eliminar todos los eventos de este día">
              <img src="@/assets/iconos/broom.svg" alt="Limpiar" />
            </div>
          </div>
        </div>
        <div id="representacionSemanas" v-show="tomandoAccion === 'semana'">
          <div
            class="semana"
            v-for="(semana, index) of semanasMes"
            :key="'semana' + semana"
          >
            <div id="contenedorBotonesSemana">
              <div
                class="boton"
                title="Repetir los eventos de esta semana"
                @click="repetirEventosSemana(index)"
              >
                <img src="@/assets/iconos/relojArena.svg" alt="Reloj" />
              </div>
              <div
                class="boton"
                title="Eliminar todos los eventos de esta semana"
                @click="deleteEventosSemana(index)"
              >
                <img src="@/assets/iconos/broom.svg" alt="Limpiar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <dia-calendario
      v-if="diaSeleccionado"
      :eventoSiendoCreado="eventoSiendoCreado"
      :hoy="dateHoy.getTime() === diaSeleccionado.date.getTime()"
      :key="'dia' + diaSeleccionado.date.getTime()"
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
      @cambioEventos="reloadEventosRelevantes"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
// import { gql } from "@apollo/client/core"
import DiaCalendario from "./DiaCalendario.vue";
import debounce from "debounce";
import Loading from './Loading.vue';

export default {
  components: { DiaCalendario, Loading },
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
        query (
          $year: Int!
          $mes: Int!
          $idParent: ID!
          $tipoParent: String!
          $timeZoneOffset: Int!
        ) {
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
          idParent: this.idParent ? this.idParent : this.idUsuarioTarget,
          tipoParent: this.tipoParent ? this.tipoParent : "usuario",
          timeZoneOffset: new Date().getTimezoneOffset(),
        };
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    const dateHoy = new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);

    return {
      cantidadEventosRelevantesMes: [],
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
      seleccionandoMes: false,
      yearSeleccionado: dateHoy.getFullYear(),
      numeroDiaSeleccionado: null,

      eventoSiendoCreado: null,

      horaPx: 100,
      scrollX: 0,

      idEventoSeleccionado: null,
      modoEventosPublicosExtranjeros: "invisibles",

      diasRendered: [{ date: dateHoy }],

      usuarioVeEventosPublicos: false,

      tomandoAccion: null,
      enviandoAccionIntervalo: false,
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
        parseInt(this.numeroMesSeleccionado + 1),
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
    semanasMes() {
      console.log(`Calculando semanasMes`);
      const diaSemana = new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado),
        1
      ).getDay();
      console.log(`Dia semana inicio de mes: ${diaSemana}`);
      const diaSemanaCorregido=diaSemana===0?7:diaSemana;
      const semanasCompletas = Math.floor(this.lengthMonthSeleccionado / 7);
      console.log(`${semanasCompletas} semanas completas`);
      const diasSobrantes = this.lengthMonthSeleccionado - semanasCompletas * 7;
      console.log(`${diasSobrantes} dias sobrantes`);
      var semanasTotales = semanasCompletas;
      if (diaSemanaCorregido > 1) {
        semanasTotales++;
      }

      if (
        diasSobrantes + diaSemanaCorregido > 7 ||
        (diasSobrantes > 0 && diaSemanaCorregido === 1)
      ) {
        semanasTotales++;
      }
      return semanasTotales;
    },
  },
  methods: {
    iniciarSeleccionandoMes() {
      this.seleccionandoMes = true;
      this.$nextTick(() => {
        this.$refs.selectMes.click();
      });
    },
    repetirEventosSemana(numSemana) {
      console.log(`Se repetirán los eventos de la semana ${numSemana}`);
      var numRepeticiones = parseInt(
        prompt("¿Cuantas veces quieres repetir el horario de esta semana?", 0)
      );

      if (numRepeticiones < 1 || numRepeticiones > 52) {
        console.log(`Valor de repeticiones inválido`);
        return;
      }
      const millisDia = 1000 * 60 * 60 * 24;
      const primerDiaMes = new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado),
        1
      ).getDay();
      console.log(`Primer dia mes: ${primerDiaMes}`);
      const primerDiaMesCorregido=primerDiaMes===0?7:primerDiaMes;

      const dateFrom = new Date(
        new Date(
          this.yearSeleccionado,
          parseInt(this.numeroMesSeleccionado),
          1
        ).getTime() +
          millisDia * 7 * numSemana -
          (primerDiaMesCorregido - 1) * millisDia
      );
      const dateTo = new Date(dateFrom.getTime() + millisDia * 7);
      this.repetirEventosInterval(
        dateFrom,
        dateTo,
        this.idParent ? this.idParent : this.idUsuarioTarget,
        this.tipoParent ? this.tipoParent : "usuario",
        this.idUsuarioTarget,
        numRepeticiones
      );
    },
    repetirEventosInterval(
      dateFrom,
      dateTo,
      idParent,
      tipoParent,
      idUsuario,
      numRepeticiones
    ) {
      console.log(
        `Se repetiran los eventos que están entre ${dateFrom} y ${dateTo}, ${numRepeticiones} veces`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idParent: ID!
              $tipoParent: String!
              $idUsuario: ID!
              $numRepeticiones: Int!
              $dateFrom: Date!
              $dateTo: Date!
            ) {
              repetirEventosTroughInterval(
                idParent: $idParent
                tipoParent: $tipoParent
                idUsuario: $idUsuario
                numRepeticiones: $numRepeticiones
                dateFrom: $dateFrom
                dateTo: $dateTo
              )
            }
          `,
          variables: {
            idParent: this.idParent ? this.idParent : this.idUsuarioTarget,
            tipoParent: this.tipoParent ? this.tipoParent : "usuario",
            idUsuario: this.idUsuarioTarget,
            numRepeticiones,
            dateFrom,
            dateTo,
          },
        })
        .then(() => {
          this.reloadEventosRelevantes();
          alert("Operación completada");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoAccionIntervalo = false;
        });
    },
    deleteEventosSemana(numSemana) {
      console.log(`Se eliminaran los eventos de la semana ${numSemana}`);
      if (
        !confirm(
          "¿Confirmar la eliminación de los eventos de esta semana? (Esta acción no puede deshacerse)"
        )
      ) {
        return;
      }

      const millisDia = 1000 * 60 * 60 * 24;
      const primerDiaMes = new Date(
        this.yearSeleccionado,
        parseInt(this.numeroMesSeleccionado),
        1
      ).getDay();
      console.log(`Primer dia mes: ${primerDiaMes}`);
      const primerDiaMesCorregido=primerDiaMes===0?7:primerDiaMes;
      console.log(`Primer dia mes corregido: ${primerDiaMesCorregido}`);

      const dateFrom = new Date(
        new Date(
          this.yearSeleccionado,
          parseInt(this.numeroMesSeleccionado),
          1
        ).getTime() +
          millisDia * 7 * numSemana -
          (primerDiaMesCorregido - 1) * millisDia
      );
      const dateTo = new Date(dateFrom.getTime() + millisDia * 7);
      this.deleteEventosInterval(
        dateFrom,
        dateTo,
        this.idParent ? this.idParent : this.idUsuarioTarget,
        this.tipoParent ? this.tipoParent : "usuario",
        this.idUsuarioTarget
      );
    },
    deleteEventosInterval(dateFrom, dateTo, idParent, tipoParent, idUsuario) {
      console.log(
        `Se eliminarán los eventos que están entre ${dateFrom} y ${dateTo}`
      );
      this.enviandoAccionIntervalo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idParent: ID!
              $tipoParent: String!
              $idUsuario: ID!
              $dateFrom: Date!
              $dateTo: Date!
            ) {
              deleteEventosTroughInterval(
                idParent: $idParent
                tipoParent: $tipoParent
                idUsuario: $idUsuario
                dateFrom: $dateFrom
                dateTo: $dateTo
              )
            }
          `,
          variables: {
            idParent,
            tipoParent,
            idUsuario,
            dateFrom,
            dateTo,
          },
        })
        .then(() => {
          this.reloadEventosRelevantes();
          this.enviandoAccionIntervalo = false;
          alert("Operación completada");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoAccionIntervalo = false;
        });
    },
    reloadEventosRelevantes: debounce(function () {
      console.log(`Reloading cantidades mes`);
      this.$apollo.queries.cantidadEventosRelevantesMes.refetch();
    }, 1000),
  },
  watch: {
    numeroMesSeleccionado() {
      this.seleccionandoMes = false;
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
#contenedorControlesCalendario .boton{
margin: 0px 10px;
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
  position: relative;
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
  position: relative;
}
.selectorDia:hover {
  background-color: var(--paletaMain);
}
.selectorDia.hoy {
  background-color: var(--paletaSelect);
}
.selectorDia.hoy .numeroDia{
  color: white;
}

.bolitaCantidadEventosRelevantes {
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
#representacionSemanas {
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: rgba(221, 221, 221, 0.623);
}
.semana {
  height: 12vh;
  width: 98%;
  border: 0.5px solid rgb(109, 109, 109);
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
}
#contenedorBotonesDia {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
}
#contenedorBotonesSemana {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  justify-content: center;
  align-items: center;
}
#contenedorBotonesSemana .boton {
  margin: 0px 10px;
}
</style>