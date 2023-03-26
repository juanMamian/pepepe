<template>
  <div class="creadorInterpolacion">
    <div
      class="bEliminarInterpolacion bolitaX"
      @click="$emit('eliminarse', mensaje)"
    >
      <div class="rayaX1"></div>
      <div class="rayaX2"></div>
    </div>
    <div id="bloqueIframe" v-if="estaInterpolacion.tipo == 'video'">
      <iframe
        id="elIframe"
        :src="estaInterpolacion.enlaceIframe"
        frameborder="0"
        v-if="estaInterpolacion.tipo == 'video'"
        v-show="estaInterpolacion.enlaceIframe"
      ></iframe>
      <div id="zonaInputEnlace">
        <input
          type="text"
          id="inputEnlace"
          v-model="enlaceIframe"
          @input="enlaceAceptado = false"
          @keypress.enter="setEnlaceIframe"
          @paste="onPasteEnlace"
          placeholder="Introduce el enlace"
        />
        <img
          src="@/assets/iconos/success.png"
          width="17px"
          style="cursor: pointer"
          :style="[{ backgroundColor: enlaceAceptado ? 'green' : '' }]"
          alt="Ok"
          title="Aceptar"
          class="bAceptar"
          @click="setEnlaceIframe"
        />
      </div>
    </div>

    <div id="bloqueQuote" v-if="estaInterpolacion.tipo == 'quote'">
      <div id="infoQuote">
        {{ estaInterpolacion.quote.infoAutor.nombres }} escribio:
      </div>
      <div id="quote">
        {{ estaInterpolacion.quote.mensaje }}
        <interpolacion
          v-for="interpolacion of estaInterpolacion.quote.interpolaciones"
          :key="interpolacion.id"
          :estaInterpolacion="interpolacion"
        />
      </div>
    </div>

    <div id="zonaMensaje">
      <textarea
        name="inputMensaje"
        id="inputMensaje"
        ref="inputMensaje"
        :class="{ letrasRojas: mensajeIlegal }"
        v-model="mensaje"
        @input="checkHeight"
      ></textarea>
    </div>
  </div>
</template>

<script>
import Interpolacion from "./Interpolacion.vue";
var charProhibidosMensaje = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;

export default {
  components: { Interpolacion },
  name: "CreadorInterpolacion",
  props: {
    estaInterpolacion: Object,
  },
  data() {
    return {
      mensaje: null,
      enlaceIframe: null,
      enlaceIframeSet: null,

      enlaceAceptado: false,
    };
  },
  methods: {
    onPasteEnlace() {
      this.enlaceAceptado = false;
      console.log(`Paste`);
      // setTimeout(() => {
      //   console.log(`Seting con url ${this.enlaceIframe}`);
      //   this.setEnlaceIframe();
      // }, 300);
    },
    setEnlaceIframe() {
      if (!this.enlaceIframe || this.enlaceIframe.substr(0, 8) != "https://") {
        return;
      }
      if (this.enlaceIframe.substr(12, 17) == "youtube.com/watch") {
        this.enlaceIframe =
          this.enlaceIframe.substr(0, 24) +
          "embed/" +
          this.enlaceIframe.substr(32);
      }

      if (this.enlaceIframe.substr(0, 24) != "https://www.youtube.com/") {
        console.log(`Enlace no válido`);
        this.enlaceIframe.alert("Enlace no válido");
        return;
      }

      this.enlaceIframeSet = this.enlaceIframe;
      this.$emit("enlaceIframeSet", this.enlaceIframeSet);
      this.enlaceAceptado = true;
    },
    checkHeight() {
      while (
        this.$refs.inputMensaje.scrollHeight >
        this.$refs.inputMensaje.offsetHeight
      ) {
        this.$refs.inputMensaje.rows++;
      }
    },
    addToMensaje(mensaje) {
      if (!mensaje) return;
      this.mensaje += "\n\n" + mensaje;

      this.$nextTick(() => {
        this.checkHeight();
      });
    },
    temp() {
      console.log(`1`);
    },
  },
  computed: {
    mensajeIlegal() {
      if (!this.mensaje || this.mensaje.length < 1) {
        return true;
      }
      if (charProhibidosMensaje.test(this.mensaje)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.creadorInterpolacion {
  position: relative;
}
#infoQuote {
  font-size: 11px;
  font-style: italic;
  color: gray;
  width: 90%;
  margin: 5px auto;
}

#quote {
  border: 1px solid gray;
  background-color: rgb(197, 144, 107);
  width: 90%;
  margin: 5px auto;
}

#bloqueIframe {
  border: 2px solid rgb(219, 87, 87);
  width: min(600px, 95%);
  margin: 0px auto;
  border-radius: 10px;
}
#elIframe {
  display: block;
  width: 560px;
  height: 315px;
  margin: 2px auto;
}
#zonaInputEnlace {
  display: block;
  margin: 2px auto;
  width: 280px;
}
.bAceptar {
  border-radius: 50%;
}
.bAceptar:hover {
  background-color: green;
}
#inputEnlace {
  font-size: 19px;
  border-radius: 5px;
  width: 250px;
  margin-right: 5px;
}
#zonaMensaje {
  margin-top: 15px;
}
#inputMensaje {
  width: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 20px;
  resize: none;
}

.bolitaX {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: chocolate;
  cursor: pointer;
  position: relative;
}

.bEliminarInterpolacion {
  position: absolute;
  top: 1%;
  right: 1%;
}

.rayaX1 {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: black;

  transform: translate(-50%, -50%) rotate(45deg);
  height: 2px;
  width: 80%;
}
.rayaX2 {
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: black;
  transform: translate(-50%, -50%) rotate(-45deg);
  height: 2px;
  width: 80%;
}
</style>