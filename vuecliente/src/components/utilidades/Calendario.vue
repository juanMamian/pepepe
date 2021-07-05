<template>
  <div class="calendario">
    <div id="controles">
      <div
        class="control"
        id="botonCrearEvento"
        @click="seleccionandoPlaceNuevoEvento = !seleccionandoPlaceNuevoEvento"
      >
        {{ seleccionandoPlaceNuevoEvento ? "Cancelar" : "Crear evento" }}
      </div>
    </div>
    <div id="eventoSeleccionado" v-if="eventoSeleccionado"></div>
    <div id="graficoDias">
      <div id="filaTiempo">
        <div
          id="contenedorMarcas"
          @mousedown.left="moviendoTiempos = true"
          @mouseup.left="moviendoTiempos = false"
          @mouseleave="moviendoTiempos = false"
          @mousemove="moverTiempos"
        >
          <div
            class="marcaTiempo"
            v-for="hora of horasVisibles"
            :key="'marcaHora' + hora"
            :style="[
              { left: ((hora * 60 - minutoInicial) * widthHoraPx) / 60 + 'px' },
            ]"
          >
            {{ hora }}
          </div>

          <div
            id="marcaTiempoInicialNuevoEvento"
            v-show="seleccionandoPlaceNuevoEvento"
            :style="[
              {
                left:
                  ((minutoInicialFantasmaNuevoEvento - minutoInicial) *
                    widthHoraPx) /
                    60 +
                  'px',
              },
            ]"
          >
            {{ horaFormateadaInicialFantasmaNuevoEvento }}
            <div
              class="lineaReferencia"
              v-if="montado"
              :style="[{ height: $el.offsetHeight + 'px' }]"
            ></div>
          </div>
          <div
            id="marcaTiempoFinalNuevoEvento"
            v-show="seleccionandoPlaceNuevoEvento"
            :style="[
              {
                left:
                  ((minutoFinalFantasmaNuevoEvento - minutoInicial) *
                    widthHoraPx) /
                    60 +
                  'px',
              },
            ]"
          >
            {{ horaFormateadaFinalFantasmaNuevoEvento }}
            <div
              class="lineaReferencia"
              v-if="montado"
              :style="[{ height: $el.offsetHeight + 'px' }]"
            ></div>
          </div>
        </div>
      </div>
      <div
        class="filaDia"
        :class="{ diaHoy: dia.hoy }"
        v-for="dia of diasVisibles"
        :key="'dia' + dia.date"
      >
        <div class="diaSemana">{{ numsDiasSemana[dia.diaSemana] }}</div>
        <div class="diaMes">
          <div class="numeroDiaMes">{{ dia.diaMes }}</div>
        </div>
        <div
          class="zonaEventos"
          @mousemove="setMinutoInicialFantasmaNuevoEvento"
          @click="crearNuevoEventoEnHorario(dia)"
        >
          <div
            class="fantasmaNuevoEvento"
            v-show="seleccionandoPlaceNuevoEvento"
            :style="[offsetFantasmaNuevoEvento]"
          ></div>
          <evento-calendario
            v-for="evento of getEventosDia(dia)"
            :key="evento.id"
            :esteEvento="evento"
            :primerMinutoMediaHora="primerMinutoMediaHora"
            :minutoInicial="minutoInicial"
            :dateDia="dia.milis"
            :widthHoraPx="widthHoraPx"                        
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import EventoCalendario from "./EventoCalendario.vue";
import { fragmentoEvento } from "./recursosGql";

