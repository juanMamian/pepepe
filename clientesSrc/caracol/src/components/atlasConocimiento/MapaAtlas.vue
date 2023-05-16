<template>
    <div class="mapaAtlas" @touchmove="touchMoveDiagrama" @touchstart="touchStartDiagrama" @touchend="touchEndDiagrama"
        @scroll="scrollMapa" @mousedown.left.stop="iniciarDragMapa"
        @contextmenu.self.exact.stop.prevent="abrirMenuContextual" @mouseenter="hovered = true" @mouseleave="hovered = true"
        @mousemove="dragElemento" @mouseup.left="mouseUpDiagrama" @contextmenu.self.exact.prevent="abrirMenuContextual">

        <div id="contenedorElementosDiagrama" ref="contenedorElementosDiagrama">
            <transition name="fadeOut">
                <div v-show="showingZoomInfo || true" id="infoZoom">x{{ factorZoom }}</div>
            </transition>
            <loading v-show="$apollo.queries.nodosZona.loading" id="loadingNodosZona" />
            <div id="menuContextual" :style="[offsetMenuContextual]" v-show="mostrandoMenuContextual">
                <div class="botonMenuContextual" id="botonCrearNuevoNodo" :class="{ deshabilitado: posicionCreandoNodo }"
                    v-if="usuarioProfe" @click="crearNodoEnMenuContextual">
                    Crear Nodo de conocimiento
                </div>
            </div>
            <div id="contenedorNodos" ref="contenedorNodos" :style="[posContenedorNodos, sizeContenedorNodos,]">
                <loading texto="" v-if="posicionCreandoNodo" style="position: absolute" :style="[
                        {
                            top: posicionCreandoNodo.y - esquinasDiagrama.y1 + 'px',
                            left: posicionCreandoNodo.x - esquinasDiagrama.x1 + 'px',
                        },
                    ]" />

                <nodo-conocimiento-atlas v-for="(nodo) in nodosVisibles" :key="nodo.id" :idNodo="nodo.id"
                    :seleccionado="idNodoSeleccionado === nodo.id" :yo="yo" :idsNodosAprendidos="idsNodosActivosAprendidos"
                    :idsNodosOlvidados="idsNodosActivosOlvidados" :idsNodosEstudiados="idsNodosActivosEstudiados"
                    :idsNodosEstudiables="idsNodosColeccionEstudiables"
                    :class="{ esperandoClick: conectandoNodosColeccion, activoSeleccion: conectandoNodosColeccion && coleccionSeleccionada?.idsNodos.includes(nodo.id), activoSubseleccion: conectandoNodosColeccion && coleccionSeleccionada?.idsRed.includes(nodo.id), }"
                    :idNodoTarget="idNodoTarget"
                    :style="[{ top: nodo.autoCoords.y - centroDescarga.y + 'px', left: nodo.autoCoords.x - centroDescarga.x + 'px', },]"
                    @dblclick="$router.push({ name: 'visorNodoConocimiento', params: { idNodo: nodo.id }, })"
                    @click.stop="clickNodo(nodo)" @click.stop.ctrl.exact="iniciarDragNodo(nodo.id)" @mousedown.stop=""
                    @abrirMyControles="$emit('abrirControlesNodo')">
                    <template #imagenBolita v-if="conectandoNodosColeccion &&
                        coleccionSeleccionada?.idsNodos.includes(nodo.id)
                        ">
                        <img src="@/assets/iconos/plugSolid.svg" style="transform: scale(0.7); filter: invert(1)"
                            alt="Conectado" />
                    </template>
                </nodo-conocimiento-atlas>
            </div>
        </div>
    </div>
</template>
<script>
import gql from "graphql-tag";
import BuscadorNodosConocimiento from "./BuscadorNodosConocimiento.vue";
import Loading from "../utilidades/Loading.vue";
import debounce from "debounce";
import throttle from "lodash/throttle";
import {
    QUERY_NODO_CONOCIMIENTO_ESTANDAR,
    fragmentoNodoConocimiento,
    fragmentoNodoConocimientoMinimoAtlas,
} from "./fragsAtlasConocimiento";
import {
    QUERY_NODOS,
    QUERY_DATOS_USUARIO_NODOS,
    QUERY_NODO_CONOCIMIENTO_ATLAS,
} from "./fragsAtlasConocimiento";
import NodoConocimientoAtlas from "./NodoConocimientoAtlas.vue";
import GestorColecciones from "./GestorColecciones.vue";


