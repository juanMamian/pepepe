<template>
  <div
    class="atlasConocimiento"
    @mousedown.left.exact.stop="panningVista = true"
    @click="idNodoMenuCx = '-1'; cerrarBusqueda++"
    @click.exact="idNodoSeleccionado = '-1'"
    @mousemove="panVista($event)"
    @mouseup="panningVista = false"
    @dblclick.ctrl.shift.self.stop="crearNodo"
    @touchmove.prevent.stop="movimientoMobile"
    @touchstart="iniciaMovimientoTouch"
  >
    <buscador-nodos-conocimiento @nodoSeleccionado="centrarEnNodo" ref="buscadorNodos" :cerrarBusqueda="cerrarBusqueda"/>
    <div id="contenedorNodos">
      <canvases
        :todosNodos="todosNodos"
        :nodoSeleccionado="nodoSeleccionado"
        :centroVista="centroVista"
        v-if="todosNodos.length>1"
      />

      <nodo-conocimiento
        :nodoSeleccionado="nodoSeleccionado"
        :todosNodos="todosNodos"
        :idNodoMenuCx="idNodoMenuCx"
        :usuarioAdministradorAtlas="usuarioAdministradorAtlas"
        :key="nodo.id"
        v-for="nodo of todosNodos"
        :esteNodo="nodo"
        :centroVista="centroVista"
        @click.native.stop="seleccionNodo(nodo)"
        @click.right.native.prevent="idNodoMenuCx = nodo.id"
        @creacionVinculo="crearVinculo"
        @eliminacionVinculo="eliminarVinculo"
        @cambioDePosicionManual="cambiarCoordsManualesNodo"
        @eliminar="eliminarNodo"        
      />
    </div>
  </div>
</template>

<script>


import gql from "graphql-tag";
import NodoConocimiento from "./atlasConocimiento/NodoConocimiento.vue";
import Canvases from "./atlasConocimiento/Canvases.vue";
import BuscadorNodosConocimiento from './atlasConocimiento/BuscadorNodosConocimiento.vue';

const QUERY_NODOS=gql`
        query {
          todosNodos {
            nombre
            descripcion
            id
            coordsManuales {
              x
              y
            }
            vinculos {
              idRef
              rol
              tipo
            }
          }
        }
      `

