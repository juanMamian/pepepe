<template>
  <div
    class="atlasConocimiento"
    @mousedown.left.exact.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="clickFuera"
  >
    <router-view
      :yo="yo"
      :datosNodosRepasar="datosNodosRepasar"
      :datosNodosUrgentes="datosNodosRepasar"
      @centrarEnNodo="centrarEnNodoById($event)"
    />
    <div
      id="zonaSeleccionColeccion"
      v-if="yo.atlas && yo.atlas.colecciones"
      v-show="!idNodoTarget"
    >
      <div
        id="nombreColeccion"
        :class="{ seleccionandoColeccion }"
        @click.stop="seleccionandoColeccion = !seleccionandoColeccion"
      >
        <pie-progreso
          v-if="coleccionSeleccionada && progresoColeccionSeleccionada"
          :progreso="progresoColeccionSeleccionada"
          :color-fondo="'transparent'"
          style="margin-right: 10px"
        >
          <img
            src="@/assets/iconos/atlas/userNodes.png"
            alt="Colección"
            id="iconoColeccionSeleccionada"
          />
        </pie-progreso>
        <span style="z-index: 1">
          {{ nombreColeccionSeleccionada }}
        </span>
      </div>

      <div
        class="boton"
        id="botonMostrarOpcionesColeccion"
        v-show="!seleccionandoColeccion"
        @click="mostrandoOpcionesColeccion = !mostrandoOpcionesColeccion"
      >
        <img
          src="@/assets/iconos/ellipsisVertical.svg"
          alt="Opciones"
          style=""
        />
      </div>

      <div
        id="contenedorControlesColeccion"
        v-show="mostrandoOpcionesColeccion"
      >
        <div class="boton controlColeccion" @click="localizarNext('available')">
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
          />
        </div>
        <div class="boton controlColeccion" @click="localizarNext('check')">
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
            style="filter: var(--filtroAtlasCheck)"
          />
        </div>
        <div
          class="boton controlColeccion"
          @click="localizarNext('repaso')"
          :class="{
            deshabilitado:
              !idsNodosRepasarPresentes ||
              idsNodosRepasarPresentes.length === 0,
          }"
        >
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
            style="filter: var(--filtroAtlasRepaso)"
          />
        </div>
      </div>

      <div id="listaSelectoresColeccion" v-show="seleccionandoColeccion">
        <div
          class="selectorColeccion"
          @click.stop="setIdColeccionSeleccionada(null)"
          v-show="idColeccionSeleccionada"
        >
          <img
            src="@/assets/iconos/userNodes.png"
            alt="Coleccion"
            style="height: 15px"
          />
          Atlas
        </div>
        <div
          class="selectorColeccion"
          @click.stop="setIdColeccionSeleccionada(coleccion.id)"
          v-for="coleccion of coleccionesUsuario.filter(
            (col) => idColeccionSeleccionada != col.id
          )"
          :key="coleccion.id"
        >
          <img
            src="@/assets/iconos/userNodes.png"
            alt="Coleccion"
            style="height: 15px"
          />
          {{ coleccion.nombre }}
        </div>
      </div>
    </div>

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

    <div id="zonaNodoTarget" v-show="idNodoTarget">
      <div
        id="nombreNodoTarget"
        v-if="nodoTarget"
        @click="centrarEnNodo(nodoTarget)"
      >
        <pie-progreso
          v-show="
            progresoNodoTarget != null &&
            !$apollo.queries.progresoNodoTarget.loading
          "
          :progreso="progresoNodoTarget"
          :size="40"
          :cifrasDecimales="0"
          :color-fondo="'transparent'"
        >
          <img
            style="height: 25px"
            src="@/assets/iconos/crosshairsSolid.svg"
            alt="Target"
            id="iconoNodoTarget"
          />
        </pie-progreso>

        {{ nodoTarget.nombre }}
      </div>

      <div
        class="boton"
        id="botonCancelarNodoTarget"
        @click.stop="setNodoTarget(null)"
      >
        <img src="@/assets/iconos/equis.svg" alt="Equis" />
      </div>
    </div>

    <div
      id="botonCallingPosiciones"
      v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
      @click.stop="iniciarCallingPosiciones"
      :class="{ deshabilitado: callingPosiciones }"
      :style="[
        { backgroundColor: callingPosiciones ? 'green' : 'transparent' },
      ]"
    ></div>
    <buscador-nodos-conocimiento
      @nodoSeleccionado="centrarEnNodo"
      ref="buscadorNodos"
    />

    <panel-conjuntos-nodos
      ref="panelConjuntosNodos"
      :yo="yo"
      :modoAtlas="modoAtlas"
      @centrarEnNodo="centrarEnNodo(todosNodos.find((n) => n.id == $event))"
    />

    <div
      id="contenedorDiagrama"
      ref="contenedorDiagrama"
      @scroll="setCentroZonaNodosVisibles(true)"
      @touchmove="touchMoveDiagrama"
      @touchstart="touchStartDiagrama"
    >
      <div id="contenedorElementosDiagrama">
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
            v-show="posicionCreandoNodo"
            style="position: absolute"
          />

          <div
            class="placeholderNodoConocimiento"
            @dblclick="
              $router.push({
                name: 'visorNodoConocimiento',
                params: { idNodo: nodo.id },
              })
            "
            @click.stop="clickNodo(nodo)"
            :style="[
              {
                top: nodo.coords.y - esquinasDiagrama.y1 + 'px',
                left: nodo.coords.x - esquinasDiagrama.x1 + 'px',
              },
            ]"
            v-for="nodo of nodosVisibles"
            :key="'placeholderNodo' + nodo.id"
            :class="{
              // fantasmeado:
              //   idNodoSeleccionado &&
              //   nivelesConexion &&
              //   !idsRedSeleccion.includes(nodo.id),
              seleccionado: idNodoSeleccionado === nodo.id,
              aprendido: idsNodosAprendidos.includes(nodo.id),
              estudiado: idsNodosEstudiados.includes(nodo.id),
              fresco: idsNodosFrescos.includes(nodo.id),
              aprendible:
                idsNodosEstudiables.includes(nodo.id) ||
                !nodo.vinculos.some(
                  (v) => v.tipo === 'continuacion' && v.rol === 'target'
                ),
              repasar: idsNodosRepasar.includes(nodo.id),
            }"
          >
            <div
              class="boton"
              id="botonRastrear"
              v-show="idNodoSeleccionado === nodo.id || idNodoTarget == nodo.id"
            >
              <img
                src="@/assets/iconos/crosshairsSolid.svg"
                alt="Rastrear"
                :style="[
                  {
                    filter:
                      idNodoTarget === nodo.id
                        ? 'var(--filtroAtlasSeleccion)'
                        : 'none',
                  },
                ]"
                @click.stop="
                  setNodoTarget(idNodoTarget === nodo.id ? null : nodo.id)
                "
              />
            </div>
            <div class="bolita">
              <img
                v-if="nodo.tipoNodo === 'concepto'"
                src="@/assets/iconos/atlas/lightbulbEmpty.svg"
                alt="Skill"
              />
              <img
                v-else
                src="@/assets/iconos/atlas/fireSolid.svg"
                alt="Skill"
              />
            </div>

            <div class="cajaTexto">
              {{ nodo.nombre }}

              <div
                class="boton"
                v-show="idNodoSeleccionado == nodo.id"
                id="botonAbrir"
              >
                <img
                  src="@/assets/iconos/expandSolid.svg"
                  alt="Abrir"
                  @click.stop="
                    $router.push({
                      name: 'visorNodoConocimiento',
                      params: { idNodo: nodo.id },
                    })
                  "
                />
              </div>
            </div>

            <div
              class="lineaVinculo"
              v-for="vinculo of nodo.vinculos.filter((v) => v.estilo)"
              :key="vinculo.id"
              :style="[vinculo.estilo]"
            >
              <div class="laLinea"></div>
            </div>
          </div>
        </div>
        <div
          id="indicadorCentroNodosVisibles"
          :style="[estiloIndicadorCentroZonasVisibles]"
        >
          {{ centroZonaNodosVisibles.x + " " + centroZonaNodosVisibles.y }}
        </div>
      </div>
    </div>
    <transition name="fadeOut">
      <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
    </transition>
    <div id="barraInferior" @click.stop="">
      <div
        class="boton"
        title="Mostrar colecciones"
        @click="$refs.panelConjuntosNodos.abierto = true"
      >
        <img src="@/assets/iconos/userNodes.png" alt="Nodos de usuario" />
      </div>

      <div
        class="boton"
        :title="
          'Cambiar a modo ' + modoAtlas === 'experto' ? 'estudiante' : 'experto'
        "
        :class="{ deshabilitado: enviandoQueryModo }"
        @click="setModo(modoAtlas === 'estudiante' ? 'experto' : 'estudiante')"
      >
        <img
          src="@/assets/iconos/teacher.svg"
          v-if="modoAtlas === 'experto'"
          alt="Experto"
        />
        <img
          src="@/assets/iconos/estudiante.png"
          v-if="modoAtlas === 'estudiante'"
          alt="Estudiante"
        />
      </div>

      <div
        class="boton"
        title="Mostrar temas para repasar"
        @click="$router.push({ name: 'ventanaRepasos' })"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            d="M256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512zM232 256C232 264 236 271.5 242.7 275.1L338.7 339.1C349.7 347.3 364.6 344.3 371.1 333.3C379.3 322.3 376.3 307.4 365.3 300L280 243.2V120C280 106.7 269.3 96 255.1 96C242.7 96 231.1 106.7 231.1 120L232 256z"
            :fill="
              datosNodosRepasar.length > 0
                ? 'var(--atlasConocimientoRepaso)'
                : ''
            "
          />
        </svg>
      </div>
    </div>

    <controles-nodo
      :yo="yo"
      ref="controlesNodo"
      style="z-index: 20"
      :elNodo="nodoSeleccionado"
      :nodoCreandoDependencia="nodoCreandoDependencia"
      @setMeTarget="
        setNodoTarget(nodoSeleccionado.id);
        centrarEnNodoById(nodoSeleccionado.id);
      "
      @nivelesConexion="nivelesConexion = $event"
      @click.stop=""
      @iniciarCrearDependenciaNodo="
        iniciarCrearDependenciaNodo(nodoSeleccionado)
      "
      @cancelarCreandoDependencia="nodoCreandoDependencia = null"
    />
  </div>
