<template>
  <div
    class="nodoConocimiento"    
    :style="[estiloPosicion, estiloSize, estiloZeta]"
    @mousedown.ctrl="arrastrandoNodo = true"
    @mouseup.left="guardarPosicion"
    @mousemove="arrastrarNodo"
    @mouseenter="mostrandoCuadritoDescripcion=true"
    @mouseleave="arrastrandoNodo = false; mostrandoCuadritoDescripcion=false"
    @dblclick="abrirPaginaNodo"
  >
    <img
      :src="this.serverUrl+'/api/atlas/iconos/' + esteNodo.id"
      alt=""
      class="iconoNodo"
      ref="iconoNodo"
    />

    <div id="menuContextual" v-show="menuCx">
      <div class="seccionMenuCx" @click="abrirPaginaNodo">{{ esteNodo.nombre }}</div>
      <div class="botonMenuCx" v-if="usuarioSuperadministrador" @click.stop="eliminarEsteNodo">Eliminar</div>
      <div
        class="botonMenuCx"
        v-if="usuarioSuperadministrador"
        @click.stop="copiarId"
      >
        {{ esteNodo.id }}
      </div>
      <template
        v-if="nodoSeleccionado.id != -1 && nodoSeleccionado.id != esteNodo.id && usuarioSuperadministrador"
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
      ref="nombre"            
    >
      {{ esteNodo.nombre }}
    </div>

    <div class="cuadritoDescripcionNodo" v-if="esteNodo && esteNodo.descripcion" v-show="mostrandoCuadritoDescripcion || seleccionado">
      <div class="descripcionNodo">{{esteNodo.descripcion}}</div>
      <img @click.stop="abrirPaginaNodo" src="@/assets/iconos/ir.png" alt="Ir" title="Abrir este nodo" class="botonAbrirNodo"/>
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

      mostrandoCuadritoDescripcion:false,

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
    estiloZeta() {
      let valorZ = 0;
      if (this.arrastrandoNodo || this.seleccionado) {
        valorZ = 10;
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
  },
  methods: {
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
.seleccionado{
  z-index: 10;
}
#nombre {
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
.cuadritoDescripcionNodo{
  position: absolute;
  top: 50%;
  left: 104%;
  width:170px;
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
.botonAbrirNodo{
  display: block;
  width: 30px;
  height: 30px;
  cursor: pointer;
  margin: 10px auto;
  border-radius: 50%;
  padding: 10px;
  background-color: rgb(219, 193, 243);

}
.botonAbrirNodo:hover{
  background-color: rgb(194, 148, 236);
}
</style>