export default {
  components: { NodoConocimiento, Canvases, BuscadorNodosConocimiento },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: {
      query: QUERY_NODOS,
      result: function () {
        this.dibujarVinculosGrises();
      },
      fetchPolicy:"cache-and-network"
    },
  },
  data() {
    return {
      todosNodos: [],
      idNodoSeleccionado: "-1",
      idNodoMenuCx: "-1",
      centroVista: {
        x: 0,
        y: 0,
      },
      actualizarTrazos: 0,
      panningVista: false,
      nodosConectadosAlSeleccionado: {
        listaCompleta: [],
        listaPorNiveles: [],
      },
      profundidadNodosConectadosAlSeleccionado: 1,
      actualizarVinculosGrises: 0,

      ultimoTouchX:0,
      ultimoTouchY:0,

      cerrarBusqueda:0,
    };
  },
  computed: {
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
      return (this.$store.state.usuario.permisos.includes("atlasAdministrador")) ? true : false
    },
  },
  methods: {
    centrarEnNodo(n){
      console.log(`Centrando en ${JSON.stringify(n)}`);
      
      this.$set(this.centroVista, "x", n.coordsManuales.x - (this.$el.offsetWidth/2));
      this.$set(this.centroVista, "y", n.coordsManuales.y - (this.$el.offsetHeight/2));
      this.seleccionNodo(n);
      //this.centroVista=e;
    },
    iniciaMovimientoTouch(e){
      this.ultimoTouchX=e.changedTouches[0].clientX;
      this.ultimoTouchY=e.changedTouches[0].clientY;

    },
    movimientoMobile(e){
      const deltaX=e.changedTouches[0].clientX - this.ultimoTouchX;
      const deltaY=e.changedTouches[0].clientY - this.ultimoTouchY;
      this.ultimoTouchX=e.changedTouches[0].clientX;
      this.ultimoTouchY=e.changedTouches[0].clientY;

      this.desplazarVista(deltaX, deltaY);
    },
    cambiarCoordsManualesNodo(idNodo, coordsManuales) {
      if(!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas){
        console.log(`No autorizado`);
        return
      }
      this.todosNodos[
        this.todosNodos.findIndex((n) => n.id == idNodo)
      ].coordsManuales = coordsManuales;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: String, $coordsManuales: CoordsInput) {
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
                }
              }
            }
          `,
          variables: {
            idNodo,
            coordsManuales,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log(`Error: ${error}`);
        });
    },
    eliminarNodo(idNodo) {
      if(!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas){
        console.log(`No autorizado`);
        return
      }
      if(!confirm("¿Seguro de que quieres eliminar este nodo?"))return
      console.log(`enviando mutacion de eliminar nodo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!) {
              eliminarNodo(idNodo: $idNodo)
            }
          `,
          variables: {
            idNodo,
          },
          update(store, {data:{eliminarNodo}}){
            if(!eliminarNodo){
              console.log(`Nodo no fue eliminado`);
              return
            }
            const cache=store.readQuery({
              query: QUERY_NODOS,            
            });
            var nuevoCache=JSON.parse(JSON.stringify(cache));
            const indexN=nuevoCache.todosNodos.findIndex(n=>n.id==idNodo);
            if(indexN>-1){
              nuevoCache.todosNodos.splice(indexN, 1);
              store.writeQuery({
                query:QUERY_NODOS,
                data:nuevoCache              
              });
            }
            else{
              console.log(`El nodo no estaba presente`);              
            }
          }
        })
        .then((data) => {
          console.log(`quitando el objeto del array. ${data}`);
        });
    },
    crearNodo(e) {
      if(!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas){
        console.log(`Error usuario no autorizado`);
        return
      }
      console.log(`enviando una mutación de crear nodo`);
      
      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();
      let nuevoTop = Math.round(
        e.clientY - posContenedor.top + this.centroVista.y
      );
      let nuevoLeft = Math.round(
        e.clientX - posContenedor.left + this.centroVista.x
      );

      let infoNodo = {
        coordsManuales: {
          x: nuevoLeft,
          y: nuevoTop,
        },
      };
      console.log(`en las coordenadas: ${nuevoLeft}, ${nuevoTop} `);
      this.$apollo.mutate({
        mutation: gql`
          mutation($infoNodo: NodoConocimientoInput) {
            crearNodo(infoNodo: $infoNodo) {
              nombre
              descripcion
              id
              coordsManuales {
                x
                y
              }
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
        update(store, {data:{crearNodo}}){
          const cache=store.readQuery({
            query:QUERY_NODOS,            
          });
          //console.log(`Cache: ${JSON.stringify(cache)}`);
          var nuevoCache=JSON.parse(JSON.stringify(cache));
          let losNodos=nuevoCache.todosNodos;
          losNodos.push(crearNodo);
          store.writeQuery({
            query: QUERY_NODOS,
            data: nuevoCache,
          });
        }
      }).then(({data:{crearNodo}})=>{ 
        console.log(`Creado ${crearNodo.id}`);
        //this.$router.push("/nodoConocimiento/"+crearNodo.id);
      }).catch((error)=>{
        console.log(`Error. E: ${error}`);
      });
    },
    descargarCentroVista() {
      let dis = this;
      this.$apollo
        .query({
          query: gql`
            query{
              yo{
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
        .then(function ({ data:{yo} }) {          
          let coords = yo.atlas.centroVista;
          dis.$set(dis.centroVista, "x", coords.x);
          dis.$set(dis.centroVista, "y", coords.y);
          dis.$store.commit("setCentroVistaAtlas", coords);
        })
        .catch(function (error) {
          console.log(`error fetching centro vista: ${error}`);
        });
    },
    desplazarVista(deltaX, deltaY){
      this.$set(this.centroVista, "x", this.centroVista.x - deltaX);
      this.$set(this.centroVista, "y", this.centroVista.y - deltaY);
      this.actualizarTrazos++;
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      this.desplazarVista(e.movementX, e.movementY)
      e.preventDefault();
      
      /*this.centroVista.x -= e.movementX;
      this.centroVista.y -= e.movementY;
      */
    },
    seleccionNodo(nodo) {
      console.log(`Seleccionando nodo ${JSON.stringify(nodo)}`);
      this.idNodoSeleccionado = nodo.id;
      console.log(`idNodoSeleccionado: ${this.idNodoSeleccionado}`);
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
        ({
          listaCompleta,
          listaPorNiveles,
        } = this.encontrarNodosConectadosRecursivamente(
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
      if(!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas){
        console.log(`No autorizado`);
        return;
      }
      console.log(
        `eliminando un vinculo entre ${args.idNodoFrom} y ${args.idNodoTo} `
      );
      await this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodoFrom: ID!, $idNodoTo: ID!) {
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
      if(!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas){
        console.log(`No autorizado`);
        return;
      }
      console.log(`creando un vinculo ${JSON.stringify(args)} `);
      await this.$apollo
        .mutate({
          mutation: gql`
            mutation($tipo: String!, $idNodoFrom: ID!, $idNodoTo: ID!) {
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
            ({
              listaCompleta,
              listaPorNiveles,
            } = this.encontrarNodosConectadosRecursivamente(
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
  },
  watch: {
    nodoSeleccionado: function () {
      this.actualizarTrazos++;
    },
    route: function (to) {
      console.log(`cambio de navegación a ${to.path}`);
    },
  },
  mounted() {
    if (!this.usuario.atlas || !this.usuario.atlas.centroVista) { 
      console.log(`No había info de centro vista en la store. Descargando`);
      this.descargarCentroVista();
      return
    }
    this.$set(this.centroVista, "x", this.usuario.atlas.centroVista.x);
    this.$set(this.centroVista, "y", this.usuario.atlas.centroVista.y);
  },
  beforeRouteLeave(_, __, next) {
    console.log(
      `enviando nuevo centroVista para el usuario ${
        this.usuario.id
      }. Centro vista: ${JSON.stringify(this.centroVista)}`
    );
    this.$store.commit("setCentroVistaAtlas", this.centroVista);

    this.$apollo
      .mutate({
        mutation: gql`
          mutation($idUsuario: ID, $centroVista: CoordsInput) {
            setCentroVista(idUsuario: $idUsuario, centroVista: $centroVista)
          }
        `,
        variables: {
          idUsuario: this.$store.state.usuario.id,
          centroVista: this.centroVista,
        },
      })
      .then(function () {
        next();
      })
      .catch(function (error) {
        console.log(`error: ${error}`);
        next();
      });
  },
};
</script>

<style scoped>
.atlasConocimiento {
  position: relative;
  overflow: scroll;
}
#canvases {
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
}
#contenedorNodos {
  position: absolute;
  width: 100%;
  height: 100%;
  user-select: none;
  overflow: hidden;
  pointer-events: none;
}
#buscadorNodosConocimiento{
  position: absolute;
  top: 1%;
  left:1%;
  /* transform: translateX(-50%); */
  z-index: 1;
}
</style>