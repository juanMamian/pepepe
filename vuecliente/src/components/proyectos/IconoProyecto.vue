<template>
  <div
    class="iconoProyecto"
    :class="{ proyectoPropio: usuarioResponsableProyecto }"
    @dblclick="navegarAlProyecto"
  >
    <p
      id="nombre"
      ref="nombre"
      :contenteditable="permisosEdicion"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
      @dblclick.stop=""
    >
      {{ esteProyecto.nombre }}
    </p>
  </div>
</template>

<script>
var charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

export default {
  name: "IconoProyecto",
  props: {
    esteProyecto: Object,
  },
  data() {
    return {
      nombreEditandose: false,
    };
  },
  computed: {
    usuario: function () {
      return this.$store.state.usuario;
    },
    usuarioResponsableProyecto: function () {
      if (!this.esteProyecto.responsables) return false;

      if (this.esteProyecto.responsables.some((r) => r.id == this.usuario.id)) {
        return true;
      }
      return false;
    },
    permisosEdicion: function () {
      if (
        this.usuarioResponsableProyecto ||
        this.$store.state.usuario.permisos == "superadministrador"
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    guardarNombre() {
      console.log(`guardando nombre`);
      let nuevoNombre = this.$refs.nombre.innerText.trim();
      let idProyecto = this.esteProyecto.id;

      if (!this.nombreEditandose || nuevoNombre == this.esteProyecto.nombre) {
        return;
      }
      console.log(`guardando nombres`);

      nuevoNombre = nuevoNombre.replace(charProhibidosNombreProyecto, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

      this.$emit("cambioDeNombre", { idProyecto, nuevoNombre });

      this.nombreEditandose = false;
    },
    setNombreEditandose() {
      if (this.esteProyecto.nombre != this.$refs.nombre.innerText.trim()) {
        this.nombreEditandose = true;
      } else {
        this.nombreEditandose = false;
      }
    },
    blurNombre() {
      this.$refs.nombre.blur();
    },
    navegarAlProyecto(){
      this.$router.push("/proyecto/"+this.esteProyecto.id)
    }
  },
};
</script>

<style scoped>
.iconoProyecto {
  width: 160px;
  height: 200px;
  margin: 15px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
  cursor: pointer;
  box-sizing: border-box;
  padding: 1px 5px;
  border-radius: 5px;
  background-color: burlywood;
}
.iconoProyecto:hover {
  box-shadow: 2px 2px 2px 2px grey;
}
#nombre {
  text-align: center;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
.proyectoPropio {
  border-bottom: 2px solid purple;
}
</style>