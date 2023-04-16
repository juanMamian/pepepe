<template>
  <div
    class="mapaAtlas"
    @touchmove="touchMoveDiagrama"
    @touchstart="touchStartDiagrama"
    @contextmenu.self.exact.stop.prevent="abrirMenuContextual"
    @mouseenter="hovered = true"
    @mouseleave="hovered = true"
  >
    <div
      id="contenedorElementosDiagrama"
      ref="contenedorElementosDiagrama"
      @scroll="setCentroZonaNodosVisibles(true)"
    >
      <transition name="fadeOut">
        <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
      </transition>
      <div
        id="menuContextual"
        :style="[offsetMenuContextual]"
        v-show="mostrandoMenuContextual"
      >
        <div
          class="botonMenuContextual"
          id="botonCrearNuevoNodo"
          :class="{ deshabilitado: posicionCreandoNodo }"
          v-if="usuarioProfe"
          @click="crearNodoEnMenuContextual"
        >
          Crear Nodo de conocimiento
        </div>
      </div>
      <div
        id="contenedorNodos"
        @contextmenu.self.exact.prevent="abrirMenuContextual"
        ref="contenedorNodos"
        :style="[
          { transform: 'scale(' + factorZoom + ')' },
          sizeContenedorNodos,
        ]"
      >
        <loading
          texto=""
          v-if="posicionCreandoNodo"
          style="position: absolute"
          :style="[
            {
              top: posicionCreandoNodo.y - esquinasDiagrama.y1 + 'px',
              left: posicionCreandoNodo.x - esquinasDiagrama.x1 + 'px',
            },
          ]"
        />

        <nodo-conocimiento-atlas
          v-for="(nodo, index) in nodosVisibles"
          :key="nodo.id"
          :idNodo="nodo.id"
          :seleccionado="idNodoSeleccionado === nodo.id"
          :yo="yo"
          :idsNodosAprendidos="idsNodosActivosAprendidos"
          :idsNodosOlvidados="idsNodosActivosOlvidados"
          :idsNodosEstudiados="idsNodosActivosEstudiados"
          :idsNodosAccesibles="idsNodosActivosAccesibles"
          :idsUnderTargetActivos="idsUnderTargetActivos"
          :class="{
            esperandoClick: conectandoNodosColeccion,
            conectadoSeleccionado:
              nodoTarget &&
              idsUnderTarget[nivelesUnderTarget] &&
              idsUnderTarget[nivelesUnderTarget].includes(nodo.id),
            activoSeleccion:
              conectandoNodosColeccion &&
              coleccionSeleccionada?.idsNodos.includes(nodo.id),
            activoSubseleccion:
              conectandoNodosColeccion &&
              coleccionSeleccionada?.idsRed.includes(nodo.id),
          }"
          :idNodoTarget="idNodoTarget"
          :style="[
            {
              top: nodo.coords.y - esquinasDiagrama.y1 + 'px',
              left: nodo.coords.x - esquinasDiagrama.x1 + 'px',
            },
          ]"
          @dblclick="
            $router.push({
              name: 'visorNodoConocimiento',
              params: { idNodo: nodo.id },
            })
          "
          @click.stop="clickNodo(nodo)"
        >
          <template
            #imagenBolita
            v-if="
              conectandoNodosColeccion &&
              coleccionSeleccionada?.idsNodos.includes(nodo.id)
            "
          >
            <img
              src="@/assets/iconos/plugSolid.svg"
              style="transform: scale(0.7); filter: invert(1)"
              alt="Conectado"
            />
          </template>
        </nodo-conocimiento-atlas>
      </div>
      <div
        id="indicadorCentroNodosVisibles"
        :style="[estiloIndicadorCentroZonasVisibles]"
        v-if="false && usuarioSuperadministrador"
      >
        {{ centroZonaNodosVisibles.x + " " + centroZonaNodosVisibles.y }}
        {{ nodosVisibles.length }}
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
} from "./fragsAtlasConocimiento";
import {
  QUERY_NODOS,
  QUERY_DATOS_USUARIO_NODOS,
  QUERY_NODO_CONOCIMIENTO_ATLAS,
} from "./fragsAtlasConocimiento";
import NodoConocimientoAtlas from "./NodoConocimientoAtlas.vue";
import GestorColecciones from "./GestorColecciones.vue";

