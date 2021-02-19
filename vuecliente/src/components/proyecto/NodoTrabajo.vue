<template>
  <div
    class="nodoTrabajo"
    :class="{ seleccionado }"
    :style="[estiloPosicion, estiloZeta]"
    @mousedown.left="agarrado = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
  >
    <div class="zonaNombre">
      <div id="nombre">
        <img
          src="@/assets/iconos/iconoTrabajo.png"
          alt=""
          class="iconoTrabajo"
        />
        {{ esteTrabajo.nombre }}
      </div>
    </div>

    <div id="menuContextual" v-show="menuCx">
      <template
        v-if="
          idNodoSeleccionado != null &&
          idNodoSeleccionado != esteTrabajo.id &&
          (usuarioSuperadministrador == true || usuarioResponsableProyecto)
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
const QUERY_TRABAJO = gql`
  query($idTrabajo: ID!) {
    trabajo(idTrabajo: $idTrabajo) {
      id
      nombre
      diagramaProyecto {
        posicion {
          x
          y
        }
      }
      vinculos {
        idRef
        tipo
        tipoRef
      }
    }
  }
`;

export default {
  name: "NodoTrabajo",
  apollo: {
    esteTrabajo: {
      query: QUERY_TRABAJO,
      variables() {
        return {
          idTrabajo: this.idTrabajo,
        };
      },
      update({ trabajo }) {
        var miInfo = {
          id: trabajo.id,
          posicion: trabajo.diagramaProyecto.posicion,
          vinculos: trabajo.vinculos,
        };
        this.$emit("miInfo", miInfo);
        return trabajo;
      },
      skip() {
        return !this.idTrabajo;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  data() {
    return {
      esteTrabajo: {
        vinculos: [],
      },
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
  props: {
    idTrabajo: String,
    idProyecto: String,
    idNodoSeleccionado: String,
    usuarioResponsableProyecto: Boolean,
    seleccionado: Boolean,
    posDummy: Object,
    menuCx: Boolean,
  },
  methods: {
    arrastrarNodo(e) {
      if (!this.agarrado || (this.usuarioResponsableProyecto===false && this.usuarioSuperadministrador===false)) {
        return;
      }
      this.arrastrandoNodo=this.arrastrandoNodo+Math.abs(e.movementX)+Math.abs(e.movementY);
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        return;
      }
      var contenedor = this.$parent.$el;
      let posContenedor = contenedor.getBoundingClientRect();
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
        console.log(`Saliendose por abajo`);
        this.$emit("empujandoDummyPorAbajo");
      }
      if (this.posDummy.x < nuevoLeft + 100) {
        console.log(`Saliendose por la derecha`);
        this.$emit("empujandoDummyPorDerecha");
      }

      const umbralMovimientoBorde = 100;

      var distanciasBordes = {
        der: (posContenedor.left + contenedor.offsetWidth) - e.clientX,
        izq: e.clientX - posContenedor.left,
        top: (posContenedor.top + contenedor.offsetHeight) - e.clientY,
        bot: e.clientY - posContenedor.top,
      };

      var saliendose={
        x:0, 
        y:0,
      }

      if (distanciasBordes.der < umbralMovimientoBorde) {
         console.log(`der`);
         saliendose.x=(umbralMovimientoBorde-distanciasBordes.der);
      }
      if (distanciasBordes.izq < umbralMovimientoBorde) {
         console.log(`izq`);
         saliendose.x=(distanciasBordes.izq-umbralMovimientoBorde);
      }
      if (distanciasBordes.top < umbralMovimientoBorde) {
         console.log(`top`);
         saliendose.y=(umbralMovimientoBorde-distanciasBordes.top);
      }
      if (distanciasBordes.bot < umbralMovimientoBorde) {
         console.log(`bot`);
         saliendose.y=(distanciasBordes.bot-umbralMovimientoBorde);
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
              $idTrabajo: ID!
              $idProyecto: ID!
              $nuevaPosicion: CoordsInput
            ) {
              setPosicionTrabajoDiagramaProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
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
            idTrabajo: this.idTrabajo,
            nuevaPosicion: this.posicion,
          },
        })
        .then(() => {
          console.log(`Posición guardada`);
          this.emitirMiInfo();
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
    emitirMiInfo() {
      var info = {
        id: this.esteTrabajo.id,
        posicion: this.esteTrabajo.diagramaProyecto.posicion,
        vinculos: this.esteTrabajo.vinculos,
      };
      this.$emit("miInfo", info);
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

      if (this.arrastrandoNodo == true || this.seleccionado == true) {
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
    esteTrabajo() {
      this.$set(
        this.posicion,
        "x",
        this.esteTrabajo.diagramaProyecto.posicion.x
      );
      this.$set(
        this.posicion,
        "y",
        this.esteTrabajo.diagramaProyecto.posicion.y
      );
    },
  },
  mounted() {
    this.montado = true;
  },
};
</script>

<style scoped>
.nodoTrabajo {
  width: 200px;
  position: absolute;
  border-radius: 5px;
  border: 1px solid rgb(0, 94, 94);
  padding: 10px 10px;
  background-color: rgb(230, 247, 247);
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
.iconoTrabajo {
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
</style>