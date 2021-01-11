<template>
  <div
    id="atlasConocimiento"
    @mousedown.left.shift.stop="panningVista = true"
    @click="idNodoMenuCx = '-1'"
    @click.exact="idNodoSeleccionado = '-1'"
    @mousemove="panVista($event)"
    @mouseup="panningVista = false"
    @dblclick.ctrl.shift.self.stop="crearNodo"
  >
    <div id="contenedorNodos">
      <canvases
        :todosNodos="todosNodos"
        :nodoSeleccionado="nodoSeleccionado"
        :centroVista="centroVista"
      />

      <nodo-conocimiento
        :nodoSeleccionado="nodoSeleccionado"
        :todosNodos="todosNodos"
        :idNodoMenuCx="idNodoMenuCx"
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
export default {
  components: { NodoConocimiento, Canvases },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: {
      query: gql`
        query {
          todosNodos {
            nombre
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
      result: function () {
        this.dibujarVinculosGrises();
      },
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
    };
  },
  computed: {
    nodoSeleccionado: function () {
      if(!this.todosNodos){
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
  },
  methods: {
    cambiarCoordsManualesNodo(idNodo, coordsManuales) {
      //Update optimista:
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
        })
        .then((data) => {
          console.log(`quitando el objeto del array. ${data}`);
        });
    },
    crearNodo(e) {
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
              modificados {
                nombre
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
          }
        `,
        variables: {
          infoNodo,
        },
      });
    },
    descargarCentroVista() {
      let dis = this;
      this.$apollo
        .query({
          query: gql`
            query($idUsuario: ID!) {
              publicUsuario(idUsuario: $idUsuario) {
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
        fetchPolicy:"network-only",          
        })
        .then(function ({ data }) {
          console.log(`respuesta: ${JSON.stringify(data)} `);
          let coords = data.usuario.atlas.centroVista;
          dis.$set(dis.centroVista, "x", coords.x);
          dis.$set(dis.centroVista, "y", coords.y);
        })
        .catch(function (error) {
          console.log(`error: ${error}`);
        });
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      e.preventDefault();
      this.$set(this.centroVista, "x", this.centroVista.x - e.movementX);
      this.$set(this.centroVista, "y", this.centroVista.y - e.movementY);
      this.actualizarTrazos++;
      /*this.centroVista.x -= e.movementX;
      this.centroVista.y -= e.movementY;
      */
    },
    seleccionNodo(nodo) {
      this.idNodoSeleccionado = nodo.id;
      if (!this.todosNodos.some((n) => n.id == this.idNodoSeleccionado)) {
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
    route:function(to){
      console.log(`cambio de navegación a ${to.path}`);
      //this.descargarCentroVista();
    }
  },
  mounted() {
    this.descargarCentroVista();
  },
  beforeRouteLeave(_, __, next) {
    console.log(
      `enviando nuevo centroVista para el usuario ${
        this.$store.state.usuario.id
      }. Centro vista: ${JSON.stringify(this.centroVista)}`
    );
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
#atlasConocimiento {
  position: relative;
  overflow: hidden;
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
</style>