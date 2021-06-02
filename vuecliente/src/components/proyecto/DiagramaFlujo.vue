<template> 
  <div
    class="diagramaFlujo"
    :class="{ deshabilitado: deshabilitar }"
    id="diagramaFlujo"
    :style="[opacidad, {backgroundColor:hovered?'rgb(225, 229, 241)':'white'}]"
    @mouseenter="hovered=true"
    @mouseleave="hovered=false"
    @click.right.self.prevent="abrirMenuCx"
    @mousedown.left.self="panningVista=true"
    @mouseup.left.self="mouseUpFondo"
    @mousemove="panVista"
    
  >
    <canvas-diagrama-flujo :todosNodos="infoNodos" :style="[posicionCanvasFlechas]" :factorZoom="factorZoom" />
    <nodo-trabajo
      v-for="idTrabajo of idsTrabajos"
      :key="idTrabajo"
      :idTrabajo="idTrabajo"
      :idProyecto="idProyecto"
      :usuarioResponsableProyecto="usuarioResponsableProyecto"
      :seleccionado="idNodoSeleccionado == idTrabajo"
      :posDummy="posDummy"
      :menuCx="idNodoClickDerecho === idTrabajo"
      :idNodoSeleccionado="idNodoSeleccionado"
      :centroVista="centroVista"
      :factorZoom="Number(factorZoom.toFixed(2))"
      @click.native="
        idNodoSeleccionado = idTrabajo;
        tipoNodoSeleccionado = 'trabajo';
      "
      @dblclick.native="$emit('nodoAbierto', idTrabajo)"
      @meAbrieron="$emit('nodoAbierto', idTrabajo)"            
      @miInfo="actualizarInfoTrabajos(idTrabajo, $event)"
      @crearRequerimento="crearRequerimento('trabajo', $event)"
      @eliminarVinculo="eliminarVinculo('trabajo', $event)"
      @click.right.native.prevent="idNodoClickDerecho = idTrabajo"
    />
    <nodo-objetivo
      v-for="objetivo of objetivos"
      :key="objetivo.id"
      :idProyecto="idProyecto"
      :esteObjetivo="objetivo"
      :usuarioResponsableProyecto="usuarioResponsableProyecto"
      :seleccionado="idNodoSeleccionado == objetivo.id"
      :idNodoSeleccionado="idNodoSeleccionado"
      :posDummy="posDummy"
      :menuCx="idNodoClickDerecho === objetivo.id"
      :centroVista="centroVista"
      :factorZoom="factorZoom"
      @click.native="
        idNodoSeleccionado = objetivo.id;
        tipoNodoSeleccionado = 'objetivo';
      "      
      @dblclick.native="$emit('nodoAbierto', objetivo.id)"
      @meAbrieron="$emit('nodoAbierto', objetivo.id)"      
      @crearRequerimento="crearRequerimento('objetivo', $event)"
      @eliminarVinculo="eliminarVinculo('objetivo', $event)"
      @click.right.native.prevent.stop="idNodoClickDerecho = objetivo.id"
    />        

    <div id="menuCx" :style="posMenuCx" v-show="mostrandoMenuCx">
      <div class="itemMenuCx" @click="crearTrabajoAqui">Crear trabajo aquí</div>
      <div class="itemMenuCx" @click="crearObjetivoAqui">
        Crear objetivo aquí
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import CanvasDiagramaFlujo from "./CanvasDiagramaFlujo.vue";
import NodoObjetivo from "./NodoObjetivo.vue";
import NodoTrabajo from "./NodoTrabajo.vue";

