<template>
  <div
    class="nodoTrabajo"
    :class="{ seleccionado }"
    :style="[estiloPosicion, estiloZeta, estiloSize, {transition: callingPosiciones?'left 5s': ''}]"
    @mousedown.left="agarrado = callingPosiciones?false:true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
  >
    <div id="zonaArrastre" v-show="agarrado"></div>

    <img
      src="@/assets/iconos/maximizar.png"
      alt="abrir"
      class="bAbrirNodo"
      title="Ampliar información"
      v-show="seleccionado"
      @click.left.stop="$emit('meAbrieron')"
    />
    <div class="zonaNombre">
      <div id="nombre" draggable="false">
        <img
          src="@/assets/iconos/estrella.png"
          alt=""
          class="iconoTrabajo"
          draggable="false"
          :style="{width: Math.round(17*factorZoom)+'px'}"
          :class="{
            iconoCompletado: esteTrabajo.estado === 'cumplido',
          }"
        />{{ callingPosiciones? esteTrabajo.puntaje.toFixed(2) : esteTrabajo.nombre }}
      </div>
    </div>

    <div id="menuContextual" v-show="menuCx">
      <template
        v-if="
          idNodoSeleccionado != null &&
          idNodoSeleccionado != esteTrabajo.id &&
          (usuarioSuperadministrador == true || usuarioResponsableObjetivoParent)
        "
      >
        <div class="seccionMenuCx">El elemento seleccionado...</div>
        <div
          class="botonMenuCx"
          @click.stop="crearRequerimento(idNodoSeleccionado, esteTrabajo.id)"
        >
          Requiere este elemento
        </div>
        <div
          class="botonMenuCx"
          @click.stop="eliminarVinculo(idNodoSeleccionado, esteTrabajo.id)"
        >
          Desconectar
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "NodoTrabajo",
  props: {
    esteTrabajo: Object,
    idProyecto: String,        
    idNodoSeleccionado: String,    
    menuCx: Boolean,    
    factorZoom:Number,
    callingPosiciones:Boolean
  },
  data() {
    return {
      agarrado: false,
      arrastrandoNodo: 0,
      umbralArrastreNodo: 10,
      posicion: {
        x: 0,
        y: 0,
      },
      montado: false,
      widthBase:150,
      heightBase:100,
      size:{
        x: 150,
        y: 100
      }
    };
  },
  methods: {
    arrastrarNodo(e) {
      if (
        !this.agarrado ||
        (this.usuarioResponsableObjetivoParent === false &&
          this.usuarioSuperadministrador === false)
      ) {
        return;
      }
      this.arrastrandoNodo =
        this.arrastrandoNodo + Math.abs(e.movementX) + Math.abs(e.movementY);
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        return;
      }
      var contenedor = document.getElementById("contenedorNodos");
      let posContenedor = contenedor.getBoundingClientRect();

      let nuevoTop = Math.round(
        ((e.clientY - posContenedor.top)/this.factorZoom)
      );
      let nuevoLeft = Math.round(
        ((e.clientX - posContenedor.left)/this.factorZoom)
      );

      const stepPosx = 25;
      const stepPosy = 15;      

      nuevoLeft = nuevoLeft-(nuevoLeft%stepPosx);
      nuevoTop = nuevoTop - (nuevoTop%stepPosy);

      this.$set(this.posicion, "x", nuevoLeft);
      this.$set(this.posicion, "y", nuevoTop);

      
    },
    guardarPosicion() {
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        this.agarrado = false;
        return;
      }
      this.arrastrandoNodo = 0;
      this.agarrado = false;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idTrabajo: ID!              
              $nuevaPosicion: CoordsInput
            ) {
              setPosicionTrabajoDiagramaProyecto(                
                idTrabajo: $idTrabajo
                nuevaPosicion: $nuevaPosicion
              ) {
                id
                coords{
                  x
                  y
                }
              }
            }
          `,
          variables: {            
            idTrabajo: this.esteTrabajo.id,
            nuevaPosicion: this.posicion,
          },
        })
        .then(() => {
          console.log(`Posición guardada`);
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
    crearRequerimento(idNodoRequiere, idNodoRequerido) {
      console.log(
        `Se fijara que ${idNodoRequiere} requiere a ${idNodoRequerido}`
      );
      this.$emit("crearRequerimento", { idNodoRequiere, idNodoRequerido });
    },
    eliminarVinculo(idNodoRequiere, idNodoRequerido) {
      console.log(
        `Se fijara que ${idNodoRequiere} ya no requiere a ${idNodoRequerido}`
      );
      this.$emit("eliminarVinculo", { idNodoRequiere, idNodoRequerido });
    },
  },
  computed: {
    estiloPosicion() {
      if (this.montado) {
        return {
          left: (((this.posicion.x-(this.size.x/2))*this.factorZoom) ) + "px",
          top: (((this.posicion.y - (this.size.y/2))*this.factorZoom) ) + "px",
        };
      }
      return {
        top: "0px",
        left: "0px",
      };
    },
    estiloZeta() {
      let valorZ = 0;
      if (this.arrastrandoNodo > this.umbralArrastreNodo || this.seleccionado) {
        valorZ = 100;
      }
      if (this.menuCx) {
        valorZ = 200;
      }
      return {
        zIndex: valorZ,
      };
    },
    estiloSize(){
      return {
        width: Math.round(this.size.x*(this.factorZoom))+"px",
        height: Math.round(this.size.y*(this.factorZoom))+"px",
        fontSize:Math.round(14*this.factorZoom)+"px",
        padding:Math.round(5*this.factorZoom)+'px'
      }
    },
    seleccionado(){
      return this.idNodoSeleccionado && this.idNodoSeleccionado==this.esteTrabajo.id
    },  
    usuarioResponsableObjetivoParent(){
      if(!this.esteTrabajo.idObjetivoParent)return false;

      return false;
    }
  },
  watch: {
    esteTrabajo() {
      this.$set(
        this.posicion,
        "x",
        this.esteTrabajo.coords.x
      );
      this.$set(
        this.posicion,
        "y",
        this.esteTrabajo.coords.y
      );
    },
  },
  mounted() {
    this.montado = true;
    this.$set(
      this.posicion,
      "x",
      this.esteTrabajo.coords.x
    );
    this.$set(
      this.posicion,
      "y",
      this.esteTrabajo.coords.y
    );
  },
};
</script>

<style scoped>
.nodoTrabajo {
  
  position: absolute;
  border-radius: 5px;
  border: 1px solid rgb(0, 94, 94);  
  background-color: rgb(230, 247, 247);
  cursor: pointer;
  transition-timing-function: linear;
  
}
.seleccionado {
  border-width: 2px;
  border-color: purple;
}
#nombre {  
  user-select: none;
  
}
.iconoTrabajo {
 
  border-radius: 50%;
  padding: 3px;
}
.iconoCompletado {
  background-color: rgb(44, 136, 44);
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
  padding: 5px 10px;
}
.botonMenuCx:hover {
  background-color: gray;
}
.bAbrirNodo {
  padding: 3px;
  background-color: rgb(168, 221, 223);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 105%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 25px;
  height: 25px;
}
.bAbrirNodo:hover {
  background-color: cadetblue;
}
#zonaArrastre{
  position: absolute;
  width: 300px;
  height: 300px;
  top:50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}
</style>