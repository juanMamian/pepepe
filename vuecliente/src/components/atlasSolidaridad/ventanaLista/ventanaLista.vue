<template>
  <div
    class="ventanaLista"
    @mouseup.stop=""
    @mousedown.stop=""
    @touchmove.stop=""
    @touchstart.stop=""
    @touchend.stop=""
  >
    <div id="barraSuperior">
      <buscador-nodos :listaIdsNodosRelevantes="nodosSolidaridad.map(n=>n.id)"/>
      <div id="bloqueBotonesControl">
        <div id="zonaVerNodos" class="zonaControl">
          <div
            class="botonVerNodos"
            @click="verCompletados = !verCompletados"
            id="botonVerCompletados"
            :title="
              verCompletados
                ? 'Ocultar nodos completados'
                : 'Mostrar nodos completados'
            "
            :style="{
              borderColor: verCompletados ? '#858585' : 'transparent',
              opacity: verCompletados ? 1 : 0.3,
            }"
          ></div>
        </div>
        <img
          src="@/assets/iconos/equis.svg"
          alt="cerrar"
          title="Cerrar ventana de lista"
          id="botonCerrar"
          v-if="cerrable"
          @click.stop="$emit('cerrarme')"
        />
      </div>
    </div>
    <loading v-show="$apollo.queries.nodoRoot.loading || idsNodosNeedingFetchMore.includes(idNodoRoot)"/>
    <lista-nodos
      :todosNodos="nodosSolidaridad"
      class="lista"
      ref="listaNodos"
      :idNodoSeleccionado="idNodoSeleccionado"
      :verCompletados="verCompletados"
      :modoLista="modoLista"
      :idNodoRoot="idNodoRoot"
      :tipoNodoRoot="tipoNodoRoot"
      :nodoRoot="nodoRoot"
      :idsNodosNeedingFetchMore="idsNodosNeedingFetchMore"
      :indiceNodosUnder="indiceNodosUnder"
      :usuarioResponsableAmplioNodoRoot="usuarioResponsableAmplioNodoRoot"
      @nodoSeleccionado="idNodoSeleccionado = $event"
      @click.native.self="idNodoSeleccionado = null"
      @nodosRenderizados="updateInfoNodosEverRendered"
      @nodoEliminado="removeNodoFromNodosSolidaridad($event)"
      @nodoSolidaridadCreado="addNodoToNodosSolidaridad($event)"
    />
  </div>
</template>

<script>
import Loading from '../../utilidades/Loading.vue';
import { MixinAtlasSolidaridad } from '../MixinAtlasSolidaridad';
import BuscadorNodos from "./BuscadorNodos.vue";
import ListaNodos from "./ListaNodos.vue";

export default {
  components: { ListaNodos, BuscadorNodos, Loading },
  name: "VentanaLista",
  props: {    
    idNodoRoot: String,
    tipoNodoRoot:String,
    cerrable: Boolean,        
  },  
  mixins:[MixinAtlasSolidaridad],  
  data() {
    return {
      idNodoSeleccionado: null,
      listaSeleccionada: null,
      verCompletados: true,
      modoLista: "todo",      
    };
  },
  methods: {
    desplegarCascadaHaciaNodo(idNodo) {
      this.$refs.listaNodos.desplegarCascadaHaciaNodo(idNodo);
    },
    
    updateInfoNodosEverRendered(idsNodosRendered){
      const nuevos=idsNodosRendered.filter(id=>!this.infoNodosEverRendered.map(ner=>ner.id).includes(id));
      const nuevosInfos=nuevos.map(id=>{return {id, tipo:'nodoSolidaridad'}})
      this.infoNodosEverRendered.push(...nuevosInfos)
    },       
  },
  computed: {
    nodoSeleccionado() {
      if (!this.idNodoSeleccionado) return null;
      return this.todosNodos.find((n) => n.id === this.idNodoSeleccionado);
    },
    descendientesNodoSeleccionado() {
      if (!this.nodoSeleccionado) return null;
      const maxNesting = 5;
      var nesting = 0;
      var idNodosCurrentNivel = [this.nodoSeleccionado.id];
      var nodosDescendientes = [];
      while (idNodosCurrentNivel.length > 0 && nesting < maxNesting) {
        console.log(`Descendientes`);
        nesting++;
        let nodosCurrentNivel = this.todosNodos.filter((n) =>
          idNodosCurrentNivel.includes(n.id)
        );
        var requerimentos = [];
        nodosCurrentNivel.forEach((currentNodo) => {
          currentNodo.vinculos
            .filter((v) => v.tipo === "requiere")
            .map((v) => v.idRef)
            .forEach((idV) => {
              let indexV = requerimentos.indexOf(idV);
              if (indexV === -1) {
                requerimentos.push(idV);
              }
            });
        });
        nodosDescendientes = nodosDescendientes.concat(requerimentos);
        idNodosCurrentNivel = requerimentos;
      }
      return nodosDescendientes;
    },   
    usuarioResponsableAmplioNodoRoot(){
      if (!this.usuarioLogeado || !this.usuario || !this.usuario.id || !this.nodoRoot)
        return false;
      return (
        this.nodoRoot.responsablesAmplio &&
        this.nodoRoot.responsablesAmplio.includes(this.usuario.id)
      );
    }
  },
  watch:{
    nodoRoot(){
      if(this.nodoRoot){
        var nuevoInfo={
          id:this.nodoRoot.id,
          tipo: this.nodoRoot.__typename.charAt(0).toLowerCase()+ this.nodoRoot.__typename.slice(1)
        }
        this.infoNodosEverRendered.push(nuevoInfo)
      }
    }
  }
  
};
</script>

<style scoped>
.ventanaLista {
  top: 0;
  overflow-y: hidden;
  z-index: 50;
  min-height: 100px;
  min-width: 50%;
  max-height: 100%;

  font-family: Poppins, Helvetica, Arial, sans-serif;
  display: grid;
  grid-template-rows: auto 1fr;
  row-gap: 0px;
}
#buscadorNodos {
  z-index: 1;
}
#barraSuperior {
  display: flex;
  padding-top: 20px;
  box-sizing: border-box;
  align-items:flex-start;
  min-height: 60px;
}
#bloqueBotonesControl{
  margin-left: auto;
  margin-top: 0px;
  display: flex;
  align-items: center;
}
#botonCerrar {
  margin-right: 15px;
  margin-left: 5px;
  opacity: 0.7;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
#botonCerrar:hover {
  opacity: 1;
}

.zonaControl {
  margin-right: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
}

.botonVerNodos {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin: 0px 10px;
  cursor: pointer;
  border-style: solid;
  border-width: 1px;
}

#botonVerCompletados {
  background-color: var(--atlasVerde);
}
</style>