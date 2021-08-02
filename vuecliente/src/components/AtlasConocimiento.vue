<template>
  <div
    class="atlasConocimiento"
    @mousedown.left.exact.stop="panningVista = true"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click="
      idNodoMenuCx = '-1';
      cerrarBusqueda++;
    "
    @mousemove="panVista($event)"
    @mouseup.left="clickFondoAtlas"
    @touchmove.prevent.stop="movimientoMobile"
    @touchstart="iniciaMovimientoTouch"
    @touchend="finTouch"
    @contextmenu.self.exact.prevent="abrirMenuContextual"
  >
    <transition name="fadeOut">
      <div v-show="showingZoomInfo" id="infoZoom">x{{ factorZoom }}</div>
    </transition>
    <div id="menuContextual" :style="[offsetMenuContextual]" v-show="mostrandoMenuContextual">
      <div class="botonMenuContextual" id="botonCrearNuevoNodo" @click="crearNodoEnMenuContextual">Crear Nodo de conocimiento</div>
    </div>
    <div
      id="botonCallingPosiciones"
      v-if="usuarioSuperadministrador && usuario.username == 'juanMamian'"
      @click.stop="callingPosiciones = !callingPosiciones"
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
      :todosNodos="todosNodos"
      :idNodoTarget="idNodoTarget"
      @targetSeleccionado="setNodoTargetCache"
      @centrarEnNodo="centrarEnNodo(todosNodos.find((n) => n.id == $event))"
    />
    <panel-configuracion-atlas ref="panelConfiguracionAtlas" :yo="yo"/>
    <canvases
      :todosNodos="todosNodos"
      :nodoSeleccionado="nodoSeleccionado"
      :idNodoTarget="idNodoTarget"
      :idsNecesariosParaTarget="idsNecesariosParaTarget"
      :centroVista="centroVista"
      :callingPosiciones="callingPosiciones"
      :factorZoom="factorZoom"
      :style="[offsetContenedorNodos]"
      ref="canvases"
      v-if="todosNodos.length > 1"
    />
    <div id="contenedorNodos" :style="[offsetContenedorNodos]">
      <nodo-conocimiento
        :nodoSeleccionado="nodoSeleccionado"
        :todosNodos="todosNodos"
        :idNodoMenuCx="idNodoMenuCx"
        :usuarioAdministradorAtlas="usuarioAdministradorAtlas"
        :yo="yo"
        :key="nodo.id"
        v-for="nodo of todosNodos"
        :esteNodo="nodo"
        :centroVista="centroVista"
        :esNodoObjetivo="idsNodosObjetivos.includes(nodo.id)"
        :esTarget="idNodoTarget == nodo.id"
        :idsNodosAprendidos="idsNodosAprendidos"
        :factorZoom="factorZoom"
        :escondido="
          idNodoTarget &&
          !idsNecesariosParaTarget.includes(nodo.id) &&
          idNodoTarget != nodo.id
        "
        :callingPosiciones="callingPosiciones"
        @click.right.native.exact.stop.prevent="idNodoMenuCx = nodo.id"
        @click.native.stop="seleccionNodo(nodo)"
        @creacionVinculo="crearVinculo"
        @eliminacionVinculo="eliminarVinculo"
        @cambioDePosicionManual="cambiarCoordsManualesNodo"
        @eliminar="eliminarNodo"
        @cambieEstadoObjetivo="setEstadoObjetivoNodoCache($event, nodo.id)"
        @tengoNuevoValorAprendido="setNodoAprendidoCache($event, nodo.id)"
      />
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
import NodoConocimiento from "./atlasConocimiento/NodoConocimiento.vue";
import Canvases from "./atlasConocimiento/Canvases.vue";
import BuscadorNodosConocimiento from "./atlasConocimiento/BuscadorNodosConocimiento.vue";
import Loading from "./utilidades/Loading.vue";
import PanelConjuntosNodos from "./atlasConocimiento/PanelConjuntosNodos.vue";
import PanelConfiguracionAtlas from './atlasConocimiento/PanelConfiguracionAtlas.vue';
const debounce = require("debounce");