</template>

<script lang="js">
import gql from "graphql-tag";
import BuscadorNodosConocimiento from "./BuscadorNodosConocimiento.vue";
import Loading from "../utilidades/Loading.vue";
import PanelConjuntosNodos from "./PanelConjuntosNodos.vue";
import EnlacesNodoConocimiento from "./EnlacesNodoConocimiento.vue";
import PieProgreso from "../utilidades/PieProgreso.vue";
import debounce from "debounce";
import throttle from "lodash/throttle";
import ControlesNodo from "./controlesNodo.vue";
import {
  QUERY_DATOS_USUARIO_NODOS,
  QUERY_NODOS,
  fragmentoNodoConocimiento,
} from "./fragsAtlasConocimiento";

var idTimeoutNodosVisibles = null;
var apuntadorChunkNodosVisibles = 0;

export default {
  components: {
    BuscadorNodosConocimiento,
    Loading,
    PanelConjuntosNodos,
    EnlacesNodoConocimiento,
    PieProgreso,
    ControlesNodo,
  },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: {
      query: QUERY_NODOS,
      update({ todosNodos }) {
        this.nodosDescargados = true;
        var nuevoTodosNodos = JSON.parse(JSON.stringify(todosNodos));
        nuevoTodosNodos.forEach((nodo) => {
          nodo.coordsManuales = nodo.autoCoords;
          nodo.coords = nodo.autoCoords;


          nodo.vinculos = nodo.vinculos.map((vinculo) => {
            if (vinculo.rol === "source") {
              return {
                ...vinculo,
              };
            }

            let contraparte = nuevoTodosNodos.find(
              (nodo) => nodo.id === vinculo.idRef
            );
            if (!contraparte) {
              return {
                ...vinculo,
              };
            }

            let idNodoTo = vinculo.idRef;

            let nodoFrom = nodo;
            let nodoTo = nuevoTodosNodos.find((nodo) => nodo.id === idNodoTo);


            let posFrom = nodoFrom.autoCoords;
            let posTo = nodoTo.autoCoords;

            //Calc angle in radians
            let angle = Math.atan2(posTo.y - posFrom.y, posTo.x - posFrom.x);

            //Calc distance
            let distance = Math.sqrt(
              Math.pow(posTo.y - posFrom.y, 2) + Math.pow(posTo.x - posFrom.x, 2)
            );

            let diametroBolitas = 100;
            let largoLinea = distance;

            let estilo = {
              paddingLeft: Math.round(diametroBolitas / 2) + "px",
              paddingRight: Math.round(diametroBolitas / 2) + "px",
              width: Math.round(largoLinea) + "px",
              transform: "rotate(" + angle + "rad)",
            };

            return {
              ...vinculo,
              estilo,
            };
          });
        });

        const idLastNodoTarget = localStorage.getItem(
          "atlasConocimientoIdLastNodoTarget"
        );

        if (idLastNodoTarget) {
          const nodoLast = todosNodos.find((n) => n.id === idLastNodoTarget);
          if (nodoLast) {
            this.idNodoTarget = nodoLast.id;
          }
        }
        return nuevoTodosNodos;
      },
    },
    yo: {
      query: QUERY_DATOS_USUARIO_NODOS,
      skip() {
        return !this.usuarioLogeado || this.todosNodos.length < 1;
      },
      update({ yo }) {
        const idLastColeccionTarget = localStorage.getItem(
          "atlasConocimientoIdLastColeccionTarget"
        );

        if (idLastColeccionTarget && yo.atlas?.colecciones) {
          const coleccionLast = yo.atlas?.colecciones.find(
            (col) => col.id === idLastColeccionTarget
          );
          if (coleccionLast) {
            this.idColeccionSeleccionada = coleccionLast.id;
          }
        }
        return yo;
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
    progresoColeccionSeleccionada: {
      query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            progreso
          }
        }
      `,
      variables() {
        return {
          idColeccion: this.idColeccionSeleccionada,
          idUsuario: this.usuario.id,
        };
      },
      update({ coleccionNodosConocimiento }) {
        return coleccionNodosConocimiento.progreso;
      },
      skip() {
        return !this.idColeccionSeleccionada;
      },
    },
  },
  data() {
    return {
      montado: false,
      firstLoad: true,

      configuracionAtlas: {
        posicionando: false,
      },
      hovered: false,
      todosNodos: [],
      nodosDescargados: false,
      posicionCreandoNodo: null,
      idNodoSeleccionado: null,
      nivelesConexion: 0,
      factorEscalera: 0.2,
      idsNodosCadenaPreviaSeleccionado: [],
      idNodoMenuCx: null,
      idsNecesariosParaTarget: [],
      enviandoQueryModo: false,
      modoAtlas: "estudiante",
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
      apuntadorDeFrontera: 0,
      centroZonaNodosVisibles: {
        x: 218,
        y: 39,
      },
      factorZonaVisible:1,
      paddingRefreshZonaVisible: 0.5,
      anchoScreen: 0,
      altoScreen: 0,


      showingZoomInfo: false,
      zoom: 60,
      minZoom: 20,
      maxZoom: 70,
      pinching: false,
      lastPinchDistance: 0,
      panningVista: false,
      vistaPanned: false,

      actualizarVinculosGrises: 0,

      ultimoTouchX: 0,
      ultimoTouchY: 0,

      cerrarBusqueda: 0,

      callingPosiciones: false,

      mostrandoMenuContextual: false,
      offsetMenuContextual: {
        top: "0px",
        left: "0px",
      },
      enviandoQueryConfiguracionAtlas: false,

      idColeccionSeleccionada: null,
      seleccionandoColeccion: false,
      mostrandoOpcionesColeccion: false,

      indexLastLocateNextAvailable: 0,
      indexLastLocateNextCheck: 0,
      indexLastLocateNextRepaso: 0,

      idColeccionTargetOnLastLocalizacion: null,

      idNodoTarget: null,

      nodoCreandoDependencia: null,
      creandoDependencia:false,
      editandoVinculos: false,
    };
  },
  computed: {
    datosPlusDomReady(){
      return this.montado && this.todosNodos.length > 0 && this.yo.atlas?.datosNodos;
    },
    estiloIndicadorCentroZonasVisibles(){
      return {
        left: (this.centroZonaNodosVisibles.x - this.esquinasDiagrama.x1)*this.factorZoom + "px",
        top: (this.centroZonaNodosVisibles.y - this.esquinasDiagrama.y1)*this.factorZoom + "px",
      }
    },
    sizeZonaVisible(){
      //Un cinturón alrededor del centro que marca una región de nodos visibles. x y Y marcan el ancho del cinturón. No de la zona.
      return{
        x: (this.anchoScreen / this.factorZoom) * this.factorZonaVisible,
        y: (this.altoScreen / this.factorZoom) * this.factorZonaVisible,
      }
    },
    nombreColeccionSeleccionada() {
      if (!this.idColeccionSeleccionada) {
        return "Atlas";
      }

      return this.coleccionSeleccionada?.nombre || "Cargando";
    },
    coleccionSeleccionada() {
      if (!this.idColeccionSeleccionada) {
        return null;
      }
      return this.coleccionesUsuario.find(
        (col) => col.id === this.idColeccionSeleccionada
      );
    },
    coleccionesUsuario() {
      if (!this.yo?.atlas?.colecciones) {
        return [];
      }

      return this.yo.atlas.colecciones;
    },
    nodoSeleccionado: function () {
      if (!this.idNodoSeleccionado) {
        return null;
      }
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    nodoTarget() {
      if (!this.idNodoTarget) return null;
      return this.todosNodos.find((n) => n.id === this.idNodoTarget);
    },
    idsNodosEstudiables() {
      if (!this.yo?.atlas?.datosNodos) return [];

      let idsNodosAbrenCamino = [
        ...this.idsNodosFrescos,
        ...this.idsNodosAprendidos,
      ];
      let nodosAbrenCamino = this.nodosRender.filter((n) =>
        idsNodosAbrenCamino.includes(n.id)
      );

      let idsNodosAbiertos = nodosAbrenCamino
        .map((n) =>
          n.vinculos
            .filter((v) => v.rol === "source" && v.tipo === "continuacion")
            .map((v) => v.idRef)
        )
        .flat();

      return idsNodosAbiertos;
    },
    idsNodosAprendidos() {
      return this.yo.atlas.datosNodos
        .filter((n) => n.aprendido === true)
        .map((n) => n.idNodo);
    },
    datosNodosEstudiados() {
      return this.yo.atlas.datosNodos.filter(
        (n) => !n.aprendido && n.estudiado
      );
    },
    idsNodosEstudiados() {
      return this.datosNodosEstudiados.map((ne) => ne.idNodo);
    },
    datosNodosRepasar() {
      if (!this.yo || !this.yo.atlas || !this.yo.atlas.datosNodos) {
        return [];
      }

      var datosNodoConRepasoConfigurado = this.datosNodosEstudiados.filter(
        (dn) => dn.diasRepaso
      );

      let datosNodoParaRepasar = datosNodoConRepasoConfigurado.filter((dn) => {
        return (
          new Date(dn.estudiado).getTime() + dn.diasRepaso * 86400000 <
          Date.now()
        );
      });
      return datosNodoParaRepasar;
    },
    idsNodosRepasar() {
      return this.datosNodosRepasar.map((dn) => dn.idNodo);
    },
    idsNodosRepasarPresentes() {
      if (!this.idTarget) {
        return this.idsNodosRepasar;
      }

      return this.idsNodosRepasar.filter((id) =>
        this.idsNodosRender.includes(id)
      );
    },
    datosNodosFrescos() {
      return this.datosNodosEstudiados.filter(
        (dn) => !this.idsNodosRepasar.includes(dn.idNodo)
      );
    },
    idsNodosFrescos() {
      return this.datosNodosFrescos.map((nf) => nf.idNodo);
    },
    idsNodosPresentesCabeza() {
      return this.idsNodosFrescos
        .filter((idNe) => !this.idsNodosAprendidos.includes(idNe))
        .concat(this.idsNodosAprendidos);
    },
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    sizeContenedorNodos(){
      return {
        width: (this.esquinasDiagrama.x2 - this.esquinasDiagrama.x1) + 'px',
        height: (this.esquinasDiagrama.y2 - this.esquinasDiagrama.y1) + 'px',
      }
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
    nodosRender() {
      console.log("recalculando nodosRender con idColeccion: ", this.coleccionSeleccionada?.id);
      if (this.$route.name != "atlas") {
        return [];
      }
      if (this.idNodoTarget) {
        return this.todosNodos
          .filter((n) => this.idsNecesariosParaTarget.includes(n.id))
          .concat([this.todosNodos.find((n) => this.idNodoTarget === n.id)]);
      }

      if (this.coleccionSeleccionada) {
        let guarda = 0;
        let idsNodosActuales = this.coleccionSeleccionada.idsNodos;
        let todosNodosColeccion = [];
        let nodosActuales = [];

        while (guarda < 100 && idsNodosActuales.length > 0) {
          nodosActuales = this.todosNodos.filter((n) =>
            idsNodosActuales.includes(n.id)
          );
          todosNodosColeccion.push(...nodosActuales);
          let idsTodosNodosColeccion = todosNodosColeccion.map((n) => n.id);

          idsNodosActuales = [];
          for (const nodoActual of nodosActuales) {
            let idsVinculosRequeridos = nodoActual.vinculos
              .filter((v) => v.tipo === "continuacion" && v.rol === "target")
              .map((v) => v.idRef);
            let idsVinculosNuevos = idsVinculosRequeridos.filter(
              (idV) => !idsTodosNodosColeccion.includes(idV)
            );
            idsNodosActuales.push(...idsVinculosNuevos);
          }
        }
        return todosNodosColeccion;
      }

      return this.todosNodos;
    },
    idsNodosRender() {
      return this.nodosRender.map((n) => n.id);
    },
    idTarget() {
      return this.idNodoTarget || this.idColeccionSeleccionada;
    },
    idsNodosConectadosSeleccionadoLabelled() {
      if (!this.nodoSeleccionado) {
        return [];
      }

      let rolRelevante = "target";
      if (this.nivelesConexion > 0) {
        rolRelevante = "source";
      }

      //Array of arrays. Each level of conection is an array. We need the last array to know if there are more levels to explore
      let nodosActuales = [this.nodoSeleccionado];
      let listaIdsConectados = [[this.nodoSeleccionado.id]];
      for (let i = 0; i < Math.abs(this.nivelesConexion); i++) {
        let idsSiguientes = nodosActuales
          .map((n) =>
            n.vinculos
              .filter(
                (v) => v.tipo === "continuacion" && v.rol === rolRelevante
              )
              .map((v) => v.idRef)
          )
          .flat();
        nodosActuales = this.todosNodos.filter((n) =>
          idsSiguientes.includes(n.id)
        );
        listaIdsConectados.push(nodosActuales.map((n) => n.id));
      }

      return listaIdsConectados;
    },
    idsRedSeleccion() {
      if (!this.nodoSeleccionado) {
        return [];
      }

      return this.idsNodosConectadosSeleccionadoLabelled.flat();
    },
  },
  methods: {
    touchStartDiagrama(e){
      if(e.touches.length===2){
        e.stopPropagation();
        e.preventDefault();

        // get distance between fingers
        let distance=Math.sqrt(Math.pow(e.touches[0].clientX-e.touches[1].clientX,2)+Math.pow(e.touches[0].clientY-e.touches[1].clientY,2));

        this.lastPinchingDistance=distance;
      }
    },
    touchMoveDiagrama(e){
      if(e.touches.length===2){
        e.stopPropagation();
        e.preventDefault();
        let center={
          x:(e.touches[0].clientX+e.touches[1].clientX)/2,
          y:(e.touches[0].clientY+e.touches[1].clientY)/2
        }

        let posContenedor=this.$refs.contenedorDiagrama.getBoundingClientRect();
        let zoomPosPx={
          x:center.x-posContenedor.left,
          y:center.y-posContenedor.top
        }

        let distance=Math.sqrt(Math.pow(e.touches[0].clientX-e.touches[1].clientX,2)+Math.pow(e.touches[0].clientY-e.touches[1].clientY,2));

        if(!this.lastPinchingDistance){
          this.lastPinchingDistance=distance;
          return;
        }
        let zoomChange=distance - this.lastPinchingDistance;

        //set to 1 if postive, -1 if negative
        if(zoomChange!=0){
          zoomChange=zoomChange/Math.abs(zoomChange);

          throttle(this.zoomVista(zoomChange,zoomPosPx ),1000);
        }

        this.lastPinchingDistance=distance;


      }
    },
    clickNodo(nodo){
      if(this.nodoCreandoDependencia){
        if(nodo.id===this.nodoCreandoDependencia.id){
          return;
        }
        this.$refs.controlesNodo.crearDependenciaNodo(nodo);
        return;
      }


      this.idNodoSeleccionado=nodo.id;
    },
    iniciarCrearDependenciaNodo(nodo){
      this.nodoCreandoDependencia=nodo;
    },

    clickFuera() {
      this.seleccionNodo({});
      this.$refs.controlesNodo.clickFuera();
      this.$refs.buscadorNodos.cerrarBusqueda();
      this.$refs.panelConjuntosNodos.abierto=false;
    },
    localizarNext(tipo) {
      let nodosConsiderados = [...this.nodosRender];

      this.idColeccionTargetOnLastLocalizacion = this.idColeccionSeleccionada;
      if (tipo === "available") {
        let indexEncontrados = 0;
        let nextNodo = nodosConsiderados.find((n) => {
          if (this.idsNodosPresentesCabeza.includes(n.id)) {
            return false;
          }

          if (this.indexLastLocateNextAvailable === n.id) {
            return false;
          }

          let idsNodosRequeridos = n.vinculos
            .filter((v) => v.tipo === "continuacion" && v.rol === "target")
            .map((v) => v.idRef);

          let nodosRequeridos = nodosConsiderados.filter((n) =>
            idsNodosRequeridos.includes(n.id)
          );

          if (
            nodosRequeridos.some(
              (nodo) => !this.idsNodosPresentesCabeza.includes(nodo.id)
            )
          ) {
            return false;
          }

          indexEncontrados++;

          if (indexEncontrados <= this.indexLastLocateNextAvailable) {
            return false;
          }
          return true;
        });

        if (nextNodo) {
          this.centrarEnNodoById(nextNodo.id);
          this.indexLastLocateNextAvailable = indexEncontrados;
        } else {
          this.indexLastLocateNextAvailable = 0;
        }
      } else if (tipo === "check") {
        let indexEncontrados = 0;
        let nextNodo = nodosConsiderados.find((n) => {
          if (this.idsNodosPresentesCabeza.includes(n.id)) {

            indexEncontrados++;

            if (indexEncontrados <= this.indexLastLocateCheck) {
              return false;
            }
            return true;
          }
        });

        if (nextNodo) {
          this.centrarEnNodoById(nextNodo.id);
          this.indexLastLocateCheck = indexEncontrados;
        } else {
          this.indexLastLocateCheck = 0;
        }
      } else if (tipo === "repaso") {
        if (!this.idsNodosRepasarPresentes?.length > 0) {
          return;
        }
        this.indexLastLocateNextRepaso++;
        if (
          this.indexLastLocateNextRepaso >= this.idsNodosRepasarPresentes.length
        ) {
          this.indexLastLocateNextRepaso = 0;
        }

        this.centrarEnNodoById(
          this.idsNodosRepasarPresentes[this.indexLastLocateNextRepaso]
        );
      }
    },
    setIdColeccionSeleccionada(nuevoId) {
      this.indexLastLocateNextAvailable = 0;
      this.indexLastLocateNextCheck = 0;

      this.idColeccionSeleccionada = nuevoId;
    },
    iniciarCallingPosiciones() {
      var ciclos = prompt("¿Cuantos ciclos?");
      if (isNaN(ciclos)) {
        return;
      }

      ciclos = Math.round(ciclos);
      if (ciclos < 1) {
        return;
      }
      console.log(`Enviando reposicionamiento de ${ciclos} ciclos`);
      this.callingPosiciones = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($ciclos: Int!) {
              posicionarNodosConocimientoByFuerzas(ciclos: $ciclos)
            }
          `,
          variables: {
            ciclos,
          },
        })
        .then(() => {
          this.callingPosiciones = false;
        })
        .catch((error) => {
          this.callingPosiciones = false;
          console.log(`Error: ${error}`);
        });
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
    abrirMenuContextual(e) {
      let posDiagrama = this.$refs.contenedorDiagrama.getBoundingClientRect();

      let topClick = Math.round(e.pageY - posDiagrama.top);
      let leftClick = Math.round(e.pageX - posDiagrama.left);

      this.offsetMenuContextual.top = topClick + "px";
      this.offsetMenuContextual.left = leftClick + "px";

      this.mostrandoMenuContextual = true;
      //this.crearNodo({x: leftClick, y: topClick});
    },
    crearNodoEnMenuContextual() {
      const posContenedorNodos =
        this.$refs.contenedorNodos.getBoundingClientRect();
      const distanciaLeftPx =
        parseInt(this.offsetMenuContextual.left) -
        parseInt(posContenedorNodos.left);
      const distanciaTopPx =
        parseInt(this.offsetMenuContextual.top) -
        (parseInt(posContenedorNodos.top) - parseInt(this.$el.offsetTop));

      const posPxX = distanciaLeftPx;
      const posPxY = distanciaTopPx;

      console.log(`xPix: ${parseInt(this.offsetMenuContextual.left)}`);
      console.log(
        `posXContenedorNodos: ${parseInt(posContenedorNodos.left)}, ${posContenedorNodos.top
        }`
      );
      console.log(`distanciaLeftPx: ${distanciaLeftPx}`);
      console.log(`distanciaTopPx: ${distanciaTopPx}`);
      console.log(
        `Scroll x contenedorDiagrama: ${this.$refs.contenedorDiagrama.scrollLeft}`
      );

      var posicionNuevoNodo = {
        x: parseInt(posPxX / this.factorZoom + this.esquinasDiagrama.x1),
        y: parseInt(posPxY / this.factorZoom + this.esquinasDiagrama.y1),
      };

      console.log(`Creando nuevo nodo en ${JSON.stringify(posicionNuevoNodo)}`);

      this.crearNodo(posicionNuevoNodo);
    },
    encontrarNodosNecesariosDeNodo(idNodo, listaTotal) {
      const elNodo = this.todosNodos.find((n) => n.id == idNodo);
      if (!elNodo) {
        return listaTotal;
      }
      const necesarios = elNodo.vinculos
        .filter((v) => v.rol == "target")
        .map((v) => v.idRef);
      necesarios.forEach((necesario) => {
        if (!listaTotal.includes(necesario)) {
          listaTotal.push(necesario);
          listaTotal = this.encontrarNodosNecesariosDeNodo(
            necesario,
            listaTotal
          );
        }
      });
      return listaTotal;
    },
    setNodoTargetCache(idNodo) {
      console.log(`Seting en cache al nodo ${idNodo} como target`);
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      nuevoCache.yo.atlas.idNodoTarget = idNodo;
      store.writeQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
        data: nuevoCache,
      });
    },
    setModo(modo) {
      if (!this.usuarioLogeado) return;
      this.modoAtlas = modo;
    },
    setNodoTarget(idNodo) {
      this.idNodoTarget = idNodo;
    },

    centrarEnNodo(n) {
      const posDiagrama = this.$refs.contenedorDiagrama.getBoundingClientRect();
      const posNodo = {
        x: (n.autoCoords.x - this.esquinasDiagrama.x1) * this.factorZoom,
        y: (n.autoCoords.y - this.esquinasDiagrama.y1) * this.factorZoom,
      };

      const posIdealScroll = {
        x: parseInt(posNodo.x - posDiagrama.width / 2),
        y: parseInt(posNodo.y - posDiagrama.height / 2),
      };

      this.$refs.contenedorDiagrama.scrollLeft = posIdealScroll.x;
      this.$refs.contenedorDiagrama.scrollTop = posIdealScroll.y;

      this.seleccionNodo(n);
    },
    centrarEnNodoById(idNodo) {
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
    eliminarNodo(idNodo) {
      if (!this.usuarioSuperadministrador) {
        console.log(`No autorizado`);
        return;
      }
      if (!confirm("¿Seguro de que quieres eliminar este nodo?")) return;
      console.log(`enviando mutacion de eliminar nodo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              eliminarNodo(idNodo: $idNodo)
            }
          `,
          variables: {
            idNodo,
          },
          update(store, { data: { eliminarNodo } }) {
            if (!eliminarNodo) {
              console.log(`Nodo no fue eliminado`);
              return;
            }
            const cache = store.readQuery({
              query: QUERY_NODOS,
            });
            var nuevoCache = JSON.parse(JSON.stringify(cache));
            const indexN = nuevoCache.todosNodos.findIndex(
              (n) => n.id == idNodo
            );
            if (indexN > -1) {
              nuevoCache.todosNodos.splice(indexN, 1);
              store.writeQuery({
                query: QUERY_NODOS,
                data: nuevoCache,
              });
            } else {
              console.log(`El nodo no estaba presente`);
            }
          },
        })
        .then((data) => {
          console.log(`quitando el objeto del array. ${data}`);
        });
    },
    crearNodo(posicion) {
      if (!this.usuarioSuperadministrador) {
        console.log(`Error usuario no autorizado`);
        return;
      }
      console.log(`enviando una mutación de crear nodo`);

      let infoNodo = {
        coordsManuales: {
          x: posicion.x,
          y: posicion.y,
        },
        coords: {
          x: posicion.x,
          y: posicion.y,
        },
        autoCoords: {
          x: posicion.x,
          y: posicion.y,
        },
      };
      console.log(`en las coordenadas: ${posicion.x}, ${posicion.y} `);
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
          console.log(`1`);
          var losNodos = nuevoCache.todosNodos;
          console.log(`2`);

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
      this.idNodoSeleccionado = nodo.id;
    },
    async eliminarVinculo(idNodoFrom, idNodoTo) {
      if (!this.usuarioSuperadministrador) {
        console.log(`No autorizado`);
        return;
      }
      console.log(
        `eliminando un vinculo entre ${idNodoFrom} y ${idNodoTo} `
      );

      this.editandoVinculos=true;
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
      let contenedor = this.$refs.contenedorDiagrama;

      let posicionTotalPx = {
        x: posicionPx.x + this.$refs.contenedorDiagrama.scrollLeft,
        y: posicionPx.y + this.$refs.contenedorDiagrama.scrollTop,
      };

      let step = 20 * cantidad;
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
      });
      this.showingZoomInfo = true;
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();

      var contenedor = this.$refs.contenedorDiagrama;
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
    setCentroZonaNodosVisibles: throttle(function(padded){
      let nuevoCentroX=this.esquinasDiagrama.x1 + (this.$refs.contenedorDiagrama.scrollLeft / this.factorZoom) + (this.$refs.contenedorDiagrama.clientWidth/(2 * this.factorZoom));
      let nuevoCentroY=this.esquinasDiagrama.y1 + (this.$refs.contenedorDiagrama.scrollTop / this.factorZoom) + (this.$refs.contenedorDiagrama.clientHeight/(2 * this.factorZoom));


      if(padded && Math.abs(nuevoCentroX-this.centroZonaNodosVisibles.x)<(1 - this.paddingRefreshZonaVisible)*this.sizeZonaVisible.x && Math.abs(nuevoCentroY-this.centroZonaNodosVisibles.y)<(1 - this.paddingRefreshZonaVisible)*this.sizeZonaVisible.y){
        return;
      }

      this.centroZonaNodosVisibles = {
        x: nuevoCentroX,
        y: nuevoCentroY,
      }
    }, 1000),
    iniciarCalculoNodosVisibles(){
      clearTimeout(idTimeoutNodosVisibles);

      //Todos los nodos visibles actuales desaparecen
      apuntadorChunkNodosVisibles=0;
      this.$nextTick(()=>{
        this.apuntadorDeFrontera=this.nodosVisibles.length - 1; // Indica el ultimo nodo no confiable en el array de nodos visibles
        this.introducirChunkNodosVisibles()
      })
    },
    introducirChunkNodosVisibles(){
      let chunkSize=20;

      for(let i=apuntadorChunkNodosVisibles; i<apuntadorChunkNodosVisibles+chunkSize; i++){
        if(i>=this.todosNodos.length){
          break;
        }
        let posNodo = this.todosNodos[i].autoCoords;
        let limiteIzquierdo=this.centroZonaNodosVisibles.x - (this.factorZonaVisible * this.anchoScreen/this.factorZoom);
        let limiteDerecho=this.centroZonaNodosVisibles.x + (this.factorZonaVisible * this.anchoScreen/this.factorZoom);
        let limiteSuperior=this.centroZonaNodosVisibles.y - (this.factorZonaVisible * this.altoScreen/this.factorZoom);
        let limiteInferior=this.centroZonaNodosVisibles.y + (this.factorZonaVisible * this.altoScreen/this.factorZoom);

        if(posNodo.x>limiteIzquierdo && posNodo.x<limiteDerecho && posNodo.y>limiteSuperior && posNodo.y<limiteInferior){
          this.nodosVisibles.push(this.todosNodos[i]);
          this.idsNodosVisibles.push(this.todosNodos[i].id);
        }
      }

      apuntadorChunkNodosVisibles+=chunkSize;

      if(apuntadorChunkNodosVisibles<this.todosNodos.length){
        this.$nextTick(()=>{
          idTimeoutNodosVisibles=setTimeout(()=>{
              this.introducirChunkNodosVisibles();
          }, 100)
        })
      }
      else{
        // Fin de la introducción de nodos visibles. Ahora retirar los que no deberían ser visibles.
        this.$nextTick(()=>{
          this.nodosVisibles.splice(0, this.apuntadorDeFrontera + 1);
        })
      }
    },

  },
  watch: {
    idColeccionSeleccionada(idColeccion) {
      console.log(`idColeccionSeleccionada: ${idColeccion}`);
      this.seleccionandoColeccion = false;
      localStorage.setItem(
        "atlasConocimientoIdLastColeccionTarget",
        idColeccion
      );
      if (idColeccion) {
        console.log("Setting lastTarget");
      }
    },
    seleccionandoColeccion() {
      this.mostrandoOpcionesColeccion = false;
    },
    idNodoTarget(idNodoTarget) {
      localStorage.setItem("atlasConocimientoIdLastNodoTarget", idNodoTarget);

      if (!idNodoTarget) {
        this.idsNecesariosParaTarget = [];
        return;
      }
      this.idsNecesariosParaTarget = this.encontrarNodosNecesariosDeNodo(
        idNodoTarget,
        []
      );
    },
    zoom() {
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    centroZonaNodosVisibles(){

      this.iniciarCalculoNodosVisibles();
    },
    datosPlusDomReady:{
      handler: function(ready){
        if(ready){
          this.$refs.contenedorDiagrama.scrollLeft = this.$refs.contenedorDiagrama.scrollWidth/2 - this.$refs.contenedorDiagrama.clientWidth/2;
          this.$refs.contenedorDiagrama.scrollTop = this.$refs.contenedorDiagrama.scrollHeight/2 - this.$refs.contenedorDiagrama.clientHeight/2;
          this.$nextTick(()=>{
            this.setCentroZonaNodosVisibles();
          })
        }
      },
    }

  },
  mounted() {
    this.anchoScreen = screen.width;
    this.altoScreen = screen.height;
    if (screen.width < 600) {
      this.zoom = 40;
    }
    this.montado=true;
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
    // watch for resize
    window.addEventListener("resize", function(){
      this.anchoScreen = screen.width;
      this.altoScreen = screen.height;
    });

  },
  removed() {
    window.removeEventListener("wheel", this.zoomWheel);

    window.removeEventListener("resize", function(){
      this.anchoScreen = screen.width;
      this.altoScreen = screen.height;
    });
  },
};
</script>