const QUERY_NODOS_ZONA = gql`
query($centro: CoordsInput!, $radioX: Int!, $radioY: Int!){
    nodosConocimientoAroundCentro(centro : $centro, radioX: $radioX, radioY: $radioY){
        ...fragNodoConocimientoMinimoAtlas
    }
}
    ${fragmentoNodoConocimientoMinimoAtlas}
`

export default {
    name: "MapaAtlas",
    props: {
        idsNodosColeccionEstudiables: {
            type: Array,
            default: [],
        },
        nodoSeleccionadoBelongsColeccionSeleccionada: {
            type: Boolean,
        },
        conectandoNodosColeccion: {
            type: Boolean,
        },
        nodoCreandoDependencia: {
            type: Object,
        },
        idNodoSeleccionado: {
            type: String,
        },
        coleccionSeleccionada: {
            type: Object,
        },
        idsNodosActivosOlvidados: {
            type: Array,
            default: [],
        }
    },
    components: {
        BuscadorNodosConocimiento,
        Loading,
        NodoConocimientoAtlas,
        GestorColecciones,
    },
    apollo: {
        nodosZona: {
            query: QUERY_NODOS_ZONA,
            variables() {
                let gridSize = Math.round(150 / this.factorZoom);//Ancho de una grid cuyos vértices son los posibles centros de descarga. Esto eleva la posiblidad de que haya querys en cache.

                return {
                    centro: {
                        x: Math.round(this.centroDescarga.x / gridSize) * gridSize,
                        y: Math.round(this.centroDescarga.y / gridSize) * gridSize,
                    },
                    radioX: this.radioDescargaX,
                    radioY: this.radioDescargaY,
                }
            },
            update({ nodosConocimientoAroundCentro }) {
                console.log(nodosConocimientoAroundCentro.length + " nodos en zona");
                return nodosConocimientoAroundCentro;
            },
            fetchPolicy: "cache-first",
            debounce: 1000,
            skip() {
                return !this.centroDescarga || !this.radioDescargaX || !this.radioDescargaY || !this.factorZoom;
            }
        },
        nodoSeleccionadoDB: {
            query: QUERY_NODO_CONOCIMIENTO_ESTANDAR,
            variables() {
                return {
                    idNodo: this.idNodoSeleccionado,
                };
            },
            skip() {
                return !this.idNodoSeleccionado;
            },
            update({ nodo }) {
                return nodo;
            },
            fetchPolicy: "cache-first",
        },
        todosNodos: {
            query: QUERY_NODOS,
            update({ todosNodos }) {
                this.nodosDescargados = true;
                var nuevoTodosNodos = JSON.parse(JSON.stringify(todosNodos));
                nuevoTodosNodos.forEach((nodo) => {
                    nodo.coordsManuales = nodo.autoCoords;
                    nodo.coords = nodo.autoCoords;
                });

                return nuevoTodosNodos;
            },
            fetchPolicy: "cache-and-network",
        },
        configuracionAtlas: {
            query: gql`
        query ($nombreAtlas: String!) {
          configuracionAtlas(nombreAtlas: $nombreAtlas) {
            id
            posicionando
          }
        }
      `,
            variables: {
                nombreAtlas: "conocimiento",
            },
            fetchPolicy: "network-only",
        },
        yo: {
            query: QUERY_DATOS_USUARIO_NODOS,
            skip() {
                return !this.usuarioLogeado;
            },
            fetchPolicy: "cache-first",
        },
        progresoNodoTarget: {
            query: gql`
        query ($idNodo: ID!) {
          nodo(idNodo: $idNodo) {
            id
            porcentajeCompletado
          }
        }
      `,
            variables() {
                return {
                    idNodo: this.idNodoTarget,
                };
            },
            skip() {
                return !this.idNodoTarget;
            },
            update({ nodo }) {
                return nodo.porcentajeCompletado;
            },
        },
    },
    data() {
        return {
            lastPointerMoveX: null,
            lastPointerMoveY: null,
            centroVista: {
                x: 0,
                y: 0,
            },
            porcentajeTriggerDescarga: 60, // Padding imaginario en porcentajes en el cual se activa la descarga de un nuevo centro. Con referencia a centro vista. 
            centroDescarga: {
                x: 0,
                y: 0,
            },
            radioDescargaX: 1000,
            radioDescargaY: 1000,
            overflowZonaDescarga: 30, // Porcentaje del ancho del contenedor que es superado por la zona de descarga.
            elementoDragged: null,
            nodoSeleccionadoDB: {
                vinculos: [],
                expertos: [],
            },

            montado: false,
            firstLoad: false,

            configuracionAtlas: {
                posicionando: false,
            },
            hovered: false,
            todosNodos: [],
            nodosDescargados: false,
            posicionCreandoNodo: null,
            factorEscalera: 0.2,
            idsNodosCadenaPreviaSeleccionado: [],
            idNodoMenuCx: null,
            idsNecesariosParaTarget: [],
            enviandoQueryModo: false,
            enviandoQueryTarget: false,

            redibujarEnlacesNodos: 0,

            yo: {
                atlas: {
                    datosNodos: [],
                    configuracion: {
                        modo: "estudiante",
                    },
                },
            },

            idsNodosVisibles: [],
            idsNodosAlreadyRendered: [],

            showingZoomInfo: false,
            zoom: 60,
            minZoom: 20,
            maxZoom: 70,
            pinching: false,
            lastPinchDistance: 0,

            actualizarVinculosGrises: 0,

            ultimoTouchX: 0,
            ultimoTouchY: 0,

            cerrarBusqueda: 0,

            mostrandoMenuContextual: false,
            enviandoQueryConfiguracionAtlas: false,

            seleccionandoColeccion: false,
            mostrandoOpcionesColeccion: false,

            idColeccionTargetOnLastLocalizacion: null,

            nivelesUnderTarget: 1,
            hoveringAnuncioTarget: false,

            creandoDependencia: false,
            editandoVinculos: false,

            posMenuContextual: {
                x: 0,
                y: 0,
            },
        };
    },
    computed: {
        nodosVisibles() {
            if (!this.nodosZona) {
                return [];
            }

            if (this.conectandoNodosColeccion) {
                return this.nodosZona;
            }
            if (this.coleccionSeleccionada) {
                return this.nodosZona.filter(n => this.coleccionSeleccionada.idsRed.includes(n.id));
            }
            return this.nodosZona;
        },
        posContenedorNodos() {
            if (!this.montado) {
                return;
            }
            let heightScreen = this.$el.offsetHeight;
            let widthScreen = this.$el.offsetWidth;

            let deltaCentroVista = {
                x: this.centroDescarga.x - this.centroVista.x,
                y: this.centroDescarga.y - this.centroVista.y,

            }
            return {
                transform: "translate(" + Math.round(deltaCentroVista.x * this.factorZoom) + "px, " + Math.round(deltaCentroVista.y * this.factorZoom) + "px) scale(" + this.factorZoom + ")",
            }

            //            return {
            //                top: Math.round(heightScreen / 2) + (deltaCentroVista.y * this.factorZoom) + 'px',
            //                left: Math.round(widthScreen / 2) + (deltaCentroVista.x * this.factorZoom) + 'px',
            //            }

        },
        offsetMenuContextual() {
            if (!this.mostrandoMenuContextual) {
                return;
            }
            let widthMapa = this.$el.offsetWidth;
            let heightMapa = this.$el.offsetHeight;
            return {
                left: Math.round(widthMapa / 2 + ((this.posMenuContextual.x - this.centroVista.x) * this.factorZoom)) + "px",
                top: Math.round(heightMapa / 2 + ((this.posMenuContextual.y - this.centroVista.y) * this.factorZoom)) + "px",
            };
        },
        idsNodosTop() {
            if (!this.coleccionSeleccionada) {
                return [];
            }
            return this.coleccionSeleccionada.idsNodos;
        },
        idNodoTarget() {
            return this.yo?.atlas?.idNodoTarget;
        },
        domAndNodosReady() {
            return this.montado && this.firstLoad;
        },
        nodoSeleccionado: function () {
            if (!this.idNodoSeleccionado) {
                return null;
            }
            return this.nodoSeleccionadoDB;
        },
        nodoTarget() {
            if (!this.idNodoTarget) return null;
            return this.todosNodos.find((n) => n.id === this.idNodoTarget);
        },

        idsTodosNodosEstudiados() {
            if (!this.yo?.atlas?.datosNodos) {
                return [];
            }
            return this.yo.atlas.datosNodos
                .filter((dn) => dn.estadoAprendizaje === "ESTUDIADO")
                .map((dn) => dn.idNodo);
        },
        idsTodosNodosAprendidos() {
            if (!this.yo?.atlas?.datosNodos) {
                return [];
            }
            return this.yo.atlas.datosNodos
                .filter((dn) => dn.estadoAprendizaje === "APRENDIDO")
                .map((dn) => dn.idNodo);
        },
        idsNodosActivosEstudiados() {
            let listaCompleta = this.idsTodosNodosEstudiados;
            if (this.coleccionSeleccionada?.id) {
                listaCompleta = listaCompleta.filter(id => this.coleccionSeleccionada.idsRed.includes(id));
            }
            return listaCompleta;
        },
        idsNodosActivosAprendidos() {
            if (this.coleccionSeleccionada) {
                return this.idsTodosNodosAprendidos.filter(id => this.coleccionSeleccionada.idsRed.includes(id));
            }
            return this.idsTodosNodosAprendidos;
        },
        idsNodosColeccionAccesibles() {
            return this.nodosColeccionAccesibles.map(n => n.id);
        },
        factorZoom() {
            return Number((this.zoom / 100).toFixed(2));
        },
        sizeContenedorNodos() {
            return {
                width: this.radioDescargaX + "px",
                height: this.radioDescargaY + "px",
            };
        },
        esquinasDiagrama() {
            const maxX = this.todosNodos.reduce(
                (acc, n) => (n.autoCoords.x > acc ? n.autoCoords.x : acc),
                0
            );
            const maxY = this.todosNodos.reduce(
                (acc, n) => (n.autoCoords.y > acc ? n.autoCoords.y : acc),
                0
            );
            const minX = this.todosNodos.reduce(
                (acc, n) => (n.autoCoords.x < acc ? n.autoCoords.x : acc),
                0
            );
            const minY = this.todosNodos.reduce(
                (acc, n) => (n.autoCoords.y < acc ? n.autoCoords.y : acc),
                0
            );

            let padding = 400;

            return {
                x1: minX - padding,
                y1: minY - padding,

                x2: maxX + padding,
                y2: maxY + padding,
            };
        },
    },
    methods: {
        scrollMapa(e) {
            console.log("scrollMapa")
            e.stopPropagation();
            e.preventDefault();
        },

        mouseUpDiagrama(e) {
            if (this.elementoDragged?.tipo === 'nodoConocimiento') {
                console.log("Soltando nodo conocimiento")
                const posContenedor = this.$el.getBoundingClientRect();

                let posicion = {
                    x: Math.round(this.centroVista.x + (e.clientX - posContenedor.left - (posContenedor.width / 2)) / this.factorZoom),
                    y: Math.round(this.centroVista.y + (e.clientY - posContenedor.top - (posContenedor.height / 2)) / this.factorZoom),
                }

                console.table(posicion);

                this.$apollo.mutate({
                    mutation: gql`
                    mutation($idNodo: ID!, $coordsManuales: CoordsInput!){
                        setCoordsManuales(idNodo: $idNodo, coordsManuales: $coordsManuales){
                            modificados{
                            id
                                autoCoords{
                                    x
                                    y
                                }
                            }
                        }
                    }
                    `,
                    variables: {
                        idNodo: this.elementoDragged.id,
                        coordsManuales: posicion,
                    }

                }).then(() => {
                    console.log("hecho");
                }).catch((error) => {
                    console.log("Error: " + error);
                })

            }
            this.elementoDragged = null;
            this.lastPointerMoveX = null;
            this.lastPointerMoveY = null;
        },

        iniciarDragMapa() {
            if (this.elementoDragged) {
                return;
            }
            this.elementoDragged = {
                tipo: "mapa",
            }
        },

        setRadiosDescarga() {
            let anchoContenedor = this.$el.offsetWidth;
            let altoContenedor = this.$el.offsetHeight;

            this.radioDescargaX = Math.round((anchoContenedor / 2) * ((100 + this.overflowZonaDescarga) / 100) / this.factorZoom);
            this.radioDescargaY = Math.round((altoContenedor / 2) * ((100 + this.overflowZonaDescarga) / 100) / this.factorZoom);
        },
        iniciarDragNodo(idNodo) {
            if (!this.usuarioSuperadministrador) {
                return;
            }
            this.elementoDragged = {
                tipo: "nodoConocimiento",
                id: idNodo,
            }
        },
        dragElemento: throttle(function (e) {
            if (!this.elementoDragged) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();

            let dragClientX = e.touches ? e.touches[0].clientX : e.clientX;
            let dragClientY = e.touches ? e.touches[0].clientY : e.clientY;
            if (this.elementoDragged.tipo === 'nodoConocimiento') {
                console.log("dragging nodo");
                if (!this.usuarioSuperadministrador) {
                    return;
                }

            }
            else if (this.elementoDragged.tipo === 'mapa') {
                if (!this.lastPointerMoveX || !this.lastPointerMoveY) {
                    console.log("No había last move coordinates");
                    this.lastPointerMoveX = dragClientX;
                    this.lastPointerMoveY = dragClientY;
                    return;
                }
                let deltaX = dragClientX - this.lastPointerMoveX;
                let deltaY = dragClientY - this.lastPointerMoveY;

                deltaX = Math.round(deltaX / this.factorZoom);
                deltaY = Math.round(deltaY / this.factorZoom);
                this.panVista(-deltaX, -deltaY);
                this.lastPointerMoveX = dragClientX;
                this.lastPointerMoveY = dragClientY;
            }
        }, 50),
        stepNivelesUnderTarget: throttle(function (step) {
            let nuevoNiveles = this.nivelesUnderTarget + step;
            if (nuevoNiveles < 0) {
                nuevoNiveles = 0;
            }
            if (this.idsUnderTarget[nuevoNiveles]) {
                this.nivelesUnderTarget = nuevoNiveles;
            }
        }, 800),
        nodoEnRangoVista(nodo) {
            let posNodo = nodo.autoCoords;
            let limiteIzquierdo =
                this.centroZonaNodosVisibles.x -
                (this.factorZonaVisible * this.anchoScreen) / this.factorZoom;
            let limiteDerecho =
                this.centroZonaNodosVisibles.x +
                (this.factorZonaVisible * this.anchoScreen) / this.factorZoom;
            let limiteSuperior =
                this.centroZonaNodosVisibles.y -
                (this.factorZonaVisible * this.altoScreen) / this.factorZoom;
            let limiteInferior =
                this.centroZonaNodosVisibles.y +
                (this.factorZonaVisible * this.altoScreen) / this.factorZoom;
            return (
                posNodo.x > limiteIzquierdo &&
                posNodo.x < limiteDerecho &&
                posNodo.y > limiteSuperior &&
                posNodo.y < limiteInferior
            );
        },
        reactToNodoEliminado(idNodo) {
            console.log("Reaccionar to nodo eliminado");
            const store = this.$apollo.provider.defaultClient;
            const cache = store.readQuery({
                query: QUERY_NODOS_ZONA,
                variables: {
                    centro: this.centroDescarga,
                    radioX: this.radioDescargaX,
                    radioY: this.radioDescargaY,
                }
            });
            let nuevoCache = JSON.parse(JSON.stringify(cache));
            let listaNodos = nuevoCache.nodosConocimientoAroundCentro;
            const indexN = listaNodos.findIndex(n => n.id === idNodo);
            if (indexN < 0) {
                console.log("el nodo ni estaba en el caché");
                return
            }
            listaNodos.splice(indexN, 1);
            store.writeQuery({
                query: QUERY_NODOS_ZONA,
                variables: {
                    centro: this.centroDescarga,
                    radioX: this.radioDescargaX,
                    radioY: this.radioDescargaY,
                },
                data: nuevoCache
            });

        },
        touchEndDiagrama(e) {
            this.elementoDragged = null;
            this.lastPointerMoveX = null;
            this.lastPointerMoveY = null;
        },

        touchStartDiagrama(e) {
            if (e.touches.length === 2) {
                e.stopPropagation();
                e.preventDefault();

                // get distance between fingers
                let distance = Math.sqrt(
                    Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
                    Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
                );

                this.lastPinchingDistance = distance;
                return
            }

            this.elementoDragged = {
                tipo: "mapa"
            }

        },
        touchMoveDiagrama(e) {
            if (e.touches.length === 2) {
                e.stopPropagation();
                e.preventDefault();
                let center = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
                };

                var contenedor = this.$el;
                let posContenedor = contenedor.getBoundingClientRect();

                let centroAccion = {
                    x: this.centroVista.x + (center.x - posContenedor.left - posContenedor.width / 2) / this.factorZoom,
                    y: this.centroVista.y + (center.y - posContenedor.top - posContenedor.height / 2) / this.factorZoom,
                };
                let distance = Math.sqrt(
                    Math.pow(e.touches[0].clientX - e.touches[1].clientX, 2) +
                    Math.pow(e.touches[0].clientY - e.touches[1].clientY, 2)
                );

                if (!this.lastPinchingDistance) {
                    this.lastPinchingDistance = distance;
                    return;
                }
                let zoomChange = distance - this.lastPinchingDistance;

                //set to 2 if postive, -2 if negative
                if (zoomChange != 0) {
                    zoomChange = 2 * zoomChange / Math.abs(zoomChange);

                    throttle(this.zoomVista(zoomChange, centroAccion), 1000);
                }

                this.lastPinchingDistance = distance;
                return
            }
            this.dragElemento(e);

        },
        clickNodo(nodo) {
            this.$emit("seleccionNodo", { idNodo: nodo.id, programmatic: false });
        },
        togglePosicionamiento() {
            this.enviandoQueryConfiguracionAtlas = true;
            this.$apollo
                .mutate({
                    mutation: gql`
            mutation ($nombreAtlas: String!) {
              togglePosicionamientoAutomaticoAtlas(nombreAtlas: $nombreAtlas) {
                id
                posicionando
              }
            }
          `,
                    variables: {
                        nombreAtlas: "conocimiento",
                    },
                })
                .then(() => {
                    this.enviandoQueryConfiguracionAtlas = false;
                })
                .catch(() => {
                    this.enviandoQueryConfiguracionAtlas = false;
                });
        },
        cerrarMenuContextual() {
            this.mostrandoMenuContextual = false;
        },
        abrirMenuContextual(e) {
            const posContenedor = this.$el.getBoundingClientRect();
            let clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let clientY = e.touches ? e.touches[0].clientY : e.clientY;

            let pxToCentroX = clientX - posContenedor.left - (this.$el.offsetWidth / 2);
            let pxToCentroY = clientY - posContenedor.top - (this.$el.offsetHeight / 2)

            this.posMenuContextual = {
                x: Math.round(this.centroVista.x + (pxToCentroX / this.factorZoom)),
                y: Math.round(this.centroVista.y + (pxToCentroY / this.factorZoom)),
            };
            this.mostrandoMenuContextual = true;
            //this.crearNodo({x: leftClick, y: topClick});
        },
        crearNodoEnMenuContextual() {
            var posicionNuevoNodo = {
                x: this.posMenuContextual.x,
                y: this.posMenuContextual.y,
            };

            console.log(`Creando nuevo nodo en ${JSON.stringify(posicionNuevoNodo)}`);

            this.crearNodo(posicionNuevoNodo);
        },

        centrarEnNodo(n) {
            this.centrarVista(n.autoCoords.x, n.autoCoords.y);
        },
        centrarEnNodoById(idNodo) {
            if (!idNodo) {
                return;
            }
            console.log(`Centrando en nodo con id ${idNodo}`);
            this.$apollo
                .query({
                    query: gql`
            query ($idNodo: ID!) {
              nodo(idNodo: $idNodo) {
                id
                autoCoords {
                  x
                  y
                }
              }
            }
          `,
                    variables: {
                        idNodo,
                    },
                })
                .then(({ data: { nodo } }) => {
                    console.log(`Recibido nodo así: ${JSON.stringify(nodo)}`);
                    this.centrarEnNodo(nodo);
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                });
        },
        cambiarCoordsManualesNodo(idNodo, coordsManuales) {
            if (!this.usuarioSuperadministrador) {
                console.log(`No autorizado`);
                return;
            }
            this.todosNodos[this.todosNodos.findIndex((n) => n.id == idNodo)].coords =
                coordsManuales;
            this.$apollo
                .mutate({
                    mutation: gql`
            mutation ($idNodo: String, $coordsManuales: CoordsInput) {
              setCoordsManuales(
                idNodo: $idNodo
                coordsManuales: $coordsManuales
              ) {
                modificados {
                  id
                  coordsManuales {
                    x
                    y
                  }
                  coords {
                    x
                    y
                  }
                }
              }
            }
          `,
                    variables: {
                        idNodo,
                        coordsManuales,
                    },
                })
                .then(() => {
                    this.$refs.canvases.crearImagenTodosVinculos();
                })
                .catch((error) => {
                    console.log(`Error: ${error}`);
                });
        },
        crearNodo(posicion) {
            if (!this.usuarioSuperadministrador) {
                console.log(`Error. Usuario no autorizado`);
                return;
            }
            console.log(`enviando una mutación de crear nodo`);

            let infoNodo = {
                autoCoords: {
                    x: posicion.x,
                    y: posicion.y,
                },
            };
            this.posicionCreandoNodo = {
                x: posicion.x,
                y: posicion.y,
            };
            this.$apollo
                .mutate({
                    mutation: gql`
            mutation ($infoNodo: NodoConocimientoInput) {
              crearNodo(infoNodo: $infoNodo) {
                ...fragNodoConocimiento
              }
            }
            ${fragmentoNodoConocimiento}
          `,
                    variables: {
                        infoNodo,
                    },
                })
                .then(({ data: { crearNodo } }) => {
                    console.log(`Creado ${crearNodo.id}`);
                    const store = this.$apollo.provider.defaultClient;
                    const cache = store.readQuery({
                        query: QUERY_NODOS_ZONA,
                        variables: {
                            centro: this.centroDescarga,
                            radioX: this.radioDescargaX,
                            radioY: this.radioDescargaY
                        }
                    });
                    var nuevoCache = JSON.parse(JSON.stringify(cache));
                    var losNodos = nuevoCache.nodosConocimientoAroundCentro;

                    const indexN = losNodos.findIndex((n) => n.id === crearNodo.id);
                    if (indexN > -1) {
                        console.log(`El nodo ya estaba en caché`);
                    } else {
                        losNodos.push(crearNodo);
                        store.writeQuery({
                            query: QUERY_NODOS_ZONA,
                            variables: {
                                centro: this.centroDescarga,
                                radioX: this.radioDescargaX,
                                radioY: this.radioDescargaY,
                            },
                            data: nuevoCache,
                        });
                    }
                    this.posicionCreandoNodo = null;
                    //this.$router.push("/nodoConocimiento/"+crearNodo.id);
                })
                .catch((error) => {
                    this.posicionCreandoNodo = null;
                    console.log(`Error. E: ${error}`);
                });
        },
        seleccionNodo(nodo, programatic) {
            this.$emit("seleccionNodo", { idNodo: nodo.id, programatic });
        },
        async eliminarVinculo(idNodoFrom, idNodoTo) {
            if (!this.usuarioSuperadministrador) {
                console.log(`No autorizado`);
                return;
            }
            console.log(`eliminando un vinculo entre ${idNodoFrom} y ${idNodoTo} `);

            this.editandoVinculos = true;
            this.$apollo
                .mutate({
                    mutation: gql`
            mutation ($idNodoFrom: ID!, $idNodoTo: ID!) {
              eliminarVinculoFromTo(
                idSource: $idNodoFrom
                idTarget: $idNodoTo
              ) {
                modificados {
                  id
                  vinculos {
                    id
                    idRef
                    tipo
                    rol
                  }
                }
              }
            }
          `,
                    variables: {
                        idNodoFrom,
                        idNodoTo,
                    },
                })
                .then(() => {
                    this.editandoVinculos = false;
                })
                .catch((error) => {
                    console.log(`error: ${error}`);
                    this.editandoVinculos = false;
                });
        },
        centrarVista(posx, posy) {
            this.centroVista.x = posx;
            this.centroVista.y = posy;
        },

        zoomVista(cantidad, centroAccion) {

            let step = cantidad;
            let nuevoZoom = this.zoom + step;
            if (nuevoZoom < this.minZoom) {
                nuevoZoom = this.minZoom;
            } else if (nuevoZoom > this.maxZoom) {
                nuevoZoom = this.maxZoom;
            }

            //Mantener distancia entre centroAccion y centroVista igual en px
            var contenedor = this.$el;
            let posContenedor = contenedor.getBoundingClientRect();

            const distanciaCentroVistaCentroAccion = {
                x: this.centroVista.x - centroAccion.x,
                y: this.centroVista.y - centroAccion.y,
            }
            let razonZoom = nuevoZoom / this.zoom;

            this.zoom = nuevoZoom;

            let nuevaDistanciaX = distanciaCentroVistaCentroAccion.x / razonZoom;
            let nuevaDistanciaY = distanciaCentroVistaCentroAccion.y / razonZoom;

            this.centrarVista(Math.round(centroAccion.x + nuevaDistanciaX), Math.round(centroAccion.y + nuevaDistanciaY));

            this.showingZoomInfo = true;
        },
        zoomWheel(e) {
            if (!this.hovered) {
                return;
            }
            e.preventDefault();

            if (e.ctrlKey) {
                var contenedor = this.$el;
                let posContenedor = contenedor.getBoundingClientRect();

                let centroAccion = {
                    x: this.centroVista.x + (e.clientX - posContenedor.left - posContenedor.width / 2) / this.factorZoom,
                    y: this.centroVista.y + (e.clientY - posContenedor.top - posContenedor.height / 2) / this.factorZoom,
                };

                //Check wheel direction
                if (e.deltaY > 0) {
                    this.zoomVista(-5, centroAccion);
                } else {
                    this.zoomVista(5, centroAccion);
                }
                return;
            }

            //Pan vista:
            scrollX = e.deltaX;
            scrollY = e.deltaY;
            if (e.shiftKey) {
                let temp = scrollY;
                scrollY = scrollX;
                scrollX = temp;
            }
            this.panVista(scrollX, scrollY);

        },
        panVista(deltaX, deltaY) {
            this.centroVista.y += deltaY;
            this.centroVista.x += deltaX;

        },
        hideZoomInfo: debounce(function () {
            this.showingZoomInfo = false;
        }, 1000),
    },
    watch: {
        centroVista: {
            handler: function () {
                let radioPermitidoX = this.radioDescargaX * (100 - this.porcentajeTriggerDescarga) / 100;
                let radioPermitidoY = this.radioDescargaY * (100 - this.porcentajeTriggerDescarga) / 100;

                if (this.centroVista.x > this.centroDescarga.x + radioPermitidoX || this.centroVista.x < this.centroDescarga.x - radioPermitidoX || this.centroVista.y < this.centroDescarga.y - radioPermitidoY || this.centroVista.y > this.centroDescarga.y + radioPermitidoY) {
                    //Refresh de descarga.
                    console.log("refrescando la zona de descarga");
                    this.centroDescarga.x = this.centroVista.x;
                    this.centroDescarga.y = this.centroVista.y;
                }
            },
            deep: true,
        },
        coleccionSeleccionada(col) {
        },
        nodoTarget() {
            this.nivelesUnderTarget = 1;
        },
        zoom() {
            this.showingZoomInfo = true;
            this.hideZoomInfo();

            this.setRadiosDescarga();
        },
        idsNodosTop: {
            handler: function (ids) {
                this.$emit("settedIdsNodosTop", ids);
            },
            immediate: true,
        },
    },
    mounted() {
        if (screen.width < 600) {
            this.zoom = 40;
        }
        this.setRadiosDescarga();
        this.montado = true;
    },
};
</script>
<style scoped>
.mapaAtlas {
    position: relative;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: scroll;
    overscroll-behavior: contain;
}

#contenedorElementosDiagrama {
    z-index: 0;
    position: relative;
    top: 0px;
    left: 0px;
    overflow: hidden;
    width: 100%;
    height: 100.1%;
    pointer-events: none;
}

#loadingNodosZona {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#contenedorNodos {
    position: absolute;
    top: 50%;
    left: 50%;
    user-select: none;
    z-index: 0;
    transform-origin: top left;
    width: 0px;
    height: 0px;
}

.nodoConocimientoAtlas {
    pointer-events: all;
}

#infoZoom {
    position: absolute;
    bottom: 2%;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px;
    display: inline-block;
    font-weight: bold;
    z-index: 10;
    color: rgb(102, 102, 102);
}

#menuContextual {
    position: absolute;
    background-color: gray;
    z-index: 2;
    pointer-events: all;
}

.botonMenuContextual {
    font-size: 12px;
    color: rgb(221, 221, 221);
    cursor: pointer;
    padding: 10px;
}

.botonMenuContextual:hover {
    background-color: rgb(68, 68, 68);
}
</style>
