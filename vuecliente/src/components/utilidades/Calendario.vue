<template>
  <div
    class="calendario"
    :class="{
      deshabilitado:
        enviandoQueryCrearEvento ||
        $apollo.queries.eventosOrigen.loading ||
        $apollo.queries.eventosUsuario.loading ||
        $apollo.queries.eventosCruceClub.loading ||
        $apollo.queries.eventosCruceClaseNodoConocimiento.loading,
    }"
    @mouseup.left="
      idEventoSeleccionado = null;
      idEventoAbierto = null;
    "
    @mouseenter="hoveringCalendario = true"
    @mouseleave="hoveringCalendario = false"
    @touchstart="inicioTouch"
    @touchmove="movimientoTouch"
    @touchend="endTouch"
  >
    <loading
      id="avisoLoadingCalendario"
      texto="Cargando información..."
      v-show="$apollo.queries.eventosOrigen.loading ||
        $apollo.queries.eventosUsuario.loading ||
        $apollo.queries.eventosCruceClub.loading ||
        $apollo.queries.eventosCruceClaseNodoConocimiento.loading"
    />
    <div id="controles">
      <div
        class="control"
        id="botonCrearEvento"
        v-show="configCalendario.tipo != 'personal' && !creacionEventosDisallowed"
        @click="
          seleccionandoPlaceNuevoEvento = !seleccionandoPlaceNuevoEvento;
          minutoInicialFantasmaNuevoEvento = null;
        "
      >
        {{
          seleccionandoPlaceNuevoEvento
            ? "Cancelar"
            : configCalendario.tipo === "claseNodoConocimiento"
            ? "Programar clase"
            : "Crear evento"
        }}
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
            v-show="
              seleccionandoPlaceNuevoEvento &&
              minutoInicialFantasmaNuevoEvento != null
            "
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
            v-show="
              seleccionandoPlaceNuevoEvento &&
              minutoFinalFantasmaNuevoEvento != null
            "
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
          v-if="eventosCruzados"
          @mousemove="setMinutoInicialFantasmaNuevoEvento"
          @click="
            configCalendario.tipo === 'claseNodoConocimiento'
              ? crearClaseNodoConocimiento(dia)
              : crearNuevoEventoEnHorario(dia)
          "
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
            :nivel="
              evento.idOrigen === configCalendario.id
                ? 'primario'
                : 'secundario'
            "
            @mouseup.native.left.stop="idEventoSeleccionado = evento.id"
            @meElimine="eliminarEventoDeCache"
            @dblclick.native="idEventoAbierto = evento.id"
            @marcarInicio="tiempoInicioMarcado = $event"
            @marcarFinal="tiempoFinalMarcado = $event"
            @desmarcarInicio="tiempoInicioMarcado = null"
            @desmarcarFinal="tiempoFinalMarcado = null"
            @abrirEsteEvento="idEventoAbierto = evento.id"
          />

          <evento-calendario-cruzado
            :esteEvento="evento"
            v-for="evento of getEventosCruzadosDia(dia)"
            :key="'eventoCruzado' + evento.id"
            :idEventoAbierto="idEventoAbierto"
            :minutoInicial="minutoInicial"
            :widthHoraPx="widthHoraPx"
            :seleccionado="idEventoSeleccionado === evento.id"
            @mouseup.native.left.stop="idEventoSeleccionado = evento.id"
            @dblclick.native="idEventoAbierto = evento.id"
            @abrirEsteEvento="idEventoAbierto = evento.id"
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
import EventoCalendarioCruzado from "./EventoCalendarioCruzado.vue";
import Loading from "./Loading.vue";