<style scoped>
@import "./estilosGlobalesAtlasConocimiento.css";
@import "./estiloPlaceholderNodoConocimiento.css";
</style>

<style>
:root {
  --atlasConocimientoFondo: #f3eff5;
  --atlasConocimientoCheck: #3f7d20;
  --atlasConocimientoAvailable: #c087ed;
  --atlasConocimientoRepasar: #e2c044;
  --atlasConocimientoRepaso: #ff5f5f;
  --atlasConocimientoBaseNodo: #d9d9d9;
  --atlasConocimientoSeleccion: #ad58d8;
  --atlasConocimientoContinuacion: #3066be;

  --filtroAtlasSeleccion: invert(43%) sepia(84%) saturate(539%)
    hue-rotate(236deg) brightness(88%) contrast(92%);

  --filtroAtlasAvailable: invert(79%) sepia(70%) saturate(443%)
    hue-rotate(349deg) brightness(92%) contrast(91%);
  --filtroAtlasCheck: invert(34%) sepia(99%) saturate(407%) hue-rotate(56deg)
    brightness(95%) contrast(81%);

  --filtroAtlasRepaso: invert(76%) sepia(39%) saturate(654%) hue-rotate(4deg)
    brightness(95%) contrast(93%);
}
</style>
<style scoped>
.atlasConocimiento {
  position: relative;
  overflow-x: hidden;
}

