<template>
  <div class="diaCalendario" :class="{ abierto }">
    <div id="barraSuperior">
      <div id="bloqueTituloDia" @click="$emit('regresar')">
        <div id="nombreDia" :class="{ hoy }">
          {{ diaSemana }}
        </div>
        <div id="fechaDia">
          {{ diaYMes }}
        </div>
        <div id="cantidadesEventos">
          {{
            cantidadEventosRelevantes
              ? "(" + cantidadEventosRelevantes + ")"
              : ""
          }}
        </div>
      </div>
    </div>

    <loading texto="" v-show="downloadingData" />
    <div id="contenedorContenido">
      <div id="barraHoras">
        <div
          ref="labelsHoras"
          class="hora"
          :style="[estiloSizeHora]"
          v-for="hora of 24"
          :key="'hora' + (hora - 1)"
        >
          {{ hora - 1 }}:00
        </div>
      </div>
      <div
        id="contenedorEventos"
        ref="contenedorEventos"
        v-show="!downloadingData"
        :style="[estiloSizeContenedorEventos]"
        @click.self="clickContenedorEventos"
      >
        <evento-publico-calendario
          :horaPx="horaPx"
          v-for="eventoPublico of eventosPublicosVisibles"
          :key="eventoPublico.id"
          :esteEvento="eventoPublico"
          :extranjero="(!idParent || idParent != eventoPublico.idParent)"
          :idUsuarioTarget="idUsuarioTarget"
          :seleccionado="idEventoSeleccionado === eventoPublico.id"
          :infoOffset="indiceOffset[eventoPublico.id]"
          :diaCalendarioOver="esteDia"
          :enfasis="enfasis"
          :idParent="idParent"
          :tipoParent="tipoParent"
          @meElimine="deleteEventoCache(eventoPublico); $emit('cambioEventos')"
          @click.native="$emit('clickEnEvento', eventoPublico)"
          @meCambiaronDia="deleteEventoCache(eventoPublico);$emit('cambioEventos')"
          @creadoEventoPersonal="addEventoCache($event);$emit('cambioEventos');"
        />
        <evento-personal-calendario
          :horaPx="horaPx"
          v-for="eventoPersonal of todosEventosPersonalesDia || []"
          :key="eventoPersonal.id"
          :esteEvento="eventoPersonal"
          :seleccionado="idEventoSeleccionado === eventoPersonal.id"
          :infoOffset="indiceOffset[eventoPersonal.id]"
          :diaCalendarioOver="esteDia"
          :enfasis="enfasis"
          :extranjero="
            idUsuarioTarget != eventoPersonal.idPersona &&
            !eventoPersonal.idsParticipantes.includes(idUsuarioTarget)
          "          
          @meElimine="deleteEventoCache(eventoPersonal);$emit('cambioEventos')"
          @click.native="$emit('clickEnEvento', eventoPersonal)"
          @meCambiaronDia="
            deleteEventoCache(eventoPersonal);$emit('cambioEventos');            
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import {
  fragmentoEventoPersonal,
  fragmentoEventoPublico,
} from "./fragsCalendario.js";
import EventoPublicoCalendario from "./EventoPublicoCalendario.vue";
import EventoPersonalCalendario from "./EventoPersonalCalendario.vue";
import Loading from "./Loading.vue";

const QUERY_EVENTOS_PUBLICOS_DIA = gql`
  query ($dateInicioDia: Date!) {
    eventosPublicosDia(dateInicioDia: $dateInicioDia) {
      ...fragEventoPublico
    }
  }
  ${fragmentoEventoPublico}
`;

const QUERY_EVENTOS_PERSONALES_DIA = gql`
  query ($dateInicioDia: Date!, $idUsuario: ID!) {
    eventosPersonalesDia(dateInicioDia: $dateInicioDia, idUsuario: $idUsuario) {
      ...fragEventoPersonal
    }
  }
  ${fragmentoEventoPersonal}
`;

const QUERY_EVENTOS_COLISIONANTES_DIA = gql`
  query ($dateInicioDia: Date!, $idParent: ID!, $tipoParent: String!) {
    eventosPersonalesDeParentDia(
      dateInicioDia: $dateInicioDia
      idParent: $idParent
      tipoParent: $tipoParent
    ) {
      ...fragEventoPersonal
    }
  }
  ${fragmentoEventoPersonal}
`;

