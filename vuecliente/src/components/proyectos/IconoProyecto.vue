<template>
  <div
    class="iconoProyecto"
    :class="{ proyectoPropio: usuarioResponsableProyecto, seleccionado }"
    @dblclick="navegarAlProyecto"
  >
    <p
      id="nombre"
      ref="nombre"      
    >
      {{ esteProyecto.nombre }}
    </p>
    <img @click.stop="navegarAlProyecto" v-show="seleccionado" src="@/assets/iconos/enviar.png" alt="entrar" title="Entrar a este proyecto" id="bEntrarProyecto">
  </div>
</template>

<script>

export default {
  name: "IconoProyecto",
  props: {
    esteProyecto: Object,
    seleccionado:Boolean
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
    
  },
  methods: {    
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
#bEntrarProyecto{
  width: 45px;
  height: 45px;
  display: block;
  margin: 10px auto;
  background-color: gray;
  cursor: pointer;
  border-radius: 50%;
}
.proyectoPropio {
  border-bottom: 2px solid purple;
}
.seleccionado{
  background-color: rgb(187, 132, 60);
}
</style>