#zonaNodoTarget {
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translate(-50%);
  display: flex;
  align-items: center;
  padding: 10px;
  max-width: min(400px, 50%);
  z-index: 50;
}

#botonCancelarNodoTarget {
  width: 25px;
  height: 25px;

  background-color: var(--mainColor);
  margin-left: 10px;
}

#iconoNodoTarget {
  width: 25px;
  height: 25px;
  background-color: rgb(230, 230, 230);
  border-radius: 50%;
  align-self: center;
  opacity: 1;
}

#iconoNodoTarget:hover {
  opacity: 0;
}

#nombreNodoTarget {
  background-color: var(--atlasConocimientoSeleccion);
  padding: 5px 10px;
  padding-right: 20px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
}

#zonaSeleccionColeccion {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

#iconoColeccionSeleccionada {
  width: 25px;
  height: 25px;
  background-color: rgb(230, 230, 230);
  border-radius: 50%;
  align-self: center;
  opacity: 1;
}

#iconoColeccionSeleccionada:hover {
  opacity: 0;
}

#nombreColeccion {
  padding: 10px 30px;
  background-color: var(--atlasConocimientoSeleccion);
  border-radius: 45px;
  cursor: pointer;
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

#nombreColeccion.seleccionandoColeccion {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

#listaSelectoresColeccion {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(200px, 90vw);
}

