<template>
  <div
    class="nodo"
    :class="{ seleccionado, deshabilitado: enviandoQueryGeneral }"
    :style="[
      estiloPosicion,
      estiloZeta,
      estiloSize,
      { transition: callingPosiciones ? 'left 5s' : '' },
    ]"
    @mousedown.left="agarrado = callingPosiciones ? false : true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
  >
    <div id="zonaArrastre" v-show="agarrado"></div>

    
    <div id="bolita" :style="[estiloColor]">
      <img
      v-if="esteNodo.__typename === 'Objetivo'"
      src="@/assets/iconos/iconoObjetivo.png"
      :class="{ transparentoso }"
      alt="Nodo"
      class="iconoFondo"
    />
      <img
        v-else
        src="@/assets/iconos/iconoTrabajo.png"
        :class="{ transparentoso }"
        alt="Nodo"
        class="iconoFondo"
      />
    </div>
    <div
      class="aureola"
      id="aureolaParentSeleccionado"
      v-show="parentDeSeleccionado"
    ></div>
    <img src="@/assets/iconos/archivo.png" v-show="plegado" alt="Plegado" title="Este nodo ha sido plegado" id="iconoPlegado">
    <img
      src="@/assets/iconos/maximizar.png"
      alt="abrir"
      class="bAbrirNodo"
      title="Ampliar información"
      v-show="seleccionado"
      @click.left.stop="$emit('meAbrieron')"
      @mouseup.left.stop=""
      @mousedown.left.stop=""
    />
    <div
      id="zonaNombre"
      :style="[estiloCartelNombre, colorCartelNombre]"
      :class="{ transparentoso }"
    >
      <div id="nombre" draggable="false">
        <!-- <img
          src="@/assets/iconos/estrella.png"
          alt=""
          class="iconoNodo"
          draggable="false"
          :style="{width: Math.round(17*factorZoom)+'px'}"
          :class="{
            iconoCompletado: esteNodo.estadoDesarrollo === 'completado',
          }"
        /> -->
        {{ callingPosiciones ? esteNodo.peso.toFixed(2) : esteNodo.nombre }}
      </div>
    </div>

    <div id="menuContextual" v-show="menuCx">
      <div
        class="botonMenuCx"
        v-show="usuario && usuario.id"
        :class="{deshabilitado: enviandoQueryPlegar}"
        @click.stop="togglePlegar"
        @mousedown.left.stop=""
        @mouseup.left.stop=""
      >
        {{plegado?'Desplegar': 'Plegar'}}
      </div>
      <template
        v-if="idNodoSeleccionado != null && idNodoSeleccionado != esteNodo.id"
      >
        <div class="seccionMenuCx">El elemento seleccionado...</div>
        <div
          class="botonMenuCx"
          v-show="
            (usuarioResponsableNodoSeleccionado || usuarioSuperadministrador) &&
            !requeridoPorSeleccionado
          "
          @mouseup.stop=""
          @mousedown.stop=""
          @click.stop="crearRequerimento(idNodoSeleccionado, esteNodo.id)"
        >
          Requiere este elemento
        </div>
        <div
          class="botonMenuCx"
          v-show="
            usuarioSuperadministrador &&
            requeridoPorSeleccionado &&
            !childSeleccionado
          "
          @mouseup.stop=""
          @mousedown.stop=""
          @click.stop="crearParenting(idNodoSeleccionado, esteNodo.id)"
        >
          Se adueña de este elemento
        </div>
        <div
          class="botonMenuCx"
          @mouseup.stop=""
          @mousedown.stop=""
          @click.stop="eliminarVinculo(idNodoSeleccionado, esteNodo.id)"
          v-show="requeridoPorSeleccionado"
          :class="{
            deshabilitado:
              !usuarioResponsableNodoSeleccionado && !usuarioSuperadministrador,
          }"
        >
          Desconectar
        </div>
      </template>
      <div
        class="botonMenuCx"
        v-show="usuarioSuperadministrador || usuarioAdministrador"
        :class="{
          deshabilitado:
            ((autoadministrado &&
              esteNodo.administradores.length > 1 &&
              !usuarioSuperadministrador) ||
              (!usuarioResponsable && esteNodo.responsables.length > 0)) &&
            !usuarioSuperadministrador,
        }"
        @click="eliminarse"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "nodo",
  props: {
    esteNodo: Object,
    idNodoSeleccionado: String,
    nodoSeleccionado: Object,
    menuCx: Boolean,
    factorZoom: Number,
    callingPosiciones: Boolean,
    transparentoso: Boolean,
    usuarioAdministradorNodoSeleccionado: Boolean,
    usuarioResponsableNodoSeleccionado: Boolean,
    childSeleccionado: Boolean,
    parentDeSeleccionado: Boolean,
    idsNodosPlegados:Array,
  },
  data() {
    return {
      estiloNombreBase: {
        minWidth: 80,
        fontSize: 12,
        minHeight: 15,
        padding: 10,
        borderRadius: 10,
      },
      agarrado: false,
      arrastrandoNodo: 0,
      umbralArrastreNodo: 10,
      posicion: {
        x: 0,
        y: 0,
      },
      montado: false,
      widthBase: 150,
      heightBase: 100,
      size: {
        x: 40,
        y: 40,
      },
      enviandoQueryGeneral:false,
      enviandoQueryPlegar:false,
    };
  },
  methods: {
    arrastrarNodo(e) {
      if (
        !this.agarrado ||
        (this.usuarioAdministrador === false &&
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
        (e.clientY - posContenedor.top) / this.factorZoom
      );
      let nuevoLeft = Math.round(
        (e.clientX - posContenedor.left) / this.factorZoom
      );

      const stepPosx = 25;
      const stepPosy = 15;

      nuevoLeft = nuevoLeft - (nuevoLeft % stepPosx);
      nuevoTop = nuevoTop - (nuevoTop % stepPosy);

      this.$set(this.posicion, "x", nuevoLeft);
      this.$set(this.posicion, "y", nuevoTop);
    },
    guardarPosicion() {
      if (this.arrastrandoNodo < this.umbralArrastreNodo) {
        this.agarrado = false;
        return;
      }
      if (!this.usuarioAdministrador && !this.usuarioSuperadministrador) {
        this.agarrado = false;
        return;
      }
      this.arrastrandoNodo = 0;
      this.agarrado = false;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevaPosicion: CoordsInput) {
              setPosicionNodoSolidaridad(
                idNodo: $idNodo
                nuevaPosicion: $nuevaPosicion
              ) {
                __typename
                ... on Trabajo {
                  id
                  coords {
                    x
                    y
                  }
                }
                ... on Objetivo {
                  id
                  coords {
                    x
                    y
                  }
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevaPosicion: this.posicion,
          },
        })
        .then(() => {
          console.log(`Posición guardada`);
          this.$emit("meMovi");
        })
        .catch((error) => {
          console.log(`Error. E: ${error}`);
        });
    },
    crearRequerimento(idNodoRequiriente, idNodoRequerido) {
      console.log(
        `Se fijara que ${idNodoRequiriente} requiere a ${idNodoRequerido}`
      );
      this.$apollo.mutate({
        mutation: gql`
          mutation ($idNodoRequiriente: ID!, $idNodoRequerido: ID!) {
            crearRequerimentoEntreNodosSolidaridad(
              idNodoRequiriente: $idNodoRequiriente
              idNodoRequerido: $idNodoRequerido
            ) {
              __typename
              ... on Trabajo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
              ... on Objetivo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
            }
          }
        `,
        variables: {
          idNodoRequiriente,
          idNodoRequerido,
        },
      });
    },
    crearParenting(idNodoRequiriente, idNodoRequerido) {
      console.log(
        `Se fijara que ${idNodoRequiriente} es parent de ${idNodoRequerido}`
      );
      this.$apollo.mutate({
        mutation: gql`
          mutation ($idNodoRequiriente: ID!, $idNodoRequerido: ID!) {
            crearParentingEntreNodosSolidaridad(
              idNodoRequiriente: $idNodoRequiriente
              idNodoRequerido: $idNodoRequerido
            ) {
              __typename
              ... on Trabajo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
              ... on Objetivo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
            }
          }
        `,
        variables: {
          idNodoRequiriente,
          idNodoRequerido,
        },
      });
    },
    eliminarVinculo(idUnNodo, idOtroNodo) {
      console.log(`Se desconectará el nodo ${idUnNodo} del nodo ${idOtroNodo}`);

      this.$apollo.mutate({
        mutation: gql`
          mutation ($idUnNodo: ID!, $idOtroNodo: ID!) {
            desvincularNodosSolidaridad(
              idUnNodo: $idUnNodo
              idOtroNodo: $idOtroNodo
            ) {
              __typename
              ... on Trabajo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
              ... on Objetivo {
                id
                vinculos {
                  idRef
                  tipo
                  tipoRef
                }
                administradores
                nodoParent {
                  idNodo
                  tipo
                }
              }
            }
          }
        `,
        variables: {
          idUnNodo,
          idOtroNodo,
        },
      });
    },
    eliminarse() {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministrador) {
        console.log(`No autorizado`);
        return;
      }
      this.enviandoQueryGeneral = true;
      const dis=this;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $tipo: String!) {
              eliminarNodoSolidaridad(idNodo: $idNodo, tipo: $tipo)
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            tipo: this.esteNodo.__typename.toLowerCase(),
          },          
        })
        .then(() => {
          dis.enviandoQueryGeneral = false;  
          this.$emit("meElimine");

        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          dis.enviandoQueryGeneral = false;
        });


    },
    togglePlegar() {      

      this.enviandoQueryPlegar = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!) {
              setPlegarNodoSolidaridadUsuario(
                idNodo: $idNodo                
              ) {
                id
                atlasSolidaridad{
                id
                  idsNodosPlegados
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,            
          },
        })
        .then(() => {
          this.enviandoQueryPlegar = false;
          console.log(`toggled`);
        })
        .catch((error) => {
          this.enviandoQueryPlegar = false;
          console.log(`Error: E:${error}`);
        });
    },
  },
  computed: {
    estiloPosicion() {
      if (this.montado) {
        return {
          left: (this.posicion.x - this.size.x / 2) * this.factorZoom + "px",
          top: (this.posicion.y - this.size.y / 2) * this.factorZoom + "px",
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
    estiloSize() {
      return {
        width: Math.round(this.size.x * this.factorZoom) + "px",
        height: Math.round(this.size.y * this.factorZoom) + "px",
        fontSize: Math.round(14 * this.factorZoom) + "px",
        padding: Math.round(5 * this.factorZoom) + "px",
      };
    },
    seleccionado() {
      return (
        this.idNodoSeleccionado && this.idNodoSeleccionado == this.esteNodo.id
      );
    },
    usuarioResponsable() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteNodo.responsables.includes(this.usuario.id);
    },
    usuarioAdministrador() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteNodo.administradores.includes(this.usuario.id);
    },
    estiloCartelNombre() {
      return {
        minWidth:
          parseInt(this.estiloNombreBase.minWidth * this.factorZoom) + "px",
        fontSize:
          parseInt(this.estiloNombreBase.fontSize * this.factorZoom) + "px",
        minHeight:
          parseInt(this.estiloNombreBase.minHeight * this.factorZoom) + "px",
        padding:
          parseInt(this.estiloNombreBase.padding * this.factorZoom) + "px",
        borderRadius:
          parseInt(this.estiloNombreBase.borderRadius * this.factorZoom) + "px",
      };
    },
    colorCartelNombre() {
      var color = "white";
      if (this.esteNodo.responsables && this.esteNodo.responsables.length > 0) {
        color = "#f0ee6e";
      }      
      if(this.esteNodo.estadoDesarrollo==='completado'){
        color="rgb(86, 176, 54)";
      }
      if (this.usuarioResponsable) {
        color = "rgb(166 137 193)";
      }
      return {
        backgroundColor: color,
      };
    },
    autoadministrado() {
      return !this.esteNodo.nodoParent || !this.esteNodo.nodoParent.idNodo;
    },
    conectadoAlSeleccionado() {
      if (!this.nodoSeleccionado) return false;
      if (
        this.esteNodo.vinculos.some((v) => v.idRef === this.idNodoSeleccionado)
      ) {
        return true;
      }

      if (
        this.nodoSeleccionado.vinculos.some((v) => v.idRef === this.esteNodo.id)
      ) {
        return true;
      }

      return false;
    },
    requeridoPorSeleccionado() {
      if (!this.nodoSeleccionado) return false;
      if (
        this.nodoSeleccionado.vinculos.some((v) => v.idRef === this.esteNodo.id)
      ) {
        return true;
      }

      return false;
    },    
    huerfano() {
      return (
        this.esteNodo.responsables.length === 0 &&
        this.esteNodo.administradores.length === 0
      );
    },
    estiloColor() {
      var elColor = "rgba(105, 199, 199, 0.9)";
      if (this.seleccionado) {
        elColor = "rgb(193 72 139)";
      }
      return {
        backgroundColor: elColor,
      };
    },    
    plegado(){
      return this.idsNodosPlegados.includes(this.esteNodo.id);
    }
  },
  watch: {
    esteNodo() {
      this.$set(this.posicion, "x", this.esteNodo.coords.x);
      this.$set(this.posicion, "y", this.esteNodo.coords.y);
    },
  },
  mounted() {
    this.montado = true;
    this.$set(this.posicion, "x", this.esteNodo.coords.x);
    this.$set(this.posicion, "y", this.esteNodo.coords.y);
  },
};
</script>

<style scoped>
.nodo {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  transition-timing-function: linear;
}
.aureola {
  position: absolute;
  width: 120%;
  height: 120%;
  background-color: rgba(128, 0, 128, 0.322);
  top: -10%;
  left: -10%;
  border-radius: 50%;
  z-index: 0;
  box-shadow: 0 30px 40px rgba(0,0,0,.1);
}
#bolita{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0%;
  left: 0%;
  z-index: 1;

}
.iconoFondo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  user-select: none;
  pointer-events: none;
}
#iconoPlegado{
  position: absolute;
  padding: 5%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background-color: rgb(195, 220, 221);
  user-select: none;
  z-index: 10;
  top: 0%;
  left: 100%;
}
.seleccionado {
  border-width: 2px;
  border-color: purple;
  box-shadow: 2px 2px 2px 2px grey;
}
#zonaNombre {
  position: absolute;
  top: 103%;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid black;
}
#nombre {
  user-select: none;
}
.iconoNodo {
  border-radius: 50%;
  padding: 3px;
}
.iconoCompletado {
  background-color: rgb(44, 136, 44);
}
#menuContextual {
  position: absolute;
  top: 68%;
  left: 68%;
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
#zonaArrastre {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.transparentoso {
  opacity: 0.2;
}
</style>