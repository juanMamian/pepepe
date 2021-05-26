<template>
  <div
    class="nodoConocimiento"
    :style="[estiloPosicion, estiloSize, estiloZeta]"
    :class="{ fantasmeado: usuarioLogeado && !aprendible && !seleccionado && !callingPosiciones, escondido }"
    @mousedown.ctrl="arrastrandoNodo = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseenter="mostrandoCuadritoDescripcion = true"
    @mouseleave="
      arrastrandoNodo = false;
      mostrandoCuadritoDescripcion = false;
    "
    @dblclick="abrirPaginaNodo"
  >
    <img
      :src="this.serverUrl + '/api/atlas/iconos/' + esteNodo.id"
      alt=""
      class="iconoNodo"
      ref="iconoNodo"
    />
    <img
      src="@/assets/iconos/success.png"
      alt="Completado"
      title="Aprendizaje de este tema completado"
      v-show="nodoAprendido"
      class="imagenAprendido"
    />
    <img
      src="@/assets/iconos/target.png"
      alt="Objetivo"
      v-show="esTarget"
      class="imagenTarget"
    />

    <div
      id="menuContextual"
      v-show="menuCx"
      @mousedown.stop=""
      @mouseup.stop=""
    >
      <div class="seccionMenuCx" @click="abrirPaginaNodo">
        {{ esteNodo.nombre }}
      </div>
      <div
        class="botonMenuCx"
        v-if="
          usuarioSuperadministrador == true || usuarioAdministradorAtlas == true
        "
        @click.stop="eliminarEsteNodo"
      >
        Eliminar
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioSuperadministrador"
        @click.stop="copiarId"
      >
        {{ esteNodo.id }}
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado && !esNodoObjetivo"
        @click.stop="setNodoObjetivo(true)"
      >
        Añadir a objetivos
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado && esNodoObjetivo"
        @click.stop="setNodoObjetivo(false)"
      >
        Retirar de objetivos
      </div>
      <div
        class="botonMenuCx"
        v-if="usuarioLogeado"
        @click.stop="toggleAprendido"
        v-show="aprendible"
      >
        {{ nodoAprendido ? "Desm" : "M" }}arcar como aprendido
      </div>
      <template
        v-if="
          nodoSeleccionado.id != -1 &&
          nodoSeleccionado.id != esteNodo.id &&
          (usuarioSuperadministrador == true ||
            usuarioAdministradorAtlas == true)
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
    <div id="nombre" ref="nombre" :class="{ nombreSeleccionado: seleccionado, nodoStuck:esteNodo.stuck && callingPosiciones }">
      {{ callingPosiciones?esteNodo.puntaje:esteNodo.nombre }}
    </div>

    <div
      class="cuadritoDescripcionNodo"
      v-if="esteNodo && esteNodo.descripcion"
      v-show="seleccionado && !callingPosiciones"
    >
      <div class="descripcionNodo">{{ esteNodo.descripcion }}</div>
      <img
        @click.stop="abrirPaginaNodo"
        src="@/assets/iconos/ir.png"
        alt="Ir"
        title="Abrir este nodo"
        class="botonAbrirNodo"
      />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "NodoConocimiento",
  data() {
    return {
      arrastrandoNodo: false,
      nombreEditable: false,
      nombreEditandose: false,

      mostrandoCuadritoDescripcion: false,

      baseSize: {
        x: 50,
        y: 50,
      },
     posicion:{
       x:0,
       y:0
     }
    };
  },
  props: {
    esteNodo: {
      type: Object,
      required: true,
    },
    esNodoObjetivo: Boolean,
    esTarget: Boolean,

    escondido: Boolean,
    centroVista: Object,
    idNodoMenuCx: String,
    idsNodosAprendidos: Array,
    nodoSeleccionado: {
      type: Object,
      default() {
        return {
          id: "-1",
          nombre: "ninguno",
        };
      },
    },
    usuarioAdministradorAtlas: {
      type: Boolean,
      default: false,
    },

    callingPosiciones:Boolean,
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
    estiloZeta() {
      let valorZ = 0;
      if (this.arrastrandoNodo || this.seleccionado) {
        valorZ = 10;
      }
      if(this.menuCx){
        valorZ=11;
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
    permisosUsuario: function () {
      return this.$store.state.usuario.permisos;
    },
    aprendible() {
      var idsNecesarios=this.esteNodo.vinculos.filter(v=>v.rol=="target").map(v=>v.idRef);
      return (
        idsNecesarios.every(id=>this.idsNodosAprendidos.includes(id)) ||
        this.idsNodosAprendidos.includes(this.esteNodo.id) ||
        !this.esteNodo.vinculos.some((v) => v.rol == "target")
      );
    },
    fantasmeado() {
      if (
        this.esteNodo.vinculos
          .filter((v) => v.rol == "target")
          .some((v) => this.idsNodosAprendidos.includes(v.idRef)) ||
        this.esteNodoAprendido ||
        !this.esteNodo.vinculos.some((v) => v.rol == "target")
      ) {
        return false;
      }
      return true;
    },
    nodoAprendido() {
      return this.idsNodosAprendidos.includes(this.esteNodo.id);
    },
  },
  methods: {
    toggleAprendido() {
      var nuevoEstadoAprendido = this.nodoAprendido ? false : true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $nuevoEstadoAprendido: Boolean!) {
              setNodoAtlasAprendidoUsuario(
                idNodo: $idNodo
                nuevoEstadoAprendido: $nuevoEstadoAprendido
              )
            }
          `,
          variables:{
            idNodo:this.esteNodo.id,
            nuevoEstadoAprendido
          }
        })
        .then(({ data: { setNodoAtlasAprendidoUsuario } }) => {
          if (setNodoAtlasAprendidoUsuario) {
            this.$emit("tengoNuevoValorAprendido", nuevoEstadoAprendido);
          }
        });
    },
    setNodoObjetivo(nuevoEstadoObjetivo) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $nuevoEstadoObjetivo: Boolean!) {
              setNodoObjetivo(
                idNodo: $idNodo
                nuevoEstadoObjetivo: $nuevoEstadoObjetivo
              )
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoEstadoObjetivo,
          },
        })
        .then(({ data: { setNodoObjetivo } }) => {
          if (setNodoObjetivo) {
            this.$emit("cambieEstadoObjetivo", nuevoEstadoObjetivo);
          }
        });
    },
    abrirPaginaNodo() {
      this.$router.push("/nodoConocimiento/" + this.esteNodo.id);
    },
    copiarId(e) {
      let str = e.target.innerText.trim();
      const el = document.createElement("textarea");
      el.value = str;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    },
    eliminarEsteNodo() {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      this.$emit("eliminar", this.esteNodo.id);
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
      console.log(`Creando vinculo entre ${nodoFrom} y ${nodoTo}`);
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
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
      console.log(`Desconectando`);
      if (!this.usuarioSuperadministrador && !this.usuarioAdministradorAtlas) {
        console.log(`No autorizado`);
        return;
      }
      this.$emit("eliminacionVinculo", {
        idNodoFrom: nodoFrom.id,
        idNodoTo: nodoTo.id,
      });
    },
  },
  watch:{
    esteNodo(){
      this.posicion=this.esteNodo.coords;
    }
  },
  mounted() {
      this.posicion=this.esteNodo.coords;
  },
};
</script>

<style scoped>
.iconoNodo {
  position: absolute;
  top: 0px;
  left: 0px;
  pointer-events: none;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  box-shadow: 2px 2px 2px 2px grey;
  border-radius: 50%;
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
.seleccionado {
  z-index: 10;
}
.fantasmeado {
  opacity: 0.2;
}
.fantasmeado:hover {
  opacity: 1;
}
.escondido {
  visibility: hidden;
}
#nombre {
  font-size: 12px;
  position: absolute;
  top: 105%;
  min-height: 10px;
  min-width: 20px;
  text-align: center;
  /* width: 160%; */
  padding: 5px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgb(5, 102, 109);
  border-radius: 3px;
}

#nombre:not(.nombreSeleccionado) {
  background-color: lightblue;
}

.nombreSeleccionado {
  background-color: rgb(108, 179, 202);
}
#nombre.nodoStuck {
  background-color: rgb(206, 94, 94);
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  padding: 5px;
  z-index: 10;
  background-color: rgb(177, 177, 159);
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
.cuadritoDescripcionNodo {
  position: absolute;
  top: 50%;
  left: 104%;
  width: 170px;
  transform: translateY(-50%);
  background-color: #ffdbaf;
  border: 1px solid rgb(0, 0, 44);
  border-radius: 10px;
}

.descripcionNodo {
  font-size: 15px;
  padding: 10px;
  min-height: 30px;
  white-space: pre-wrap;
}
.botonAbrirNodo {
  display: block;
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 10px auto;
  border-radius: 50%;
  padding: 10px;
  background-color: rgb(214, 176, 130);
}
.botonAbrirNodo:hover {
  background-color: rgb(190, 145, 88);
}

.imagenTarget {
  width: 180%;
  position: absolute;
  top: -40%;
  left: -40%;
  z-index: 10;
  opacity: 0.86;
}
.imagenTarget:hover {
  opacity: 0.16;
}
.imagenAprendido{
  width: 20px;
  position: absolute;
  left: -10px;
  top:-10px;
  background-color: rgb(33, 168, 33);
  border-radius: 50%;
}
</style>