const QUERY_EVENTOS_PROPIOS = gql`
  query ($origen: String!, $idOrigen: ID!) {
    eventosSegunOrigen(origen: $origen, idOrigen: $idOrigen) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;

export default {
  components: { EventoCalendario },
  name: "Calendario",
  apollo: {
    eventosPropios: {
      query: QUERY_EVENTOS_PROPIOS,
      variables() {
        return {
          origen: this.configCalendario.tipo,
          idOrigen: this.configCalendario.id,
        };
      },
      update(respuesta) {
        return respuesta.eventosSegunOrigen;
      },
    },
  },
  props: {
    configCalendario: Object,
  },
  data() {
    const dateHoy=new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);
    console.log(`Fecha hoy: ${dateHoy}`);
    return {
      eventosPropios: [],
      numsDiasSemana: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ],
      diaCentral: dateHoy.getTime(),
      minutoInicial: 480,
      montado: false,
      moviendoTiempos: false,
      widthHoraPx: 100,
      seleccionandoPlaceNuevoEvento: false,
      minutoInicialFantasmaNuevoEvento: 0,
      duracionFantasmaNuevoEvento: 60,

      eventoSeleccionado: null,
    };
  },
  computed: {
    diasVisibles() {
      var fechas = [];
      console.log(`Dia central ${this.diaCentral}`);
      for (var i = -5; i <= 5; i++) {
        let iteracionFecha = this.diaCentral + i * 86400000;
        fechas.push(iteracionFecha);
      }
      const dateHoy = new Date(Date.now());
      var fechasEnriquecidas = fechas.map((f) => {
        let laDate = new Date(f);
        var esHoy = false;
        console.log(`Comparando ${laDate} con ${dateHoy}`);
        if (
          dateHoy.getMonth() === laDate.getMonth() &&
          dateHoy.getDate() === laDate.getDate() &&
          dateHoy.getFullYear() === laDate.getFullYear()
        ) {
          esHoy = true;
        }
        return {
          date: laDate,
          milis: f,
          diaSemana: laDate.getDay(),
          diaMes: laDate.getDate(),
          hoy: esHoy,
        };
      });
      return fechasEnriquecidas;
    },
    horasVisibles() {
      if (!this.montado) return;
      const horasQueCaben = Math.ceil(
        document.getElementById("filaTiempo").offsetWidth / this.widthHoraPx
      );
      var primeraHora = Math.ceil(this.minutoInicial / 60);
      if (primeraHora < 0) primeraHora = 0;
      var arrayHoras = [];
      for (var i = 0; i <= horasQueCaben; i++) {
        let estaHora = primeraHora + i;
        if (estaHora < 24) arrayHoras.push(estaHora);
      }
      return arrayHoras;
    },
    primerMinutoMediaHora() {
      const margenInicial = this.minutoInicial % 30;
      const faltante = 30 - margenInicial;
      return this.minutoInicial + faltante;
    },
    offsetFantasmaNuevoEvento() {
      return {
        left:
          Math.round(
            ((this.minutoInicialFantasmaNuevoEvento - this.minutoInicial) *
              this.widthHoraPx) /
              60
          ) + "px",
        width:
          (this.duracionFantasmaNuevoEvento * this.widthHoraPx) / 60 + "px",
      };
    },
    horaFormateadaInicialFantasmaNuevoEvento() {
      const horas = Math.floor(this.minutoInicialFantasmaNuevoEvento / 60);
      const minutos = this.minutoInicialFantasmaNuevoEvento - horas * 60;
      var resultado = horas;
      if (minutos > 0) {
        resultado += ":" + minutos;
      }

      return resultado;
    },
    minutoFinalFantasmaNuevoEvento() {
      return (
        this.minutoInicialFantasmaNuevoEvento + this.duracionFantasmaNuevoEvento
      );
    },
    horaFormateadaFinalFantasmaNuevoEvento() {
      const horas = Math.floor(this.minutoFinalFantasmaNuevoEvento / 60);
      const minutos = this.minutoFinalFantasmaNuevoEvento - horas * 60;
      var resultado = horas;
      if (minutos > 0) {
        resultado += ":" + minutos;
      }

      return resultado;
    },
    eventosPropiosConDia(){
        return this.eventosPropios.map(evento=>{
            const fechaEvento=new Date(evento.horarioInicio)
            const dia=fechaEvento.getDate();
            const mes=fechaEvento.getMonth();
            const año=fechaEvento.getFullYear();
            evento.dia=dia;
            evento.mes=mes;
            evento.año=año;
            return evento;
        }) 

    }
  },
  methods: {
    crearNuevoEventoEnHorario(dia) {
      if (!this.seleccionandoPlaceNuevoEvento) return;
      const horarioI=new Date(dia.milis + (this.minutoInicialFantasmaNuevoEvento * 60000));
      const dateDia=new Date(dia.milis);
      console.log(`Creando con horario de inicio: ${horarioI.getHours()}h`);
      console.log(`Minuto inicial fantasma: ${this.minutoInicialFantasmaNuevoEvento}`);
      console.log(`dateDia: ${dateDia}`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $origen: String!
              $idOrigen: ID!
              $horarioInicio: Date!
              $horarioFinal: Date!
            ) {
              crearEventoCalendario(
                origen: $origen
                idOrigen: $idOrigen
                horarioInicio: $horarioInicio
                horarioFinal: $horarioFinal
              ) {
                ...fragEvento
              }
            }
            ${fragmentoEvento}
          `,
          variables: {
            origen: this.configCalendario.tipo,
            idOrigen: this.configCalendario.id,
            horarioInicio:
              dia.milis + (this.minutoInicialFantasmaNuevoEvento * 60000),
            horarioFinal:
              dia.milis + (this.minutoFinalFantasmaNuevoEvento * 60000),
          },
        })
        .then(() => {
          this.seleccionandoPlaceNuevoEvento = false;
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.seleccionandoPlaceNuevoEvento = false;
        });
    },
    moverTiempos(e) {
      if (!this.moviendoTiempos) return;

      this.minutoInicial -= e.movementX;
    },
    setMinutoInicialFantasmaNuevoEvento(e) {
      if (!this.seleccionandoPlaceNuevoEvento) return;
      var zonaEventos = e.target;
      const posParent = zonaEventos.getBoundingClientRect();
      const leftMouse = e.clientX - posParent.left;
      const leftPropio = leftMouse - this.widthHoraPx / 2;
      const minutosLeftMouse = Math.round((leftPropio * 60) / this.widthHoraPx);
      const deltaMinutos =
        minutosLeftMouse + this.minutoInicial - this.primerMinutoMediaHora;
      const mediasHoras = Math.round(deltaMinutos / 30);
      this.minutoInicialFantasmaNuevoEvento =
        this.primerMinutoMediaHora + mediasHoras * 30;
    },
    getEventosDia(dia){
        return this.eventosPropios.filter(e=>{
            const minutosEvento=Math.floor(Date.parse(e.horarioInicio)/(1000*60*60*24));
            const minutosDia=Math.floor(dia.milis/(1000*60*60*24));
            if(minutosEvento===minutosDia){
                return true;
            }
            else{
                return false;
            }
        })
    }
  },
  mounted() {
    this.montado = true;
  },
};
</script>