export default {
  components: { NodoObjetivo, NodoTrabajo, CanvasDiagramaFlujo },
  name: "DiagramaFlujo",
  props: {
    idsTrabajos: Array,
    objetivos: Array,
    idProyecto: String,
    usuarioResponsableProyecto: Boolean,
    activo: Boolean,
    deshabilitar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      posicionMenuCx: {
        x: 0,
        y: 0,
      },
      mostrandoMenuCx: false,
      idNodoSeleccionado: null,
      tipoNodoSeleccionado: null,
      posDummy: {
        x: 300,
        y: 300,
      },
      infoTrabajos: [],
      idNodoClickDerecho: null,

      centroVistaDecimal:{
        x:0,
        y:0
      },      

      hovered:false,

      zoom:100,
      maxZoom:200,
      minZoom:50,
    };
  },
  computed: {
    posMenuCx() {
      return {
        top: this.posicionMenuCx.y + "px",
        left: this.posicionMenuCx.x + "px",
      };
    },
    opacidad() {
      return {
        opacity: this.activo ? 1 : 0.4,
      };
    },
    infoObjetivos() {
      return this.objetivos.map((objetivo) => {
        return {
          id: objetivo.id,
          posicion: objetivo.diagramaProyecto.posicion,
          vinculos: objetivo.vinculos,
        };
      });
    },
    infoNodos() {
      return this.infoObjetivos.concat(this.infoTrabajos);
    },
    posicionCanvasFlechas(){
      return {
        top: Math.round(-this.centroVista.y*this.factorZoom)+"px",
        left: Math.round(-this.centroVista.x*this.factorZoom)+"px"
      }
    },
    centroVista(){
      return {
        x: Math.round(this.centroVistaDecimal.x),
        y: Math.round(this.centroVistaDecimal.y),
      }
    },
    factorZoom(){
      return Number((this.zoom/100).toFixed(2));
    }
  },
  methods: {
    abrirMenuCx(e) {
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();
      this.$set(
        this.posicionMenuCx,
        "x",
        Math.round(e.clientX - posContenedor.left + contenedor.scrollLeft)
      );
      this.$set(
        this.posicionMenuCx,
        "y",
        Math.round(e.clientY - posContenedor.top + contenedor.scrollTop)
      );

      this.mostrandoMenuCx = true;
    },
    crearTrabajoAqui(e) {
      var posicion = {
        x: 0,
        y: 0,
      };

      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();      

      posicion.x = Math.round(
        ((e.clientX - posContenedor.left)/this.factorZoom)+this.centroVista.x                
      );
      posicion.y = Math.round(
        ((e.clientY - posContenedor.top)/this.factorZoom)+this.centroVista.y
      );
      this.mostrandoMenuCx=false;
      this.$emit("crearTrabajoEnPosicion", posicion);
    },
    crearObjetivoAqui(e) {
      var posicion = {
        x: 0,
        y: 0,
      };

      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();
      posicion.x = Math.round(
        e.clientX + this.centroVista.x - posContenedor.left 
      );
      posicion.y = Math.round(
        e.clientY + this.centroVista.y - posContenedor.top 
      );
      this.mostrandoMenuCx=false;
      this.$emit("crearObjetivoEnPosicion", posicion);
    },   
    actualizarInfoTrabajos(idTrabajo, info) {
      const indexT = this.infoTrabajos.findIndex((t) => t.id === idTrabajo);
      if (indexT > -1) {
        this.infoTrabajos.splice(indexT, 1);
      }
      this.infoTrabajos.push(info);
    },
    crearRequerimento(tipoNodoRequerido, { idNodoRequiere, idNodoRequerido }) {
      console.log(
        `Preparando mutación para setear que ${idNodoRequiere} requiere a ${idNodoRequerido} de tipo ${tipoNodoRequerido}`
      );
      const tipoNodoRequiere = this.tipoNodoSeleccionado;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idNodoRequiere: ID!
              $idNodoRequerido: ID!
              $tipoNodoRequiere: String!
              $tipoNodoRequerido: String!
            ) {
              crearRequerimentoEntreNodosProyecto(
                idProyecto: $idProyecto
                idNodoRequiere: $idNodoRequiere
                idNodoRequerido: $idNodoRequerido
                tipoNodoRequiere: $tipoNodoRequiere
                tipoNodoRequerido: $tipoNodoRequerido
              ) {
                nodo {
                  ... on Objetivo {
                    id
                    vinculos {
                      idRef
                      tipoRef
                      tipo
                    }
                  }
                  ... on Trabajo {
                    id
                    vinculos {
                      idRef
                      tipoRef
                      tipo
                    }
                  }
                }
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idNodoRequiere,
            idNodoRequerido,
            tipoNodoRequiere,
            tipoNodoRequerido,
          },
        })
        .then(({ data: { crearRequerimentoEntreNodosProyecto } }) => {
          console.log(
            `Requerimento creado: ${JSON.stringify(
              crearRequerimentoEntreNodosProyecto
            )}`
          );
        })
        .catch((error) => {
          console.log(`Error`, error.message);
        });
    },
    eliminarVinculo(tipoNodoRequerido, { idNodoRequiere, idNodoRequerido }) {
      console.log(
        `Preparando mutación para setear que ${idNodoRequiere} ya no está vinculado a ${idNodoRequerido} de tipo ${tipoNodoRequerido}`
      );
      const tipoNodoRequiere = this.tipoNodoSeleccionado;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idNodoRequiere: ID!
              $idNodoRequerido: ID!
              $tipoNodoRequiere: String!
              $tipoNodoRequerido: String!
            ) {
              desvincularNodosProyecto(
                idProyecto: $idProyecto
                idNodoRequiere: $idNodoRequiere
                idNodoRequerido: $idNodoRequerido
                tipoNodoRequiere: $tipoNodoRequiere
                tipoNodoRequerido: $tipoNodoRequerido
              ) {
                nodo {
                  ... on Objetivo {
                    id
                    vinculos {
                      idRef
                      tipoRef
                      tipo
                    }
                  }
                  ... on Trabajo {
                    id
                    vinculos {
                      idRef
                      tipoRef
                      tipo
                    }
                  }
                }
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idNodoRequiere,
            idNodoRequerido,
            tipoNodoRequiere,
            tipoNodoRequerido,
          },
        })
        .then(() => {
          console.log(`Vinculo eliminado`);
        })
        .catch((error) => {
          console.log(`Error`, error.message);
        });
    },  
    desplazarVista(deltaX, deltaY) {
      this.$set(this.centroVistaDecimal, "x",this.centroVistaDecimal.x - deltaX);
      this.$set(this.centroVistaDecimal, "y",this.centroVistaDecimal.y - deltaY);
      //this.actualizarTrazos++;
    },
    panVista(e){
      if(!this.panningVista){
        return
      }      
      this.desplazarVista((e.movementX/this.factorZoom), (e.movementY/this.factorZoom));
      e.preventDefault();
      this.vistaPanned = true;
    },
    mouseUpFondo(){
      if(!this.vistaPanned){    
        this.idNodoSeleccionado = null;
        this.mostrandoMenuCx = false;
        this.idNodoClickDerecho = null;
      }
      this.vistaPanned=false;
      this.panningVista=false;
    },
    zoomVista(e){
      if(!this.hovered || !e.ctrlKey){
        return
      }
      e.preventDefault();      
      
      var contenedor = this.$el;
      let posContenedor = contenedor.getBoundingClientRect();

      const proporciones={
        x: (e.clientX-posContenedor.left)/posContenedor.width,
        y: (e.clientY-posContenedor.top)/posContenedor.height,
      }

      const posZoom={
        x: Math.round((e.clientX-posContenedor.left)/this.factorZoom)+this.centroVista.x,
        y: Math.round((e.clientY-posContenedor.top)/this.factorZoom)+this.centroVista.y
      }


      const factorZoom=0.2;
      var nuevoZoom=this.zoom-Math.round(e.deltaY*factorZoom);
      if(nuevoZoom<this.minZoom){
        this.zoom=this.minZoom;
      }
      else if(nuevoZoom>this.maxZoom){
        this.zoom=this.maxZoom
      }
      else{
        this.zoom=nuevoZoom;
      }

      //Pan vista de acuerdo con la posición del mouse respecto del atlas                       

      this.$set(this.centroVistaDecimal, "x", posZoom.x-((posContenedor.width/this.factorZoom)*proporciones.x) );
      this.$set(this.centroVistaDecimal, "y", posZoom.y-((posContenedor.height/this.factorZoom)*proporciones.y) );

    }
  },
  mount() {
    this.$set(
      this.sizeDiagrama,
      "w",
      this.$$parent.$refs.zonaDiagramaFlujo.offsetWidth
    );
    this.$set(
      this.sizeDiagrama,
      "h",
      this.$$parent.$refs.zonaDiagramaFlujo.offsetHeight
    );
  },
  created(){
    window.addEventListener("wheel", this.zoomVista, {passive:false});
  },
  removed(){
    window.removeEventListener("wheel", this.zoomVista);
  }
};
</script>

<style scoped>
.diagramaFlujo {
  width: 100%;
  height: 800px;
  position: relative;
  overflow: scroll;
  background-color: rgb(225, 229, 241);
  overflow: hidden;
}
#canvasDiagramaFlujo {
  position: absolute;
  top: 0%;
  left: 0%;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
#dummy {
  position: absolute;
  width: 30px;
  height: 30px;
  pointer-events: none;
}

#menuCx {
  position: absolute;
  z-index: 100;
}

.itemMenuCx {
  padding: 5px 10px;
  font-size: 15px;
  cursor: pointer;
  background-color: azure;
}
.itemMenuCx:hover {
  background-color: rgb(141, 158, 158);
}
</style>