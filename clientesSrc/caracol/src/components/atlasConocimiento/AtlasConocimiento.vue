<template>
  <div
    class="atlasConocimiento"
    @mousedown.left.exact.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="clickFuera"
  >
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

    <RouterView />
    <gestor-colecciones
      :yo="yo"
      :todosNodos="todosNodos"
      @coleccionSeleccionada="coleccionSeleccionada = $event"
      @mostrandoArbol="gestorColeccionesMostrandoArbol = $event"
      @idNodoSeleccionado="nodoSeleccionadoEnColecciones"
    />

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
    <div
      v-show="!algoOverlaying"
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
            :idNodoTarget="idNodoTarget"
            :style="[
              {
                top: nodo.coords.y - esquinasDiagrama.y1 + 'px',
                left: nodo.coords.x - esquinasDiagrama.x1 + 'px',
              },
            ]"
            @setNodoTarget="setNodoTarget"
            @dblclick="
              $router.push({
                name: 'visorNodoConocimiento',
                params: { idNodo: nodo.id },
              })
            "
            @click.stop="clickNodo(nodo)"
          />
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
    <transition name="fadeOut">
      <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
    </transition>

    <controles-nodo
      :yo="yo"
      ref="controlesNodo"
      :elNodo="nodoSeleccionado"
      :nodoCreandoDependencia="nodoCreandoDependencia"
      @setMeTarget="
        setNodoTarget(nodoSeleccionado.id);
        centrarEnNodoById(nodoSeleccionado.id);
      "
      @nivelesConexion="nivelesConexion = $event"
      @click.stop=""
      @iniciarCrearDependenciaNodo="
        marcarNodoEsperandoDependencia(nodoSeleccionado)
      "
      @cancelarCreandoDependencia="nodoCreandoDependencia = null"
      @nodoEliminado="reactToNodoEliminado"
    />

    <div id="zonaLocalizadores" v-show="!algoOverlaying">
      <div
        class="boton controlColeccion"
        :class="{
          deshabilitado: idsNodosActivosAccesiblesInexplorados.length < 1,
        }"
        @click="localizarNext('accesible')"
      >
        <img
          src="@/assets/iconos/atlas/locationCrosshair.svg"
          alt="Localizar"
        />
      </div>
      <div
        class="boton controlColeccion"
        :class="{ deshabilitado: idsNodosActivosEstudiados.length < 1 }"
        @click="localizarNext('estudiado')"
      >
        <img
          src="@/assets/iconos/atlas/locationCrosshair.svg"
          alt="Localizar"
          style="filter: var(--filtroAtlasCheck)"
        />
      </div>
      <div
        class="boton controlColeccion"
        @click="localizarNext('olvidado')"
        :class="{
          deshabilitado: idsNodosActivosOlvidados.length < 1,
        }"
      >
        <img
          src="@/assets/iconos/atlas/locationCrosshair.svg"
          alt="Localizar"
          style="filter: var(--filtroAtlasRepaso)"
        />
      </div>
    </div>
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
import NodoConocimientoAtlas from "./NodoConocimientoAtlas.vue";
import GestorColecciones from "./GestorColecciones.vue";
import { RouterView } from "vue-router";

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
    NodoConocimientoAtlas,
    GestorColecciones,
    RouterView
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
      fetchPolicy: "cache-first",
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
  },
  data() {
    return {
      montado: false,
      firstLoad: false,

      configuracionAtlas: {
        posicionando: false,
      },
      hovered: false,
      todosNodos: [],
      nodosDescargados: false,
      posicionCreandoNodo: null,
      idNodoSeleccionado: null,
      coleccionSeleccionada: null,
      nivelesConexion: 0,
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

      seleccionandoColeccion: false,
      mostrandoOpcionesColeccion: false,

      indexLocalizadorAccesibles:0,
      indexLocalizadorOlvidados:0,
      indexLocalizadorEstudiados:0,

      idColeccionTargetOnLastLocalizacion: null,

      idNodoTarget: null,

      nodoCreandoDependencia: null,
      creandoDependencia:false,
      editandoVinculos: false,

      gestorColeccionesMostrandoArbol:false,
    };
  },
  computed: {
    domAndNodosReady(){
      return this.montado && this.firstLoad;
    },
    algoOverlaying(){
      return this.gestorColeccionesMostrandoArbol;
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

    idsTodosNodos(){
      if(!this.todosNodos){
        return [];

      }
      return this.todosNodos.map(n=>n.id);

    },
    idsTodosNodosEstudiados(){
      if(!this.yo?.atlas?.datosNodos){
        return []
      }
      return this.yo.atlas.datosNodos.filter(dn => dn.estadoAprendizaje==='ESTUDIADO').map(dn=>dn.idNodo);

    },
    idsTodosNodosAprendidos(){
      if(!this.yo?.atlas?.datosNodos){
        return []
      }
      return this.yo.atlas.datosNodos.filter(dn=>dn.estadoAprendizaje==='APRENDIDO').map(dn=>dn.idNodo);
    },
    idsTodosNodosOlvidados(){
      if(!this.yo?.atlas?.datosNodos){
        return []
      }
      return this.yo.atlas.datosNodos.filter(dn=>dn.estadoAprendizaje==='OLVIDADO').map(dn=>dn.idNodo);
    },
    idsTodosNodosAccesibles(){
      return this.todosNodos.filter(n=>!n.vinculos.some(v=>v.tipo==='continuacion' && v.rol==='target' && !this.idsTodosNodosAprendidos.includes(v.idRef) && !this.idsTodosNodosEstudiados.includes(v.idRef))).map(nA=>nA.id);
    },

    nodosActivos(){
      if(!this.todosNodos){
        return [];
      }
      if(this.nodoTarget){
        return this.todosNodos.filter(n=> this.idsRedUnderNodo(this.nodoTarget).includes(n.id));
      }

      if(this.coleccionSeleccionada){
        return this.todosNodos.filter(n=>this.coleccionSeleccionada.idsRed.includes(n.id));
      }
      return this.todosNodos;
    },

    idsNodosActivos(){
      return this.nodosActivos.map(na=>na.id);
    },
    idsNodosActivosEstudiados(){
      return this.idsNodosActivos.filter(idN=>this.idsTodosNodosEstudiados.includes(idN));
    },
    idsNodosActivosAprendidos(){
      return this.idsNodosActivos.filter(idN=>this.idsTodosNodosAprendidos.includes(idN));
    },
    idsNodosActivosOlvidados(){
      return this.idsNodosActivos.filter(idN=>this.idsTodosNodosOlvidados.includes(idN));
    },
    idsNodosActivosAccesibles(){
      return this.idsTodosNodosAccesibles.filter(idN=>this.idsNodosActivos.includes(idN));
    },
    idsNodosActivosAccesiblesInexplorados(){
      return this.idsNodosActivosAccesibles.filter(id=>!this.idsNodosActivosAprendidos.includes(id) && !this.idsNodosActivosEstudiados.includes(id) && !this.idsNodosActivosOlvidados.includes(id));
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

  },
  methods: {
    nodoSeleccionadoEnColecciones(idNodo){
      this.idNodoSeleccionado=idNodo;

    },
    reactToNodoEliminado(idNodo){
     let indexN = this.nodosVisibles.findIndex(n=>n.id===idNodo) ;
     if(indexN>-1){
      this.nodosVisibles.splice(indexN, 1);
     }
    },
    idsRedUnderNodo(nodo){
      let guarda=0;
      let idsNodosActuales=[nodo.id];
      let idsCompletos=[...idsNodosActuales];
      while(guarda<100 && idsNodosActuales.length>0){
        guarda++;
        let nodosActuales = this.todosNodos.filter((nodo) => idsNodosActuales.includes(nodo.id));
        let idsSiguientes=nodosActuales.map((nodo) => nodo.vinculos.filter(v=>v.tipo==='continuacion' && v.rol == 'target').map((vinculo) => vinculo.idRef)).flat();
        idsNodosActuales=idsSiguientes; idsCompletos.push(...idsSiguientes);
      }
      return idsCompletos;
    },
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
    marcarNodoEsperandoDependencia(nodo){
      this.nodoCreandoDependencia=nodo;
    },

    clickFuera() {
      this.seleccionNodo({});
      this.$refs.controlesNodo.clickFuera();
      this.$refs.buscadorNodos.cerrarBusqueda();
    },
    localizarNext(tipo){

      let nodoNext = null;
      if (tipo === "accesible") {
        if(this.idsNodosActivosAccesiblesInexplorados.length < 1){
          return;
        }
        this.indexLocalizadorAccesibles++;
        if(this.indexLocalizadorAccesibles >= this.idsNodosActivosAccesiblesInexplorados.length){
          this.indexLocalizadorAccesibles=0;
        }
      nodoNext = this.nodosActivos.find(na=>na.id===this.idsNodosActivosAccesiblesInexplorados[this.indexLocalizadorAccesibles]);

      } else if (tipo === "estudiado") {
        if(this.idsNodosActivosEstudiados.length < 1){
          return;
        }
        this.indexLocalizadorEstudiados++;
        if(this.indexLocalizadorEstudiados >= this.idsNodosActivosEstudiados.length){
          this.indexLocalizadorEstudiados=0;
        }
        nodoNext = this.nodosActivos.find(n=>n.id===this.idsNodosActivosEstudiados[this.indexLocalizadorEstudiados]);
      } else if (tipo === "olvidado") {
        if(this.idsNodosActivosOlvidados.length < 1){
          return;
        }
        this.indexLocalizadorOlvidados++;
        if(this.indexLocalizadorOlvidados >= this.idsNodosActivosOlvidados.length){
          this.indexLocalizadorOlvidados=0;
        }
        nodoNext = this.nodosActivos.find(na=>na.id === this.idsNodosActivosOlvidados[this.indexLocalizadorOlvidados]);
      }
      if(nodoNext){
        this.centrarEnNodo(nodoNext);
        this.seleccionNodo(nodoNext);
      }
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
      let nuevoCentroX=Math.round(this.esquinasDiagrama.x1 + (this.$refs.contenedorDiagrama.scrollLeft / this.factorZoom) + (this.$refs.contenedorDiagrama.clientWidth/(2 * this.factorZoom)));
      let nuevoCentroY=Math.round(this.esquinasDiagrama.y1 + (this.$refs.contenedorDiagrama.scrollTop / this.factorZoom) + (this.$refs.contenedorDiagrama.clientHeight/(2 * this.factorZoom)));


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
      apuntadorChunkNodosVisibles=0;
      this.$nextTick(()=>{
        this.apuntadorDeFrontera=this.nodosVisibles.length - 1; // Indica el ultimo nodo no confiable en el array de nodos visibles
        this.introducirChunkNodosVisibles()
      })
    },
    introducirChunkNodosVisibles(){
      let chunkSize=20;

      for(let i=apuntadorChunkNodosVisibles; i<apuntadorChunkNodosVisibles+chunkSize; i++){
        if(i>=this.nodosActivos.length){

          break;
        }
        let esteNodo=this.nodosActivos[i];
        let posNodo = esteNodo.autoCoords;
        let limiteIzquierdo=this.centroZonaNodosVisibles.x - (this.factorZonaVisible * this.anchoScreen/this.factorZoom);
        let limiteDerecho=this.centroZonaNodosVisibles.x + (this.factorZonaVisible * this.anchoScreen/this.factorZoom);
        let limiteSuperior=this.centroZonaNodosVisibles.y - (this.factorZonaVisible * this.altoScreen/this.factorZoom);
        let limiteInferior=this.centroZonaNodosVisibles.y + (this.factorZonaVisible * this.altoScreen/this.factorZoom);

        if(posNodo.x>limiteIzquierdo && posNodo.x<limiteDerecho && posNodo.y>limiteSuperior && posNodo.y<limiteInferior){
          this.nodosVisibles.push(esteNodo);
          this.idsNodosVisibles.push(esteNodo.id);
        }
      }

      apuntadorChunkNodosVisibles+=chunkSize;

      if(apuntadorChunkNodosVisibles<this.nodosActivos.length){
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
    nodosActivos(val){
      if(val.length > 0){
        this.firstLoad = true;
      }

    },
    coleccionSeleccionada(){
      this.iniciarCalculoNodosVisibles();
    },
    seleccionandoColeccion() {
      this.mostrandoOpcionesColeccion = false;
    },
    idNodoTarget(idNodoTarget) {
      localStorage.setItem("atlasConocimientoIdLastNodoTarget", idNodoTarget);


    },
    domAndNodosReady(){
      console.log("Cambio en domAndNodosReady");
      let contenedor=this.$refs.contenedorDiagrama;
      console.log("scrollWidth: " + contenedor.scrollWidth);
      this.$nextTick(()=>{
      contenedor.scrollLeft=contenedor.scrollWidth/2;
        contenedor.scrollTop=contenedor.scrollHeight/2;
        this.setCentroZonaNodosVisibles();
      })
    },
    nodoTarget(){
      this.iniciarCalculoNodosVisibles();
    },
    zoom() {
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    centroZonaNodosVisibles(){
      this.iniciarCalculoNodosVisibles();
    },
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

.gestorColecciones {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
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
.controlesNodo {
  z-index: 100;
}

/* #region localizadores */
#zonaLocalizadores {
  position: fixed;
  bottom: 0px;
  right: 0px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  padding: 20px 20px;
}
/* #endregion */

/* #region Windowing */

#indicadorCentroNodosVisibles {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: red;
}
/* #endregion */
</style>
