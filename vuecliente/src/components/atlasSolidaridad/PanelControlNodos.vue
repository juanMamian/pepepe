<template>
  <div id="panelControlNodos" @mousedown.stop="" @mouseup.stop="">
    <div      
      id="botonIterateNodosUsuario"
      @click="tabNodoUsuario"
    ></div>

    <img
      src="@/assets/iconos/iconoTrabajo.png"
      alt="Trabajos"
      :title="mostrandoTrabajos ? 'Ocultar trabajos' : 'Ver trabajos'"
      :style="{opacity: mostrandoTrabajos?'1':'0.5'}"
      @click="$emit('setMostrandoTrabajos', mostrandoTrabajos?false:true)"
      id="botonToggleTrabajos"
      class="botonControl"
    />
    <img
      src="@/assets/iconos/iconoObjetivo.png"
      alt="Objetivos"
      :title="mostrandoObjetivos ? 'Ocultar objetivos' : 'Ver objetivos'"
      :style="{opacity: mostrandoObjetivos?'1':'0.5'}"
      @click="$emit('setMostrandoObjetivos', mostrandoObjetivos?false:true)"
      id="botonToggleObjetivos"
      class="botonControl"
    />
  </div>
</template>

<script>
export default {
  name: "PanelControlNodos",
  props: {
    todosNodos: Array,
    mostrandoTrabajos:Boolean,
    mostrandoObjetivos:Boolean,
    idsNodosVisibles: Array,
  },
  data() {
    return {
      idCurrentNodoUsuario: null,      
    };
  },
  methods: {
    tabNodoUsuario() {
      if (!this.nodosUsuario || this.nodosUsuario.length < 1) {
        return;
      }
      var newIndex = 0;
      if (this.idCurrentNodoUsuario) {
        var indexActual = this.nodosUsuario.findIndex(
          (n) => n.id === this.idCurrentNodoUsuario
        );
        if (indexActual > -1) {
          newIndex = indexActual + 1;
        }
      }

      if (newIndex >= this.nodosUsuario.length) {
        newIndex = 0;
      }
      this.idCurrentNodoUsuario = this.nodosUsuario[newIndex].id;
    },
  },
  computed: {
    nodosUsuario() {
      if (!this.usuario || !this.usuario.id) return [];
      return this.todosNodos.filter(
        (n) => n.responsables && n.responsables.includes(this.usuario.id) && this.idsNodosVisibles.includes(n.id)
      );
    },
  },
  watch: {
    idCurrentNodoUsuario() {
      this.$emit("centrarEnNodo", this.idCurrentNodoUsuario);
    },
  },
};
</script>

<style scoped>
#panelControlNodos {
  position: absolute;
  bottom: 0%;
  right: 0%;
  display: flex;
  align-items: center;
  padding: 4px 10px;
  z-index: 100;
}

#botonIterateNodosUsuario {
  width: 20px;
  height: 20px;
  background-color: purple;
  border-radius: 50%;
  cursor: pointer;
}

.botonControl {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  margin: 0px 5px;
}
.botonControl:hover {
  background-color: rgba(95, 158, 160, 0.521);
}
</style>