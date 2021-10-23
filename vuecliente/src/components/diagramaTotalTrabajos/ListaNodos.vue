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
        :id="'nodoEnLista'+nodoPrimerNivel.id"
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
    nodosTodos(){
      return JSON.parse(JSON.stringify(this.todosNodos))
    },
    nodosPrimerNivel() {
      return this.nodosNested.filter(
        (n) => !n.nodoParent || !n.nodoParent.idNodo
      );
    },
    nodosNested() {
      return this.nodosTodos.map((nodo) => {
        nodo.children = this.nodosTodos.filter(
          (n) => n.nodoParent && n.nodoParent.idNodo === nodo.id
        );
        return nodo;
      });
    },
  },
  watch:{
    idNodoSeleccionado(){
      if(!this.idNodoSeleccionado || !this.busqueda || this.busqueda.length<2)return;
      this.desplegarCascadaHaciaNodo(this.idNodoSeleccionado);
      this.busqueda=null;
      this.$nextTick(()=>{
        const domSeleccionado=document.getElementById('nodoEnLista'+this.idNodoSeleccionado);
        console.log(`Seleccionado: ${domSeleccionado}`);
        const topSeleccionado=domSeleccionado.getBoundingClientRect().top-document.getElementById('laListaNodos').getBoundingClientRect().top;
        document.getElementById("laListaNodos").scrollTop=topSeleccionado;
      })
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
#zonaBuscar{
  display: flex;
  margin-bottom: 5px;
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