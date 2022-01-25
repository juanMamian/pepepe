<template>
  <div
    class="atlasSolidaridad"
    @mousedown.left.exact.self.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click.right.self.exact.prevent="abrirMenuContextual"
    @mousemove="panVista"
    @mouseup.left="clickFondoAtlas"
    @touchmove.prevent.stop="movimientoMobile"
    @touchstart="iniciaMovimientoTouch"
    @touchend="finTouch"
  >    
    <div
      id="botonCallingPosiciones"
      v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
      @click.stop="iniciarCallingPosiciones"
      :class="{ deshabilitado: callingPosiciones }"
      :style="[
        { backgroundColor: callingPosiciones ? 'green' : 'transparent' },
      ]"
    ></div>
    <transition name="fadeOut">
      <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
    </transition>      
    <div
      id="menuContextual"
      v-if="usuario && usuario.id"
      v-show="mostrandoMenuContextual"
      :style="[offsetMenuContextual]"
      :class="{ deshabilitado: enviandoQueryNodos }"
    >
      <div
        class="botonMenuContextual"
        id="botonCrearObjetivo"
        v-show="usuarioSuperadministrador"
        @mouseup.left.stop=""
        @click.stop="crearNodoEnMenuContextual('objetivo')"
      >
        Crear objetivo
      </div>
      <div
        class="botonMenuContextual"
        id="botonCrearObjetivo"
        @click.stop="crearNodoEnMenuContextual('trabajo')"
        @mouseup.left.stop=""
        v-show="usuarioSuperadministrador"
      >
        Crear trabajo
      </div>
    </div>

    <div
      id="centroVista"
      v-show="usuarioSuperadministrador && callingPosiciones"
    >
      {{ centroVista.x + ", " + centroVista.y }}
    </div>

    <div id="contenedorVinculosNodos" :style="[posContenedores]">
      <enlaces-nodo
        v-for="nodo of nodosConRequerimentos"
        :yo="yo"
        :key="nodo.id"
        :idNodoSeleccionado="idNodoSeleccionado"
        :esteNodo="nodo"
        :todosNodos="todosNodos"
        :factorZoom="factorZoom"
        :nodoSeleccionado="nodoSeleccionado"
        :redibujarEnlaces="redibujarEnlacesNodos"
        :idsTodosNodosRender="idsTodosNodosRender"
        :callingPosiciones="callingPosiciones"
        :transicionarPosicionNodos="transicionarPosicionNodos"
      />
    </div>

    <div id="contenedorNodos" :style="[posContenedores]">
      <nodo-persona
        v-for="persona of personasRender"
        :esNodoYo="nodoYo.id === persona.id"
        :key="persona.id"
        :esteNodo="persona"
        :idNodoSeleccionado="idNodoSeleccionado"
        :idsNodosNeedingFetchMore="idsNodosNeedingFetchMore"
        :nodoSeleccionado="nodoSeleccionado"
        :nodosUnder="indiceNodosUnder[persona.id]"
        :requeridoPorSeleccionado="
          idsNodosRequeridosSeleccionado.includes(persona.id)
        "
        :requiereAlSeleccionado="
          idsNodosRequierenSeleccionado.includes(persona.id)
        "
        :idsNodosDesplegados="idsNodosDesplegados"
        :menuCx="idNodoMenuCx && idNodoMenuCx === persona.id"
        :factorZoom="factorZoom"
        :callingPosiciones="callingPosiciones"
        :transparentoso="
          idNodoSeleccionado &&
          idNodoSeleccionado != persona.id &&
          !nodoSeleccionado.responsables.includes(persona.id) &&
          !idsNodosRequierenSeleccionado.includes(persona.id) &&
          nodoSeleccionado &&
          nodoSeleccionado.nodoParent != persona.id
        "
        :todosNodos="todosNodos"
        :todasPersonas="personas"
        :transicionarPosicionNodos="transicionarPosicionNodos"
        @mouseup.native.stop=""
        @click.native="idNodoSeleccionado = persona.id"
        @click.native.right.exact.stop.prevent="idNodoMenuCx = persona.id"
        @nodoSolidaridadCreado="addNodoToNodosSolidaridad($event)"

      />
      <transition-group name="fade" tag="div" v-if="indiceNodosUnder">
        <nodo
          v-for="nodo of nodosSolidaridadRender"
          :key="nodo.id"
          :esteNodo="nodo"
          :nodoYo="nodoYo"
          :idNodoSeleccionado="idNodoSeleccionado"
          :idsNodosNeedingFetchMore="idsNodosNeedingFetchMore"
          :nodoParent="todosNodos.find((n) => n.id === nodo.nodoParent)"
          :nodoSeleccionado="nodoSeleccionado"
          :nodosUnder="indiceNodosUnder[nodo.id]"
          :requeridoPorSeleccionado="
            idsNodosRequeridosSeleccionado.includes(nodo.id)
          "
          :seleccionadoEsResponsable="
            nodo.responsables.includes(idNodoSeleccionado)
          "
          :requiereAlSeleccionado="
            idsNodosRequierenSeleccionado.includes(nodo.id)
          "
          :enVentanita="idNodoPaVentanita === nodo.id"
          :idsNodosDesplegados="idsNodosDesplegados"
          :menuCx="idNodoMenuCx && idNodoMenuCx == nodo.id"
          :factorZoom="factorZoom"
          :callingPosiciones="callingPosiciones"
          :usuarioAdministradorNodoSeleccionado="
            usuarioAdministradorNodoSeleccionado
          "
          :usuarioResponsableNodoSeleccionado="
            usuarioResponsableNodoSeleccionado
          "
          :usuarioResponsableAmplioNodoSeleccionado="
            usuarioResponsableAmplioNodoSeleccionado
          "
          :transparentoso="
            idNodoSeleccionado &&
            idNodoSeleccionado != nodo.id &&
            !idsNodosRequeridosSeleccionado.includes(nodo.id) &&
            !idsNodosRequierenSeleccionado.includes(nodo.id) &&
            !nodo.responsables.includes(idNodoSeleccionado) &&
            nodoSeleccionado &&
            nodoSeleccionado.nodoParent != nodo.id
          "
          :childSeleccionado="idsNodosChildrenSeleccionado.includes(nodo.id)"
          :todosNodos="todosNodos"
          :transicionarPosicionNodos="transicionarPosicionNodos"
          @meMovi="redibujarEnlacesNodos++"
          @mouseup.native.stop=""
          @click.native="idNodoSeleccionado = nodo.id"
          @click.native.right.exact.stop.prevent="idNodoMenuCx = nodo.id"
          @meAbrieron="setNodoEnVentanita(nodo.id)"
          @meElimine="eliminarNodoCache(nodo.id)"
          @nodoSolidaridadCreado="addNodoToNodosSolidaridad($event)"

        />
      </transition-group>

      <div
        id="indicadorCentroDescarga"
        :style="[
          {
            left: centroDescarga.x * factorZoom + 'px',
            top: centroDescarga.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
      <div
        id="indicadorCentroVista"
        :style="[
          {
            left: centroVista.x * factorZoom + 'px',
            top: centroVista.y * factorZoom + 'px',
            width: 20 * factorZoom + 'px',
            height: 20 * factorZoom + 'px',
          },
        ]"
        v-show="usuario.username == 'juanMamian'"
      ></div>
    </div>

    <!-- <ventanita-nodo
      v-if="idNodoPaVentanita && nodoEnVentanita && !callingPosiciones"      
      :key="nodoEnVentanita.id"
      :esteNodo="nodoEnVentanita"      
      @cerrarme="cerrarNodoEnVentanita()"
    /> -->

    <router-view
      v-if="idNodoPaVentanita && nodoEnVentanita && !callingPosiciones"
      :key="nodoEnVentanita.id"
      :esteNodo="nodoEnVentanita"
      @cerrarme="cerrarNodoEnVentanita()"
    />

    <transition name="fadeOutLento">
      <div id="nombreNodoEmergente" v-show="showingNombreNodoEmergente">
        {{ nodoSeleccionado ? nodoSeleccionado.nombre : "" }}
      </div>
    </transition>

    <div id="panelConfiguracion" @mouseup.stop="">
      <div
        class="boton botonPanelConfiguracion"
        :class="{ activo: mostrandoPersonas }"
        :title="mostrandoPersonas ? 'Ocultar personas' : 'Mostrar personas'"
        @click.stop="mostrandoPersonas = !mostrandoPersonas"
      >
        <img src="@/assets/iconos/user.svg" alt="Usuarios" />
      </div>
    </div>

    <loading
      id="loadingNodos"
      v-show="        
        $apollo.queries.nodoRoot.loading        
      "
      texto="Descargando información..."
      colorLetra="white"
    />
  </div>