const QUERY_NODOS = gql`
  query {
    todosNodos {
      id
      nombre
      descripcion
      expertos
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
      centroMasa {
        x
        y
      }
      stuck
      angulo
      puntaje
      vinculos {
        idRef
        rol
        tipo
      }
    }
  }
`;

const QUERY_DATOS_USUARIO_NODOS = gql`
  query {
    yo {
      id
      atlas {
        datosNodos {
          idNodo
          objetivo
          aprendido
        }
        configuracion{
          modo
        }
        idNodoTarget
      }
    }
  }
`;

export default {
  components: {
    NodoConocimiento,
    Canvases,
    BuscadorNodosConocimiento,
    Loading,
    PanelConjuntosNodos,
    PanelConfiguracionAtlas,
  },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: {
      query: QUERY_NODOS,
      result: function () {
        this.dibujarVinculosGrises();
      },
      pollInterval() {
        return this.callingPosiciones ? 5000 : null;
      },
      update({ todosNodos }) {
        this.nodosDescargados = true;
        todosNodos.forEach((nodo) => {
          nodo.coordsManuales = nodo.coords;
        });
        return todosNodos;
      },
      fetchPolicy: "cache-and-network",
    },
    yo: {
      query: QUERY_DATOS_USUARIO_NODOS,
      skip() {
        return !this.usuarioLogeado || this.todosNodos.length < 1;
      },
    },
  },
  data() {
    return {
      hovered: false,
      todosNodos: [],
      nodosDescargados: false,
      idNodoSeleccionado: "-1",
      idNodoMenuCx: "-1",
      idsNecesariosParaTarget: [],

      yo: {
        atlas: {
          datosNodos: [],
          configuracion:{
            modo:'estudiante'
          }
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
      nodosConectadosAlSeleccionado: {
        listaCompleta: [],
        listaPorNiveles: [],
      },
      profundidadNodosConectadosAlSeleccionado: 1,
      actualizarVinculosGrises: 0,

      ultimoTouchX: 0,
      ultimoTouchY: 0,

      cerrarBusqueda: 0,

      callingPosiciones: false,

      mostrandoMenuContextual:false,
      offsetMenuContextual:{
        top: '0px',
        left: '0px'
      }
    };
  },
  computed: {
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
      if (!this.todosNodos) {
        console.log(`NO HAY NODOS`);
        return false;
      }
      if (this.todosNodos.some((n) => n.id == this.idNodoSeleccionado)) {
        let indexSeleccionado = this.todosNodos.findIndex(
          (n) => n.id == this.idNodoSeleccionado
        );
        return this.todosNodos[indexSeleccionado];
      }
      return {
        id: "-1",
        vinculos: [],
      };
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
    idsNodosAprendidos() {
      return this.yo.atlas.datosNodos
        .filter((n) => n.aprendido == true)
        .map((n) => n.idNodo);
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
    offsetContenedorNodos() {
      return {
        left: -(this.centroVista.x * this.factorZoom) + "px",
        top: -(this.centroVista.y * this.factorZoom) + "px",
      };
    },   
  },
  methods: {
    abrirMenuContextual(e){
            
      let posCalendario = this.$el.getBoundingClientRect();
    
      let topClick = Math.round(
        (e.pageY - posCalendario.top)
      );
      let leftClick = Math.round(
        (e.pageX - posCalendario.left)
      );

      this.$set(this.offsetMenuContextual, 'top', topClick+'px');
      this.$set(this.offsetMenuContextual, 'left', leftClick+'px');
      this.mostrandoMenuContextual=true;
      //this.crearNodo({x: leftClick, y: topClick});
    },
    crearNodoEnMenuContextual(){

      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();

      console.log(`Offset menú cx: ${this.offsetMenuContextual.top}`);
      console.log(`Offset menú cx: ${parseInt(this.offsetMenuContextual.top)}`);

      var posicionNuevoNodo={
        x:parseInt((parseInt(this.offsetMenuContextual.left)-posContenedor.left)/this.factorZoom),
        y:parseInt((parseInt(this.offsetMenuContextual.top)-posContenedor.top)/this.factorZoom)
      }

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
      console.log(`Click en el fondo del atlas`);
      if (!this.vistaPanned) this.idNodoSeleccionado = "-1";
      this.panningVista = false;
      this.vistaPanned = false;
      this.$refs.panelConjuntosNodos.abierto = false;
      this.$refs.panelConfiguracionAtlas.abierto = false;
      this.mostrandoMenuContextual=false;
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

    centrarEnNodo(n) {
      this.$set(
        this.centroVistaDecimal,
        "x",
        n.coords.x - this.$el.offsetWidth / (2 * this.factorZoom)
      );
      this.$set(
        this.centroVistaDecimal,
        "y",
        n.coords.y - this.$el.offsetHeight / (2 * this.factorZoom)
      );
      this.seleccionNodo(n);
      //this.centroVista=e;
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
    movimientoMobile(e) {
      if (this.pinching) {
        var contenedor = this.$el;
        let posContenedor = contenedor.getBoundingClientRect();

        const posZoom = {
          x:
            Math.round(posContenedor.width / 2 / this.factorZoom) +
            this.centroVista.x,
          y:
            Math.round(posContenedor.height / 2 / this.factorZoom) +
            this.centroVista.y,
        };

        const proporciones = {
          x:
            (posZoom.x - this.centroVistaDecimal.x) /
            (posContenedor.width / this.factorZoom),
          y:
            (posZoom.y - this.centroVistaDecimal.y) /
            (posContenedor.height / this.factorZoom),
        };

        var dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        var pinch = dist - this.lastPinchDistance;
        pinch = pinch * 0.5;
        this.zoomVista(pinch);
        this.lastPinchDistance = dist;

        this.$set(
          this.centroVistaDecimal,
          "x",
          posZoom.x - (posContenedor.width / this.factorZoom) * proporciones.x
        );
        this.$set(
          this.centroVistaDecimal,
          "y",
          posZoom.y - (posContenedor.height / this.factorZoom) * proporciones.y
        );
        return;
      }

      const deltaX = e.changedTouches[0].clientX - this.ultimoTouchX;
      const deltaY = e.changedTouches[0].clientY - this.ultimoTouchY;
      this.ultimoTouchX = e.changedTouches[0].clientX;
      this.ultimoTouchY = e.changedTouches[0].clientY;

      this.desplazarVista(deltaX, deltaY);
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
      };
      console.log(`en las coordenadas: ${posicion.x}, ${posicion.y} `);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNodo: NodoConocimientoInput) {
              crearNodo(infoNodo: $infoNodo) {
                nombre
                descripcion
                id
                expertos
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
                centroMasa {
                  x
                  y
                }
                angulo
                stuck
                puntaje
                vinculos {
                  idRef
                  rol
                  tipo
                }
              }
            }
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

          //this.$router.push("/nodoConocimiento/"+crearNodo.id);
        })
        .catch((error) => {
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
    desplazarVista(deltaX, deltaY) {
      this.$set(
        this.centroVistaDecimal,
        "x",
        Math.round(this.centroVistaDecimal.x - deltaX / this.factorZoom)
      );
      this.$set(
        this.centroVistaDecimal,
        "y",
        Math.round(this.centroVistaDecimal.y - deltaY / this.factorZoom)
      );
      this.actualizarTrazos++;
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      this.desplazarVista(e.movementX, e.movementY);
      e.preventDefault();
      this.vistaPanned = true;

      /*this.centroVista.x -= e.movementX;
      this.centroVista.y -= e.movementY;
      */
    },
    seleccionNodo(nodo) {
      this.idNodoSeleccionado = nodo.id;
      if (!this.todosNodos.some((n) => n.id == this.idNodoSeleccionado)) {
        console.log(`No encontrado`);
        return null;
      }

      let profundidad = parseInt(this.profundidadNodosConectadosAlSeleccionado);
      let listaPorNiveles = [];
      let idNodoSel = this.idNodoSeleccionado;
      let listaCompleta = [idNodoSel];
      if (profundidad > 0) {
        for (let i = 0; i < profundidad; i++) {
          listaPorNiveles[i] = [];
        }
        ({ listaCompleta, listaPorNiveles } =
          this.encontrarNodosConectadosRecursivamente(
            idNodoSel,
            ["target", "source"],
            ["continuacion"],
            listaCompleta,
            listaPorNiveles,
            0,
            profundidad
          ));
      }
      this.nodosConectadosAlSeleccionado = {
        listaCompleta,
        listaPorNiveles,
      };
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
    encontrarNodosConectadosRecursivamente(
      idNodo,
      roles,
      tipos,
      listaCompleta,
      listaPorNiveles,
      nivel,
      profundidad
    ) {
      // Rol debe ser un array que incluye los roles validos en esta búsqueda.
      // Tipo deber ser un array que incluye todos los tipos válidos en esta búsqueda
      let nodo = this.todosNodos.find((n) => n.id == idNodo);
      for (let vinculo of nodo.vinculos) {
        if (
          this.todosNodos.some((n) => n.id == vinculo.idRef) &&
          roles.some((r) => r == vinculo.rol) &&
          tipos.some((t) => t == vinculo.tipo) &&
          !listaCompleta.some((idN) => idN == vinculo.idRef)
        ) {
          listaPorNiveles[nivel].push(vinculo.idRef);
          listaCompleta.push(vinculo.idRef);

          if (nivel + 1 < profundidad) {
            ({ listaCompleta, listaPorNiveles } =
              this.encontrarNodosConectadosRecursivamente(
                vinculo.idRef,
                roles,
                tipos,
                listaCompleta,
                listaPorNiveles,
                nivel + 1,
                profundidad
              ));
          }
        } else {
          console.log(`No`);
        }
      }
      return { listaCompleta, listaPorNiveles };
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

      const proporciones = {
        x:
          (posZoom.x - this.centroVistaDecimal.x) /
          (posContenedor.width / this.factorZoom),
        y:
          (posZoom.y - this.centroVistaDecimal.y) /
          (posContenedor.height / this.factorZoom),
      };

      const factorZoom = 0.2;
      this.zoomVista(-Math.round(e.deltaY * factorZoom), {
        x: posZoom.x,
        y: posZoom.y,
      });

      this.$set(
        this.centroVistaDecimal,
        "x",
        posZoom.x - (posContenedor.width / this.factorZoom) * proporciones.x
      );
      this.$set(
        this.centroVistaDecimal,
        "y",
        posZoom.y - (posContenedor.height / this.factorZoom) * proporciones.y
      );
    },
    hideZoomInfo: debounce(function () {
      this.showingZoomInfo = false;
    }, 1000),
  },
  watch: {
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

<style scoped>
.atlasConocimiento {
  position: relative;
  overflow: hidden;
}
#menuContextual{
  position: absolute;
  background-color: gray;
}
.botonMenuContextual{
  font-size: 12px;
  color: rgb(221, 221, 221);
  cursor:pointer;
  padding: 10px;
}
.botonMenuContextual:hover{
  background-color: rgb(68, 68, 68);
}

#canvases {
  position: absolute;
  pointer-events: none;
}
#contenedorNodos {
  position: absolute;
  width: 100%;
  height: 100%;
  user-select: none;

  pointer-events: none;
}
#buscadorNodosConocimiento {
  position: absolute;
  top: 1%;
  left: 1%;
  /* transform: translateX(-50%); */
  z-index: 1;
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
}

#simboloDescargandoNodos {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
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