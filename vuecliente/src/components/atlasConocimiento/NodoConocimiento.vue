<template>
  <div
    class="nodoConocimiento"
    :style="[estiloPosicion, estiloSize, estiloZeta]"
    :class="{ escondido }"
    @mousedown.ctrl.stop="arrastrandoNodo = true"
    @click.ctrl.capture="stopProp"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseleave="arrastrandoNodo = false"
    @dblclick="abrirPaginaNodo"
  >
    <div id="zonaArrastre" v-show="arrastrandoNodo"></div>

    <div v-if="usuarioSuperadministrador" v-show="configuracionAtlas.posicionando" id="fuerzaCentroMasa" class="fuerzaMovimiento" :style="[estiloFuerzaCentroMasa]"><div class="flechitaFuerza"></div></div>
    <div v-if="usuarioSuperadministrador" v-show="configuracionAtlas.posicionando" id="fuerzaColision" class="fuerzaMovimiento" :style="[estiloFuerzaColision]"><div class="flechitaFuerza"></div></div>

    <img
      src="@/assets/iconos/nodoConocimientoDefault.png"
      :class="{
        fantasmeado:
          usuarioLogeado &&
          !aprendible &&
          yo.atlas.configuracion.modo === 'estudiante' &&
          !callingPosiciones,
        deNodoSeleccionado: seleccionado,
      }"
      alt=""
      class="iconoNodo"
      ref="iconoNodo"
    />
    <img
      src="@/assets/iconos/success.png"
      alt="Completado"
      title="Aprendizaje de este tema completado"
      v-show="nodoAprendido && yo.atlas.configuracion.modo === 'estudiante'"
      :style="[
        {
          width: parseInt(20 * factorZoom) + 'px',
          left: parseInt(-10 * factorZoom) + 'px',
          top: parseInt(-10 * factorZoom) + 'px',
        },
      ]"
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
      <div class="botonMenuCx selectorSubseccionMenuCx" v-show="yo.atlas && yo.atlas.colecciones && yo.atlas.colecciones.length>0">
        Colecciones
        <div class="subseccionMenuCx">
          <div class="botonMenuCx" v-for="coleccion of yo.atlas.colecciones" :key="coleccion.id" @click.stop="toggleNodoEnColeccion(coleccion.id)" :class="{enColeccion:coleccion.idsNodos.includes(esteNodo.id)}">
            {{coleccion.nombre}}
          </div>
        </div>
      </div>
      <!-- <div
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
      </div> -->
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
    <div
      id="nombre"
      :style="[estiloCartelNombre]"
      ref="nombre"
      :class="{
        nombreSeleccionado: seleccionado,
        nombreNodoAprendido:
          nodoAprendido && yo.atlas.configuracion.modo === 'estudiante',
        nombreNodoOutreach:
          !aprendible &&
          !callingPosiciones &&
          yo.atlas.configuracion.modo === 'estudiante',
        nombreNodoAprendible:
          aprendible &&
          !nodoAprendido &&
          yo.atlas.configuracion.modo === 'estudiante',
        nombreNodoExperto:
          usuarioExpertoNodo && yo.atlas.configuracion.modo === 'experto',
        nodoStuck: esteNodo.stuck && callingPosiciones,
        deNodoSeleccionado: seleccionado,
      }"
    >
      {{ callingPosiciones ? esteNodo.puntaje : esteNodo.nombre }}
    </div>

    <div
      class="cuadritoDescripcionNodo"
      v-if="esteNodo && esteNodo.descripcion"
      v-show="seleccionado && !callingPosiciones && mostrarDescripcion"
    >
      <div class="descripcionNodo">{{ esteNodo.descripcion }}</div>
      <img
        @click.stop="abrirPaginaNodo"
        src="@/assets/iconos/ir.png"
        alt="Ir"
        title="Abrir este nodo"
        class="botonAbrirNodo"
      />
      <div
        class="botonEquis"
        @click.stop="mostrarDescripcion = false"
        @mousedown.stop=""
        @mouseup.stop=""
        id="botonCerrarDescripcion"
      >
        <div class="linea1"></div>
        <div class="linea2"></div>
      </div>
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

      baseSize: {
        x: 50,
        y: 50,
      },

      posicion: {
        x: 0,
        y: 0,
      },

      estiloNombreBase: {
        minWidth: 20,
        fontSize: 12,
        minHeight: 10,
        padding: 5,
        borderRadius: 4,
      },
      mostrarDescripcion: true,
    };
  },
  props: {
    esteNodo: {
      type: Object,
      required: true,
    },
    esNodoObjetivo: Boolean,
    esTarget: Boolean,
    yo: Object,
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

    callingPosiciones: Boolean,
    factorZoom: Number,
    configuracionAtlas:Object,
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
      let posY = Math.round(
        (this.posicion.y - this.size.y / 2) * this.factorZoom
      );
      let posX = Math.round(
        (this.posicion.x - this.size.x / 2) * this.factorZoom
      );

      //Ajustar respecto del centro de la vista
      // posY -= this.centroVista.y;
      // posX -= this.centroVista.x;
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
      if (this.menuCx) {
        valorZ = 11;
      }
      return {
        zIndex: valorZ,
      };
    },
    estiloSize() {
      return {
        width: this.size.x * this.factorZoom + "px",
        height: this.size.y * this.factorZoom + "px",
      };
    },
    permisosUsuario: function () {
      return this.$store.state.usuario.permisos;
    },
    aprendible() {
      var idsNecesarios = this.esteNodo.vinculos
        .filter((v) => v.rol == "target")
        .map((v) => v.idRef);
      return (
        idsNecesarios.every((id) => this.idsNodosAprendidos.includes(id)) ||
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
    usuarioExpertoNodo() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteNodo.expertos.includes(this.usuario.id);
    },
    estiloFuerzaCentroMasa(){
      return {
        width: Math.round(this.esteNodo.fuerzaCentroMasa.fuerza*this.factorZoom)+'px',
        height: Math.round(3*this.factorZoom)+"px",
        transform: "rotate("+this.esteNodo.fuerzaCentroMasa.direccion+"rad)"
        }
    },
    estiloFuerzaColision(){
      return {
        width: Math.round(this.factorZoom*this.esteNodo.fuerzaColision.fuerza)+'px',
        height: Math.round(3*this.factorZoom)+"px",
        transform: "rotate("+this.esteNodo.fuerzaColision.direccion+"rad)"
        }
    }
  },
  methods: {
    toggleAprendido() {
      var nuevoEstadoAprendido = this.nodoAprendido ? false : true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $nuevoEstadoAprendido: Boolean!) {
              setNodoAtlasAprendidoUsuario(
                idNodo: $idNodo
                nuevoEstadoAprendido: $nuevoEstadoAprendido
              )
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoEstadoAprendido,
          },
        })
        .then(({ data: { setNodoAtlasAprendidoUsuario } }) => {
          if (setNodoAtlasAprendidoUsuario) {
            this.$emit("tengoNuevoValorAprendido", nuevoEstadoAprendido);
          }
        });
    },
    // setNodoObjetivo(nuevoEstadoObjetivo) {
    //   this.$apollo
    //     .mutate({
    //       mutation: gql`
    //         mutation ($idNodo: ID!, $nuevoEstadoObjetivo: Boolean!) {
    //           setNodoObjetivo(
    //             idNodo: $idNodo
    //             nuevoEstadoObjetivo: $nuevoEstadoObjetivo
    //           )
    //         }
    //       `,
    //       variables: {
    //         idNodo: this.esteNodo.id,
    //         nuevoEstadoObjetivo,
    //       },
    //     })
    //     .then(({ data: { setNodoObjetivo } }) => {
    //       if (setNodoObjetivo) {
    //         this.$emit("cambieEstadoObjetivo", nuevoEstadoObjetivo);
    //       }
    //     });
    // },
    abrirPaginaNodo() {
      if (
        !this.aprendible &&
        !this.usuarioSuperadministrador &&
        this.yo.atlas.configuracion.modo === "estudiante"
      )
        return alert("¡Aún no puedes estudiar este nodo!");
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
        (e.clientY - posContenedor.top) / this.factorZoom
      );
      let nuevoLeft = Math.round(
        (e.clientX - posContenedor.left) / this.factorZoom
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
    stopProp(e) {
      console.log(`Stopping`);
      e.stopPropagation();
    },
    toggleNodoEnColeccion(idColeccion){
      if(!this.usuario || !this.usuario.id){
        return ;
      }
      this.$apollo.mutate({
        mutation:gql`
          mutation($idNodo:ID!, $idColeccion:ID!, $idUsuario:ID!){
            toggleNodoColeccionNodosAtlasConocimientoUsuario(idNodo: $idNodo, idColeccion:$idColeccion, idUsuario: $idUsuario){
              id
              idsNodos
              nodos{
                id
                nombre
              }
            }
          }
        `,
        variables:{
          idNodo: this.esteNodo.id,
          idColeccion,
          idUsuario: this.usuario.id,
        }
      })
    }
  },
  watch: {
    esteNodo() {
      this.posicion = { ...this.esteNodo.coords };
    },
    seleccionado(estado) {
      if (estado) {
        this.mostrarDescripcion = true;
      }
    },
  },
  mounted() {
    this.posicion = { ...this.esteNodo.autoCoords };
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
#zonaArrastre {
  width: 500px;
  height: 500px;
  position: absolute;
  transform: translate(-50%, -50%);
}
.seleccionado {
  z-index: 10;
}
.fantasmeado {
  opacity: 0.2;
}
.fantasmeado.imgSeleccionado {
  opacity: 0.5;
}
.escondido {
  visibility: hidden;
}
#nombre {
  position: absolute;
  top: 105%;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
  border-width: 1px;
  border-style: solid;
}

