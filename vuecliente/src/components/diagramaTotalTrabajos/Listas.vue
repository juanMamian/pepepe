<template>
  <div
    id="listas"
    @mouseup.stop=""
    @mousedown.stop=""
    @touchmove.stop=""
    @touchstart.stop=""
    @touchend.stop=""
  >
    <div id="barraSelectoresListas">
      <img
        src="@/assets/iconos/lista.png"
        :class="{
          selectorSeleccionado: listaSeleccionada === 'nodos' && abierta,
        }"
        title="Todos los nodos"
        alt="Nodos"
        class="selectorLista"
        id="selectorListaNodos"
        @click="
          abierta = true;
          listaSeleccionada = 'nodos';
        "
      />
      <img
        src="@/assets/iconos/material.png"
        :class="{ selectorSeleccionado: listaSeleccionada === 'materiales' }"
        title="Todos los materiales"
        alt="Materiales"
        class="selectorLista"
        id="selectorListaMateriales"
        v-show="abierta"
        @click="listaSeleccionada = 'materiales'"
      />
    </div>
    <div id="zonaListas" @click.self.stop="idNodoSeleccionado=null">
      <lista-nodos
        :todosNodos="todosNodos"
        class="lista"
        v-show="listaSeleccionada === 'nodos' && abierta"
        :idNodoSeleccionado="idNodoSeleccionado"
        @centrarEnNodo="$emit('centrarEnNodo', $event)"
        @nodoSeleccionado="idNodoSeleccionado = $event===idNodoSeleccionado?null: $event"
        @click.native.self="idNodoSeleccionado=null"
      />
      <span id="tituloListaMateriales">Materiales {{nodoSeleccionado?' relevantes para el nodo '+nodoSeleccionado.nombre:''}}</span>
      <lista-materiales
        v-show="listaSeleccionada === 'materiales' && abierta"
        :idNodoSeleccionado="idNodoSeleccionado"
        :descendientesNodoSeleccionado="descendientesNodoSeleccionado"
        @centrarEnNodo="$emit('centrarEnNodo', $event)"
      />
    </div>
  </div>
</template>

<script>
import ListaMateriales from "./ListaMateriales.vue";
import ListaNodos from "./ListaNodos.vue";
export default {
  components: { ListaNodos, ListaMateriales },
  name: "Listas",
  props: {
    todosNodos: Array,
    cerrar: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      abierta: false,
      listaSeleccionada: null,

      idNodoSeleccionado: null,
    };
  },
  computed:{
    nodoSeleccionado(){
      if(!this.idNodoSeleccionado)return null
      return this.todosNodos.find(n=>n.id===this.idNodoSeleccionado)
    },
    descendientesNodoSeleccionado(){
      if(!this.nodoSeleccionado)return null;
      const maxNesting=5;
      var nesting=0;
      var idNodosCurrentNivel=[this.nodoSeleccionado.id];
      var nodosDescendientes=[];
      while(idNodosCurrentNivel.length>0 && nesting<maxNesting){
        nesting++;
        let nodosCurrentNivel=this.todosNodos.filter(n=>idNodosCurrentNivel.includes(n.id));        
        var requerimentos=[];
        nodosCurrentNivel.forEach(currentNodo=>{
          currentNodo.vinculos.filter(v=>v.tipo==='requiere').map(v=>v.idRef).forEach(idV=>{
            let indexV=requerimentos.indexOf(idV);
            if(indexV===-1){
              requerimentos.push(idV);
            }
          })
        });
        nodosDescendientes=nodosDescendientes.concat(requerimentos);
        idNodosCurrentNivel=requerimentos;        
      }
      return nodosDescendientes;
    }
  },
  watch: {
    cerrar() {
      this.abierta = false;
    },
  },
};
</script>

<style scoped>
#listas {
  position: absolute;
  top: 5px;
  left: 5px;
  overflow-y: hidden;
  z-index: 100;
  height: 80%;
  padding: 10px;
}
#barraSelectoresListas {
  display: flex;
}
.selectorLista {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 5px;
  opacity: 0.5;
  margin: 3px 4px;
}
.selectorLista:hover {
  opacity: 1;
  background-color: rgba(128, 128, 128, 0.39);
}
.selectorSeleccionado {
  opacity: 1;
  background-color: rgba(95, 158, 160, 0.719);
}
.selectorSeleccionado:hover {
  background-color: rgba(54, 130, 133, 0.719);
}
#zonaListas{
  height: 85%;
}
#tituloListaMateriales{
  font-size: 13px;
  color: rgb(82, 81, 81);
}
.lista {
  height: 100%;
}

</style>