#botonMostrarOpcionesColeccion {
  position: absolute;
  top: 50%;
  left: calc(100% + 5px);
  transform: translateY(-50%);
}

#contenedorControlesColeccion {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  justify-content: center;
}

.controlColeccion {
  background-color: rgba(58, 58, 58, 0.445);
  box-shadow: 2px 2px 2px gray;
}

.selectorColeccion {
  padding: 15px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--mainColor);
  display: flex;
  gap: 10px;
  align-items: center;
}

#menuContextual {
  position: absolute;
  background-color: gray;
  z-index: 110;
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

#contenedorDiagrama {
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: scroll;
  z-index: 0;
}

#contenedorNodos {
  position: absolute;
  top: 0px;
  left: 0px;
  transform-origin: left top;
  user-select: none;

  z-index: 0;
}

#buscadorNodosConocimiento {
  position: absolute;
  top: 1%;
  right: 1%;
  /* transform: translateX(-50%); */
  z-index: 1;
  width: min(100vh, 350px);
}

#panelConjuntosNodos {
  z-index: 100;
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

#botonCallingPosiciones {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid black;
  position: absolute;
  top: 10%;
  right: 1%;
  cursor: pointer;
  z-index: 1;
}

#simboloDescargandoNodos {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
}

.visorNodoConocimiento {
  width: 100%;
  min-height: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1000;
  background-color: whitesmoke;
}

#barraInferior {
  position: absolute;
  bottom: 12px;
  padding: 10px;
  display: flex;
  flex-direction: row-reverse;
  right: 0px;
  box-sizing: border-box;
}

#barraInferior .boton {
  height: 30px;
  width: 30px;
  margin: 0px 5px;
  z-index: 0;
}

.fadeOut-leave-to {
  opacity: 0;
}

.fadeOut-leave-active {
  transition: opacity 1s;
}

.fadeOut-leave {
  opacity: 1;
}

/* Windowing */

#indicadorCentroNodosVisibles {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: red;
}
</style>
