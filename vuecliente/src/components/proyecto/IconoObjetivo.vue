<template>
  <div class="iconoObjetivo" :class="{ objetivoSeleccionado: seleccionado }">
    <img src="iconos/iconoObjetivo.png" alt="" id="imagenIcono" />

    <div
      id="nombre"
      ref="nombre"
      :contenteditable="permisosEdicion == true && seleccionado == true"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
    >
      {{ esteObjetivo.nombre }}
    </div>

    <div id="zonaDescripcion" v-if="seleccionado">
      Descripcion: <br />

      <div
        id="descripcion"
        ref="descripcion"
        :contenteditable="permisosEdicion == true && seleccionado == true"
        @blur="guardarDescripcion"
        @input="setDescripcionEditandose"
        @keypress.enter="blurDescripcion"
      >
        {{ esteObjetivo.descripcion }}
      </div>
    </div>
    <div id="controlesObjetivo" v-show="seleccionado">
      <div class="controlesObjetivo hoverGris" @click="eliminarse">
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
var charProhibidosDescripcion = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?"'%$]/g;

export default {
  name: "IconoObjetivo",
  data() {
    return {
      nombreEditandose: false,
      descripcionEditandose: false,
    };
  },
  props: {
    esteObjetivo: Object,
    idObjetivoSeleccionado: String,
    permisosEdicion: Boolean,
  },
  computed: {
    seleccionado: function () {
      return this.idObjetivoSeleccionado == this.esteObjetivo.id ? true : false;
    },
  },
  methods: {
    eliminarse() {
        console.log(`emitiendo evento de elimacion de objetivo`);
      this.$emit("eliminandose", this.esteObjetivo.id);
    },
    setNombreEditandose() {
      if (this.esteObjetivo.nombre != this.$refs.nombre.innerHTML.trim()) {
        this.nombreEditandose = true;
      } else {
        this.nombreEditandose = false;
      }
    },
    setDescripcionEditandose() {
      this.descripcionEditandose = true;
    },
    blurNombre() {
      this.$refs.nombre.blur();
    },
    blurDescripcion() {
      this.$refs.descripcion.blur();
    },
    async guardarNombre() {
      let nuevoNombre = this.$refs.nombre.innerHTML.trim();
      let idObjetivo = this.esteObjetivo.id;

      if (!this.nombreEditandose || nuevoNombre == this.esteObjetivo.nombre) {
        return;
      }

      nuevoNombre = nuevoNombre.replace(charProhibidosNombre, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

      this.$emit("cambiandoNombre", { idObjetivo, nuevoNombre });
    },
    async guardarDescripcion() {
      let nuevaDescripcion = this.$refs.descripcion.innerHTML.trim();
      let idObjetivo = this.esteObjetivo.id;

      if (
        !this.descripcionEditandose ||
        nuevaDescripcion == this.esteObjetivo.descripcion
      ) {
        return;
      }

      nuevaDescripcion = nuevaDescripcion.replace(charProhibidosDescripcion, "");
      nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");

      this.$emit("cambiandoDescripcion", { idObjetivo, nuevaDescripcion });
    },
  },
};
</script>

<style scoped>
.iconoObjetivo {
  border: 2px solid blue;
  border-radius: 5px;
  min-height: 10px;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 10px;
  background-color: rgb(230, 247, 247);
}

.objetivoSeleccionado {
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
  padding-bottom: 25px;
}

#controlesObjetivo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesObjetivo {
  padding: 3px 5px;
}
#nombre {
  padding: 10px 5px;
  text-align: left;
  font-weight: bold;
  font-size: 18px;
  margin-left: 35px;
  
}
#descripcion {
  min-width: 100px;
  min-height: 50px;
  border: 2px solid pink;
  padding: 3px 30px;
}
#imagenIcono {
  width: 30px;
  height: 30px;
  position: absolute;
}
</style>