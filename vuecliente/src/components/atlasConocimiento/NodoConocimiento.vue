<template>
  <div
    class="nodoConocimiento"
    :style="[imgFondo, estiloPosicion, estiloSize, estiloArrastrando]"
    @mousedown.ctrl="arrastrandoNodo = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseleave="arrastrandoNodo = false"
  >
    <div id="menuContextual" v-show="menuCx">
      <div class="seccionMenuCx">{{ esteNodo.nombre }}</div>
      <div class="botonMenuCx" @click.stop="eliminarEsteNodo">Eliminar</div>
      <template
        v-if="
          nodoSeleccionado.id!=-1 &&
          nodoSeleccionado.id != esteNodo.id
        "
      >
        <div class="seccionMenuCx">{{ nodoSeleccionado.nombre }}</div>
        <div
          class="botonMenuCx"
          @click.stop="crearVinculo('continuacion', nodoSeleccionado, esteNodo)"
        >
          Continua aquí
        </div>
        <div
          class="botonMenuCx"
          @click.stop="crearVinculo('continuacion', esteNodo, nodoSeleccionado)"
        >
          Continua desde aquí
        </div>
        <div
          class="botonMenuCx"
          v-show="esteNodo.vinculos.some((v) => v.idRef == nodoSeleccionado.id)"
          @click.stop="eliminarVinculo(esteNodo, nodoSeleccionado)"
        >
          Desconectar
        </div>
      </template>
    </div>
    <div
      id="nombreNodo"
      ref="nombreNodo"
      :contenteditable="true"
      @blur="guardarNombre"
      @input="nombreEditandose = true"
    >
      {{ esteNodo.nombre }}
    </div>
  </div>
</template>

<script>
export default {
  name: "NodoConocimiento",
  data() {
    return {
      arrastrandoNodo: false,
      nombreEditable: false,
      nombreEditandose: false,
      baseSize: {
        x: 50,
        y: 50,
      },
      posicion: {
        x: 0,
        y: 0,
      },
    };
  },
  props: {
    esteNodo: {
      type: Object,
      required: true,
    },
    centroVista: Object,
    idNodoMenuCx: String,
    nodoSeleccionado: {
      type: Object,
      default(){
        return {
          id:"-1",
          nombre:"ninguno"
        }
      }
      },
  },
  computed: {
    menuCx() {
      return this.idNodoMenuCx == this.esteNodo.id ? true : false;
    },
    size() {
      let fSize = Object.assign({}, this.baseSize);
      if (this.seleccionado) {
        let baseX = this.baseSize.x;
        let baseY = this.baseSize.y;
        fSize.x = Math.round(baseX * 1.1);
        fSize.y = Math.round(baseY * 1.1);
      }
      return { ...fSize };
    },
    seleccionado() {
      let sel = false;
      if (this.nodoSeleccionado.id == this.esteNodo.id) {
        sel = true;
      }
      return sel;
    },
    imgFondo() {
      return {
        backgroundImage:
          "url('http://localhost:3000/api/atlas/iconos/" +
          this.esteNodo.id +
          "')",
      };
    },
    estiloPosicion() {
      //Posicion absoluta
      let posY = Math.round(this.posicion.y - this.size.y / 2);
      let posX = Math.round(this.posicion.x - this.size.x / 2);

      //Ajustar respecto del centro de la vista
      posY -= this.centroVista.y;
      posX -= this.centroVista.x;
      return {
        top: posY + "px",
        left: posX + "px",
      };
    },
    estiloArrastrando() {
      let valorZ = 0;
      if (this.arrastrandoNodo) {
        valorZ = 1;
      }
      return {
        zIndex: valorZ,
      };
    },
    estiloSize() {
      return {
        width: this.size.x + "px",
        height: this.size.y + "px",
      };
    },
  },
  methods: {
    eliminarEsteNodo(){
      this.$emit("eliminar", this.esteNodo.id);
    },
    guardarNombre() {
      let nuevoNombre = this.$refs.nombreNodo.innerHTML;
      this.$emit("edicionNombreNodo", {
        idNodo: this.esteNodo.id,
        nuevoNombre,
      });
    },
    arrastrarNodo(e) {
      if (!this.arrastrandoNodo) {
        return;
      }
      //console.log(`mouse move en ${e.pageX}, ${e.pageY}`);
      let posContenedor = document
        .getElementById("contenedorNodos")
        .getBoundingClientRect();
      let nuevoTop = Math.round(
        e.clientY - posContenedor.top + this.centroVista.y
      );
      let nuevoLeft = Math.round(
        e.clientX - posContenedor.left + this.centroVista.x
      );
      this.posicion.y = nuevoTop;
      this.posicion.x = nuevoLeft;
    },
    guardarPosicion() {
      if (!this.arrastrandoNodo) return;
      this.$emit("cambioDePosicionManual", this.esteNodo.id, {x:this.posicion.x, y: this.posicion.y});
      
      this.arrastrandoNodo = false;
      
    },
    crearVinculo(tipo, nodoFrom, nodoTo) {
      console.log(
        `creando un vinculo tipo ${tipo} entre ${nodoFrom.nombre} y ${nodoTo.nombre} `
      );
      this.$emit("creacionVinculo", {
        tipo,
        idNodoFrom: nodoFrom.id,
        idNodoTo: nodoTo.id,
      });
    },
    eliminarVinculo(nodoFrom, nodoTo) {
      this.$emit("eliminacionVinculo", {
        idNodoFrom: nodoFrom.id,
        idNodoTo: nodoTo.id,
      });
    },
    activarEdicionNombre() {},
  },
  mounted() {
    this.posicion.y = this.esteNodo.coordsManuales.y
      ? this.esteNodo.coordsManuales.y
      : 0;
    this.posicion.x = this.esteNodo.coordsManuales.x
      ? this.esteNodo.coordsManuales.x
      : 0;
  },
};
</script>

<style>
.nodoConocimiento {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-size: 100% 100%;
  cursor: pointer;
  position: absolute;
  pointer-events: all;
  background-color: rgba(128, 128, 128, 0.349);
}
#nombreNodo {
  font-size: 12px;
  position: absolute;
  top: 105%;
  min-height: 10px;
  min-width: 20px;
  text-align: center;
  width: 160%;
  left: -30%;
  border: 1px solid orange;
  border-radius: 3px;
  background-color: lightblue;
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  width: 140px;
  background-color: rgb(177, 177, 159);
  padding: 5px;
  z-index: 10;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.botonMenuCx:hover {
  background-color: gray;
}
</style>