.nombreNodoOutreach {
  background-color: rgb(127, 190, 192);
  border-color: rgb(53, 110, 112);
  opacity: 0.4;
}
.nombreNodoOutreach:hover {
  opacity: 0.6;
}
.nombreNodoOutreach.deNodoSeleccionado {
  opacity: 0.8;
}

.nombreNodoAprendible {
  background-color: rgb(221, 236, 91);
  border-color: rgb(189, 120, 16);
}

.nombreNodoAprendido {
  background-color: rgb(135, 199, 135);
  border-color: rgb(24, 92, 24);
}

#nombre.nodoStuck {
  background-color: rgb(206, 94, 94);
}
.nombreNodoExperto {
  background-color: rgb(150, 101, 150);
}
#menuContextual {
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  padding: 5px 0px;
  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
  padding: 3px 6px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.botonMenuCx:hover {
  background-color: gray;
}
.selectorSubseccionMenuCx{
  position: relative;
}

.subseccionMenuCx{
  position: absolute;
  left: 100%;
  top: 0%;
  display: none;
  background-color: rgb(177, 177, 159);
}
.selectorSubseccionMenuCx:hover>.subseccionMenuCx{
  display: block;
}
.enColeccion{
  background-color: rgb(117, 182, 117);
}
.enColeccion:hover{
    background-color: rgb(136, 168, 136);

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
.imagenAprendido {
  position: absolute;
  background-color: rgb(33, 168, 33);
  border-radius: 50%;
}
#botonCerrarDescripcion {
  left: 101%;
  bottom: 101%;
  width: 15px;
  height: 15px;
}
.fuerzaMovimiento{  
  background-color: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0% 0%;
  z-index: 200;
}
#fuerzaCentroMasa{
  background-color: blue;
}
#fuerzaColision{
  background-color: red;
}
.flechitaFuerza{
  position: absolute;
  top: 50%;
  left: 100%;
  width: 1px;
  height: 1px;
  border: 5px solid transparent;
  border-left-color: black;
  transform: translate(-50%, -50%);
}
</style>