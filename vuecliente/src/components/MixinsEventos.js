import { fragmentoEventoPublico } from "./utilidades/fragsCalendario";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./configs";
import gql from "graphql-tag";
const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"];
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const MixinEdicionEventos = {
    data() {
        return {


            nuevoNombre: "Nuevo nombre",
            editandoNombre: false,
            enviandoNuevoNombre: false,

            nuevoDescripcion: "Nueva descripcion",
            editandoDescripcion: false,
            enviandoNuevoDescripcion: false,

            minRepetir: 1,
            maxRepetir: 52,

            editandoFechaInicio: false,
            editandoHoraInicio: false,
            nuevoDuracion: null,

            enviandoNuevoDateInicio: false,
            enviandoNuevoDateFinal: false,
            enviandoHorarios: false,
            enviandoSomeHorario:false,

            enviandoQueryRepetir:false,


        }
    },
    methods: {
        guardarNuevoNombre() {
            this.nuevoNombre = this.$refs.inputNuevoNombre.value;

            if (this.nuevoNombreIlegal) {
                console.log(`No enviado`);
                return;
            }
            if (this.nuevoNombre == this.esteEvento.nombre) {
                this.editandoNombre = false;
                return;
            }
            console.log(`guardando nuevo nombre`);
            this.enviandoNuevoNombre = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($idEvento: ID!, $tipoEvento:String!, $nuevoNombre: String!) {
                    editarNombreEvento(
                      idEvento: $idEvento
                      tipoEvento:$tipoEvento
                      nuevoNombre: $nuevoNombre
                    ) {
                      id
                      nombre
                    }
                  }
                `,
                    variables: {
                        idEvento: this.esteEvento.id,
                        tipoEvento: this.tipoEvento,
                        nuevoNombre: this.nuevoNombre,
                    },
                })
                .then(() => {
                    this.enviandoNuevoNombre = false;
                    this.editandoNombre = false;
                })
                .catch((error) => {
                    this.enviandoNuevoNombre = false;
                    console.log(`Error. E :${error}`);
                });
        },
        guardarNuevoDescripcion() {
            if (this.nuevoDescripcionIlegal) {
                console.log(`No enviado`);
                return;
            }
            if (this.nuevoDescripcion == this.esteEvento.descripcion) {
                this.editandoDescripcion = false;
                return;
            }
            console.log(`guardando nuevo descripcion`);
            this.enviandoNuevoDescripcion = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($idEvento: ID!, $tipoEvento:String!, $nuevoDescripcion: String!) {
                    editarDescripcionEvento(
                      idEvento: $idEvento
                      tipoEvento: $tipoEvento
                      nuevoDescripcion: $nuevoDescripcion
                    ) {
                      id
                      descripcion
                    }
                  }
                `,
                    variables: {
                        idEvento: this.esteEvento.id,
                        tipoEvento: this.tipoEvento,
                        nuevoDescripcion: this.nuevoDescripcion,
                    },
                })
                .then(() => {
                    this.enviandoNuevoDescripcion = false;
                    this.editandoDescripcion = false;
                })
                .catch((error) => {
                    this.enviandoNuevoDescripcion = false;
                    console.log(`Error. E :${error}`);
                });
        },
        toggleEditandoDescripcion() {
            if (!this.administrador) {
                return;
            }
            this.$refs.inputNuevoDescripcion.style.height =
                this.$refs.descripcion.offsetHeight + "px";
            this.editandoDescripcion = !this.editandoDescripcion;
            this.nuevoDescripcion = this.esteEvento.descripcion;

            if (this.editandoDescripcion) {
                this.$nextTick(() => {
                    this.$refs.inputNuevoDescripcion.focus();
                });
            }
        },
        toggleEditandoNombre(e) {
            if (this.administrador) {
                e.stopPropagation();

                this.editandoNombre = true;
                this.nuevoNombre = this.esteEvento.nombre;
                this.$nextTick(() => {
                    this.$refs.inputNuevoNombre.focus();
                });
            }
        },
        keydownInputNuevoNombre(e) {
            if (e.key === "Escape") {
                this.$refs.inputNuevoNombre.blur();
            }
        },
        repetirEvento(cantidadRepetir, periodoRepetir) {
            if (!this.usuarioSuperadministrador && !this.administrador) {
                return;
            }
            cantidadRepetir = parseInt(cantidadRepetir);

            if (cantidadRepetir < this.minRepetir || cantidadRepetir > this.maxRepetir) {
                return;
            }
            console.log(`Se hara query de repetir este evento ${cantidadRepetir} veces ${periodoRepetir}`)
            this.enviandoQueryRepetir=true;
            this.$apollo.mutate({
                mutation: gql`
                mutation($periodoRepetir: String, $cantidadRepetir: Int!, $idEvento:ID!, $tipoEvento:String!){
                  repetirEventoPeriodicamente(periodoRepetir:$periodoRepetir, cantidadRepetir: $cantidadRepetir, idEvento: $idEvento, tipoEvento:$tipoEvento){
                    ...fragEventoPublico
                  }
                } 
                ${fragmentoEventoPublico}       
              `,
                variables: {
                    periodoRepetir: periodoRepetir,
                    cantidadRepetir: cantidadRepetir,
                    idEvento: this.esteEvento.id,
                    tipoEvento: this.tipoEvento,
                }
            }).then(({ data: { repetirEventoPeriodicamente } }) => {
                if (repetirEventoPeriodicamente) {
                    this.$emit('meRepetiPeriodicamente', repetirEventoPeriodicamente);
                    this.mostrandoZonaRepetir=false;
                }
                    this.enviandoQueryRepetir=false;

            }).catch((error) => {
                console.log(`Error: ${error}`);
                this.enviandoQueryRepetir=false;

            })
        },
        eliminarse() {
            if (
                !confirm(
                    "¿Confirmar la eliminación de este evento? (Esta acción no puede deshacerse)"
                )
            )
                return;

            if (!this.administrador && !this.usuarioSuperadministrador) {
                return;
            }
            this.eliminandose = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($idEvento: ID!, $tipoEvento:String!) {
                    eliminarEvento(idEvento: $idEvento, tipoEvento:$tipoEvento)
                  }
                `,
                    variables: {
                        idEvento: this.esteEvento.id,
                        tipoEvento: this.tipoEvento,
                    },
                })
                .then(() => {
                    this.$emit("meElimine");
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                });
        },
        iniciarEdicionDuracion() {
            this.nuevoDuracion = this.esteEvento.horarioFinal - this.esteEvento.horarioInicio;
            this.editandoDuracion = true;
        },
        guardarHorariosInicioDuracion() {
            if (!this.admiistrador && !this.usuarioSuperadministrador) {
                return;
            }

            this.

                this.$apol
        }

    },
    computed: {
        nuevoNombreIlegal() {
            if (this.nuevoNombre.length < 1) {
                return true;
            }
            if (charProhibidosNombreCosa.test(this.nuevoNombre)) {
                return true;
            }
            return false;
        },
        nuevoDescripcionIlegal() {
            if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
                return true;
            }
            if (charProhibidosTexto.test(this.nuevoDescripcion)) {
                return true;
            }
            return false;
        },
    },
    watch: {
        mostrando(mostrando) {
            if (mostrando != "descripcion") this.editandoDescripcion = false;

            if (mostrando === "descripcion") {
                if (
                    !this.esteEvento.descripcion ||
                    this.esteEvento.descripcion.length < 1
                ) {
                    if (!this.editandoDescripcion) {
                        this.toggleEditandoDescripcion();
                    }
                }
            }
        },
    },
};

export const MixinBasicoEventos = {
    data() {
        return {
        }
    },
    computed: {
        administrador() {
            if (!this.usuarioLogeado) return false;

            return this.usuario.id === this.esteEvento.idAdministrador;
        },
        tipoEvento() {
            return this.esteEvento.__typename.charAt(0).toLowerCase() + this.esteEvento.__typename.slice(1);
        },
        dateInicio(){
            return new Date(this.esteEvento.horarioInicio);
        },  
        fechaInicioFormateada(){
            const dateActualString = this.dateInicio.toISOString().split('T')[0];
            return dateActualString;
        },
        fechaFinalFormateada(){
            const dateActualString = this.dateFinal.toISOString().split('T')[0];
            return dateActualString;
        },
        dateFinal(){
            return new Date(this.esteEvento.horarioFinal)
        },
        horarioInicioFormateado() {
            return (
                this.timesLegibles.horarioInicio.horas +
                ":" +
                this.timesLegibles.horarioInicio.minutos
            );
        },
        horarioFinalFormateado() {
            return (
                this.timesLegibles.horarioFinal.horas +
                ":" +
                this.timesLegibles.horarioFinal.minutos
            );
        },
        fechaInicioLegible() {
            
            const diaSemana = diasSemana[this.dateInicio.getDay()];
            const diaMes = this.dateInicio.getDate();
            const mes = meses[this.dateInicio.getMonth()];

            const texto = diaSemana + " " + diaMes + " de " + mes;
            return texto;

        },
        horaInicioLegible() {
            var hora = this.dateInicio.getHours();
            var minutos = this.dateInicio.getMinutes();
            if (('' + hora).length < 2) {
                hora = '0' + hora;
            }
            if (('' + minutos).length < 2) {
                minutos = '0' + minutos;
            }
            return  hora + ':' + minutos
        },
        dateInicioLegible() {
            const texto = this.fechaInicioLegible + ", " + this.horaInicioLegible;
            return texto;
        },
        fechaFinalLegible() {
            const diaSemana = diasSemana[this.dateFinal.getDay()];
            const diaMes = this.dateFinal.getDate();
            const mes = meses[this.dateFinal.getMonth()];

            const texto = diaSemana + " " + diaMes + " de " + mes;
            return texto;

        },
        horaFinalLegible() {
            var hora = this.dateFinal.getHours();
            var minutos = this.dateFinal.getMinutes();
            if (('' + hora).length < 2) {
                hora = '0' + hora;
            }
            if (('' + minutos).length < 2) {
                minutos = '0' + minutos;
            }
            return  hora + ':' + minutos
        },
        dateFinalLegible() {

            const texto = this.fechaFinalLegible + ", " + this.horaFinalLegible;
            return texto;
        },
        timesLegibles() {
            const millisHoyInicio = this.millisInicioLocal % 86400000;
            const millisHoyFinal = this.millisFinalLocal % 86400000;

            return {
                horarioInicio: {
                    horas: Math.floor(millisHoyInicio / 3600000),
                    minutos: (millisHoyInicio % 3600000) / 60000,
                },
                horarioFinal: {
                    horas: Math.floor(millisHoyFinal / 3600000),
                    minutos: (millisHoyFinal % 3600000) / 60000,
                },
            };
        },
        millisFinalLocal() {
            const fecha = new Date(this.esteEvento.horarioFinal);
            const millis = fecha.getTime();
            const offset = fecha.getTimezoneOffset() * 60000;
            return millis - offset;
        },
        millisInicioLocal() {
            const fecha = new Date(this.esteEvento.horarioInicio);
            const millis = fecha.getTime();
            const offset = fecha.getTimezoneOffset() * 60000;
            return millis - offset;
        },
        duracionMinutos() {
            return Math.round((new Date(this.esteEvento.horarioFinal).getTime() - new Date(this.esteEvento.horarioInicio).getTime()) / 60000);
        },
        duracionLegible() {
            const dias = Math.floor(this.duracionMinutos / 1440);
            const horas = Math.floor((this.duracionMinutos - (dias * 1440)) / 60);
            const minutos = this.duracionMinutos - (dias * 1440) - (horas * 60);

            var texto = "";
            if (minutos > 0 || this.duracionMinutos === 0) {
                texto = minutos + "min";
            }
            if (horas > 0) {
                if (texto.length > 0) {
                    texto = ", " + texto
                }
                texto = horas + "h" + texto;
            }
            if (dias > 0) {
                if (texto.length > 0) {
                    texto = ", " + texto
                }
                texto = dias + "dias" + texto;
            }
            return texto;
        }
    }
}