const QUERY_EVENTOS_ORIGEN = gql`
  query ($origen: String!, $idOrigen: ID!) {
    eventosSegunOrigen(origen: $origen, idOrigen: $idOrigen) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
const QUERY_EVENTOS_USUARIO = gql`
  query ($idUsuario: ID!) {
    eventosUsuario(idUsuario: $idUsuario) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
const QUERY_EVENTOS_CRUCE_CLUB = gql`
  query ($idClub: ID!) {
    eventosCruceNuevoEventoClub(idClub: $idClub) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
const QUERY_EVENTOS_CRUCE_CLASE_NODO_CONOCIMIENTO = gql`
  query ($idClase: ID!, $idNodo: ID!) {
    eventosCruceNuevaClaseNodoConocimiento(idClase: $idClase, idNodo: $idNodo) {
      ...fragEvento
    }
  }
  ${fragmentoEvento}
`;
export default {
  components: {
    EventoCalendario,
    VentanaEventoCalendario,
    EventoCalendarioCruzado,
    Loading,
  },
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
      skip() {
        const origenes = ["club", "claseNodoConocimiento"];
        if (!this.configCalendario || !this.configCalendario.tipo) return true;
        return !origenes.includes(this.configCalendario.tipo);
      },
      fetchPolicy: "network-only",
    },
    eventosUsuario: {
      query: QUERY_EVENTOS_USUARIO,
      variables() {
        console.log(
          `Preparando query eventosUsuario con idUsuario ${this.usuario.id}`
        );
        return {
          idUsuario: this.usuario.id,
        };
      },
      skip() {
        var decision =
          !this.usuario ||
          !this.usuario.id ||
          this.configCalendario.tipo != "personal";

        return decision;
      },
      fetchPolicy: "network-only",
    },
    eventosCruceClub: {
      query: QUERY_EVENTOS_CRUCE_CLUB,
      variables() {
        return {
          idClub: this.configCalendario.id,
        };
      },
      update(data) {
        return data.eventosCruceNuevoEventoClub;
      },
      skip() {
        var decision = this.configCalendario.tipo != "club";
        return decision;
      },
      fetchPolicy: "network-only",
    },
    eventosCruceClaseNodoConocimiento: {
      query: QUERY_EVENTOS_CRUCE_CLASE_NODO_CONOCIMIENTO,
      variables() {
        return {
          idClase: this.configCalendario.id,
          idNodo: this.configCalendario.idNodo,
        };
      },
      update(data) {
        return data.eventosCruceNuevaClaseNodoConocimiento;
      },
      skip() {
        var decision = this.configCalendario.tipo != "claseNodoConocimiento";
        return decision;
      },
      fetchPolicy: "network-only",
    },
  },
  props: {
    configCalendario: Object,
    creacionEventosDisallowed:Boolean
  },
  data() {
    const dateHoy = new Date(Date.now());
    dateHoy.setHours(0);
    dateHoy.setMinutes(0);
    dateHoy.setSeconds(0);

    return {
      enviandoQueryCrearEvento: false,

      hoveringCalendario: false,
      eventosOrigen: [],
      eventosUsuario: [],
      eventosCruceClub: [],
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

      seleccionandoPlaceNuevoEvento: false,
      minutoInicialFantasmaNuevoEvento: null,
      duracionFantasmaNuevoEvento: 60,
      tiempoInicioMarcado: null,
      tiempoFinalMarcado: null,

      ultimoTouchX: 0,
      ultimoTouchY: 0,
      lastPinchDistance: 0,
      pinching: false,

      idEventoSeleccionado: null,
      idEventoAbierto: null,

      zoom: 100,
      maxZoom: 140,
      minZoom: 35,
    };
  },
  computed: {
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    widthHoraPx() {
      return Math.round(100 * this.factorZoom);
    },
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
      if (this.minutoInicialFantasmaNuevoEvento == null) return null;
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

      return this.eventosOrigen.find((e) => e.id === this.idEventoSeleccionado);
    },
    todosEventos() {
      return this.eventosOrigen.concat(this.eventosUsuario);
    },
    eventoAbierto() {
      if (!this.idEventoAbierto) return null;
      return this.todosEventos
        .concat(this.eventosCruzados)
        .find((e) => e.id === this.idEventoAbierto);
    },
    eventosCruzados() {
      if (this.configCalendario.tipo === "club") {
        return this.eventosCruceClub;
      } else if (this.configCalendario.tipo === "claseNodoConocimiento") {
        return this.eventosCruceClaseNodoConocimiento;
      }

      return [];
    },
  },
  methods: {
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
    crearNuevoEventoEnHorario(dia) {
      if (!this.seleccionandoPlaceNuevoEvento) return;
      const horarioI = new Date(
        dia.milis + this.minutoInicialFantasmaNuevoEvento * 60000
      );
      const dateDia = new Date(dia.milis);
      console.log(
        `Creando evento con horario de inicio: ${horarioI.getHours()}h`
      );
      console.log(
        `Minuto inicial fantasma: ${this.minutoInicialFantasmaNuevoEvento}`
      );
      console.log(`dateDia: ${dateDia}`);
      this.enviandoQueryCrearEvento = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $origen: String!
              $idOrigen: ID!
              $horarioInicio: Date!
              $horarioFinal: Date!
            ) {
              crearEventoProyectoCalendario(
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
        .then(({ data: { crearEventoProyectoCalendario } }) => {
          this.seleccionandoPlaceNuevoEvento = false;
          this.enviandoQueryCrearEvento = false;

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
            (e) => e.id == crearEventoProyectoCalendario.id
          );
          if (indexE > -1) {
            console.log(`El evento ya estaba en caché`);
          } else {
            nuevoCache.eventosSegunOrigen.push(crearEventoProyectoCalendario);
            store.writeQuery({
              query: QUERY_EVENTOS_ORIGEN,
              variables: {
                origen: this.configCalendario.tipo,
                idOrigen: this.configCalendario.id,
              },
              data: nuevoCache,
            });
            this.$nextTick(() => {
              this.idEventoSeleccionado = crearEventoProyectoCalendario.id;
            });
          }
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
          this.seleccionandoPlaceNuevoEvento = false;
          this.enviandoQueryCrearEvento = false;
        });
    },
    crearClaseNodoConocimiento(dia) {
      if (!this.seleccionandoPlaceNuevoEvento) return;
      console.log(`1`);
      console.log(`Creando clase ${this.configCalendario.laClase.nombre}`);
      console.log(`2`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idClase: ID!
              $horarioInicio: Date!
              $horarioFinal: Date!
              $nombre: String!
              $descripcion: String
            ) {
              crearClaseNodoConocimientoCalendario(
                idNodo: $idNodo
                idClase: $idClase
                horarioInicio: $horarioInicio
                horarioFinal: $horarioFinal
                nombre: $nombre
                descripcion: $descripcion
              ) {
                ...fragEvento
              }
            }
            ${fragmentoEvento}
          `,
          variables: {
            idNodo: this.configCalendario.idNodo,
            idClase: this.configCalendario.laClase.id,
            horarioInicio:
              dia.milis + this.minutoInicialFantasmaNuevoEvento * 60000,
            horarioFinal:
              dia.milis + this.minutoFinalFantasmaNuevoEvento * 60000,
            datosEvento: this.posibleEventoNuevo,
            nombre: this.configCalendario.laClase.nombre,
            descripcion:
              this.configCalendario.laClase.descripcion || "Descripción",
          },
        })
        .then(({ data: { crearClaseNodoConocimientoCalendario } }) => {
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
            (e) => e.id == crearClaseNodoConocimientoCalendario.id
          );
          if (indexE > -1) {
            console.log(`El evento ya estaba en caché`);
          } else {
            nuevoCache.eventosSegunOrigen.push(
              crearClaseNodoConocimientoCalendario
            );
            store.writeQuery({
              query: QUERY_EVENTOS_ORIGEN,
              variables: {
                origen: this.configCalendario.tipo,
                idOrigen: this.configCalendario.id,
              },
              data: nuevoCache,
            });
            this.$nextTick(() => {
              this.idEventoSeleccionado =
                crearClaseNodoConocimientoCalendario.id;
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
    getEventosCruzadosDia(dia) {
      return this.eventosCruzados.filter((e) => {
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
      var nuevoCache = null;
      var eventos = null;
      console.log(`Eliminando de cache el evento ${idEvento}`);
      if (
        this.configCalendario.tipo === "club" ||
        this.configCalendario.tipo === "claseNodoConocimiento"
      ) {
        const cache = store.readQuery({
          query: QUERY_EVENTOS_ORIGEN,
          variables: {
            origen: this.configCalendario.tipo,
            idOrigen: this.configCalendario.id,
          },
        });
        nuevoCache = JSON.parse(JSON.stringify(cache));
        eventos = nuevoCache.eventosSegunOrigen;
      }

      const indexE = eventos.findIndex((e) => e.id === idEvento);
      if (indexE > -1) {
        console.log(`Evento en posicion ${indexE}`);
        eventos.splice(indexE, 1);
        if (
          this.configCalendario.tipo === "club" ||
          this.configCalendario.tipo === "claseNodoConocimiento"
        ) {
          store.writeQuery({
            query: QUERY_EVENTOS_ORIGEN,
            variables: {
              origen: this.configCalendario.tipo,
              idOrigen: this.configCalendario.id,
            },
            data: nuevoCache,
          });
        }
      } else {
        console.log(`El evento no estaba en cache`);
      }
    },
    moverDias(e) {
      if (!this.hoveringCalendario) return;

      if (!e.ctrlKey && !e.shiftKey) return;
      e.preventDefault();
      const deltaTiempos = 30;

      if (e.deltaY > 0) {
        if (e.shiftKey) {
          this.minutoInicial += deltaTiempos;
          if (this.minutoInicial < 0) this.minutoInicial = 0;
          if (this.minutoInicial > 1380) this.minutoInicial = 1380;
        } else if (e.ctrlKey) {
          this.diaCentral += 86400000;
        }
      }
      if (e.deltaY < 0) {
        if (e.shiftKey) {
          this.minutoInicial -= deltaTiempos;
          if (this.minutoInicial < 0) this.minutoInicial = 0;
          if (this.minutoInicial > 1380) this.minutoInicial = 1380;
        } else if (e.ctrlKey) {
          this.diaCentral -= 86400000;
        }
      }
    },

    inicioTouch(e) {
      if (e.touches.length === 2) {
        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        this.lastPinchDistance = dist;
        this.pinching = true;
        return;
      }

      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
    },
    movimientoTouch(e) {
      if (this.pinching) {
        console.log(`Pinching`);
        // var contenedor = this.$el;
        // const posContenedor = contenedor.getBoundingClientRect();

        const anchoFecha = parseInt(
          document.getElementById("contenedorMarcas").offsetLeft
        );
        console.log(`El ancho de la fecha es: ${anchoFecha}`);

        const pinchPos = {
          x: (e.touches[0].pageX + e.touches[1].pageX) / 2,
        };

        if (pinchPos.x < anchoFecha) return;

        const minutosPinch =
          this.minutoInicial + (pinchPos.x * 60) / this.widthHoraPx;

        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        var pinch = dist - this.lastPinchDistance;
        pinch = pinch * 0.5;
        e.preventDefault();

        this.zoomVista(Math.round(pinch), minutosPinch);
        this.lastPinchDistance = dist;

        return;
      }

      const deltaX = e.changedTouches[0].clientX - this.ultimoTouchX;
      const deltaY = e.changedTouches[0].clientY - this.ultimoTouchY;
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        e.preventDefault();
        this.minutoInicial -= Math.round(deltaX / this.factorZoom);
        if (this.minutoInicial < 0) this.minutoInicial = 0;
        if (this.minutoInicial > 1380) this.minutoInicial = 1380;
      }
    },
    endTouch() {
      this.pinching = false;
    },
    zoomVista(zoom, minutosTarget) {
      if (minutosTarget < this.minutoInicial)
        minutosTarget = this.minutoInicial;
      if (minutosTarget > 1440) minutosTarget = 1440;

      const posTargetPixeles = {
        x: ((minutosTarget - this.minutoInicial) * this.widthHoraPx) / 60,
      };

      var nuevoZoom = this.zoom + zoom;
      if (nuevoZoom > this.maxZoom) nuevoZoom = this.maxZoom;
      if (nuevoZoom < this.minZoom) nuevoZoom = this.minZoom;
      this.zoom = nuevoZoom;

      this.$nextTick(() => {
        const nuevoMinutoInicial =
          minutosTarget - (posTargetPixeles.x * 60) / this.widthHoraPx;
        this.minutoInicial = Math.round(nuevoMinutoInicial);
        if (this.minutoInicial < 0) this.minutoInicial = 0;
        if (this.minutoInicial > 1380) this.minutoInicial = 1380;
      });
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
  position: relative;
}
#avisoLoadingCalendario{
  position:absolute;
  top:50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}
.ventanaEventoCalendario {
  width: min(500px, 80%);
  min-height: 100px;
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
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
  margin-left: 86px;
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
  min-width: 60px;
  width: 60px;
  margin-left: 6px;
  font-size: 12px;
}
.diaMes {
  min-width: 18px;
  width: 18px;
  height: 18px;
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
  font-size: 9px;
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
.eventoPrimario {
  background: cornflowerblue;
}
@media only screen and (min-width: 768px) {
  .diaSemana {
    min-width: 100px;
    width: 100px;
    margin-left: 10px;
    font-size: 16px;
  }
  .diaMes {
    min-width: 25px;
    width: 25px;
    height: 25px;
    margin-left: 2px;
  }
  .numeroDiaMes {
    font-size: 13px;
  }
  #contenedorMarcas {
    margin-left: 137px;
  }
}
</style>