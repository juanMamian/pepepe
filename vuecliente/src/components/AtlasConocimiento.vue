<template>
  <div
    id="atlasConocimiento"
    @mousedown.left.shift="panningVista = true"
    @click="idNodoMenuCx = '-1'"
    @mousemove="panVista($event)"
    @mouseup="panningVista = false"
    @dblclick.ctrl.shift.self.stop="crearNodo"
  >
    <canvas-vinculos
      :nodoSeleccionado="nodoSeleccionado"
      :todosNodos="todosNodos"
      :centroVista="centroVista"
      :actualizar="actualizarTrazos"
    />
    <div id="contenedorNodos">
      <nodo-conocimiento
        :nodoSeleccionado="nodoSeleccionado"
        :idNodoMenuCx="idNodoMenuCx"
        :key="nodo.id"
        v-for="nodo of todosNodos"
        :esteNodo="nodo"
        :centroVista="centroVista"
        @click.native="seleccionNodo(nodo)"
        @click.right.native.prevent="idNodoMenuCx = nodo.id"
        @creacionVinculo="crearVinculo"
        @eliminacionVinculo="eliminarVinculo"
        @edicionNombreNodo="editarNombreNodo"
        @cambioDePosicionManual="cambiarCoordsManualesNodo"
        @eliminar="eliminarNodo"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import NodoConocimiento from "./atlasConocimiento/NodoConocimiento.vue";
import CanvasVinculos from "./atlasConocimiento/CanvasVinculos.vue";
export default {
  components: { NodoConocimiento, CanvasVinculos },
  name: "AtlasConocimiento",
  apollo: {
    todosNodos: gql`
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
    ping: gql`
      query {
        ping
      }
    `,
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
    };
  },
  computed: {
    nodoSeleccionado: function () {
      let indexSeleccionado = this.todosNodos.findIndex(
        (n) => n.id == this.idNodoSeleccionado
      );
      return this.todosNodos[indexSeleccionado];
    },
  },
  methods: {
    
    cambiarCoordsManualesNodo(idNodo, coordsManuales){
      console.log(`enviando mutacion de cambio de coordenadas manuales`);
      console.log(`Token: ${localStorage.getItem(process.env.TOKEN_KEY)}`);
      //Update optimista:
      this.todosNodos[this.todosNodos.findIndex(n=>n.id==idNodo)].coordsManuales=coordsManuales;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo: String, $coordsManuales: CoordsInput) {
            setCoordsManuales(idNodo: $idNodo, coordsManuales: $coordsManuales) {
              modificados{
                id
                coordsManuales{
                  x
                  y
                }
              }
            }
          }
        `,
        variables: {
          idNodo,
          coordsManuales
        },
      });
    },
    eliminarNodo(idNodo){
      console.log(`enviando mutacion de eliminar nodo`);
      this.$apollo.mutate({
        mutation:gql`
          mutation($idNodo:ID!){
            eliminarNodo(idNodo:$idNodo)                        
          }
        `,
        variables:{
          idNodo
        }
      }).then(data=>{
        console.log(`quitando el objeto del array. ${data}`);
      })
    },
    crearNodo(e){
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
      
      let infoNodo={
        coordsManuales:{
          x: nuevoLeft,
          y: nuevoTop
        }
      }
      console.log(`en las coordenadas: ${nuevoLeft}, ${nuevoTop} `);
      this.$apollo.mutate({
        mutation:gql`
        mutation($infoNodo: NodoConocimientoInput){
          crearNodo(infoNodo:$infoNodo){
            modificados{
              nombre
              id
              coordsManuales{
                x
                y
              }
              vinculos{
                idRef
                rol
                tipo
              }
            }
          }
        }
        `,
        variables:{
          infoNodo 
        }
      });
    },
    panVista(e) {
      if (!this.panningVista) {
        return;
      }
      e.preventDefault();
      console.log(`panning`);
      this.$set(this.centroVista, "x", this.centroVista.x - e.movementX);
      this.$set(this.centroVista, "y", this.centroVista.y - e.movementY);
      this.actualizarTrazos++;
      /*this.centroVista.x -= e.movementX;
      this.centroVista.y -= e.movementY;
      */
    },
    seleccionNodo(nodo) {
      this.idNodoSeleccionado = nodo.id;
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
    async editarNombreNodo({ idNodo, nuevoNombre }) {
      console.log(`enviando una edicion de nombre de nodo`);
      nuevoNombre = nuevoNombre.replace(/[^a-zA-Z0-9Á-ú ]/g, "");
      await this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $nuevoNombre: String!) {
              editarNombreNodo(idNodo: $idNodo, nuevoNombre: $nuevoNombre) {
                modificados {
                  id
                  nombre
                }
              }
            }
          `,
          variables: {
            idNodo: idNodo,
            nuevoNombre: nuevoNombre,
          },
        })
        .then(() => {
          console.log(`fin de la mutacion`);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
  },
  watch: {
    nodoSeleccionado: function () {
      this.actualizarTrazos++;
    },
  },
};
</script>

<style>
#atlasConocimiento {
  position: relative;
}
#canvasVinculos {
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