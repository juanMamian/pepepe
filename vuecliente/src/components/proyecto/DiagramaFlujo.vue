<template>
  <div
    class="diagramaFlujo"
    id="diagramaFlujo"
    :style="[opacidad]"
    @click.right.self.prevent="abrirMenuCx"
    @click.left.self="
      idNodoClickDerecho = null;
      idNodoSeleccionado = null;
      mostrandoMenuCx = false;
    "
  >
    <canvas-diagrama-flujo :todosNodos="infoNodos" />
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
      @click.native="
        idNodoSeleccionado = idTrabajo;
        tipoNodoSeleccionado = 'trabajo';
      "
      @dblclick.native="$emit('nodoAbierto', idTrabajo)"
      @empujandoDummyPorAbajo="reposDummy(0, 5)"
      @empujandoDummyPorDerecha="reposDummy(5, 0)"
      @saliendose="scrollDiagrama"
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
      @click.native="
        idNodoSeleccionado = objetivo.id;
        tipoNodoSeleccionado = 'objetivo';
      "
      @saliendose="scrollDiagrama"
      @dblclick.native="$emit('nodoAbierto', objetivo.id)"
      @empujandoDummyPorAbajo="reposDummy(0, 5)"
      @empujandoDummyPorDerecha="reposDummy(5, 0)"
      @crearRequerimento="crearRequerimento('objetivo', $event)"
      @eliminarVinculo="eliminarVinculo('objetivo', $event)"
      @click.right.native.prevent.stop="idNodoClickDerecho = objetivo.id"
    />

    <div id="dummy" ref="dummy" :style="[estiloPosDummy]"></div>

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
    estiloPosDummy() {
      return {
        top: this.posDummy.y + "px",
        left: this.posDummy.x + "px",
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
        e.clientX - posContenedor.left + contenedor.scrollLeft
      );
      posicion.y = Math.round(
        e.clientY - posContenedor.top + contenedor.scrollTop
      );

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
        e.clientX - posContenedor.left + contenedor.scrollLeft
      );
      posicion.y = Math.round(
        e.clientY - posContenedor.top + contenedor.scrollTop
      );

      this.$emit("crearObjetivoEnPosicion", posicion);
    },
    reposDummy(factorx, factory) {
      this.$set(this.posDummy, "x", this.posDummy.x + 20 * factorx);
      this.$set(this.posDummy, "y", this.posDummy.y + 20 * factory);
      
    },
    scrollDiagrama({x, y}){
      this.$el.scrollBy(x, y);
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
      this.$apollo.mutate({
        mutation: gql`
          mutation(
            $idProyecto:ID!,
            $idNodoRequiere: ID!,
            $idNodoRequerido: ID!,
            $tipoNodoRequiere: String!,
            $tipoNodoRequerido: String!,
          ) {
            crearRequerimentoEntreNodosProyecto(
              idProyecto:$idProyecto,
              idNodoRequiere: $idNodoRequiere,
              idNodoRequerido: $idNodoRequerido,
              tipoNodoRequiere: $tipoNodoRequiere,
              tipoNodoRequerido: $tipoNodoRequerido,
            ) {
              nodo {
                ...on Objetivo{
                  id
                  vinculos{
                    idRef
                    tipoRef
                    tipo
                  }
                }
                ...on Trabajo{
                  id
                  vinculos{
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
          idProyecto:this.idProyecto,
          idNodoRequiere,
          idNodoRequerido,
          tipoNodoRequiere,
          tipoNodoRequerido,
        },
      }).then(({data:{crearRequerimentoEntreNodosProyecto}})=>{
        console.log(`Requerimento creado: ${JSON.stringify(crearRequerimentoEntreNodosProyecto)}`);
      }).catch(error=>{
        console.log(`Error`, error.message);
      })
      ;
    },
    eliminarVinculo(tipoNodoRequerido, { idNodoRequiere, idNodoRequerido }) {
      console.log(
        `Preparando mutación para setear que ${idNodoRequiere} ya no está vinculado a ${idNodoRequerido} de tipo ${tipoNodoRequerido}`
      );
      const tipoNodoRequiere = this.tipoNodoSeleccionado;
      this.$apollo.mutate({
        mutation: gql`
          mutation(
            $idProyecto:ID!,
            $idNodoRequiere: ID!,
            $idNodoRequerido: ID!,
            $tipoNodoRequiere: String!,
            $tipoNodoRequerido: String!,
          ) {
            desvincularNodosProyecto(
              idProyecto:$idProyecto,
              idNodoRequiere: $idNodoRequiere,
              idNodoRequerido: $idNodoRequerido,
              tipoNodoRequiere: $tipoNodoRequiere,
              tipoNodoRequerido: $tipoNodoRequerido,
            ) {
              nodo {
                ...on Objetivo{
                  id
                  vinculos{
                    idRef
                    tipoRef
                    tipo
                  }
                }
                ...on Trabajo{
                  id
                  vinculos{
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
          idProyecto:this.idProyecto,
          idNodoRequiere,
          idNodoRequerido,
          tipoNodoRequiere,
          tipoNodoRequerido,
        },
      }).then(()=>{
        console.log(`Vinculo eliminado`);
      }).catch(error=>{
        console.log(`Error`, error.message);
      })
      ;
    },
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
};
</script>

<style scoped>
.diagramaFlujo {
  width: 100%;
  height: 800px;
  position: relative;
  overflow: scroll;
  background-color: rgb(225, 229, 241);
  scroll-behavior: smooth;
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
  width:30px;
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