var idTimeoutNodosVisibles = null;
var apuntadorChunkNodosVisibles = 0;
export default {
  name: "MapaAtlas",
  props: {
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
  },
  components: {
    BuscadorNodosConocimiento,
    Loading,
    NodoConocimientoAtlas,
    GestorColecciones,
  },
  apollo: {
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
      nodosVisibles: [],
      idsNodosAlreadyRendered: [],
      apuntadorDeFrontera: 0,
      centroZonaNodosVisibles: {
        x: 218,
        y: 39,
      },
      factorZonaVisible: 1,
      paddingRefreshZonaVisible: 0.5,
      anchoScreen: 0,
      altoScreen: 0,

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
    offsetMenuContextual() {
      return {
        left: this.posMenuContextual.x + "px",
        top: this.posMenuContextual.y + "px",
      };
    },
    idsNodosTop() {
      if (!this.coleccionSeleccionada) {
        return [];
      }
      return this.coleccionSeleccionada.idsNodos;
    },
    nodoTargetRelevante() {
      if (!this.idNodoTarget) {
        return false;
      }

      if (!this.coleccionSeleccionada) {
        return true;
      }
      return this.coleccionSeleccionada.idsRed.includes(this.idNodoTarget);
    },
    idNodoTarget() {
      return this.yo?.atlas?.idNodoTarget;
    },
    idsUnderTarget() {
      // Array de arrays. Cada array es los ids de un nivel de nodos under target.
      if (!this.nodoTarget) {
        return [];
      }

      let nodosActuales = [this.nodoTarget];
      let nivelCero = [this.nodoTarget.id];
      let todosIds = [nivelCero];
      for (let i = 1; i <= this.nivelesUnderTarget + 1; i++) {
        //Se calcula un nivel extra para saber en todo momento si se puede ampliar el rango de nodos under Target.
        let siguientesIds = nodosActuales
          .map((n) =>
            n.vinculos
              .filter((v) => v.tipo === "continuacion" && v.rol === "target")
              .map((v) => v.idRef)
          )
          .flat();
        let nuevosIds = siguientesIds.filter((id) => !todosIds.includes(id));
        todosIds.push(nuevosIds);
        nodosActuales = this.todosNodos.filter((n) => nuevosIds.includes(n.id));
      }
      return todosIds;
    },
    idsUnderTargetActivos() {
      return this.idsUnderTarget.slice(0, this.nivelesUnderTarget + 1).flat();
    },
    domAndNodosReady() {
      return this.montado && this.firstLoad;
    },
    estiloIndicadorCentroZonasVisibles() {
      return {
        left:
          (this.centroZonaNodosVisibles.x - this.esquinasDiagrama.x1) *
            this.factorZoom +
          "px",
        top:
          (this.centroZonaNodosVisibles.y - this.esquinasDiagrama.y1) *
            this.factorZoom +
          "px",
      };
    },
    sizeZonaVisible() {
      //Un cinturón alrededor del centro que marca una región de nodos visibles. x y Y marcan el ancho del cinturón. No de la zona.
      return {
        x: (this.anchoScreen / this.factorZoom) * this.factorZonaVisible,
        y: (this.altoScreen / this.factorZoom) * this.factorZonaVisible,
      };
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

    idsTodosNodos() {
      if (!this.todosNodos) {
        return [];
      }
      return this.todosNodos.map((n) => n.id);
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
    idsTodosNodosOlvidados() {
      if (!this.yo?.atlas?.datosNodos) {
        return [];
      }
      return this.yo.atlas.datosNodos
        .filter((dn) => dn.estadoAprendizaje === "OLVIDADO")
        .map((dn) => dn.idNodo);
    },
    idsTodosNodosAccesibles() {
      return this.todosNodos
        .filter(
          (n) =>
            !n.vinculos.some(
              (v) =>
                v.tipo === "continuacion" &&
                v.rol === "target" &&
                !this.idsTodosNodosAprendidos.includes(v.idRef) &&
                !this.idsTodosNodosEstudiados.includes(v.idRef)
            )
        )
        .map((nA) => nA.id);
    },

    nodosActivos() {
      if (this.$route.name != "atlas") {
        return [];
      }
      if (!this.todosNodos) {
        return [];
      }
      let campo = this.todosNodos;

      if (this.coleccionSeleccionada && !this.conectandoNodosColeccion) {
        campo = campo.filter((n) =>
          this.coleccionSeleccionada.idsRed.includes(n.id)
        );
      }
      return campo;
    },

    idsNodosActivos() {
      return this.nodosActivos.map((na) => na.id);
    },
    idsNodosActivosEstudiados() {
      return this.idsNodosActivos.filter((idN) =>
        this.idsTodosNodosEstudiados.includes(idN)
      );
    },
    idsNodosActivosAprendidos() {
      return this.idsNodosActivos.filter((idN) =>
        this.idsTodosNodosAprendidos.includes(idN)
      );
    },
    idsNodosActivosOlvidados() {
      return this.idsNodosActivos.filter((idN) =>
        this.idsTodosNodosOlvidados.includes(idN)
      );
    },
    idsNodosActivosAccesibles() {
      return this.idsTodosNodosAccesibles.filter((idN) =>
        this.idsNodosActivos.includes(idN)
      );
    },
    idsNodosActivosAccesiblesInexplorados() {
      return this.idsNodosActivosAccesibles.filter(
        (id) =>
          !this.idsNodosActivosAprendidos.includes(id) &&
          !this.idsNodosActivosEstudiados.includes(id) &&
          !this.idsNodosActivosOlvidados.includes(id)
      );
    },

    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    sizeContenedorNodos() {
      return {
        width: this.esquinasDiagrama.x2 - this.esquinasDiagrama.x1 + "px",
        height: this.esquinasDiagrama.y2 - this.esquinasDiagrama.y1 + "px",
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
      let indexN = this.nodosVisibles.findIndex((n) => n.id === idNodo);
      if (indexN > -1) {
        this.nodosVisibles.splice(indexN, 1);
      }
    },
    idsRedUnderNodo(nodo) {
      let guarda = 0;
      let idsNodosActuales = [nodo.id];
      let idsCompletos = [...idsNodosActuales];
      while (guarda < 100 && idsNodosActuales.length > 0) {
        guarda++;
        let nodosActuales = this.todosNodos.filter((nodo) =>
          idsNodosActuales.includes(nodo.id)
        );
        let idsSiguientes = nodosActuales
          .map((nodo) =>
            nodo.vinculos
              .filter((v) => v.tipo === "continuacion" && v.rol == "target")
              .map((vinculo) => vinculo.idRef)
          )
          .flat();
        idsNodosActuales = idsSiguientes;
        idsCompletos.push(...idsSiguientes);
      }
      return idsCompletos;
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

        let posContenedor =
          this.$refs.contenedorElementosDiagrama.getBoundingClientRect();
        let zoomPosPx = {
          x: center.x - posContenedor.left,
          y: center.y - posContenedor.top,
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

        //set to 1 if postive, -1 if negative
        if (zoomChange != 0) {
          zoomChange = zoomChange / Math.abs(zoomChange);

          throttle(this.zoomVista(zoomChange, zoomPosPx), 1000);
        }

        this.lastPinchingDistance = distance;
      }
    },
    clickNodo(nodo) {
      this.$emit("seleccionNodo", nodo.id);
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
      let contenedor = this.$refs.contenedorElementosDiagrama;
      let posDiagrama = contenedor.getBoundingClientRect();

      let topClick = Math.round(
        e.pageY + contenedor.scrollTop - posDiagrama.top
      );
      let leftClick = Math.round(
        e.pageX + contenedor.scrollLeft - posDiagrama.left
      );

      this.posMenuContextual = {
        x: leftClick,
        y: topClick,
      };
      this.mostrandoMenuContextual = true;
      //this.crearNodo({x: leftClick, y: topClick});
    },
    crearNodoEnMenuContextual() {
      let contenedor = this.$refs.contenedorElementosDiagrama;

      var posicionNuevoNodo = {
        x: parseInt(
          this.posMenuContextual.x / this.factorZoom + this.esquinasDiagrama.x1
        ),
        y: parseInt(
          this.posMenuContextual.y / this.factorZoom + this.esquinasDiagrama.y1
        ),
      };

      console.log(`Creando nuevo nodo en ${JSON.stringify(posicionNuevoNodo)}`);

      this.crearNodo(posicionNuevoNodo);
    },

    centrarEnNodo(n) {
      const posDiagrama =
        this.$refs.contenedorElementosDiagrama.getBoundingClientRect();
      const posNodo = {
        x: (n.autoCoords.x - this.esquinasDiagrama.x1) * this.factorZoom,
        y: (n.autoCoords.y - this.esquinasDiagrama.y1) * this.factorZoom,
      };

      const posIdealScroll = {
        x: parseInt(posNodo.x - posDiagrama.width / 2),
        y: parseInt(posNodo.y - posDiagrama.height / 2),
      };

      this.$refs.contenedorElementosDiagrama.scrollLeft = posIdealScroll.x;
      this.$refs.contenedorElementosDiagrama.scrollTop = posIdealScroll.y;

      this.seleccionNodo(n);
    },
    centrarEnNodoById(idNodo) {
      if (!idNodo) {
        return;
      }
      console.log(`Centrando en nodo con id ${idNodo}`);
      var elNodo = this.todosNodos.find((n) => n.id === idNodo);
      if (elNodo) {
        this.centrarEnNodo(elNodo);
        return;
      }
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
            query: QUERY_NODOS,
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var losNodos = nuevoCache.todosNodos;

          const indexN = losNodos.findIndex((n) => n.id === crearNodo.id);
          if (indexN > -1) {
            console.log(`El nodo ya estaba en caché`);
          } else {
            losNodos.push(crearNodo);
            store.writeQuery({
              query: QUERY_NODOS,
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
    seleccionNodo(nodo) {
      this.$emit("seleccionNodo", nodo.id);
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
    zoomVista(cantidad, posicionPx) {
      let contenedor = this.$refs.contenedorElementosDiagrama;

      let posicionTotalPx = {
        x: posicionPx.x + this.$refs.contenedorElementosDiagrama.scrollLeft,
        y: posicionPx.y + this.$refs.contenedorElementosDiagrama.scrollTop,
      };

      let step = 8 * cantidad;
      let nuevoZoom = this.zoom + step;
      if (nuevoZoom < this.minZoom) {
        nuevoZoom = this.minZoom;
      } else if (nuevoZoom > this.maxZoom) {
        nuevoZoom = this.maxZoom;
      }
      let cambioZoom = nuevoZoom / this.zoom;
      this.zoom = nuevoZoom;

      let posicionTotalPxPrima = {
        x: posicionTotalPx.x * cambioZoom,
        y: posicionTotalPx.y * cambioZoom,
      };

      let nuevoScrollLeft = posicionTotalPxPrima.x - posicionPx.x;
      let nuevoScrollTop = posicionTotalPxPrima.y - posicionPx.y;

      this.$nextTick(() => {
        contenedor.scrollLeft = Math.round(nuevoScrollLeft);
        contenedor.scrollTop = Math.round(nuevoScrollTop);
        this.setCentroZonaNodosVisibles();
      });
      this.showingZoomInfo = true;
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();

      var contenedor = this.$refs.contenedorElementosDiagrama;
      let posContenedor = contenedor.getBoundingClientRect();

      let posMousePx = {
        x: e.clientX - posContenedor.left,
        y: e.clientY - posContenedor.top,
      };

      //Check wheel direction
      if (e.deltaY > 0) {
        this.zoomVista(-1, posMousePx);
      } else {
        this.zoomVista(1, posMousePx);
      }

      // const factorZoom = 0.05;
      // this.zoomVista(-Math.round(e.deltaY * factorZoom), posMousePx);
    },
    hideZoomInfo: debounce(function () {
      this.showingZoomInfo = false;
    }, 1000),
    setCentroZonaNodosVisibles: throttle(function (padded) {
      let nuevoCentroX = Math.round(
        this.esquinasDiagrama.x1 +
          this.$refs.contenedorElementosDiagrama.scrollLeft / this.factorZoom +
          this.$refs.contenedorElementosDiagrama.clientWidth /
            (2 * this.factorZoom)
      );
      let nuevoCentroY = Math.round(
        this.esquinasDiagrama.y1 +
          this.$refs.contenedorElementosDiagrama.scrollTop / this.factorZoom +
          this.$refs.contenedorElementosDiagrama.clientHeight /
            (2 * this.factorZoom)
      );

      // Padded indica que se respetará un padding respecto del último centro. Si !padded entonces se hace un nuevo set de centro no matter what.
      if (
        padded &&
        Math.abs(nuevoCentroX - this.centroZonaNodosVisibles.x) <
          (1 - this.paddingRefreshZonaVisible) * this.sizeZonaVisible.x &&
        Math.abs(nuevoCentroY - this.centroZonaNodosVisibles.y) <
          (1 - this.paddingRefreshZonaVisible) * this.sizeZonaVisible.y
      ) {
        return;
      }

      this.centroZonaNodosVisibles = {
        x: nuevoCentroX,
        y: nuevoCentroY,
      };
    }, 1000),
    iniciarCalculoNodosVisibles: debounce(function () {
      // Sacando del array de nodos visibles a todos los que no están en el rango.
      this.idsNodosAlreadyRendered = [];
      for (let i = this.nodosVisibles.length - 1; i >= 0; i--) {
        let elNodo = this.nodosVisibles[i];
        if (
          !this.nodoEnRangoVista(elNodo) ||
          !this.idsNodosActivos.includes(elNodo.id)
        ) {
          this.nodosVisibles.splice(i, 1);
        } else {
          this.idsNodosAlreadyRendered.push(elNodo.id);
        }
      }
      clearTimeout(idTimeoutNodosVisibles);
      apuntadorChunkNodosVisibles = 0;
      this.$nextTick(() => {
        this.introducirChunkNodosVisibles();
      });
    }, 700),
    introducirChunkNodosVisibles() {
      let chunkSize = 20;

      for (
        let i = apuntadorChunkNodosVisibles;
        i < apuntadorChunkNodosVisibles + chunkSize;
        i++
      ) {
        if (i >= this.nodosActivos.length) {
          break;
        }
        let esteNodo = this.nodosActivos[i];

        //Check if nodo already in nodosVisibles
        if (this.idsNodosAlreadyRendered.includes(esteNodo.id)) {
          continue;
        }

        if (this.nodoEnRangoVista(esteNodo)) {
          this.nodosVisibles.push(esteNodo);
          this.idsNodosVisibles.push(esteNodo.id);
        }
      }

      apuntadorChunkNodosVisibles += chunkSize;

      if (apuntadorChunkNodosVisibles < this.nodosActivos.length) {
        this.$nextTick(() => {
          idTimeoutNodosVisibles = setTimeout(() => {
            this.introducirChunkNodosVisibles();
          }, 100);
        });
      }
    },
  },
  watch: {
    "nodosActivos.length": function (val, oldVal) {
      if (val > 0) {
        this.firstLoad = true;
      }
      if (val != oldVal) {
        this.iniciarCalculoNodosVisibles();
      }
    },
    coleccionSeleccionada() {
      this.iniciarCalculoNodosVisibles();
    },
    domAndNodosReady() {
      let contenedor = this.$refs.contenedorElementosDiagrama;
      this.$nextTick(() => {
        contenedor.scrollLeft = contenedor.scrollWidth / 2;
        contenedor.scrollTop = contenedor.scrollHeight / 2;
        this.setCentroZonaNodosVisibles();
      });
    },
    nodoTarget() {
      this.nivelesUnderTarget = 1;
      this.iniciarCalculoNodosVisibles();
    },
    zoom() {
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    centroZonaNodosVisibles() {
      this.iniciarCalculoNodosVisibles();
    },
    idsNodosActivosAccesiblesInexplorados: {
      handler: function (ids) {
        this.$emit("settedIdsNodosActivosAccesiblesInexplorados", ids);
      },
      immediate: true,
    },
    idsNodosTop: {
      handler: function (ids) {
        this.$emit("settedIdsNodosTop", ids);
      },
      immediate: true,
    },
  },
  mounted() {
    this.anchoScreen = screen.width;
    this.altoScreen = screen.height;
    if (screen.width < 600) {
      this.zoom = 40;
    }
    this.montado = true;
  },
  created() {
    window.addEventListener("resize", function () {
      this.anchoScreen = screen.width;
      this.altoScreen = screen.height;
    });
  },
  destroyed() {
    window.removeEventListener("resize", function () {
      this.anchoScreen = screen.width;
      this.altoScreen = screen.height;
    });
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
}

#contenedorElementosDiagrama {
  z-index: 0;
  position: relative;
  overflow: scroll;
  width: 100%;
  height: 100%;
}

#contenedorNodos {
  position: absolute;
  top: 0px;
  left: 0px;
  transform-origin: left top;
  user-select: none;

  z-index: 0;
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
