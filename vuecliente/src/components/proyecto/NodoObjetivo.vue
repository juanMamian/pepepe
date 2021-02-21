<template>
  <div
    class="nodoObjetivo"
    :class="{ seleccionado }"
    :style="[estiloPosicion, estiloZeta]"
    @mousedown.left="agarrado = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
  >
    <img
      src="@/assets/iconos/ir.png"
      alt="abrir"
      class="bAbrirNodo"
      title="Abrir este elemento"
      v-show="seleccionado"
      @click.left.stop="$emit('meAbrieron')"
    />
    <div class="zonaNombre">
      <div id="nombre">
        <img
          src="@/assets/iconos/iconoObjetivo.png"
          alt=""
          class="iconoObjetivo"
        />{{ esteObjetivo.nombre }}
      </div>
    </div>

    <div id="menuContextual" v-show="menuCx">
      <template
        v-if="
          idNodoSeleccionado != null &&
          idNodoSeleccionado != esteObjetivo.id &&
          (usuarioSuperadministrador == true || usuarioResponsableProyecto)
        "
      >
        <div class="seccionMenuCx">El elemento seleccionado...</div>
        <div
          class="botonMenuCx"
          @click.stop="crearRequerimento(idNodoSeleccionado, esteObjetivo.id)"
        >
          Requiere este elemento
        </div>
        <div
          class="botonMenuCx"
          @click.stop="eliminarVinculo(idNodoSeleccionado, esteObjetivo.id)"
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
  name: "NodoObjetivo",
  props: {
    esteObjetivo: Object,
    idProyecto: String,
    usuarioResponsableProyecto: Boolean,
    seleccionado: Boolean,
    idNodoSeleccionado: String,
    posDummy: Object,
    menuCx: Boolean,
  },
  data() {
    return {
      agarrado: false,
      arrastrandoNodo: 0,
      umbralArrastreNodo: 25,
      posicion: {
        x: 0,
        y: 0,
      },
      montado: false,
    };
  },
  methods: {
    arrastrarNodo(e) {
      if (
        !this.agarrado ||
        (this.usuarioResponsableProyecto === false &&
          this.usuarioSuperadministrador === false)
      ) {
        return;
      }
      this.arrastrandoNodo =
        this.arrastrandoNodo + Math.abs(e.movementX) + Math.abs(e.movementY);
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        return;
      }
      var contenedor = this.$parent.$el;
      let posContenedor = this.$parent.$el.getBoundingClientRect();
      let nuevoTop = Math.round(
        e.clientY - posContenedor.top + contenedor.scrollTop
      );
      let nuevoLeft = Math.round(
        e.clientX - posContenedor.left + contenedor.scrollLeft
      );

      const stepPosx = 25;
      const stepPosy = 15;

      const factorPosx = Math.floor(nuevoLeft / stepPosx);
      const factorPosy = Math.floor(nuevoTop / stepPosy);

      nuevoLeft = factorPosx * stepPosx;
      nuevoTop = factorPosy * stepPosy;

      this.$set(this.posicion, "x", nuevoLeft);
      this.$set(this.posicion, "y", nuevoTop);

      if (this.posDummy.y < nuevoTop + 100) {
        console.log(`pushing dummy por abajo`);
        this.$emit("empujandoDummyPorAbajo");
      }
      if (this.posDummy.x < nuevoLeft + 100) {
        console.log(`pushing dummy por la derecha`);
        this.$emit("empujandoDummyPorDerecha");
      }

      const umbralMovimientoBorde = 100;

      var distanciasBordes = {
        der: posContenedor.left + contenedor.offsetWidth - e.clientX,
        izq: e.clientX - posContenedor.left,
        top: posContenedor.top + contenedor.offsetHeight - e.clientY,
        bot: e.clientY - posContenedor.top,
      };

      var saliendose = {
        x: 0,
        y: 0,
      };

      if (distanciasBordes.der < umbralMovimientoBorde) {
        console.log(`der`);
        saliendose.x = umbralMovimientoBorde - distanciasBordes.der;
      }
      if (distanciasBordes.izq < umbralMovimientoBorde) {
        console.log(`izq`);
        saliendose.x = distanciasBordes.izq - umbralMovimientoBorde;
      }
      if (distanciasBordes.top < umbralMovimientoBorde) {
        console.log(`top`);
        saliendose.y = umbralMovimientoBorde - distanciasBordes.top;
      }
      if (distanciasBordes.bot < umbralMovimientoBorde) {
        console.log(`bot`);
        saliendose.y = distanciasBordes.bot - umbralMovimientoBorde;
      }

      this.$emit("saliendose", saliendose);
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
              $idObjetivo: ID!
              $idProyecto: ID!
              $nuevaPosicion: CoordsInput
            ) {
              setPosicionObjetivoDiagramaProyecto(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
                nuevaPosicion: $nuevaPosicion
              ) {
                id
                diagramaProyecto {
                  posicion {
                    x
                    y
                  }
                }
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idObjetivo: this.esteObjetivo.id,
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
          top: this.posicion.y - this.$el.offsetHeight / 2 + "px",
          left: this.posicion.x - this.$el.offsetWidth / 2 + "px",
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
  },
  watch: {
    esteObjetivo() {
      console.log(`Seteando posicion from network`);
      this.$set(
        this.posicion,
        "x",
        this.esteObjetivo.diagramaProyecto.posicion.x
      );
      this.$set(
        this.posicion,
        "y",
        this.esteObjetivo.diagramaProyecto.posicion.y
      );
    },
  },
  mounted() {
    this.montado = true;
    this.$set(
      this.posicion,
      "x",
      this.esteObjetivo.diagramaProyecto.posicion.x
    );
    this.$set(
      this.posicion,
      "y",
      this.esteObjetivo.diagramaProyecto.posicion.y
    );
  },
};
</script>

<style scoped>
.nodoObjetivo {
  width: 200px;
  position: absolute;
  border-radius: 5px;
  border: 1px solid rgb(82, 2, 26);
  padding: 10px 10px;
  background-color: rgb(238, 117, 117);
  cursor: pointer;
}
.seleccionado {
  border-width: 2px;
  border-color: purple;
}
#nombre {
  font-size: 14px;
  user-select: none;
}
.iconoObjetivo {
  width: 20px;
  height: 20px;
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
</style>