<template>
  <div
    class="calendario"
    @mouseup.left="
      idEventoSeleccionado = null;
      idEventoAbierto = null;
    "
    @mouseenter="hoveringCalendario = true"
    @mouseleave="hoveringCalendario = false"
  >
    <div id="controles">
      <div
        class="control"
        id="botonCrearEvento"
        @click="seleccionandoPlaceNuevoEvento = !seleccionandoPlaceNuevoEvento"
      >
        {{ seleccionandoPlaceNuevoEvento ? "Cancelar" : "Crear evento" }}
      </div>
    </div>
    <ventana-evento-calendario
      v-if="eventoAbierto"
      :key="idEventoAbierto"
      :esteEvento="eventoAbierto"
    />
    <div id="graficoDias">
      <div id="filaTiempo">
        <div
          id="contenedorMarcas"
          @mousedown.left="moviendoTiempos = true"
          @mouseup.left="moviendoTiempos = false"
          @mouseleave="moviendoTiempos = false"
          @mousemove="moverTiempos"
          @touchstart="iniciaMovimientoTouch"
          @touchmove="moverTiemposTouch"
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
            id="marcaTiempoInicialEvento"
            v-show="tiempoInicioMarcado"
            :style="[
              {
                left:
                  ((tiempoInicioMarcado - minutoInicial) * widthHoraPx) / 60 +
                  'px',
              },
            ]"
          >
            {{
              tiempoInicioMarcado % 60 > 0
                ? tiempoInicioMarcado % 60
                : tiempoInicioMarcado / 60
            }}
            <div
              class="lineaReferencia"
              v-if="montado"
              :style="[{ height: $el.offsetHeight + 'px' }]"
            ></div>
          </div>

          <div
            id="marcaTiempoFinalEvento"
            v-show="tiempoFinalMarcado"
            :style="[
              {
                left:
                  ((tiempoFinalMarcado - minutoInicial) * widthHoraPx) / 60 +
                  'px',
              },
            ]"
          >
            {{
              tiempoFinalMarcado % 60 > 0
                ? tiempoFinalMarcado % 60
                : tiempoFinalMarcado / 60
            }}
            <div
              class="lineaReferencia"
              v-if="montado"
              :style="[{ height: $el.offsetHeight + 'px' }]"
            ></div>
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
        <div class="zonaInfoDia" :class="{ diaHoy: dia.hoy }">
          <div class="diaMes">
            <div class="numeroDiaMes">{{ dia.diaMes }}</div>
          </div>
          <div class="diaSemana">{{ numsDiasSemana[dia.diaSemana] }}</div>
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
            ref="eventos"
            :esteEvento="evento"
            :idEventoAbierto="idEventoAbierto"
            :primerMinutoMediaHora="primerMinutoMediaHora"
            :minutoInicial="minutoInicial"
            :milisDia="dia.milis"
            :widthHoraPx="widthHoraPx"
            :seleccionado="idEventoSeleccionado === evento.id"
            @mouseup.native.left.stop="idEventoSeleccionado = evento.id"
            @meElimine="eliminarEventoDeCache"
            @dblclick.native="idEventoAbierto = evento.id"
            @marcarInicio="tiempoInicioMarcado = $event"
            @marcarFinal="tiempoFinalMarcado = $event"
            @desmarcarInicio="tiempoInicioMarcado = null"
            @desmarcarFinal="tiempoFinalMarcado = null"
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
import VentanaEventoCalendario from "./VentanaEventoCalendario.vue";

