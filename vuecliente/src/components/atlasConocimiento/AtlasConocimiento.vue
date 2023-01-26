<template>
  <div
    class="atlasConocimiento"
    :style="{ overflowY: nodoAbierto ? 'scroll' : 'hidden' }"
    @mousedown.left.exact.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="
      idNodoMenuCx = null;
      cerrarBusqueda++;
    "
  >
    <router-view
      :yo="yo"
      :datosNodosRepasar="datosNodosRepasar"
      :datosNodosUrgentes="datosNodosRepasar"
      @centrarEnNodo="centrarEnNodoById($event)"
    />
    <div id="zonaSeleccionColeccion">
      <div
        id="nombreColeccion"
        @click.stop="seleccionandoColeccion = !seleccionandoColeccion"
      >
        <span
          class="indicadorProgreso"
          v-if="coleccionSeleccionada && coleccionSeleccionada.progreso"
          >{{ coleccionSeleccionada.progreso }}%</span
        >
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
            style="filter: var(--filtroAtlasAvailable)"
          />
        </div>
        <div class="boton controlColeccion" @click="localizarNext('check')">
          <img
            src="@/assets/iconos/atlas/locationCrosshair.svg"
            alt="Localizar"
            style="filter: var(--filtroAtlasCheck)"
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
        v-if="usuarioAdministradorAtlas || usuarioProfe"
        @click="crearNodoEnMenuContextual"
      >
        Crear Nodo de conocimiento
      </div>
    </div>

    <div id="zonaNodoTarget">
      <div
        id="nombreNodoTarget"
        v-if="nodoTarget"
        @click="centrarEnNodo(nodoTarget)"
      >
        <img
          style="
            height: 25px;
            filter: var(--filtroBlanco);
            margin: 2px 5px;
            margin-right: 15px;
          "
          src="@/assets/iconos/target.png"
          alt="Target"
        />

        {{ nodoTarget.nombre }}
      </div>

      <div
        class="boton"
        v-show="yo.atlas.idNodoTarget && !enviandoQueryTarget"
        @click.stop="configurarNodoTarget(null)"
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
      :cerrarBusqueda="cerrarBusqueda"
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
      @contextmenu.self.exact.prevent="abrirMenuContextual"
      @mouseup.left.self="clickFondoAtlas"
    >
      <div id="contenedorVinculosNodos" :style="[offsetContenedorNodos]">
        <enlaces-nodo-conocimiento
          v-for="nodo of nodosConRequerimentos"
          :key="nodo.id"
          :yo="yo"
          :idNodoSeleccionado="idNodoSeleccionado"
          :esteNodo="nodo"
          :todosNodos="todosNodos"
          :factorZoom="factorZoom"
          :esquinasDiagrama="esquinasDiagrama"
          :nodoSeleccionado="nodoSeleccionado"
          :redibujarEnlaces="redibujarEnlacesNodos"
          :idsTodosNodosRender="idsTodosNodosRender"
          :callingPosiciones="callingPosiciones"
          :idsNodosPreviosSeleccionado="idsNodosPreviosSeleccionado"
          :idsNodosPresentesCabeza="idsNodosPresentesCabeza"
        />
      </div>
      <div
        id="contenedorNodos"
        ref="contenedorNodos"
        :style="[offsetContenedorNodos]"
      >
        <loading
          texto=""
          v-show="posicionCreandoNodo"
          style="position: absolute"
          :style="[offsetLoadingCreandoNodo]"
        />
        <nodo-conocimiento
          :nodoSeleccionado="nodoSeleccionado"
          :todosNodos="todosNodos"
          :idNodoMenuCx="idNodoMenuCx"
          :usuarioAdministradorAtlas="usuarioAdministradorAtlas"
          :yo="yo"
          :modoAtlas="modoAtlas"
          :key="nodo.id"
          v-for="nodo of nodosRender"
          :esteNodo="nodo"
          :esquinasDiagrama="esquinasDiagrama"
          :centroVista="centroVista"
          :esNodoObjetivo="idsNodosObjetivos.includes(nodo.id)"
          :esTarget="idNodoTarget == nodo.id"
          :idsNodosAprendidos="idsNodosAprendidos"
          :idsNodosEstudiados="idsNodosEstudiados"
          :idsNodosFrescos="idsNodosFrescos"
          :idsNodosPresentesCabeza="idsNodosPresentesCabeza"
          :factorZoom="factorZoom"
          :seleccionado="idNodoSeleccionado === nodo.id"
          :escondido="
            idNodoTarget &&
            !idsNecesariosParaTarget.includes(nodo.id) &&
            idNodoTarget != nodo.id
          "
          :configuracionAtlas="configuracionAtlas"
          :callingPosiciones="callingPosiciones"
          :datosUsuarioEsteNodo="
            yo.atlas.datosNodos.find((dn) => dn.idNodo === nodo.id) || {}
          "
          :fantasmeado="
            idNodoSeleccionado &&
            idNodoSeleccionado != nodo.id &&
            !idsNodosPreviosSeleccionado.includes(nodo.id)
          "
          :previoDeSeleccionado="
            idNodoSeleccionado && idsNodosPreviosSeleccionado.includes(nodo.id)
          "
          :enviandoQueryTarget="enviandoQueryTarget"
          @contextmenu.native.exact.stop.prevent="idNodoMenuCx = nodo.id"
          @abroMenuContextual="idNodoMenuCx = nodo.id"
          @click.native.stop="seleccionNodo(nodo)"
          @creacionVinculo="crearVinculo"
          @eliminacionVinculo="eliminarVinculo"
          @cambioDePosicionManual="cambiarCoordsManualesNodo"
          @eliminar="eliminarNodo"
          @cambieEstadoObjetivo="setEstadoObjetivoNodoCache($event, nodo.id)"
          @tengoNuevoValorAprendido="setNodoAprendidoCache($event, nodo.id)"
          @mePongoEnMira="configurarNodoTarget(nodo.id)"
        />
      </div>
    </div>

    <div id="barraInferior">
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

    <loading
      id="simboloDescargandoNodos"
      v-show="!nodosDescargados"
      texto="descargando nodos de conocimiento"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoConocimiento from "./NodoConocimiento.vue";