export default {
  components: { EventoPublicoCalendario, EventoPersonalCalendario, Loading },
  name: "DiaCalendario",
  apollo: {
    eventosPublicosDia: {
      query: QUERY_EVENTOS_PUBLICOS_DIA,
      variables() {
        return {
          dateInicioDia: this.esteDia.date,
        };
      },
      fetchPolicy: "cache-and-network",
    },
    eventosPersonalesDia: {
      query: QUERY_EVENTOS_PERSONALES_DIA,
      variables() {
        return {
          dateInicioDia: this.esteDia.date,
          idUsuario: this.idUsuarioTarget,
        };
      },
      skip() {
        return !this.usuarioLogeado;
      },
      fetchPolicy: "cache-and-network",
    },
    eventosPersonalesDeParentDia: {
      query: QUERY_EVENTOS_COLISIONANTES_DIA,
      variables() {
        return {
          dateInicioDia: this.esteDia.date,
          idParent: this.idParent,
          tipoParent: this.tipoParent,
        };
      },
      skip() {
        return (
          this.tipoParent != "nodoSolidaridad" ||
          !this.usuarioLogeado ||
          !this.idParent
        );
      },
      fetchPolicy: "cache-and-network",
    },
  },
  props: {
    hoy: Boolean,
    esteDia: Object,
    eventoSiendoCreado: Object,
    horaPx: Number,
    scrollXCalendario: Number,
    idParent: String,
    idEventoSeleccionado: String,
    idUsuarioTarget: String,
    tipoParent: String,
    enfasis: String,
    modoEventosPublicosExtranjeros: String,
    usuarioVeEventosPublicos: Boolean,
  },
  data() {
    return {
      eventosPublicosDia: [],
      eventosPersonalesDia: [],
      eventosPersonalesDeParentDia: [],

      abierto: false,

      creandoEvento: false,
    };
  },
  methods: {
    clickContenedorEventos(e) {
      console.log(`Click en el contenedor de eventos`);
      if (this.eventoSiendoCreado) {
        const margen = 60 * 60000; //60 minutos
        var infoNuevoEvento = JSON.parse(
          JSON.stringify(this.eventoSiendoCreado)
        );
        this.$emit("iniciaCreacionEvento");
        const posContenedorEventos =
          this.$refs.contenedorEventos.getBoundingClientRect();
        const posX = e.pageX - posContenedorEventos.left;

        const timeClicked = posX / this.horaPx;
        var minutosClicked = Math.round(
          (timeClicked - Math.floor(timeClicked)) * 60
        );
        minutosClicked = Math.floor(minutosClicked / 15) * 15; ///Set en múltiplos de 15

        const timeClickedFormatted = {
          horas: Math.floor(timeClicked),
          minutos: minutosClicked,
        };
        const dateClicked =
          this.esteDia.date.getTime() +
          timeClickedFormatted.horas * 60 * 60000 +
          timeClickedFormatted.minutos * 60000;
        console.log(
          `En ${posX} -> ${timeClickedFormatted.horas}: ${timeClickedFormatted.minutos}`
        );

        console.log(
          `Date centralh: ${
            this.esteDia.date.getTime() +
            timeClickedFormatted.horas +
            timeClickedFormatted.minutos * 60000
          }`
        );

        var dateInicio = dateClicked;
        var dateFinal = dateClicked + margen;

        console.log(
          `Quedará entre: ${new Date(dateInicio)} y ${new Date(dateFinal)}`
        );

        infoNuevoEvento.horarioInicio = new Date(dateInicio);
        infoNuevoEvento.horarioFinal = new Date(dateFinal);
        if (infoNuevoEvento.tipoEvento === "eventoPublico") {
          delete infoNuevoEvento.tipoEvento;
          this.crearEventoPublico(infoNuevoEvento);
        } else if (infoNuevoEvento.tipoEvento === "eventoPersonal") {
          delete infoNuevoEvento.tipoEvento;
          this.crearEventoPersonal(infoNuevoEvento);
        } else {
          console.log(`Tipo ${infoNuevoEvento.tipoEvento} no reconocido`);
        }
      } else if (this.idEventoSeleccionado) {
        this.$emit("desSeleccionDeEvento");
      }
    },
    addEventoCache(evento) {
      const millisInicioEvento = new Date(evento.horarioInicio).getTime();
      const millisInicioDia = this.esteDia.date.getTime();
      const millisFinalDia = this.esteDia.date.getTime() + 86400000;

      if (
        millisInicioEvento < millisInicioDia ||
        millisInicioEvento > millisFinalDia
      ) {
        return;
      }
      const tipoEvento =
        evento.__typename.charAt(0).toLowerCase() + evento.__typename.slice(1);
      var infoQuery = null;
      if (tipoEvento === "eventoPublico") {
        infoQuery = {
          query: QUERY_EVENTOS_PUBLICOS_DIA,
          variables: {
            dateInicioDia: this.esteDia.date,
          },
        };
      } else if (tipoEvento === "eventoPersonal") {
        infoQuery = {
          query: QUERY_EVENTOS_PERSONALES_DIA,
          variables: {
            dateInicioDia: this.esteDia.date,
            idUsuario: this.idUsuarioTarget,
          },
        };
      } else {
        console.log(`Tipo evento ${tipoEvento} no reconocido`);
        return;
      }
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        ...infoQuery,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var listaEventosCache = null;
      if (tipoEvento === "eventoPublico") {
        listaEventosCache = nuevoCache.eventosPublicosDia;
      } else if (tipoEvento === "eventoPersonal") {
        listaEventosCache = nuevoCache.eventosPersonalesDia;
      }
      const indexE = listaEventosCache.findIndex((e) => e.id === evento.id);
      if (indexE === -1) {
        listaEventosCache.push(evento);

        store.writeQuery({
          ...infoQuery,
          data: nuevoCache,
        });
      }
    },
    crearEventoPublico(infoNuevoEvento) {
      console.log(
        `Creando un evento publico con info ${JSON.stringify(infoNuevoEvento)}`
      );

      this.creandoEvento = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNuevoEvento: InputCrearEventoPublico) {
              crearEventoPublico(infoNuevoEvento: $infoNuevoEvento) {
                ...fragEventoPublico
              }
            }
            ${fragmentoEventoPublico}
          `,
          variables: {
            infoNuevoEvento,
          },
        })
        .then(({ data: { crearEventoPublico } }) => {
          this.creandoEvento = false;

          this.addEventoCache(crearEventoPublico);
           this.$emit("cambioEventos");

        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoEvento = false;
        });
    },
    crearEventoPersonal(infoNuevoEvento) {
      console.log(
        `Creando un evento personal con info ${JSON.stringify(infoNuevoEvento)}`
      );
      this.creandoEvento = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoEventoPersonal: InputCrearEventoPersonal) {
              crearEventoPersonal(infoEventoPersonal: $infoEventoPersonal) {
                ...fragEventoPersonal
              }
            }
            ${fragmentoEventoPersonal}
          `,
          variables: {
            infoEventoPersonal: {
              ...infoNuevoEvento,
              idPersona: this.idUsuarioTarget,
            },
          },
        })
        .then(({ data: { crearEventoPersonal } }) => {
          this.creandoEvento = false;
          this.addEventoCache(crearEventoPersonal);
           this.$emit("cambioEventos");

        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.creandoEvento = false;
        });
    },
    deleteEventoCache(evento) {
      const tipoEvento =
        evento.__typename.charAt(0).toLowerCase() + evento.__typename.slice(1);

      console.log(`Deleting ${tipoEvento} ${evento.nombre} from cache`);

      var infoQuery = null;
      if (tipoEvento === "eventoPublico") {
        infoQuery = {
          query: QUERY_EVENTOS_PUBLICOS_DIA,
          variables: {
            dateInicioDia: this.esteDia.date,
          },
        };
      } else if (tipoEvento === "eventoPersonal") {
        infoQuery = {
          query: QUERY_EVENTOS_PERSONALES_DIA,
          variables: {
            dateInicioDia: this.esteDia.date,
            idUsuario: this.idUsuarioTarget,
          },
        };
      } else {
        console.log(`Tipo evento ${tipoEvento} no reconocido`);
        return;
      }
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        ...infoQuery,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var listaEventosCache = null;
      if (tipoEvento === "eventoPublico") {
        listaEventosCache = nuevoCache.eventosPublicosDia;
      } else if (tipoEvento === "eventoPersonal") {
        listaEventosCache = nuevoCache.eventosPersonalesDia;
      }
      const indexE = listaEventosCache.findIndex((e) => e.id === evento.id);
      if (indexE > -1) {
        listaEventosCache.splice(indexE, 1);
        store.writeQuery({
          ...infoQuery,
          data: nuevoCache,
        });
      }
    },
  },
  computed: {
    diaSemana() {
      const nombres = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ];
      return nombres[this.esteDia.date.getDay()];
    },
    diaYMes() {
      const meses = [
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
      ];

      return (
        this.esteDia.date.getDate() +
        " de " +
        meses[this.esteDia.date.getMonth()]
      );
    },
    eventosPublicosVisibles() {
      if (this.enfasis === "eventosPublicos") {
        if (this.modoEventosPublicosExtranjeros === "invisibles") {
          return this.eventosPublicosDia.filter(
            (e) =>
              e.idParent === this.idParent ||
              e.idAdministrador === this.idUsuarioTarget
          );
        } else {
          return this.eventosPublicosDia;
        }
      } else if (this.enfasis === "eventosPersonales") {
        if (this.usuarioVeEventosPublicos) {
          return this.eventosPublicosDia;
        } else {
          // return this.eventosPublicosDia.filter((ev) =>
          //   this.eventosPersonalesDia.some((ep) => ep.idEventoMarco === ev.id)
          // );
          return this.eventosPublicosDia.filter(
            (ep) => ep.idAdministrador === this.idUsuarioTarget
          );
        }
      } else {
        return [];
      }
    },
    eventosPublicosUsuarioTarget() {
      return this.eventosPublicosDia.filter(
        (ev) => ev.idAdministrador === this.idUsuarioTarget
      );
    },
    estiloSizeContenedorEventos() {
      const alturaEventos = Object.values(this.indiceOffset).reduce(
        (acc, a) => (a.top + a.height > acc ? a.top + a.height : acc),
        0
      );

      return {
        width: this.horaPx * 24 + "px",
        height: alturaEventos + 45 + "px",
      };
    },
    cantidadEventosPublicos() {
      return this.eventosPublicosDia.length;
    },
    cantidadEventosRelevantes() {
      if (this.enfasis === "eventosPublicos") {
        if (!this.idParent) {
          return this.cantidadEventosPublicos;
        } else {
          return this.eventosPublicosDia.filter(
            (p) => p.idParent === this.idParent
          ).length;
        }
      } else if (this.enfasis === "eventosPersonales") {
        if (this.idParent) {
          return this.eventosPersonalesDia.filter(
            (ev) => ev.idParent === this.idParent
          ).length;
        }
        return (
          this.eventosPersonalesDia.length +
          this.eventosPublicosUsuarioTarget.length
        );
      } else {
        return 0;
      }
    },
    indiceOffset() {
      const sizeBarra = 15;
      const sizeBloque = 160;
      const marginRows = 5;
      const lineaEventosPublicosAsistidos = 30;
      // console.log(
      //   `%c Iniciando calculo de indice de offset`,
      //   "background: #222; color: #bada55"
      // );
      var indice = {};

      if (!this.usuarioLogeado) {
        console.log(`Cancelando índice offset`);
        return null;
      }

      this.todosEventosPersonalesDia.forEach((ev) => {
        let heightEvento = sizeBloque;
        let claseEvento = "bloque";
        let top = marginRows;

        if (this.enfasis === "eventosPersonales") {
          if (this.idParent) {
            if (ev.idParent != this.idParent) {
              heightEvento = sizeBarra;
              claseEvento = "barra";
            }
          }
        } else {
          heightEvento = sizeBarra;
          claseEvento = "barra";
        }

        indice[ev.id] = {
          evento: ev,
          top,
          height: heightEvento,
          bordeBot: top + heightEvento,
          clase: claseEvento,
        };
      });

      var listaEventosPublicos = JSON.parse(
        JSON.stringify(this.eventosPublicosVisibles)
      );
      listaEventosPublicos.sort((a, b) => {
        var res = 0;
        if (a.idAdministrador === this.idUsuarioTarget) {
          res++;
        } else if (
          this.eventosPersonalesDia.some((e) => e.idEventoMarco === a.id)
        ) {
          res++;
        }
        if (b.idAdministrador === this.idUsuarioTarget) {
          res--;
        } else if (
          this.eventosPersonalesDia.some((e) => e.idEventoMarco === b.id)
        ) {
          res--;
        }
        return -res;
      });
      // console.log(
      //   `Eventos sorted: ${listaEventosPublicos.map((e) => e.nombre)}`
      // );

      listaEventosPublicos.forEach((ev) => {
        // console.log(`Iterando en ${ev.nombre}`);
        let eventoAsisteUsuarioTarget = this.eventosPersonalesDia.some(
          (ep) => ep.idEventoMarco === ev.id
        );
        let heightEvento = sizeBloque;
        let claseEvento = "bloque";
        if (
          this.enfasis === "eventosPublicos" &&
          ev.idParent != this.idParent &&
          this.modoEventosPublicosExtranjeros != "full"
        ) {
          heightEvento = sizeBarra;
          claseEvento = "barra";
        }
        // console.log(
        //   `cantidad de entries en el indice ${
        //     Object.entries(indice).map((e) => e[1]).length
        //   }`
        // );

        let top = 0;
        if (this.enfasis === "eventosPersonales" && eventoAsisteUsuarioTarget) {
          top = lineaEventosPublicosAsistidos;
        } else {
          let eventosColision = Object.entries(indice)
            .map((e) => e[1])
            .filter((t) => {
              // console.log(`Comparando con ${t.evento.nombre}`);
              const inicioDentro =
                t.evento.horarioInicio > ev.horarioInicio &&
                t.evento.horarioInicio < ev.horarioFinal;
              const finalDentro =
                t.evento.horarioFinal > ev.horarioInicio &&
                t.evento.horarioFinal < ev.horarioFinal;

              const sobrepone =
                t.evento.horarioInicio <= ev.horarioInicio &&
                t.evento.horarioFinal >= ev.horarioFinal;

              // console.log(`Inicio dentro: ${inicioDentro}`);
              // console.log(`Final dentro: ${finalDentro}`);

              const colision = inicioDentro || finalDentro || sobrepone;
              // if (colision) {
              //   console.log(`colision`);
              // }
              return colision;
            });

          // console.log(`${eventosColision.length} eventos en colisión`);

          let bordeBotColision = eventosColision.reduce(
            (acc, e) => (e.bordeBot > acc ? e.bordeBot : acc),
            0
          );

          top = bordeBotColision + marginRows;
        }

        // console.log(`Queda en ${top} + ${heightEvento}`);
        indice[ev.id] = {
          evento: ev,
          top: top,
          height: heightEvento,
          bordeBot: top + heightEvento + sizeBarra,
          clase: claseEvento,
        };
      });
      return indice;
    },
    todosEventosPersonalesDia() {
      return this.eventosPersonalesDia.concat(
        this.eventosPersonalesDeParentDia.filter(
          (epp) =>
            !this.eventosPersonalesDia.map((ep) => ep.id).includes(epp.id)
        )
      );
    },
    estiloSizeHora() {
      return {
        width: this.horaPx + "px",
      };
    },
    downloadingData() {
      return (
        (this.$apollo.queries.eventosPersonalesDeParentDia &&
          this.$apollo.queries.eventosPersonalesDeParentDia.loading) ||
        (this.$apollo.queries.eventosPublicosDia &&
          this.$apollo.queries.eventosPublicosDia.loading) ||
        (this.$apollo.queries.eventosPersonalesDia &&
          this.$apollo.queries.eventosPersonalesDia.loading)
      );
    },
  },
  watch: {},
  mounted() {
    const horaActual = new Date().getHours();
    console.log(`Scrolling into ${horaActual}`);
    this.$nextTick(() => {
      this.$refs.labelsHoras[8].scrollIntoView({
        block: "nearest",
        inline: "start",
      });
    });
  },
};
</script>

<style scoped>
#contenedorEventos {
  min-height: 100px;
  background-color: var(--grisHover);
  padding: 20px 0px;
  position: relative;
}
#barraSuperior {
  display: flex;
  font-family: Salsa, cursive;
  align-items: center;
  height: 25px;
}
#contenedorContenido {
  width: 100%;
  overflow: scroll;
  height: 80vh;
}
#barraHoras {
  display: flex;
  overflow: visible;
  padding: 14px 0px;
}
#barraHoras .hora {
  font-size: 10px;
  opacity: 0.4;
  position: relative;
  overflow: visible;
  flex-shrink: 0;
}
#bloqueTituloDia {
  display: flex;
  align-items: center;
  margin-left: 1vw;
}
#nombreDia {
  margin-right: 2vw;
  font-size: 10px;
}
#nombreDia.hoy {
  color: red;
}
#fechaDia {
  font-size: 10px;
  opacity: 0.5;
}
#cantidadesEventos {
  margin-left: 10px;
  font-size: 10px;
}
</style>