</template>

<script>
import gql from "graphql-tag";

import Loading from "../utilidades/Loading.vue";
import Nodo from "./Nodo.vue";
import EnlacesNodo from "./EnlacesNodo.vue";
import debounce from "debounce";
import { fragmentoNodoSolidaridad, fragmentoPersonaAtlas } from "./frags";
import NodoPersona from "./NodoPersona.vue";
import { MixinAtlasSolidaridad } from "./MixinAtlasSolidaridad";
import { QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD } from "./ConfiguracionNodoSolidaridad";
// const QUERY_NODOS = gql`
//   query ($nivel: Int!) {
//     nodosSolidaridadById(nivel: $nivel) {
//       ...fragNodoSolidaridad
//     }
//   }
//   ${fragmentoNodoSolidaridad}
// `;

export const QUERY_PERSONAS_ATLAS_SOLIDARIDAD = gql`
  query ($idsUsuarios: [ID!]) {
    usuariosByIds(idsUsuarios: $idsUsuarios) {
      ...fragPersonaAtlas
    }
  }
  ${fragmentoPersonaAtlas}
`;

export const QUERY_NODOS_ATLAS = gql`
  query {
    nodosSolidaridadByIds {
      ...fragNodoSolidaridad
    }
  }
  ${fragmentoNodoSolidaridad}
`;

