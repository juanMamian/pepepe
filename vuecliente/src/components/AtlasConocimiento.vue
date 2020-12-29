<template>
  <div
    id="atlasConocimiento"
    @mousedown.left.shift="panningVista = true"
    @click="idNodoMenuCx = '-1'"
    @mousemove="panVista($event)"
    @mouseup="panningVista = false"
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
      nodoSeleccionado: { id: -1, nombre: "" },
      idNodoMenuCx: "-1",
      centroVista: {
        x: 0,
        y: 0,
      },
      actualizarTrazos: 0,
      panningVista: false,
    };
  },
  methods: {
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
      console.log(`seleccionando nodo ${nodo.nombre}`);
      this.nodoSeleccionado = JSON.parse(JSON.stringify(nodo));
    },
    async eliminarVinculo(args){
      console.log(`eliminando un vinculo entre ${args.idNodoFrom} y ${args.idNodoTo} `);
      await this.$apollo.mutate({
        mutation: gql`
          mutation($idNodoFrom:ID!, $idNodoTo:ID!){
            eliminarVinculoFromTo(idSource: $idNodoFrom, idTarget:$idNodoTo){
              errores{
                tipo
                mensaje
              }
              modificados{
                id
                vinculos{
                  idRef
                  tipo
                  rol
                }
              }

            }
          }
        `,
        variables:{
          idNodoFrom:args.idNodoFrom,
          idNodoTo:args.idNodoTo
        }
      })
    },
    async crearVinculo(args) {
      console.log(`creando un vinculo ${JSON.stringify(args)} `);
      await this.$apollo.mutate({
        mutation: gql`
        mutation($tipo:String!, $idNodoFrom:ID!, $idNodoTo:ID!){
          crearVinculo(tipo: $tipo, idSource: $idNodoFrom, idTarget: $idNodoTo){            
              errores{
                tipo
                mensaje
              }
              modificados{
              id
              vinculos{
                idRef
                rol
                tipo
              }
              }
            
          }
        }`,
        variables:{
          tipo:"continuacion",
          idNodoFrom:args.idNodoFrom,
          idNodoTo:args.idNodoTo
        }
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
}
</style>