<style scoped>
.calendario {
  overflow: hidden;
}
#controles {
  display: flex;
}
.control {
  cursor: pointer;
  padding: 3px 5px;
  font: 14px;
}
.control:hover {
  background-color: cadetblue;
}
#filaTiempo {
  z-index: 1;
}
#contenedorMarcas {
  margin-left: 135px;
  height: 40px;
  position: relative;
  cursor: pointer;
}
.marcaTiempo {
  font-size: 13px;
  color: gray;
  position: absolute;
  top: 10px;
  user-select: none;
  transform: translateX(-50%);
}
#marcaTiempoInicialNuevoEvento {
  position: absolute;
  top: 10px;
  user-select: none;
  color: rgb(36, 123, 126);
  font-size: 13px;
  transform: translateX(-50%);
  z-index: 1;
}
#marcaTiempoFinalNuevoEvento {
  position: absolute;
  top: 10px;
  user-select: none;
  color: rgb(36, 123, 126);
  font-size: 13px;
  transform: translateX(-50%);
  z-index: 1;
}
.lineaReferencia {
  width: 1px;
  background-color: cadetblue;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}
.filaDia {
  display: flex;
  min-height: 50px;
  z-index: 0;
  border-bottom: 1px solid rgb(146, 146, 146);
}
.diaHoy {
  background-color: cadetblue;
}
.diaSemana {
  min-width: 100px;
  width: 100px;
}
.diaMes {
  min-width: 25px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: chocolate;
  margin-left: 10px;
  position: relative;
}
.numeroDiaMes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
}
.zonaEventos {
  background-color: rgb(250, 223, 214);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.zonaEventos:not(:hover) > .fantasmaNuevoEvento {
  display: none;
}
.zonaEventos:hover > .fantasmaNuevoEvento {
  display: block;
}
.fantasmaNuevoEvento {
  background-color: cadetblue;
  position: absolute;
  height: 30px;
  pointer-events: none;
}
.eventoCalendario{
    position: absolute
}
</style>