export default {
  components: {
    Loading,
    Nodo,
    EnlacesNodo,
    NodoPersona,
  },
  name: "AtlasSolidaridad",
  apollo: {           
    yo: {
      query: QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD,
      update({ yo }) {
        this.calcularEsquinaVista(yo.coords);
        this.datosYoDescargados = true;
        return yo;
      },
      skip() {
        return !this.usuarioLogeado || !this.montado;
      },
      fetchPolicy: "network-only",
    },
    $subscribe:{
      nodosAtlasPosicionados: {
        query: gql`
          subscription ($idAtlas: ID!) {
            nodosAtlasPosicionados(idAtlas: $idAtlas)
          }
        `,
        variables: {
          idAtlas: "61b3fe0280509360825b2634", //Id del atlas de solidaridad.
        },
        result() {
          console.log(
            `Nodos del atlas han sido posicionados. Refetching coords`
          );
          this.refetchCoordsNodos();
        },
      },
    }    
  },
  mixins: [MixinAtlasSolidaridad],
  data() {
    return {
      tipoNodoRoot:'usuario',
      montado: false,
      personas: [],
      descargasPersonas: 0,
      nodosRenderRoot: [],
      nodosSolidaridadRender: [],

      personasRenderRoot: [],
      personasRender: [],

      mostrandoMenuContextual: false,
      posMenuContextual: {
        top: 0,
        left: 0,
      },

      esquinaVistaDecimal: {
        x: 0,
        y: 0,
      },
      centroDescarga: {
        x: 0,
        y: 0,
      },

      radioDescarga: null,
      sizeAtlas: {
        x: 0,
        y: 0,
        diagonal: 0,
      },
      panningVista: false,
      vistaPanned: false,
      hovered: false,

      idNodoSeleccionado: null,
      idNodoMenuCx: null,
      idNodoCentradoArbol: null,

      zoom: 80,
      minZoom: 20,
      maxZoom: 120,
      showingZoomInfo: false,
      infoPosZoom: null,

      pinching: false,
      lastPinchDistance: 0,

      // proyectos: [],
      // trabajos: [],
      // objetivos: [],

      enviandoQueryNodos: false,
      refetchingCoords: false,
      transicionarPosicionNodos: true,

      callingPosiciones: false,

      redibujarEnlacesNodos: 0,

      enviandoCoordsVistaUsuario: false,
      esquinaVistaCalculada: false,

      mostrandoPersonas: false,

      showingNombreNodoEmergente: false,
      vista: "atlas",
    };
  },
  methods: {    
    setNodosRender() {
      if (!this.indiceNodosUnder || this.indiceNodosUnder.length < 1) return [];
      console.log(`Setting nodos render`);      
      var currentTodosNodos = {
        nodosSolidaridad: this.nodosSolidaridadRoot,
        personas: this.personasRoot,
      };
      var nodosSolidaridadRender=this.nodosSolidaridadRoot;
      var personasRender=this.personasRoot;

      var idsnodosSolidaridadRenderParcial = nodosSolidaridadRender.map((nr) => nr.id);
      var idsPersonasRenderParcial = personasRender.map((p) => p.id);
      var cuenta = 0;
      do {
        cuenta++;
        if (cuenta > 1000) {
          console.log(`OVERFLOW`);
          break;
        }
        //nodosUnder
        let nodosUnder = currentTodosNodos.nodosSolidaridad
          .concat(currentTodosNodos.personas)
          .filter((cr) => this.idsNodosDesplegados.includes(cr.id))
          .reduce((acc, cn) => {
            const requeridos = this.indiceNodosUnder[cn.id].nodosRequeridos;
            return acc.concat(requeridos.filter(r=>!acc.map(v=>v.id).includes(r.id)));
          }, []);
        let nodosUnderNuevos = nodosUnder.filter(
          (nu) => !idsnodosSolidaridadRenderParcial.includes(nu.id)
        );

        //PersonasUnder
        let personasUnder = [];
        let personasUnderNuevos = [];
        if (this.mostrandoPersonas) {
          personasUnder = currentTodosNodos.nodosSolidaridad
            .filter((n) => this.idsNodosDesplegados.includes(n.id))
            .reduce((acc, cn) => {
              const responsables=this.indiceNodosUnder[cn.id].responsables;
              return acc.concat(responsables.filter(r=>!acc.map(v=>v.id).includes(r.id)));
            }, []);
          personasUnderNuevos = personasUnder.filter(
            (p) => !idsPersonasRenderParcial.includes(p.id)
          );
        }

        nodosSolidaridadRender = nodosSolidaridadRender.concat(nodosUnderNuevos);
        personasRender = personasRender.concat(personasUnderNuevos);

        currentTodosNodos.nodosSolidaridad = nodosUnderNuevos;
        currentTodosNodos.personas = personasUnderNuevos;

        idsnodosSolidaridadRenderParcial = nodosSolidaridadRender.map((nr) => nr.id);
        idsPersonasRenderParcial = personasRender.map((p) => p.id);
      } while (
        currentTodosNodos.nodosSolidaridad.length + currentTodosNodos.personas.length >
        0
      );

      this.nodosSolidaridadRender = nodosSolidaridadRender;
      this.personasRender = personasRender;
    },
    setNodoEnVentanita(idNodo) {
      console.log(`Setting path to ${idNodo}`);
      // var currentPath = this.$route.currentRoute.path;
      // console.log(`Era: ${currentPath}`);
      this.$router.push({ name: "nodoEnVentanita", params: { idNv: idNodo } });
    },
    cerrarNodoEnVentanita() {
      console.log(`Cerrando nodo en ventanita`);
      this.$router.push({ name: "atlasSolidaridad" });
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
        .query({
          query: gql`
            query ($ciclos: Int!) {
              posicionarNodosSolidaridadByFuerzas(ciclos: $ciclos)
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
    calcularEsquinaVista(centro) {
      console.log(`Centrando en usuario`);
      if (this.esquinaVistaCalculada) return;
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        Math.round(centro.x - this.sizeAtlas.x / (2 * this.factorZoom))
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        Math.round(centro.y - this.sizeAtlas.y / (2 * this.factorZoom))
      );
      this.esquinaVistaCalculada = true;
    },
    abrirMenuContextual(e) {
      let posAtlas = this.$el.getBoundingClientRect();

      let topClick = Math.round(e.pageY - posAtlas.top);
      let leftClick = Math.round(e.pageX - posAtlas.left);

      this.$set(this.posMenuContextual, "y", topClick);
      this.$set(this.posMenuContextual, "x", leftClick);
      this.mostrandoMenuContextual = true;
    },
    uploadVistaActual: debounce(function () {
      this.enviandoCoordsVistaUsuario = true;
      console.log(`Uploading vista de usuario`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($coords: CoordsInput!) {
              setCoordsVistaAtlasSolidaridadUsuario(coords: $coords)
            }
          `,
          variables: {
            coords: {
              x: Math.round(
                this.esquinaVistaDecimal.x +
                  this.sizeAtlas.x / (2 * this.factorZoom)
              ),
              y: Math.round(
                this.esquinaVistaDecimal.y +
                  this.sizeAtlas.y / (2 * this.factorZoom)
              ),
            },
          },
        })
        .then(() => {
          this.enviandoCoordsVistaUsuario = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoCoordsVistaUsuario = false;
        });
    }, 3000),
    desplazarVista(deltaX, deltaY) {
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        this.esquinaVistaDecimal.x - deltaX
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        this.esquinaVistaDecimal.y - deltaY
      );
      this.uploadVistaActual();
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      this.desplazarVista(
        e.movementX / this.factorZoom,
        e.movementY / this.factorZoom
      );
      e.preventDefault();
      this.vistaPanned = true;
    },
    clickFondoAtlas() {
      if (!this.vistaPanned) {
        if (!this.idNodoPaVentanita) {
          this.idNodoSeleccionado = null;
        }
        if (this.$route.name === "nodoEnVentanita") {
          this.cerrarNodoEnVentanita();
        }
        this.idNodoMenuCx = null;

        if (this.$route.name === "atlasConLista") {
          this.$router.push({ name: "atlasSolidaridad" });
        }
      }
      this.mostrandoMenuContextual = false;

      this.panningVista = false;
      this.vistaPanned = false;
    },
    movimientoMobile(e) {
      if (this.pinching) {
        var contenedor = this.$el;
        let posContenedor = contenedor.getBoundingClientRect();

        const posPinch = {
          x:
            (e.touches[0].pageX -
              posContenedor.left +
              (e.touches[1].pageX - posContenedor.left)) /
            2,
          y:
            (e.touches[0].pageY -
              posContenedor.top +
              (e.touches[1].pageY - posContenedor.top)) /
            2,
        }; //Posición en pixeles.

        const coordsPinch = {
          x: Math.round(
            posPinch.x / this.factorZoom + this.esquinaVistaDecimal.x
          ),
          y: Math.round(
            posPinch.y / this.factorZoom + this.esquinaVistaDecimal.y
          ),
        }; //Posicion en unidades absolutas (Las que usa el atlas)

        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        var pinch = dist - this.lastPinchDistance;
        pinch = pinch * 0.3;
        this.zoomVista(pinch, coordsPinch);
        this.lastPinchDistance = dist;

        return;
      }

      const deltaX = Math.round(
        (e.changedTouches[0].clientX - this.ultimoTouchX) / this.factorZoom
      );
      const deltaY = Math.round(
        (e.changedTouches[0].clientY - this.ultimoTouchY) / this.factorZoom
      );
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;

      this.desplazarVista(deltaX, deltaY);
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
    zoomVista(deltaZoom, posZoom) {
      const viejoZoom = this.zoom;
      var nuevoZoom = Math.round(this.zoom + deltaZoom);
      if (nuevoZoom < this.minZoom) {
        this.zoom = this.minZoom;
      } else if (nuevoZoom > this.maxZoom) {
        this.zoom = this.maxZoom;
      } else {
        this.zoom = nuevoZoom;
      }

      //Pan vista de acuerdo con la posición del mouse respecto del atlas
      const distanciaEsquina = {
        x: posZoom.x - this.esquinaVistaDecimal.x,
        y: posZoom.y - this.esquinaVistaDecimal.y,
      };
      const proporcionZoom = viejoZoom / this.zoom;

      this.$set(
        this.esquinaVistaDecimal,
        "x",
        posZoom.x - proporcionZoom * distanciaEsquina.x
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        posZoom.y - proporcionZoom * distanciaEsquina.y
      );
    },
    zoomWheel(e) {
      if (!this.hovered || !e.ctrlKey) {
        return;
      }
      e.preventDefault();
      var contenedor = document.getElementById("contenedorNodos");
      let posContenedor = contenedor.getBoundingClientRect();

      const posZoom = {
        x: Math.round((e.clientX - posContenedor.left) / this.factorZoom),
        y: Math.round((e.clientY - posContenedor.top) / this.factorZoom),
      };

      const factorZoom = 0.2;
      this.zoomVista(-Math.round(e.deltaY * factorZoom), posZoom);

      // const posZoom={
      //   x: Math.round((e.clientX-posContenedor.left)/this.factorZoom)+this.esquinaVista.x,
      //   y: Math.round((e.clientY-posContenedor.top)/this.factorZoom)+this.esquinaVista.y
      // }

      // const proporciones={
      //   x: (posZoom.x-this.esquinaVistaDecimal.x)/(posContenedor.width/this.factorZoom),
      //   y: (posZoom.y-this.esquinaVistaDecimal.y)/(posContenedor.height/this.factorZoom),
      // }

      // const factorZoom=0.2;
      // this.zoomVista(-Math.round(e.deltaY*factorZoom), {x:posZoom.x, y: posZoom.y});

      // this.$set(this.esquinaVistaDecimal, "x", posZoom.x-((posContenedor.width/this.factorZoom)*proporciones.x) );
      // this.$set(this.esquinaVistaDecimal, "y", posZoom.y-((posContenedor.height/this.factorZoom)*proporciones.y) );
    },
    eliminarNodoCache(idNodo) {
      console.log(`Eliminando nodo de caché`);
      const indexN=this.nodosSolidaridad.find(n=>n.id===idNodo);
      if(indexN>-1){
        this.nodosSolidaridad.splice(indexN, 1);
      }
      else{
        console.log(`Nodo no estaba en lista`);
      }
    },
    crearNodoEnMenuContextual(tipo) {
      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();

      var posicionNuevoNodo = {
        x: parseInt(
          (parseInt(this.posMenuContextual.x) - posContenedor.left) /
            this.factorZoom
        ),
        y: parseInt(
          (parseInt(this.posMenuContextual.y) - posContenedor.top) /
            this.factorZoom
        ),
      };

      console.log(`Creando nuevo nodo en ${JSON.stringify(posicionNuevoNodo)}`);
      this.crearNodo(posicionNuevoNodo, tipo);
    },
    crearNodo(posicion, tipoNodo) {
      if (!this.usuario || !this.usuario.id) {
        console.log(`Error usuario no logeado`);
        return;
      }
      console.log(`enviando una mutación de crear nodo`);
      this.enviandoQueryNodos = true;

      let infoNodo = {
        coords: {
          x: posicion.x,
          y: posicion.y,
        },
        tipoNodo,
      };
      console.log(`en las coordenadas: ${posicion.x}, ${posicion.y}`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNodo: NodoSolidaridadInput!) {
              crearNodoSolidaridad(infoNodo: $infoNodo) {
                ...fragNodoSolidaridad
              }
            }
            ${fragmentoNodoSolidaridad}
          `,
          variables: {
            infoNodo,
          },
        })
        .then(({ data: { crearNodoSolidaridad } }) => {
          console.log(`Creado ${crearNodoSolidaridad.id}`);
          const store = this.$apollo.provider.defaultClient;
          const cache = store.readQuery({
            query: QUERY_NODOS_ATLAS,
            variables: {
              centro: {
                x: this.centroDescarga.x,
                y: this.centroDescarga.y,
              },
              radio: this.radioDescarga,
            },
          });
          var nuevoCache = JSON.parse(JSON.stringify(cache));
          var losNodos = nuevoCache.nodosSolidaridadById;
          const indexN = losNodos.findIndex(
            (n) => n.id === crearNodoSolidaridad.id
          );
          if (indexN > -1) {
            console.log(`El nodo ya estaba en caché`);
          } else {
            losNodos.push(crearNodoSolidaridad);
            store.writeQuery({
              query: QUERY_NODOS_ATLAS,
              variables: {
                centro: {
                  x: this.centroDescarga.x,
                  y: this.centroDescarga.y,
                },
                radio: this.radioDescarga,
              },
              data: nuevoCache,
            });
          }
          this.setNodoEnVentanita(crearNodoSolidaridad.id);
          this.enviandoQueryNodos = false;
          this.mostrandoMenuContextual = false;

          //this.$router.push("/nodoConocimiento/"+crearNodoSolidaridad.id);
        })
        .catch((error) => {
          this.enviandoQueryNodos = false;
          console.log(`Error. E: ${error}`);
        });
    },
    centrarEnNodo(n) {
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      this.$set(
        this.esquinaVistaDecimal,
        "x",
        n.coords.x - posContenedor.width / (2 * this.factorZoom)
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        n.coords.y - posContenedor.height / (2 * this.factorZoom)
      );
      this.idNodoSeleccionado = n.id;
      //this.centroVista=e;
    },
    centrarEnNodoById(idNodo) {
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      const elNodo = this.todosNodos.find((n) => n.id === idNodo);
      this.$set(
        this.esquinaVistaDecimal,
        "x",
        elNodo.coords.x - posContenedor.width / (2 * this.factorZoom)
      );
      this.$set(
        this.esquinaVistaDecimal,
        "y",
        elNodo.coords.y - posContenedor.height / (2 * this.factorZoom)
      );
      this.idNodoSeleccionado = idNodo;

      //this.centroVista=e;
    },

    uploadNodosDesplegados: debounce(function () {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idsNodos: [ID!]) {
              setNodosSolidaridadDesplegadosUsuario(idsNodos: $idsNodos)
            }
          `,
          variables: {
            idsNodos: this.idsNodosDesplegados,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: E:${error}`);
        });
    }, 5000),
    refetchCoordsNodos: debounce(function () {
      console.log(`Iniciando refetch de coords`);
      this.refetchingCoords = true;
      this.$apollo
        .query({
          query: gql`
            query ($idsNodos: [ID!]) {
              nodosSolidaridadByIds(idsNodos: $idsNodos) {
                id
                coords {
                  x
                  y
                }
              }
            }
          `,
          variables: {
            idsNodos: this.todosNodos.map((n) => n.id),
          },
        })
        .then(() => {
          console.log(`Coords refetched`);
          this.refetchingCoords = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.refetchingCoords = false;
        });
    }, 2000),
    hideNombreNodoEmergente: debounce(function () {
      this.showingNombreNodoEmergente = false;
    }, 4000),
    hideZoomInfo: debounce(function () {
      this.showingZoomInfo = false;
    }, 1000),
  },
  computed: {
    personasRoot(){
      if(this.nodoRoot.__typename==='Usuario'){
        return [this.nodoRoot]
      }
      else{
        return []
      }
    },
    nodosSolidaridadRoot(){
      if(this.nodoRoot.__typename==='NodoSolidaridad'){
        return [this.nodoRoot]
      }
      else{
        return []
      }
    },
    nodoYo() {
      if (!this.usuarioLogeado) return null;
      return this.personas.find((p) => p.id === this.usuario.id);
    },
    idNodoRoot() {
      return this.usuario ? this.usuario.id : null;
    },    
    idNodoPaVentanita() {
      return this.$route.params.idNv;
    },
    refreshNodoVentanita() {
      return this.$store.state.refreshNodoVentanitaAtlasSolidaridad;
    },
    offsetMenuContextual() {
      return {
        top: this.posMenuContextual.y + "px",
        left: this.posMenuContextual.x + "px",
      };
    },
    factorZoom() {
      return Number((this.zoom / 100).toFixed(2));
    },
    esquinaVista() {
      return {
        x: Math.round(this.esquinaVistaDecimal.x),
        y: Math.round(this.esquinaVistaDecimal.y),
      };
    },
    centroVista() {
      return {
        x: this.esquinaVista.x + this.sizeAtlas.x / this.factorZoom / 2,
        y: this.esquinaVista.y + this.sizeAtlas.y / this.factorZoom / 2,
      };
    },
    posContenedores() {
      return {
        left: -(this.esquinaVista.x * this.factorZoom) + "px",
        top: -(this.esquinaVista.y * this.factorZoom) + "px",
      };
    },
    posCuadroDescarga() {
      const posx =
        this.centroDescarga.x - this.radioDescarga - this.esquinaVista.x;
      const posy =
        this.centroDescarga.y - this.radioDescarga - this.esquinaVista.y;
      return {
        left: posx * this.factorZoom + "px",
        top: posy * this.factorZoom + "px",
      };
    },
    nodoEnVentanita() {
      if (!this.idNodoPaVentanita) return null;
      return this.nodosSolidaridad.find((n) => n.id == this.idNodoPaVentanita);
    },
    nodoSeleccionado() {
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    // nodoCentradoArbol() {
    //   return this.nodosTodos.find((n) => n.id === this.idNodoCentradoArbol);
    // },
    usuarioAdministradorNodoSeleccionado() {
      if (!this.usuario || !this.usuario.id) return false;
      if (!this.nodoSeleccionado) return false;
      return this.nodoSeleccionado.administradores.includes(this.usuario.id);
    },
    usuarioResponsableNodoSeleccionado() {
      if (!this.usuario || !this.usuario.id) return false;
      if (!this.nodoSeleccionado) return false;

      return this.nodoSeleccionado.responsables.includes(this.usuario.id);
    },
    usuarioResponsableAmplioNodoSeleccionado() {
      if (!this.usuarioLogeado || !this.usuario || !this.usuario.id)
        return false;

      if (!this.nodoSeleccionado) return false;
      return (
        this.nodoSeleccionado.responsablesAmplio &&
        this.nodoSeleccionado.responsablesAmplio.includes(this.usuario.id)
      );
    },
    nodosRequierenSeleccionado() {
      if (!this.idNodoSeleccionado) return [];
      return this.todosNodos.filter((n) =>
        n.vinculos
          .filter((v) => v.tipo == "requiere")
          .map((v) => v.idRef)
          .includes(this.idNodoSeleccionado)
      );
    },
    nodosRequeridosSeleccionado() {
      return this.todosNodos.filter((n) =>
        this.idsNodosRequeridosSeleccionado.includes(n.id)
      );
    },
    idsNodosChildrenSeleccionado() {
      if (!this.nodoSeleccionado || !this.indiceNodosUnder) return [];
      return this.indiceNodosUnder[this.idNodoSeleccionado].nodosChildren.map(
        (n) => n.id
      );
    },
    idsNodosRequierenSeleccionado() {
      return this.nodosRequierenSeleccionado.map((n) => n.id);
    },
    idsNodosRequeridosSeleccionado() {
      if (!this.nodoSeleccionado) {
        return [];
      }
      return this.nodoSeleccionado.vinculos
        .filter((v) => v.tipo == "requiere")
        .map((v) => v.idRef);
    },
    idsNodosDesplegados() {
      if (
        !this.yo ||
        !this.yo.atlasSolidaridad ||
        !this.yo.atlasSolidaridad.idsNodosDesplegados
      )
        return [];
      return this.yo.atlasSolidaridad.idsNodosDesplegados;
    },   
    trabajos() {
      return this.nodosSolidaridad.filter((n) => n.tipoNodo === "trabajo");
    },
    objetivos() {
      return this.nodosSolidaridad.filter((n) => n.tipoNodo === "objetivo");
    },
    nodosConRequerimentos() {
      var nr = this.todosNodos.filter(
          (n) =>
            n.vinculos.filter((v) => v.tipo === "requiere").length > 0 ||
            (n.__typename==='NodoSolidaridad' && n.responsables.length > 0)
        );

      return nr;
    },        
    idsNodosSolidaridadRender() {
      return this.nodosSolidaridadRender.map((n) => n.id);
    },
    idsPersonasRender() {
      return this.personasRender.map((n) => n.id);
    },
    idsTodosNodosRender() {
      return this.idsNodosSolidaridadRender.concat(this.idsPersonasRender);
    },
    
  },
  watch: {
    centroVista(actual) {
      const distanciaCentroDescarga = Math.hypot(
        this.centroDescarga.x - actual.x,
        this.centroDescarga.y - actual.y
      );
      // console.log(`Distancia centro descarga: ${distanciaCentroDescarga}`);
      if (
        this.radioDescarga - distanciaCentroDescarga <
        this.sizeAtlas.diagonal / this.factorZoom / 2
      ) {
        //Hora de actualizar nodos
        this.radioDescarga = Math.ceil(
          (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
        );
        this.$set(this.centroDescarga, "x", Math.round(this.centroVista.x));
        this.$set(this.centroDescarga, "y", Math.round(this.centroVista.y));
      }
    },
    idNodoSeleccionado(nuevo) {
      if (!nuevo) {
        // this.cerrarNodoEnVentanita();
        this.showingNombreNodoEmergente = false;
      } else {
        // this.$refs.listas.desplegarCascadaHaciaNodo(nuevo);
        if (this.zoom < 65) {
          this.showingNombreNodoEmergente = true;
          this.hideNombreNodoEmergente();
        }
      }
    },
    zoom() {
      this.transicionarPosicionNodos = false;
      this.showingZoomInfo = true;
      this.hideZoomInfo();
    },
    idsNodosDesplegados() {
      if (this.usuarioLogeado) {
        this.setNodosRender();
        this.uploadNodosDesplegados();
      }
    },
    personas() {
      this.setNodosRender();
    },
    todosNodos() {
      this.setNodosRender();
    },
    mostrandoPersonas() {
      this.setNodosRender();
    },
    idsTodosNodosRender() {
      const idsNuevosPersonas = this.idsPersonasRender.filter(
        (id) => !this.infoNodosEverRendered.map((ner) => ner.id).includes(id)
      );
      const idsNuevosNodosSolidaridad = this.idsNodosSolidaridadRender.filter(
        (id) => !this.infoNodosEverRendered.map((ner) => ner.id).includes(id)
      );

      const infoPersonasNuevosRender = idsNuevosPersonas.map((idp) => {
        return { id: idp, tipo: "usuario" };
      });
      const infoNodosSolidaridadNuevosRender = idsNuevosNodosSolidaridad.map(
        (idn) => {
          return { id: idn, tipo: "nodoSolidaridad" };
        }
      );

      this.infoNodosEverRendered = this.infoNodosEverRendered
        .concat(infoPersonasNuevosRender)
        .concat(infoNodosSolidaridadNuevosRender);
    },
    
  },
  mounted() {
    var posAtlas = this.$el.getBoundingClientRect();
    this.$set(this.sizeAtlas, "x", posAtlas.width);
    this.$set(this.sizeAtlas, "y", posAtlas.height);
    this.$set(
      this.sizeAtlas,
      "diagonal",
      Math.hypot(this.sizeAtlas.x, this.sizeAtlas.y)
    );

    this.radioDescarga = Math.ceil(
      (Math.max(this.sizeAtlas.x, this.sizeAtlas.y) * 2) / this.factorZoom
    );
    this.montado = true;
    this.$el.scrollIntoView({ behavior: "smooth" });
  },
  created() {
    window.addEventListener("wheel", this.zoomWheel, { passive: false });
  },
  removed() {
    window.removeEventListener("wheel", this.zoomWheel);
  },
  // beforeRouteLeave(to, from, next) {
  //   console.log(`Hacia: ${to}`);
  //   if (this.$refs.listas.abierta) {
  //     this.$refs.listas.abierta = false;
  //     return next(false);
  //   }
  //   if (this.idNodoPaVentanita) {
  //     this.idNodoPaVentanita = null;
  //     return next(false);
  //   }
  //   next();
  // },
};
</script>
<style>
:root {
  --atlasFondo: #12263a;
  --atlasVerde: #4d8b31;
  --atlasAmarillo: #ffc800;
  --atlasAzul: #69c7c7;
  --atlasFondoNodo: #a9d1d1;
  --atlasNaranja: #ef7229;
  --atlasMorado: #ba2c73;
  --atlasGris: #929292;
  --atlasParent: #3066be;

  --atlasFilterFondo: invert(10%) sepia(55%) saturate(1034%) hue-rotate(174deg)
    brightness(91%) contrast(91%);
  --atlasFilterVerde: invert(41%) sepia(84%) saturate(349%) hue-rotate(57deg)
    brightness(95%) contrast(89%);
  --atlasFilterAmarillo: invert(79%) sepia(32%) saturate(4772%) hue-rotate(3deg)
    brightness(108%) contrast(105%);
  --atlasFilterAzul: invert(73%) sepia(20%) saturate(732%) hue-rotate(131deg)
    brightness(92%) contrast(98%);
  --atlasFilterNaranja: invert(53%) sepia(29%) saturate(1745%)
    hue-rotate(340deg) brightness(96%) contrast(95%);
  --atlasFilterMorado: invert(27%) sepia(24%) saturate(4772%) hue-rotate(301deg)
    brightness(92%) contrast(95%);
  --atlasFilterGris: invert(61%) sepia(0%) saturate(1316%) hue-rotate(210deg)
    brightness(97%) contrast(81%);
  --filterBlanco: invert(100%) sepia(100%) saturate(0%) hue-rotate(130deg)
    brightness(106%) contrast(102%);
}
</style>
<style scoped>
.atlasSolidaridad {
  overflow: hidden;
  position: relative;
  background-color: #12263a;
  height: 100vh;
}
#botonVistaLista {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 22px;
  left: 22px;
  filter: var(--atlasFilterGris);
  cursor: pointer;
  z-index: 2;
}
#botonVistaLista:hover {
  filter: var(--filterBlanco);
}
.ventanaLista {
  position: absolute;
  top: 0;
  left: 0%;
  transition: transform 0.6s;
  box-shadow: 4px 4px 6px rgba(152, 143, 253, 0.25);
  background-color: #a9d1d1;
  width: min(1000px, 100%);
}

.nodoVistaLista #barraSuperior {
  background-color: red;
}
#menuContextual {
  position: absolute;
  background-color: rgb(173, 173, 173);
  z-index: 2;
}
.botonMenuContextual {
  padding: 5px 10px;
  cursor: pointer;
}
.botonMenuContextual:hover {
  background-color: gray;
}
#contenedorNodos {
  position: relative;
  z-index: 1;
}
#contenedorVinculosNodos {
  position: relative;
}

#canvasesatlasSolidaridad {
  position: relative;
}
#centroVista {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: orange;
  transform: translate(-50%, -50%);
  position: absolute;
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
  z-index: 100;
}
.ventanitaNodo {
  width: min(400px, 90%);
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 60;
}
#loadingNodos {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform: translateX(-50%);
}
#indicadorCentroDescarga {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: red;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
#indicadorCentroVista {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: rgb(0, 60, 255);
  transform: translate(-50%, -50%);
  border-radius: 50%;
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
  z-index: 3;
}

#nombreNodoEmergente {
  position: fixed;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 10px;
  border: 2px solid rgb(56, 128, 131);
  background-color: rgb(185, 215, 216);
  padding: 10px;
  font-size: 20px;
  z-index: 10;
}
#panelConfiguracion {
  position: fixed;
  bottom: 1vh;
  right: 3vw;
}

.botonPanelConfiguracion {
  height: 25px;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}
.botonPanelConfiguracion.activo {
  border-color: white;
}
.botonPanelConfiguracion img {
  height: 100%;
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

.fadeOutLento-leave-to {
  opacity: 0;
}
.fadeOutLento-leave-active {
  transition: opacity 2s;
}
.fadeOutLento-leave {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>