import BuscadorNodosConocimiento from "./BuscadorNodosConocimiento.vue";
import Loading from "../utilidades/Loading.vue";
import PanelConjuntosNodos from "./PanelConjuntosNodos.vue";
import EnlacesNodoConocimiento from "./EnlacesNodoConocimiento.vue";
import { fragmentoDatoNodoConocimiento } from "./fragsAtlasConocimiento";
const debounce = require("debounce");

const fragmentoNodoConocimiento = gql`
  fragment fragNodoConocimiento on NodoConocimiento {
    id
    nombre
    descripcion
    expertos
    tipoNodo
    clases {
      id
      nombre
      idExperto
      interesados
    }
    coordsManuales {
      x
      y
    }
    coords {
      x
      y
    }
    autoCoords {
      x
      y
    }
    centroMasa {
      x
      y
    }
    stuck
    angulo
    puntaje
    vinculos {
      id
      idRef
      rol
      tipo
    }
    fuerzaCentroMasa {
      fuerza
      direccion
    }
    fuerzaColision {
      fuerza
      direccion
    }
  }
`;

const QUERY_NODOS = gql`
  query todosNodos {
    todosNodos {
      ...fragNodoConocimiento
    }
  }
  ${fragmentoNodoConocimiento}
`;

export const QUERY_DATOS_USUARIO_NODOS = gql`
  query {
    yo {
      id
      atlas {
        datosNodos {
          ...fragDatoNodoConocimiento
        }
        configuracion {
          modo
        }
        idNodoTarget
        colecciones {
          id
          nombre
          idsNodos
          progreso
          nodos {
            id
            nombre
          }
        }
      }
    }
  }
  ${fragmentoDatoNodoConocimiento}
`;

