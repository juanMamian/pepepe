<template>
  <div
    class="nodoConocimiento"
    :style="[estiloPosicion, estiloSize, estiloArrastrando]"
    @mousedown.ctrl="arrastrandoNodo = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseleave="arrastrandoNodo = false"
  >
    
    
    <div id="sombra"></div>
    <img
      :src="'http://localhost:3000/api/atlas/iconos/' + esteNodo.id"
      alt=""
      class="iconoNodo"
      ref="iconoNodo"
      @error.once="iconoFallback"
    />

    <div id="menuContextual" v-show="menuCx">
      <div class="seccionMenuCx">{{ esteNodo.nombre }}</div>
      <div class="botonMenuCx" @click.stop="eliminarEsteNodo">Eliminar</div>
      <template
        v-if="nodoSeleccionado.id != -1 && nodoSeleccionado.id != esteNodo.id"
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
      :style="fondoNombre"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
    >
      {{ esteNodo.nombre }}
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

var charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_-]/g;

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
      default() {
        return {
          id: "-1",
          nombre: "ninguno",
        };
      },
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
    fondoNombre() {
      if (this.nombreEditandose) {
        return {
          backgroundColor: "orange",
        };
      }
      return {
        backgroundColor: "lightblue",
      };
    },
  },
  methods: {
    // dibujarVinculos: function (rol, color) {
    //   let nodosVinculados = this.todosNodos.filter((n) =>
    //     this.esteNodo.vinculos.some((v) => v.idRef == n.id && v.rol == rol)
    //   );

    //   this.lapiz.beginPath();
    //   console.log(`trazando lineas de color ${color} `);
    //   this.lapiz.strokeStyle = color;

    //   for (let nodo of nodosVinculados) {
    //     console.log(`${nodo.nombre}`);
    //   }

    //   this.bordesDibujoActivo.bot = nodosVinculados.reduce((acc, n) => {
    //     return n.coordsManuales.y < acc ? n.coordsManuales.y : acc;
    //   }, this.esteNodo.coordsManuales.y);
    //   this.bordesDibujoActivo.top = nodosVinculados.reduce((acc, n) => {
    //     return n.coordsManuales.y > acc ? n.coordsManuales.y : acc;
    //   }, this.esteNodo.coordsManuales.y);
    //   this.bordesDibujoActivo.left = nodosVinculados.reduce((acc, n) => {
    //     return n.coordsManuales.x < acc ? n.coordsManuales.x : acc;
    //   }, this.esteNodo.coordsManuales.x);
    //   this.bordesDibujoActivo.right = nodosVinculados.reduce((acc, n) => {
    //     return n.coordsManuales.x > acc ? n.coordsManuales.x : acc;
    //   }, this.esteNodo.coordsManuales.x);

    //   let ancho =
    //     this.bordesDibujoActivo.right -
    //     this.bordesDibujoActivo.left +
    //     this.paddingGuarda;
    //   let alto =
    //     this.bordesDibujoActivo.top -
    //     this.bordesDibujoActivo.bot +
    //     this.paddingGuarda;

    //   this.$set(
    //     this.posicionDibujoVinculos,
    //     "left",
    //     this.size.x / 2 -
    //       this.paddingGuarda / 2 -
    //       (this.esteNodo.coordsManuales.x - this.bordesDibujoActivo.left) +
    //       "px"
    //   );
    //   this.$set(
    //     this.posicionDibujoActivo,
    //     "top",
    //     this.size.y / 2 -
    //       this.paddingGuarda / 2 -
    //       (this.esteNodo.coordsManuales.y - this.bordesDibujoActivo.bot) +
    //       "px"
    //   );

    //   this.lapiz.canvas.width = ancho;
    //   this.lapiz.canvas.height = alto;

    //   for (let vinculo of this.esteNodo.vinculos) {
    //     if (vinculo.rol == rol || vinculo.rol == "any") {
    //       let otroNodo = this.todosNodos.find((n) => n.id == vinculo.idRef);
    //       if (!otroNodo) {
    //         console.log(`ALERTA. Vinculo a ${vinculo.idRef} huerfano`);
    //         continue;
    //       }
    //       this.dibujarLineaEntreNodos(this.esteNodo, otroNodo);
    //       console.log(
    //         `dibujando linea entre ${this.esteNodo.nombre} y ${otroNodo.nombre} `
    //       );
    //     }
    //   }
    //   this.lapiz.stroke();
    // },
    eliminarEsteNodo() {
      this.$emit("eliminar", this.esteNodo.id);
    },
    async guardarNombre() {
      let nuevoNombre = this.$refs.nombreNodo.innerHTML.trim();
      let idNodo = this.esteNodo.id;

      if (!this.nombreEditandose || nuevoNombre == this.esteNodo.nombre) {
        return;
      }

      nuevoNombre = nuevoNombre.replace(charProhibidosNombreNodo, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

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
            idNodo,
            nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
          this.nombreEditandose = false;
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    setNombreEditandose() {
      if (this.esteNodo.nombre != this.$refs.nombreNodo.innerHTML.trim()) {
        this.nombreEditandose = true;
      } else {
        this.nombreEditandose = false;
      }
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
      this.$emit("cambioDePosicionManual", this.esteNodo.id, {
        x: this.posicion.x,
        y: this.posicion.y,
      });

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
    blurNombre() {
      this.$refs.nombreNodo.blur();
    },
    iconoFallback() {
      this.$refs.iconoNodo.src = "nodoConocimientoDefault.png";
      //this.$refs.iconoNodo.src="@/assets/iconos/atlas/nodoConocimientoDefault.png";
    },
    dibujarLineaEntreNodos(nodoFrom, nodoTo) {
      let inicio = {
        x:
          nodoFrom.coordsManuales.x +
          this.paddingGuarda / 2 -
          parseInt(this.bordesDibujoActivo.left),
        y:
          nodoFrom.coordsManuales.y +
          this.paddingGuarda / 2 -
          parseInt(this.bordesDibujoActivo.bot),
      };
      let final = {
        x:
          nodoTo.coordsManuales.x +
          this.paddingGuarda / 2 -
          parseInt(this.bordesDibujoActivo.left),
        y:
          nodoTo.coordsManuales.y +
          this.paddingGuarda / 2 -
          parseInt(this.bordesDibujoActivo.bot),
      };
      console.log(`${inicio.x}, ${inicio.y} -> ${final.x}, ${final.y} `);

      let anguloVinculo = Math.atan(
        (final.y - inicio.y) / (final.x - inicio.x)
      );
      if (final.y - inicio.y < 0 && final.x - inicio.x < 0)
        anguloVinculo += Math.PI;
      if (final.y - inicio.y > 0 && final.x - inicio.x < 0)
        anguloVinculo += Math.PI;

      let radioAmpliado = parseInt(this.baseSize.x * 0.6);
      console.log(`radio ampliado: ${radioAmpliado}`);
      let correccionHorizontal = parseInt(
        radioAmpliado * Math.cos(anguloVinculo)
      );
      let correccionVertical = parseInt(
        radioAmpliado * Math.sin(anguloVinculo)
      );
      console.log(
        `Correcciones: ${correccionHorizontal}, ${correccionVertical} `
      );

      let finalCorregido = {
        x: final.x - correccionHorizontal,
        y: final.y - correccionVertical,
      };

      this.lapiz.moveTo(inicio.x, inicio.y);
      this.lapiz.lineTo(finalCorregido.x, finalCorregido.y);

      //ahora la flechita

      // let centro = {
      //   x: (final.x + inicio.x) / 2,
      //   y: (final.y + inicio.y) / 2,
      // };

      let longitudAla = 7;

      //anguloVinculo=anguloVinculo*180/Math.PI;

      let puntaAlaIzquierda = {
        x:
          finalCorregido.x +
          longitudAla * Math.cos(anguloVinculo - (3 * Math.PI) / 4),
        y:
          finalCorregido.y +
          longitudAla * Math.sin(anguloVinculo - (3 * Math.PI) / 4),
      };
      let puntaAlaDerecha = {
        x:
          finalCorregido.x +
          longitudAla * Math.cos(anguloVinculo + (3 * Math.PI) / 4),
        y:
          finalCorregido.y +
          longitudAla * Math.sin(anguloVinculo + (3 * Math.PI) / 4),
      };
      this.lapiz.moveTo(finalCorregido.x, finalCorregido.y);
      this.lapiz.lineTo(puntaAlaIzquierda.x, puntaAlaIzquierda.y);
      this.lapiz.moveTo(finalCorregido.x, finalCorregido.y);
      this.lapiz.lineTo(puntaAlaDerecha.x, puntaAlaDerecha.y);
    },
    
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

#sombra {
  position: absolute;
  top: 2%;
  left: 0%;
  border-radius: inherit;
  width: 106%;
  height: 106%;
  background-color: rgba(128, 128, 128, 0.452);
  z-index: 0;
}
.iconoNodo {
  position: absolute;
  top: 0px;
  left: 0px;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: 1;
}
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