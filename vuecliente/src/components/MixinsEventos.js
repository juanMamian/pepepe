import { fragmentoEventoPublico, fragmentoEventoPersonal } from "./utilidades/fragsCalendario";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./configs";
import gql from "graphql-tag";
const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"];
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const MixinBasicoEventos = {

    data() {
        return {

        }
    },
    computed: {
        tipoEvento() {
            return this.esteEvento.__typename.charAt(0).toLowerCase() + this.esteEvento.__typename.slice(1);
        },
        dateInicio() {
            return new Date(this.esteEvento.horarioInicio);
        },
        fechaInicioFormateada() {
            const dateActualString = this.dateInicio.toISOString().split('T')[0];
            return dateActualString;
        },
        fechaFinalFormateada() {
            const dateActualString = this.dateFinal.toISOString().split('T')[0];
            return dateActualString;
        },
        dateFinal() {
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
            return hora + ':' + minutos
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
            return hora + ':' + minutos
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
    },
    methods: {
        eliminarse() {
            if (
                !confirm(
                    "¿Confirmar la eliminación de este evento? (Esta acción no puede deshacerse)"
                )
            )
                return;

            if (!this.administrador && !this.usuarioSuperadministrador && !this.usuarioProfe) {
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
    }

}
export const MixinBasicoEventosPublicos = {
    data() {
        return {
        }
    },
    computed: {
        administrador() {
            if (!this.usuarioLogeado) return false;

            return this.usuario.id === this.esteEvento.idAdministrador;
        },
    }
}
export const MixinBasicoEventosPersonales = {
    data() {
        return {
        }
    },
    computed: {
        administrador() {
            if (!this.usuarioLogeado) return false;

            return this.usuario.id === this.esteEvento.idPersona;
        },

    }
}



export const MixinEdicionEventos = {
    data() {
        return {
            nuevoNombre: "Nuevo nombre",
            editandoNombre: false,
            enviandoNuevoNombre: false,

            nuevoDescripcion: "Nueva descripcion",
            editandoDescripcion: false,
            enviandoNuevoDescripcion: false,

            editandoFechaInicio: false,
            editandoHoraInicio: false,
            nuevoDuracion: null,

            enviandoNuevoDateInicio: false,
            enviandoNuevoDateFinal: false,
            enviandoHorarios: false,
            enviandoSomeHorario: false,

            nuevoLimiteDeCupos: null,
            editandoLimiteDeCupos: false,
            enviandoNuevoLimiteDeCupos: false,

            minRepetir: 1,
            maxRepetir: 52,

            enviandoQueryRepetir: false,
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
                    __typename
                    ... on EventoPersonal{
                        id
                      nombre
                    }
                    ... on EventoPublico{
                        id
                        nombre
                    }
                    
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
        guardarNuevoLimiteDeCupos() {
            this.nuevoLimiteDeCupos = this.$refs.inputNuevoLimiteDeCupos.value;

            if (this.nuevoLimiteDeCuposIlegal) {
                console.log(`No enviado`);
                return;
            }
            if (this.nuevoLimiteDeCupos == this.esteEvento.limiteDeCupos) {
                this.editandoLimiteDeCupos = false;
                return;
            }
            console.log(`guardando nuevo limite de cupos`);
            this.enviandonuevoLimiteDeCupos = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($idEvento: ID!, $tipoEvento:String!, $nuevoLimiteDeCupos: Int!) {
                    editarLimiteDeCuposEvento(
                      idEvento: $idEvento
                      tipoEvento:$tipoEvento
                      nuevoLimiteDeCupos: $nuevoLimiteDeCupos
                    ) {
                        id
                      limiteDeCupos                                      
                    }
                  }
                `,
                    variables: {
                        idEvento: this.esteEvento.id,
                        tipoEvento: this.tipoEvento,
                        nuevoLimiteDeCupos: parseInt(this.nuevoLimiteDeCupos),
                    },
                })
                .then(() => {
                    this.enviandoNuevoLimiteDeCupos = false;
                    this.editandoLimiteDeCupos = false;
                })
                .catch((error) => {
                    this.enviandoNuevoLimiteDeCupos = false;
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
                        __typename
                        ... on EventoPublico{
                            id
                            descripcion  
                        }
                        ... on EventoPersonal{
                            id
                            descripcion  
                        }
                      
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
        toggleEditandoLimiteDeCupos(e) {
            if (this.administrador) {
                e.stopPropagation();

                this.editandoLimiteDeCupos = true;
                this.nuevoLimiteDeCupos = this.esteEvento.limiteDeCupos;
                this.$nextTick(() => {
                    this.$refs.inputNuevoLimiteDeCupos.focus();
                });
            }
        },
        keydownInputNuevoNombre(e) {
            if (e.key === "Escape") {
                this.$refs.inputNuevoNombre.blur();
            }
        },
        setHoraFinal() {
            var textoActual="hh:mm";
            if(this.horaFinalLegible){                
                textoActual=this.horaFinalLegible;
            }
            
            var nuevaHoraFinalInput = prompt("Introducir nueva hora de finalización", textoActual);

            const indexPuntos = nuevaHoraFinalInput.indexOf(":");

            const horasInput = parseInt(nuevaHoraFinalInput.substr(0, indexPuntos));
            const minutosInput = parseInt(nuevaHoraFinalInput.substr(indexPuntos + 1));

            if (horasInput!=null && minutosInput!=null && horasInput >= 0 && horasInput < 24 && minutosInput >= 0 && minutosInput < 60) {
                var nuevaDateFinal = new Date(this.diaCalendarioOver.date);
                nuevaDateFinal.setHours(horasInput);
                nuevaDateFinal.setMinutes(minutosInput);


                console.log("Se fijará la nueva hora de final en " + nuevaDateFinal);
                this.enviarNuevoHorarioFinal(nuevaDateFinal);
            }
            else {
                console.log("Hora inválida");
                return;
            }
        },
        setHoraInicio() {
            var textoActual="hh:mm";
            if(this.horaInicioLegible){                
                textoActual=this.horaInicioLegible;
            }
            var nuevaHoraInicioInput = prompt("Introducir nueva hora de inicio",textoActual);

            const indexPuntos = nuevaHoraInicioInput.indexOf(":");

            const horasInput = parseInt(nuevaHoraInicioInput.substr(0, indexPuntos));
            const minutosInput = parseInt(nuevaHoraInicioInput.substr(indexPuntos + 1));

            if (horasInput!=null && minutosInput!=null && horasInput >= 0 && horasInput < 24 && minutosInput >= 0 && minutosInput < 60) {
                var nuevaDateInicio = new Date(this.diaCalendarioOver.date);
                nuevaDateInicio.setHours(horasInput);
                nuevaDateInicio.setMinutes(minutosInput);


                console.log("Se fijará la nueva hora de inicio en " + nuevaDateInicio);
                this.enviarNuevaDateInicioHoldDuration(nuevaDateInicio);
            }
            else {
                console.log("Hora inválida");
                return;
            }


        },
        enviarNuevaDateInicioHoldDuration(nuevaDateInicio) {
            this.enviandoNuevoDateInicio = true;
            this.enviandoSomeHorario = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
                    setDateInicioEventoHoldDuration(
                      nuevoDate: $nuevoDate
                      tipoEvento: $tipoEvento
                      idEvento: $idEvento
                    ) {
                      __typename
                      ... on EventoPersonal{
                        id
                        horarioInicio
                        horarioFinal
                      }
                      ... on EventoPublico{
                        id
                        horarioInicio
                        horarioFinal
                      }
                      
                    }
                  }
                `,
                    variables: {
                        nuevoDate: nuevaDateInicio,
                        tipoEvento: this.tipoEvento,
                        idEvento: this.esteEvento.id,
                    },
                })
                .then(() => {
                    this.$emit("eventoCambioFecha", this.esteEvento);
                    this.enviandoSomeHorario = false;
                    this.enviandoNuevoDateInicio = false;
                    this.editandoFechaInicio = false;
                    this.editandoHoraInicio = false;
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                    this.enviandoNuevoDateInicio = false;
                    this.enviandoSomeHorario = false;
                });
        },
        enviarNuevoHorarioFinal(dateFinal) {
            this.enviandoNuevoDateFinal = true;
            this.enviandoSomeHorario = true;
            console.log(`Enviando nuevo horario final: ${dateFinal}`);
            this.$apollo
                .mutate({
                    mutation: gql`
                    mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
                        setDateFinalEvento(
                        nuevoDate: $nuevoDate
                        tipoEvento: $tipoEvento
                        idEvento: $idEvento
                        ){
                                __typename
                            ... on EventoPersonal{
                                id
                                horarioInicio
                                horarioFinal
                            }
                            ... on EventoPublico{
                                id
                                horarioInicio
                                horarioFinal
                            }
                        }
                  }
                `,
                    variables: {
                        nuevoDate: dateFinal,
                        tipoEvento: this.esteEvento.__typename.charAt(0).toLowerCase() + this.esteEvento.__typename.slice(1),
                        idEvento: this.esteEvento.id,
                    },
                })
                .then(() => {

                    this.enviandoNuevoDateFinal = false;
                    this.enviandoSomeHorario = false;
                    this.editandoDuracion = false;

                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                    this.enviandoNuevoDateFinal = false;
                    this.enviandoSomeHorario = false;
                });
        },
        iniciarEdicionDuracion() {
            this.nuevoDuracion = this.esteEvento.horarioFinal - this.esteEvento.horarioInicio;
            this.editandoDuracion = true;
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
            this.enviandoQueryRepetir = true;
            this.$apollo.mutate({
                mutation: gql`
                mutation($periodoRepetir: String, $cantidadRepetir: Int!, $idEvento:ID!, $tipoEvento:String!){
                  repetirEventoPeriodicamente(periodoRepetir:$periodoRepetir, cantidadRepetir: $cantidadRepetir, idEvento: $idEvento, tipoEvento:$tipoEvento){
                    __typename
                    ...on EventoPublico{
                        ...fragEventoPublico
                    }
                    ...on EventoPersonal{
                        ...fragEventoPersonal
                    }
                  }
                } 
                ${fragmentoEventoPublico}
                ${fragmentoEventoPersonal}
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
                    this.mostrandoZonaRepetir = false;
                }
                this.enviandoQueryRepetir = false;

            }).catch((error) => {
                console.log(`Error: ${error}`);
                this.enviandoQueryRepetir = false;

            })
        },
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
        nuevoLimiteDeCuposIlegal() {
            if (!this.nuevoLimiteDeCupos || this.nuevoLimiteDeCupos < 1) {
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
}
export const MixinEdicionEventosPublicos = {
    data() {
        return {


        }
    },
    methods: {

    },

};



export const MixinEventoCalendario = {
    props: {
        idEventoSeleccionado: String,
        esteEvento: Object,
        horaPx: Number,
        seleccionado: Boolean,
        infoOffset: Object,
        diaCalendarioOver: Object,
        enfasis: String,
        idUsuarioTarget: String,
    },
    data() {
        return {
            eliminandose: false,
            recogido: false,
        }
    },
    computed: {
        duracionMinutos() {
            return (this.dateFinal.getTime() - this.dateInicio.getTime()) / 60000;
        },
        estiloSize() {
            const anchoPx = (this.duracionMinutos / 60) * this.horaPx;
            return {
                width: anchoPx + "px",
            };
        },
        estiloPos() {
            const millisDia = (this.dateInicio.getHours() * 3600000) + (this.dateInicio.getMinutes() * 60000)
            return {
                left: (millisDia / 3600000) * this.horaPx + "px",
                top: this.infoOffset ? this.infoOffset.top + 'px' : 0 + "px",
            };
        },
        estiloZ() {
            return {
                zIndex: this.seleccionado ? 10 : 0
            }
        },
        claseOffset() {
            return this.infoOffset.clase;
        },
    },
    methods: {

    },
    watch: {
        dateInicio(dateInicio) {
            console.log(`Cambio de date inicio. Ahora inicio en ${dateInicio}`);
            if (
                dateInicio < this.diaCalendarioOver.date ||
                dateInicio.getTime() > this.diaCalendarioOver.date.getTime() + 86400000
            ) {
                console.log(`${this.esteEvento.nombre} dice: Me cambiaron de día`);
                this.$emit("meCambiaronDia", this.esteEvento);
            }
        },
    },
}
export const MixinVentanaEvento = {
    data() {
        return {
            mostrando: null,
            esteEvento: {

            },

            editandoDateInicio: false,
            editandoHorarioFinal: false,
            editandoDuracion: false,

            mostrandoZonaRepetir: false,
            periodoRepetir: "diariamente",
            cantidadRepetir: 1,
        }

    },
    methods: {
        cerrarVentana() {
            const indexEsteSubpath = this.tipoEvento === 'eventoPublico' ? this.$route.path.search("ventanaEventoPublico") : this.tipoEvento === 'eventoPersonal' ? this.$route.path.search("ventanaEventoPersonal") : null
            if (!indexEsteSubpath) return;
            const pathParent = this.$route.path.substring(0, indexEsteSubpath - 1);
            this.$router.push(pathParent);
        },
        iniciarEdicionFechaInicio() {
            if (!this.administrador && !this.usuarioSuperadministrador && !this.usuarioProfe) return;

            console.log(
                `Iniciando edicion de fecha inicio con ${this.fechaInicioString}`
            );
            this.$refs.inputFechaInicio.value = this.fechaInicioFormateada;
            this.editandoFechaInicio = true;
            this.$nextTick(() => {
                this.$refs.inputFechaInicio.focus();
            });
        },
        iniciarEdicionHoraInicio() {
            if (!this.administrador && !this.usuarioSuperadministrador && !this.usuarioProfe) return;

            this.$refs.inputHoraInicio.value = this.horaInicioLegible;
            this.editandoHoraInicio = true;
            this.$nextTick(() => {
                this.$refs.inputHoraInicio.focus();
            });
        },
        iniciarEdicionDuracion() {
            if (!this.administrador && !this.usuarioSuperadministrador && !this.usuarioProfe) return;

            console.log(`Iniciando edicion de duración con ${this.duracionMinutos}`);
            this.$refs.inputDuracion.value = this.duracionMinutos;
            this.editandoDuracion = true;
            this.$nextTick(() => {
                this.$refs.inputDuracion.focus();
            });
        },
        updateDuracion(nuevaDuracion) {
            console.log(`Updating duración to ${nuevaDuracion} minutos`);
            const nuevoHorarioFinal = new Date(
                this.dateInicio.getTime() + nuevaDuracion * 60000
            );
            this.enviarNuevoHorarioFinal(nuevoHorarioFinal);
        },
        enviarNuevoHorarioFinal(dateFinal) {
            this.enviandoNuevoDateFinal = true;
            this.enviandoSomeHorario = true;
            console.log(`Enviando nuevo horario final: ${dateFinal}`);
            this.$apollo
                .mutate({
                    mutation: gql`
                    mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
                        setDateFinalEvento(
                        nuevoDate: $nuevoDate
                        tipoEvento: $tipoEvento
                        idEvento: $idEvento
                        ){
                                __typename
                            ... on EventoPersonal{
                                id
                                horarioInicio
                                horarioFinal
                            }
                            ... on EventoPublico{
                                id
                                horarioInicio
                                horarioFinal
                            }
                        }
                  }
                `,
                    variables: {
                        nuevoDate: dateFinal,
                        tipoEvento: this.esteEvento.__typename.charAt(0).toLowerCase() + this.esteEvento.__typename.slice(1),
                        idEvento: this.esteEvento.id,
                    },
                })
                .then(() => {

                    this.enviandoNuevoDateFinal = false;
                    this.enviandoSomeHorario = false;
                    this.editandoDuracion = false;

                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                    this.enviandoNuevoDateFinal = false;
                    this.enviandoSomeHorario = false;
                });
        },
        updateHorarioInicio(e) {
            const nuevoTime = e.target.value;
            const horas = parseInt(nuevoTime.substring(0, 2));
            const minutos = parseInt(nuevoTime.substring(3));
            console.log(
                `nuevoTime: ${nuevoTime}. ${horas} horas y ${minutos} minutos`
            );
            const actualDateFinal = new Date(this.esteEvento.horarioFinal);
            var dateInicio = new Date(this.esteEvento.horarioInicio);
            console.log(`Actual date: ${dateInicio}`);
            dateInicio.setHours(horas);
            dateInicio.setMinutes(minutos);
            console.log(`Nueva date inicio: ${dateInicio}`);
            if (dateInicio > actualDateFinal) {
                return;
            }

            this.enviandoNuevoDateInicio = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
                    setDateInicioEvento(
                      nuevoDate: $nuevoDate
                      tipoEvento: $tipoEvento
                      idEvento: $idEvento
                    ){
                        __typename
                      ... on EventoPersonal{
                        id
                        horarioInicio
                        horarioFinal
                      }
                      ... on EventoPublico{
                        id
                        horarioInicio
                        horarioFinal
                      }
                    }
                  }
                `,
                    variables: {
                        nuevoDate: dateInicio,
                        tipoEvento: this.tipoEvento,
                        idEvento: this.esteEvento.id,
                    },
                })
                .then(() => {
                    this.enviandoNuevoDateInicio = false;
                    this.editandoDateInicio = false;
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                    this.enviandoNuevoDateInicio = false;
                });
            // const nuevoDate=this.
        },
        iniciarEdicionHorarioFinal() {
            if (!this.administrador && !this.usuarioSuperadministrador && !this.usuarioProfe) return;
            console.log(`Iniciando edicion`);
            this.$refs.inputHorarioFinal.value = this.horaFinalString;
            this.editandoHorarioFinal = true;
            this.$nextTick(() => {
                this.$refs.inputHorarioFinal.focus();
            });
        },
        updateHorarioFinal(e) {
            const nuevoTime = e.target.value;
            const horas = parseInt(nuevoTime.substring(0, 2));
            const minutos = parseInt(nuevoTime.substring(3));
            console.log(
                `nuevoTime: ${nuevoTime}. ${horas} horas y ${minutos} minutos`
            );
            const actualDateInicio = new Date(this.esteEvento.horarioInicio);
            var dateFinal = new Date(this.esteEvento.horarioFinal);
            console.log(`Actual date: ${dateFinal}`);
            dateFinal.setHours(horas);
            dateFinal.setMinutes(minutos);
            console.log(`Nueva date final: ${dateFinal}`);
            if (dateFinal < actualDateInicio) {
                return;
            }

            this.enviarNuevoHorarioFinal(dateFinal);
            // const nuevoDate=this.
        },
        enviarNuevaDateInicioHoldDuration(nuevaDateInicio) {
            this.enviandoNuevoDateInicio = true;
            this.enviandoSomeHorario = true;
            this.$apollo
                .mutate({
                    mutation: gql`
                  mutation ($nuevoDate: Date!, $tipoEvento: String!, $idEvento: ID!) {
                    setDateInicioEventoHoldDuration(
                      nuevoDate: $nuevoDate
                      tipoEvento: $tipoEvento
                      idEvento: $idEvento
                    ) {
                      __typename
                      ... on EventoPersonal{
                        id
                        horarioInicio
                        horarioFinal
                      }
                      ... on EventoPublico{
                        id
                        horarioInicio
                        horarioFinal
                      }
                      
                    }
                  }
                `,
                    variables: {
                        nuevoDate: nuevaDateInicio,
                        tipoEvento: this.tipoEvento,
                        idEvento: this.esteEvento.id,
                    },
                })
                .then(() => {
                    this.$emit("eventoCambioFecha", this.esteEvento);
                    this.enviandoSomeHorario = false;
                    this.enviandoNuevoDateInicio = false;
                    this.editandoFechaInicio = false;
                    this.editandoHoraInicio = false;
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                    this.enviandoNuevoDateInicio = false;
                    this.enviandoSomeHorario = false;
                });
        },
        updateFechaInicioHoldDuration(nuevaFechaInicioFormateada) {
            console.log(
                `se hara update de fecha inicio holding duration. ${nuevaFechaInicioFormateada}`
            );
            const datosFecha = new Date(nuevaFechaInicioFormateada);
            const nuevoDiaInicio = datosFecha.getUTCDate();
            const nuevoMesInicio = datosFecha.getUTCMonth();
            const nuevoYearInicio = datosFecha.getUTCFullYear();

            var nuevaDateInicio = new Date(this.esteEvento.horarioInicio);
            nuevaDateInicio.setDate(nuevoDiaInicio);
            nuevaDateInicio.setMonth(nuevoMesInicio);
            nuevaDateInicio.setFullYear(nuevoYearInicio);

            console.log(`Quedará: ${nuevaDateInicio}`);

            this.enviarNuevaDateInicioHoldDuration(nuevaDateInicio);
        },
        updateHoraInicioHoldDuration(nuevaHoraInicioFormateada) {
            console.log(
                `se hara update de hora inicio holding duration. ${nuevaHoraInicioFormateada}`
            );
            const horas = nuevaHoraInicioFormateada.substring(0, 2);
            const minutos = nuevaHoraInicioFormateada.substring(3);

            var nuevaDateInicio = new Date(this.esteEvento.horarioInicio);
            nuevaDateInicio.setHours(horas);
            nuevaDateInicio.setMinutes(minutos);

            console.log(`Quedará: ${nuevaDateInicio}`);
            this.enviarNuevaDateInicioHoldDuration(nuevaDateInicio);
        },
    },
    computed: {
        horaInicioString() {
            return new Date(this.esteEvento.horarioInicio)
                .toTimeString()
                .substring(0, 5);
        },
        horaFinalString() {
            return new Date(this.esteEvento.horarioFinal)
                .toTimeString()
                .substring(0, 5);
        },
    },
}


export const MixinEventosPublicosUseEventosPersonalesUnder = {
    props: {
        idParent: String,
        tipoParent: String,
    },
    data() {
        return {
            creandoEventoPersonalUnder: false,
        }
    },
    methods: {
        crearEventoPersonalUnder() {
            console.log(`Creando evento personal under`);
            this.creandoEventoPersonalUnder = true;

            this.$apollo.mutate({
                mutation: gql`
                    mutation($infoEventoPersonal: InputCrearEventoPersonal){
                        crearEventoPersonal(infoEventoPersonal:$infoEventoPersonal){
                            ...fragEventoPersonal
                        }
                    }
                ${fragmentoEventoPersonal}
                `,
                variables: {
                    infoEventoPersonal: {
                        idPersona: this.idUsuarioTarget,
                        idEventoMarco: this.esteEvento.id,
                        idParent: this.idParent,
                        tipoParent: this.tipoParent
                    }
                }
            }).then(({ data: { crearEventoPersonal } }) => {
                this.creandoEventoPersonalUnder = false;
                this.$emit('creadoEventoPersonal', crearEventoPersonal);

            }).catch((error) => {
                console.log(`Error: ${error}`);
                this.creandoEventoPersonalUnder = false;
            })
        }
    }
}