import gql from "graphql-tag";
import { QUERY_ACCIONES } from "./components/gestorAcciones/frags";
import { serverUrl } from "./hostConfig";

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'COP',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const QUERY_AUTH_USUARIO = gql`
  query auth_usuario_local{
    auth_usuario @client{
      id
      username
      permisos
      subscripcionIlimitada
      millisFinSubscripcion
      token
    }
  }
`;


export const globalMixin = {
    apollo: {
        usuario: {
            query: QUERY_AUTH_USUARIO,
            fetchPolicy: "cache-only",
            update({ auth_usuario }) {
                return auth_usuario;
            }
        },
        estadoRed: {
            query: gql`
            query{
                estadoRed @client
            }
        `,

        }
    },
    data() {
        return {
            widthScreen: 100,
            serverUrl,
            usuario: null,
        };
    },
    computed: {
        usuarioLogeado() {
            return this.usuario != null && this.usuario.id;
        },
        usuarioSuperadministrador: function() {
            return this.usuario?.permisos?.includes("superadministrador");
        },
        produccion() {
            return process.env.NODE_ENV === "production";
        },
        usuarioProfe: function() {
            if (!this.usuario?.permisos) return false;
            return this.usuario.permisos.includes(
                "maestraVida-profesor"
            );
        },
        usuarioEscuelaMaestraVida() {
            return this.usuario?.permisos.includes("maestraVida-profesor") || this.usuario?.permisos.includes("maestraVida-estudiante") || this.usuario?.permisos.includes("maestraVida-acompañante");
        },
        deviceMobile() {
        }
    },
    methods: {
        raiseAccion(mensaje, tipo) {
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
                query: QUERY_ACCIONES,
            });
            let nuevoCache = JSON.parse(JSON.stringify(cache));
            if (!nuevoCache) {
                nuevoCache = {}
            }
            if (!nuevoCache.acciones) {
                nuevoCache.acciones = [];
            }
            nuevoCache.acciones.push({
                mensaje,
                tipo: tipo || "accion",
                timestamp: Date.now(),
            })

            store.writeQuery({
                query: QUERY_ACCIONES,
                data: nuevoCache,
            });
        },
        selectTargetFocus(e) {
            if (e.target) {
                let target = e.target;
                target.select();
            }
        },
        toReadableTime(fecha) {
            var fechaDate = new Date(fecha);
            var hora = "" + fechaDate.getHours();
            if (hora.length === 1) hora = "0" + hora;
            var minutos = "" + fechaDate.getMinutes();
            if (minutos.length === 1) minutos = "0" + minutos;
            return hora + ":" + minutos;
        },
        toReadableDate(fecha) {
            var fechaDate = new Date(fecha);
            var year = fechaDate.getFullYear();
            const listaMeses = [
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
            const listaDias = [
                "Domingo",
                "Lunes",
                "Martes",
                "Miércoles",
                "Jueves",
                "Viernes",
                "Sábado",
            ];
            var mes = listaMeses[fechaDate.getMonth()];
            var numDia = fechaDate.getDate();
            var diaSemana = listaDias[fechaDate.getDay()];

            var finalDate = diaSemana + " " + numDia + " de " + mes;

            if (year != (new Date(Date.now())).getFullYear()) {
                finalDate = "(" + year + ") " + finalDate;
            }

            return finalDate;
        },
        toReadableFullDate(fecha) {
            return this.toReadableDate(fecha) + " - " + this.toReadableTime(fecha);
        },
        enrichedToReadableDate(fecha) {
            var fechaDate = new Date(fecha);
            var year = fechaDate.getFullYear();
            var numMes = fechaDate.getMonth();
            var numDia = fechaDate.getDate();

            var dateActual = new Date();
            var dateTomorrow = new Date(dateActual.getTime() + 86400000);
            var dateAyer = new Date(dateActual.getTime() - 86400000);
            if (year === dateActual.getFullYear() && numMes === dateActual.getMonth() && numDia === dateActual.getDate()) {
                return "Hoy"
            }
            if (year === dateTomorrow.getFullYear() && numMes === dateTomorrow.getMonth() && numDia === dateTomorrow.getDate()) {
                return "Mañana"
            }
            if (year === dateAyer.getFullYear() && numMes === dateAyer.getMonth() && numDia === dateAyer.getDate()) {
                return "Ayer"
            }
            return this.toReadableDate(fecha);
        },
        enrichedToReadableFullDate(fecha) {
            return this.enrichedToReadableDate(fecha) + " - " + this.toReadableTime(fecha);
        },
        toReadableMoney(valor) {


            var stringFinal = formatter.format(valor);
            return stringFinal;
        }
    },
    mounted() {
        this.widthScreen = screen.width;
    },

};