const QUERY_EVENTOS_ORIGEN = gql`
  query ($origen: String!, $idOrigen: ID!) {
    eventosSegunOrigen(origen: $origen, idOrigen: $idOrigen) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
const QUERY_EVENTOS_USUARIO = gql`
  query ($idUsuario:ID!) {
    eventosUsuario(idUsuario:$idUsuario) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
export default {
  components: { EventoCalendario, VentanaEventoCalendario },
  name: "Calendario",
  apollo: {
    eventosOrigen: {
      query: QUERY_EVENTOS_ORIGEN,
      variables() {
        return {
          origen: this.configCalendario.tipo,
          idOrigen: this.configCalendario.id,
        };
      },
      update(respuesta) {
        return respuesta.eventosSegunOrigen;
      },
      skip(){
        const origenes=["club"];
        if(!this.configCalendario || !this.configCalendario.tipo)return true;
        return !origenes.includes(this.configCalendario.tipo);
      }
    },
    eventosUsuario:{
      query: QUERY_EVENTOS_USUARIO,
      variables(){
        console.log(`Preparando query eventosUsuario con idUsuario ${this.usuario.id}`);
        return{
          idUsuario: this.usuario.id
        }
      },
      skip(){
        var decision=(!this.usuario || !this.usuario.id);
        
        return decision;
      }
    }
  },
  props: {
    configCalendario: Object,
  },
  data() {
    const dateHoy = new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);
    
    return {
      hoveringCalendario: false,
      eventosOrigen: [],
      eventosUsuario:[],
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
      tiempoInicioMarcado: null,
      tiempoFinalMarcado: null,

      ultimoTouchX:0,
      ultimoTouchY:0,

      idEventoSeleccionado: null,
      idEventoAbierto: null,
    };
  },
  computed: {
    diasVisibles() {
      var fechas = [];
      for (var i = -5; i <= 5; i++) {
        let iteracionFecha = this.diaCentral + i * 86400000;
        fechas.push(iteracionFecha);
      }
      const dateHoy = new Date(Date.now());
      var fechasEnriquecidas = fechas.map((f) => {
        let laDate = new Date(f);
        var esHoy = false;
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
        if (estaHora <= 24) arrayHoras.push(estaHora);
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
    eventosOrigenConDia() {
      return this.eventosOrigen.map((evento) => {
        const fechaEvento = new Date(evento.horarioInicio);
        const dia = fechaEvento.getDate();
        const mes = fechaEvento.getMonth();
        const año = fechaEvento.getFullYear();
        evento.dia = dia;
        evento.mes = mes;
        evento.año = año;
        return evento;
      });
    },
    eventoSeleccionado() {
      if (!this.idEventoSeleccionado) return null;

      return this.eventosOrigen.find(
        (e) => e.id === this.idEventoSeleccionado
      );
    },
    todosEventos() {
      return this.eventosOrigen.concat(this.eventosUsuario);
    },
    eventoAbierto() {
      if (!this.idEventoAbierto) return null;
      return this.todosEventos.find((e) => e.id === this.idEventoAbierto);
    },
    
  },
  methods: {
    crearNuevoEventoEnHorario(dia) {
      if (!this.seleccionandoPlaceNuevoEvento) return;
      const horarioI = new Date(
        dia.milis + this.minutoInicialFantasmaNuevoEvento * 60000
      );
      const dateDia = new Date(dia.milis);
      console.log(`Creando con horario de inicio: ${horarioI.getHours()}h`);
      console.log(
        `Minuto inicial fantasma: ${this.minutoInicialFantasmaNuevoEvento}`
      );
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
              dia.milis + this.minutoInicialFantasmaNuevoEvento * 60000,
            horarioFinal:
              dia.milis + this.minutoFinalFantasmaNuevoEvento * 60000,
          },
        })
        .then(({ data: { crearEventoCalendario } }) => {
          this.seleccionandoPlaceNuevoEvento = false;
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_EVENTOS_ORIGEN,
            variables: {
              origen: this.configCalendario.tipo,
              idOrigen: this.configCalendario.id,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          let indexE = nuevoCache.eventosSegunOrigen.findIndex(
            (e) => e.id == crearEventoCalendario.id
          );
          if (indexE > -1) {
            console.log(`El evento ya estaba en caché`);
          } else {
            nuevoCache.eventosSegunOrigen.push(crearEventoCalendario);
            store.writeQuery({
              query: QUERY_EVENTOS_ORIGEN,
              variables: {
                origen: this.configCalendario.tipo,
                idOrigen: this.configCalendario.id,
              },
              data: nuevoCache,
            });
            this.$nextTick(() => {
              this.idEventoSeleccionado = crearEventoCalendario.id;
            });
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.seleccionandoPlaceNuevoEvento = false;
        });
    },
    moverTiempos(e) {
      if (!this.moviendoTiempos) return;

      this.minutoInicial -= e.movementX;
      if (this.minutoInicial < 0) this.minutoInicial = 0;
      if (this.minutoInicial > 1380) this.minutoInicial = 1380;
    },
    iniciaMovimientoTouch(e) {      
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
    },
    moverTiemposTouch(e) {
      e.preventDefault();
      const deltaX = e.changedTouches[0].clientX - this.ultimoTouchX;
      // const deltaY = e.changedTouches[0].clientY - this.ultimoTouchY;
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
      
      this.minutoInicial -= deltaX;
      
      if (this.minutoInicial < 0) this.minutoInicial = 0;
      if (this.minutoInicial > 1380) this.minutoInicial = 1380;
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
    getEventosDia(dia) {
      return this.todosEventos.filter((e) => {
        const dateEvento = new Date(e.horarioInicio);
        const dateDia = dia.date;
        if (
          dateEvento.getFullYear() === dateDia.getFullYear() &&
          dateEvento.getMonth() === dateDia.getMonth() &&
          dateEvento.getDate() === dateDia.getDate()
        ) {
          return true;
        } else {
          return false;
        }
      });
    },
    eliminarEventoDeCache(idEvento) {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_EVENTOS_ORIGEN,
        variables: {
          origen: this.configCalendario.tipo,
          idOrigen: this.configCalendario.id,
        },
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var eventos = nuevoCache.eventosSegunOrigen;

      const indexE = eventos.findIndex((e) => e.id === idEvento);
      if (indexE > -1) {
        eventos.splice(indexE, 1);
        store.writeQuery({
          query: QUERY_EVENTOS_ORIGEN,
          variables: {
            origen: this.configCalendario.tipo,
            idOrigen: this.configCalendario.id,
          },
          data: nuevoCache,
        });
      } else {
        console.log(`El evento no estaba en cache`);
      }
    },
    moverDias(e) {
      if (!this.hoveringCalendario) return;

      if(!e.ctrlKey && !e.shiftKey)return
      e.preventDefault();
      const deltaTiempos=30;

      if (e.deltaY > 0) {
        if (e.shiftKey) {
          this.minutoInicial += deltaTiempos;
          if (this.minutoInicial < 0) this.minutoInicial = 0;
          if (this.minutoInicial > 1380) this.minutoInicial = 1380;
        }
        else if(e.ctrlKey){
          this.diaCentral += 86400000;
        }
      }
      if (e.deltaY < 0) {
        if (e.shiftKey) {
          this.minutoInicial -= deltaTiempos;
          if (this.minutoInicial < 0) this.minutoInicial = 0;
          if (this.minutoInicial > 1380) this.minutoInicial = 1380;
        }
        else if (e.ctrlKey){
          this.diaCentral -= 86400000;
        }
      }
    },
  },
  mounted() {
    this.montado = true;
    window.addEventListener("wheel", this.moverDias, { passive: false });
  },
  beforeDestroy() {
    window.removeEventListener("wheel", this.moverDias, { passive: false });
  },
};
</script>

<style scoped>
.calendario {
  overflow: hidden;
  position:relative
}
.ventanaEventoCalendario {
  width: min(400px, 90%);
  min-height: 100px;
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
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
  margin-left: 137px;
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
#marcaTiempoInicialEvento {
  position: absolute;
  top: 10px;
  user-select: none;
  color: rgb(36, 123, 126);
  font-size: 13px;
  transform: translateX(-50%);
  z-index: 1;
}
#marcaTiempoFinalEvento {
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
  border-bottom: 1px solid rgb(146, 146, 146);
  position: relative;
}

.zonaInfoDia {
  display: flex;
  background-color: rgb(255, 255, 225);
  z-index: 1;
}
.diaHoy {
  background-color: cadetblue;
}
.diaSemana {
  min-width: 100px;
  width: 100px;
  margin-left: 10px;
}
.diaMes {
  min-width: 25px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: chocolate;
  margin-left: 2px;
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
.eventoCalendario {
  position: absolute;
}
</style>