<template>
  <div
    class="iconoGrupo"
    :class="{ grupoPropio: usuarioResponsableGrupo, seleccionado }"
    @dblclick="navegarAlGrupo"
  >
    <p
      id="nombre"
      ref="nombre"      
    >
      {{ esteGrupo.nombre }}
    </p>
    <img @click.stop="navegarAlGrupo" v-show="seleccionado" src="@/assets/iconos/enviar.png" alt="entrar" title="Entrar a este grupo" id="bEntrarGrupo">
  </div>
</template>

<script>

export default {
  name: "IconoGrupo",
  props: {
    esteGrupo: Object,
    seleccionado:Boolean
  },
  data() {
    return {
      nombreEditandose: false,
    };
  },
  computed: {    
    usuarioResponsableGrupo: function () {
      if (!this.esteGrupo.responsables) return false;

      if (this.esteGrupo.responsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    
  },
  methods: {    
    navegarAlGrupo(){
      this.$router.push("/grupo/"+this.esteGrupo.id)
    }
  },
};
</script>

<style scoped>
.iconoGrupo {
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
.iconoGrupo:hover {
  box-shadow: 2px 2px 2px 2px grey;
}
#nombre {
  text-align: center;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}
#bEntrarGrupo{
  width: 45px;
  height: 45px;
  display: block;
  margin: 10px auto;
  background-color: gray;
  cursor: pointer;
  border-radius: 50%;
}
.grupoPropio {
  border-bottom: 2px solid purple;
}
.seleccionado{
  background-color: rgb(187, 132, 60);
}
</style>