export default {
  components: {
    NodoConocimiento,
    BuscadorNodosConocimiento,
    Loading,
    PanelConjuntosNodos,
    EnlacesNodoConocimiento,
  },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: {
      query: QUERY_NODOS,
      result: function () {
        this.dibujarVinculosGrises();
      },
      update({ todosNodos }) {
        this.nodosDescargados = true;
        var nuevoTodosNodos = JSON.parse(JSON.stringify(todosNodos));
        nuevoTodosNodos.forEach((nodo) => {
          nodo.coordsManuales = nodo.autoCoords;
          nodo.coords = nodo.autoCoords;
        });
        return nuevoTodosNodos;
      },
      fetchPolicy: "cacheFirst",
    },
    yo: {
      query: QUERY_DATOS_USUARIO_NODOS,
      skip() {
        return !this.usuarioLogeado || this.todosNodos.length < 1;
      },
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
  },
  data() {
    return {
      configuracionAtlas: {
        posicionando: false,
      },
      hovered: false,
      todosNodos: [],
      nodosDescargados: false,
      posicionCreandoNodo: null,
      idNodoSeleccionado: null,
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

      centroVistaDecimal: {
        x: 218,
        y: 39,
      },
      showingZoomInfo: false,
      zoom: 80,
      minZoom: 20,
      maxZoom: 200,
      pinching: false,
      lastPinchDistance: 0,
      actualizarTrazos: 0,
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
    };
  },
  computed: {
    nombreColeccionSeleccionada() {
      if (!this.idColeccionSeleccionada) {
        return "Atlas";
      }

      return this.coleccionSeleccionada.nombre;
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
    idsNodosObjetivos() {
      if (!this.yo || !this.yo.atlas || !this.yo.atlas.datosNodos) {
        return [];
      }
      return this.yo.atlas.datosNodos
        .filter((n) => n.objetivo == true)
        .map((n) => n.idNodo);
    },
    nodosObjetivo() {
      if (!this.todosNodos) return [];
      return this.todosNodos.filter((n) =>
        this.idsNodosObjetivos.includes(n.id)
      );
    },
    nodoSeleccionado: function () {
      if (!this.idNodoSeleccionado) {
        return null;
      }
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    idUsuario: function () {
      return this.$store.state.usuario.id;
    },
    usuarioAdministradorAtlas: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return this.$store.state.usuario.permisos.includes("atlasAdministrador")
        ? true
        : false;
    },
    idNodoTarget() {
      if (!this.yo || !this.yo.atlas) return null;
      return this.yo.atlas.idNodoTarget;
    },
    nodoTarget() {
      if (!this.idNodoTarget) return null;
      return this.todosNodos.find((n) => n.id === this.idNodoTarget);
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
        (dn) => dn.periodoRepaso
      );

      let dateHoy = new Date();

      let dateHoyMin = dateHoy;
      dateHoyMin.setHours(0);
      dateHoyMin.setMinutes(0);
      dateHoyMin.setSeconds(0);

      let datosNodoParaRepasar = datosNodoConRepasoConfigurado.filter(
        (dn) => dn.estudiado + dn.periodoRepaso > dateHoyMin.getTime()
      );
      console.log(
        `Hay ${datosNodoParaRepasar.length} nodos que se deben repasar hoy`
      );
      return datosNodoParaRepasar;
    },
    idsNodosRepasar(){
      return this.datosNodosRepasar.map(dn=>dn.id);
    },
    datosNodosFrescos() {
      return this.datosNodosEstudiados.filter((dn) => {
        !this.idsNodosRepasar.includes(dn);
      });
    },
    idsNodosFrescos() {
      return this.datosNodosFrescos.map((nf) => nf.idNodo);
    },
    idsNodosPresentesCabeza() {
      return this.idsNodosFrescos
        .filter((idNe) => !this.idsNodosAprendidos.includes(idNe))
        .concat(this.idsNodosAprendidos);
    },
    centroVista() {
      return {
        x: Math.round(this.centroVistaDecimal.x),
        y: Math.round(this.centroVistaDecimal.y),
      };
    },
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
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

      return {
        x1: minX,
        y1: minY,

        x2: maxX,
        y2: maxY,
      };
    },
    offsetContenedorNodos() {
      const ancho = this.esquinasDiagrama.x2 - this.esquinasDiagrama.x1;
      const alto = this.esquinasDiagrama.y2 - this.esquinasDiagrama.y1;
      return {
        // left: -(this.centroVista.x * this.factorZoom) + "px",
        // top: -(this.centroVista.y * this.factorZoom) + "px",

        width: ancho * this.factorZoom + "px",
        height: alto * this.factorZoom + "px",
      };
    },
    nodosConRequerimentos() {
      var nr = this.todosNodos.filter((n) => n.vinculos.length > 0);

      return nr;
    },
    nodosRender() {
      if (this.idNodoTarget) {
        return this.todosNodos
          .filter((n) => this.idsNecesariosParaTarget.includes(n.id))
          .concat([this.todosNodos.find((n) => this.idNodoTarget === n.id)]);
      } else if (this.coleccionSeleccionada) {
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
    idsTodosNodosRender() {
      return this.nodosRender.map((n) => n.id);
    },
    offsetLoadingCreandoNodo() {
      if (!this.posicionCreandoNodo) {
        return null;
      }
      const left =
        (this.posicionCreandoNodo.x - this.esquinasDiagrama.x1) *
        this.factorZoom;
      const top =
        (this.posicionCreandoNodo.y - this.esquinasDiagrama.y1) *
        this.factorZoom;
      return {
        left: left + "px",
        top: top + "px",
      };
    },
    nodoAbierto() {
      console.log("Verificando path name");
      console.log(this.$route.name);

      return this.$route.name === "visorNodoConocimiento";
    },
    nodosConectadosAlSeleccionado() {
      if (!this.nodoSeleccionado) return [];
      return this.todosNodos.filter((n) =>
        this.nodoSeleccionado.vinculos.some((v) => v.idRef === n.id)
      );
    },
    idsNodosPreviosSeleccionado() {
      if (!this.idNodoSeleccionado) {
        return [];
      }
      var idsActuales = [this.idNodoSeleccionado];
      var cadenaTotal = [];
      for (var i = 0; i < 20; i++) {
        let previos = this.nodosRender.filter((n) =>
          n.vinculos.some(
            (v) => v.rol === "source" && idsActuales.includes(v.idRef)
          )
        );

        if (previos.length < 1) {
          break;
        }

        let idsPrevios = previos.map((previo) => previo.id);

        cadenaTotal.push(...idsPrevios);

        idsActuales = idsPrevios;
      }

      return cadenaTotal;
    },
  },
  methods: {
    localizarNext(tipo) {
      let nodosConsiderados = [...this.nodosRender];
      console.log(
        `Localizando next en ${nodosConsiderados.length} nodos de coleccion`
      );
      if (tipo === "available") {
        let indexEncontrados = 0;
        let nextNodo = nodosConsiderados.find((n) => {
          if (this.idsNodosPresentesCabeza.includes(n.id)) {
            console.log("Estaba fresco");
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
      }
      if (tipo === "check") {
        let indexEncontrados = 0;
        let nextNodo = nodosConsiderados.find((n) => {
          if (this.idsNodosPresentesCabeza.includes(n.id)) {
            console.log("Estaba fresco");

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

      this.$set(this.offsetMenuContextual, "top", topClick + "px");
      this.$set(this.offsetMenuContextual, "left", leftClick + "px");
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
        `posXContenedorNodos: ${parseInt(posContenedorNodos.left)}, ${
          posContenedorNodos.top
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
    clickFondoAtlas() {
      // console.log(`Click en el fondo del atlas. Route name: ${this.$route.name}`);
      if (this.$route.name != "atlas") {
        this.$router.push({ name: "atlas" });
        return;
      }
      if (!this.vistaPanned) this.idNodoSeleccionado = null;
      this.panningVista = false;
      this.vistaPanned = false;
      this.$refs.panelConjuntosNodos.abierto = false;
      this.mostrandoMenuContextual = false;
    },
    setEstadoObjetivoNodoCache(nuevoEstado, idNodo) {
      console.log(
        `Seting en cache al nodo ${idNodo} con estado objetivo: ${nuevoEstado}`
      );
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));

      var indexN = nuevoCache.yo.atlas.datosNodos.findIndex(
        (n) => n.idNodo == idNodo
      );
      if (indexN > -1) {
        nuevoCache.yo.atlas.datosNodos[indexN].objetivo = nuevoEstado;
      } else {
        console.log(`No estaba en caché. Pushing`);
        nuevoCache.yo.atlas.datosNodos.push({
          __typename: "DatoNodoUsuario",
          idNodo,
          objetivo: nuevoEstado,
          aprendido: false,
        });
      }
      store.writeQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
        data: nuevoCache,
      });
    },
    setNodoAprendidoCache(nuevoEstado, idNodo) {
      console.log(
        `Seting en cache al nodo ${idNodo} con estado aprendido: ${nuevoEstado}`
      );
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      var indexN = nuevoCache.yo.atlas.datosNodos.findIndex(
        (n) => n.idNodo == idNodo
      );
      if (indexN > -1) {
        nuevoCache.yo.atlas.datosNodos[indexN].aprendido = nuevoEstado;
      } else {
        console.log(`No estaba en caché. Pushing`);
        nuevoCache.yo.atlas.datosNodos.push({
          __typename: "DatoNodoUsuario",
          idNodo,
          objetivo: false,
          aprendido: nuevoEstado,
        });
      }
      store.writeQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
        data: nuevoCache,
      });
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
      // this.enviandoQueryModo = true;

      // this.$apollo
      //   .mutate({
      //     mutation: gql`
      //       mutation ($idUsuario: ID!, $nuevoModo: String!) {
      //         setModoUsuarioAtlas(idUsuario: $idUsuario, nuevoModo: $nuevoModo){
      //             id
      //             atlas{
      //                 configuracion{
      //                     modo
      //                 }
      //             }
      //         }
      //       }
      //     `,
      //     variables: {
      //       idUsuario: this.usuario.id,
      //       nuevoModo: modo,
      //     },
      //   })
      //   .then(() => {
      //     this.enviandoQueryModo = false;

      //   })
      //   .catch((error) => {
      //     this.enviandoQueryModo = false;
      //     console.log(`Error: ${error}`);
      //   });
    },
    configurarNodoTarget(idNodo) {
      this.enviandoQueryTarget = true;

      console.log(`Configurando nodo target`);
      if (!idNodo || idNodo === this.idNodoTarget) {
        console.log(`Nulificando`);
        setTimeout(() => {
          this.nulificarNodoTarget();
        }, 100);
      } else {
        setTimeout(() => {
          this.setNodoTarget(idNodo);
        }, 100);
      }
    },
    setNodoTarget(idNodo) {
      if (!idNodo) return;
      if (this.idNodoTarget == idNodo) {
        return;
      }

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
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              setNodoAtlasTarget(idNodo: $idNodo)
            }
          `,
          variables: {
            idNodo,
          },
        })
        .then(() => {
          this.enviandoQueryTarget = false;
        })
        .catch((error) => {
          this.enviandoQueryTarget = false;
          console.log(`Error: ${error}`);
        });
    },
    nulificarNodoTarget() {
      console.log(`Nulificando nodo target`);
      this.enviandoQueryTarget = true;

      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
      });
      var nuevoCache = JSON.parse(JSON.stringify(cache));
      nuevoCache.yo.atlas.idNodoTarget = null;
      // nuevoCache.yo.atlas.centroVista = {x:100, y:100};
      store.writeQuery({
        query: QUERY_DATOS_USUARIO_NODOS,
        data: nuevoCache,
      });
      this.$apollo
        .mutate({
          mutation: gql`
            mutation {
              nulificarNodoTargetUsuarioAtlas
            }
          `,
        })
        .then(() => {
          this.enviandoQueryTarget = false;
        })
        .catch((error) => {
          this.enviandoQueryTarget = false;
          console.log(`Error: ${error}`);
        });
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
      //this.centroVista=e;
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
    iniciaMovimientoTouch(e) {
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
    finTouch() {
      this.pinching = false;
    },
    cambiarCoordsManualesNodo(idNodo, coordsManuales) {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
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
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
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
            console.log(`QUERY: ${JSON.stringify(QUERY_NODOS)}`);
            if (!eliminarNodo) {
              console.log(`Nodo no fue eliminado`);
              return;
            }
            const cache = store.readQuery({
              query: QUERY_NODOS,
            });
            console.log(`Cache QUERY_NODOS: ${JSON.stringify(cache)}`);
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
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
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
    descargarCentroVista() {
      let dis = this;
      this.$apollo
        .query({
          query: gql`
            query {
              yo {
                id
                atlas {
                  centroVista {
                    x
                    y
                  }
                }
              }
            }
          `,
          variables: {
            idUsuario: this.$store.state.usuario.id,
          },
          fetchPolicy: "network-only",
        })
        .then(function ({ data: { yo } }) {
          let coords = yo.atlas.centroVista;
          dis.$set(dis.centroVista, "x", coords.x);
          dis.$set(dis.centroVista, "y", coords.y);
          dis.$store.commit("setCentroVistaAtlas", coords);
        })
        .catch(function (error) {
          console.log(`error fetching centro vista: ${error}`);
        });
    },
    seleccionNodo(nodo) {
      this.idNodoSeleccionado = nodo.id;
    },
    async eliminarVinculo(args) {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      console.log(
        `eliminando un vinculo entre ${args.idNodoFrom} y ${args.idNodoTo} `
      );
      await this.$apollo
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
                    idRef
                    tipo
                    rol
                  }
                }
              }
            }
          `,
          variables: {
            idNodoFrom: args.idNodoFrom,
            idNodoTo: args.idNodoTo,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    dibujarVinculosGrises() {
      this.actualizarVinculosGrises++;
    },
    async crearVinculo(args) {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      console.log(`creando un vinculo ${JSON.stringify(args)} `);
      await this.$apollo
        .mutate({
          mutation: gql`
            mutation ($tipo: String!, $idNodoFrom: ID!, $idNodoTo: ID!) {
              crearVinculo(
                tipo: $tipo
                idSource: $idNodoFrom
                idTarget: $idNodoTo
              ) {
                modificados {
                  id
                  vinculos {
                    idRef
                    rol
                    tipo
                  }
                }
              }
            }
          `,
          variables: {
            tipo: "continuacion",
            idNodoFrom: args.idNodoFrom,
            idNodoTo: args.idNodoTo,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },

    zoomVista(deltaZoom) {
      var nuevoZoom = this.zoom + deltaZoom;
      if (nuevoZoom < this.minZoom) {
        this.zoom = this.minZoom;
      } else if (nuevoZoom > this.maxZoom) {
        this.zoom = this.maxZoom;
      } else {
        this.zoom = nuevoZoom;
      }

      //Pan vista de acuerdo con la posición del mouse respecto del atlas
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();

      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      const posZoom = {
        x:
          Math.round((e.clientX - posContenedor.left) / this.factorZoom) +
          this.centroVista.x,
        y:
          Math.round((e.clientY - posContenedor.top) / this.factorZoom) +
          this.centroVista.y,
      };

      // const proporciones = {
      //   x:
      //     (posZoom.x - this.centroVistaDecimal.x) /
      //     (posContenedor.width / this.factorZoom),
      //   y:
      //     (posZoom.y - this.centroVistaDecimal.y) /
      //     (posContenedor.height / this.factorZoom),
      // };

      const factorZoom = 0.2;
      this.zoomVista(-Math.round(e.deltaY * factorZoom), {
        x: posZoom.x,
        y: posZoom.y,
      });
    },
    hideZoomInfo: debounce(function () {
      this.showingZoomInfo = false;
    }, 1000),
  },
  watch: {
    idColeccionSeleccionada() {
      this.seleccionandoColeccion = false;
    },
    seleccionandoColeccion() {
      this.mostrandoOpcionesColeccion = false;
    },
    nodoSeleccionado: function () {
      this.actualizarTrazos++;
    },
    route: function (to) {
      console.log(`cambio de navegación a ${to.path}`);
    },
    idNodoTarget(idNodoTarget) {
      if (!idNodoTarget) {
        this.idsNecesariosParaTarget = [];
        return;
      }
      console.log(`iniciando busqueda de requeridos de nodo ${idNodoTarget}`);
      this.idsNecesariosParaTarget = this.encontrarNodosNecesariosDeNodo(
        idNodoTarget,
        []
      );
    },
    zoom() {
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    //
  },
  mounted() {
    // if (!this.usuario.atlas || !this.usuario.atlas.centroVista) {
    //   console.log(`No había info de centro vista en la store. Descargando`);
    //   this.descargarCentroVista();
    //   return;
    // }
    // this.$set(this.centroVistaDecimal, "x", this.usuario.atlas.centroVista.x);
    // this.$set(this.centroVistaDecimal, "y", this.usuario.atlas.centroVista.y);

    if (screen.width < 600) {
      this.zoom = 70;
    }
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
  },
  removed() {
    window.removeEventListener("wheel", this.zoomWheel);
  },
  // beforeRouteLeave(_, __, next) {
  //   console.log(
  //     `enviando nuevo centroVista para el usuario ${
  //       this.usuario.id
  //     }. Centro vista: ${JSON.stringify(this.centroVista)}`
  //   );
  //   this.$store.commit("setCentroVistaAtlas", this.centroVista);

  //   this.$apollo
  //     .mutate({
  //       mutation: gql`
  //         mutation($idUsuario: ID, $centroVista: CoordsInput) {
  //           setCentroVista(idUsuario: $idUsuario, centroVista: $centroVista)
  //         }
  //       `,
  //       variables: {
  //         idUsuario: this.$store.state.usuario.id,
  //         centroVista: this.centroVista,
  //       },
  //     })
  //     .then(function () {
  //       next();
  //     })
  //     .catch(function (error) {
  //       console.log(`error: ${error}`);
  //       next();
  //     });
  // },
};
</script>


<style>
@import "./estilosGlobalesAtlasConocimiento.css";
</style>

<style>
:root {
  --atlasConocimientoFondo: #f3eff5;
  --atlasConocimientoCheck: #3f7d20;
  --atlasConocimientoAvailable: #e2c044;
  --atlasConocimientoRepaso: #ff5f5f;
  --atlasConocimientoOff: #dbfcff;
  --atlasConocimientoSeleccion: #ad58d8;

  --filtroAtlasSeleccion: invert(43%) sepia(84%) saturate(539%)
    hue-rotate(236deg) brightness(88%) contrast(92%);

  --filtroAtlasAvailable: invert(79%) sepia(70%) saturate(443%)
    hue-rotate(349deg) brightness(92%) contrast(91%);
  --filtroAtlasCheck: invert(34%) sepia(99%) saturate(407%) hue-rotate(56deg)
    brightness(95%) contrast(81%);
}
</style>
<style scoped>
.atlasConocimiento {
  position: relative;
  overflow-x: hidden;
}
.ventanaRepasos {
  z-index: 100;
  position: absolute;
  top: 0px;
  left: 0%;
  background-color: rgb(255 252 249);
  box-shadow: 3px 4px 4px rgba(0, 0, 0, 0.25);
}
#zonaNodoTarget {
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  padding: 10px;
  z-index: 50;
}
#zonaNodoTarget .boton {
  width: 25px;
  height: 25px;
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

#nombreColeccion {
  padding: 10px 30px;
  background-color: var(--atlasConocimientoSeleccion);
  border-radius: 25px;
  cursor: pointer;
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
  background-color: rgb(58, 58, 58);
}
.selectorColeccion {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: var(--atlasConocimientoAvailable);
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
#contenedorVinculosNodos {
  position: absolute;
  top: 50px;
  left: 50px;
  user-select: none;

  pointer-events: none;
}
#contenedorNodos {
  position: absolute;
  top: 50px;
  left: 50px;
  user-select: none;

  pointer-events: none;
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

#panelObjetivos {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.2;
  z-index: 100;
}
#panelObjetivos:hover {
  opacity: 1;
}
#infoZoom {
  position: absolute;
  top: 2%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  display: inline-block;
  font-weight: bold;
  color: rgb(102, 102, 102);
}
#botonCallingPosiciones {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid black;
  position: absolute;
  top: 1%;
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
</style>