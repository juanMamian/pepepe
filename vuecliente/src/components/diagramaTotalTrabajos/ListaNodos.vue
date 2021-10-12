<template>
  <div
    id="listaNodos"
    @mouseup.stop=""
    @mousedown.stop=""
    @touchmove.stop=""
    @touchstart.stop=""
    @touchend.stop=""
  >
    <div id="zonaBuscar">
      <input type="text" v-model="busqueda" />
      <img
        src="@/assets/iconos/search.png"
        id="botonBuscar"
        alt="Buscar"
        width="20px"
      />
    </div>
    <div id="laListaNodos">
      <nodo-vista-lista
        v-for="nodoPrimerNivel of nodosPrimerNivel"
        ref="nodosEnLista"
        :key="nodoPrimerNivel.id"
        :esteNodo="nodoPrimerNivel"
        :busqueda="busqueda"
        :idNodoSeleccionado="idNodoSeleccionado"
        @centrarEnNodo="$emit('centrarEnNodo', $event)"
        @nodoSeleccionado="$emit('nodoSeleccionado', $event)"
      />
    </div>
  </div>
</template>

<script>
import NodoVistaLista from "./NodoVistaLista.vue";
export default {
  components: { NodoVistaLista },
  name: "ListaNodos",
  props: {
    idNodoSeleccionado:String,
    todosNodos: Array,
  },
  data() {
    return {
      busqueda: null,
    };
  },
  methods: {
    guardarChildren(nodo) {
      nodo.children = this.nodosTodos.filter(
        (n) => n.nodoParent && n.nodoParent.id === nodo.id
      );
    },
    desplegarCascadaHaciaNodo(idNodoTarget){
      this.$refs.nodosEnLista.forEach(nodo=>{
        nodo.desplegarIfTargetChild(idNodoTarget);
      })
    }
  },
  computed: {
    nodosPrimerNivel() {
      return this.nodosNested.filter(
        (n) => !n.nodoParent || !n.nodoParent.idNodo
      );
    },
    nodosTodos(){
      return this.todosNodos.map(n=>{
        return JSON.parse(JSON.stringify(n));
      })
    },
    nodosNested() {
      return this.nodosTodos.map((nodo) => {
        var nuevoNodo=JSON.parse(JSON.stringify(nodo));
        nuevoNodo.children = this.nodosTodos.filter(
          (n) => n.nodoParent && n.nodoParent.idNodo === nodo.id
        );

        return nuevoNodo;
        // return {
        //   ...nodo,
        //   children:this.todosNodos.filter(
        //   (n) => n.nodoParent && n.nodoParent.idNodo === nodo.id)
        // }
      });
    },
  },
  watch:{
    idNodoSeleccionado(){
      if(!this.idNodoSeleccionado || !this.busqueda || this.busqueda.length<2)return;
      this.desplegarCascadaHaciaNodo(this.idNodoSeleccionado);
      this.busqueda=null;
    }
  }
};
</script>

<style scoped>
#listaNodos {
  top: 1%;
  left: 0%;
  background-color: rgba(95, 158, 160, 0.788);
  border: 2px solid rgb(22, 88, 90);
  position: relative;  
  border-radius: 10px;
  padding: 10px;
  
}
#botonAbrir {
  cursor: pointer;
  opacity: 0.5;
}
#botonAbrir:hover {
  opacity: 1;
}
#zonaPlegable {
  background-color: rgba(95, 158, 160, 0.788);
  border: 2px solid rgb(22, 88, 90);
  position: relative;
  height: 100%;
  border-radius: 10px;
  padding: 10px;
}
#botonBuscar {
  cursor: pointer;
  border-radius: 50%;
}
#botonBuscar:hover {
  background-color: rgba(128, 128, 128, 0.356);
}
#laListaNodos {
  height: 85%;
  padding: 15px 0px;
  overflow-y: scroll;
}
</style>