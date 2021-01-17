<template>
  <div class="iconoPersona" :class="{ yo: soyYo, seleccionado: seleccionado }">
    <img
      id="fotografia"
      :src="this.serverUrl + '/api/usuarios/fotografias/' + estaPersona.id"
      alt=""
    />
    <div id="nombres">{{ estaPersona.nombres }}</div>
    <div id="menuCxPersona" v-show="menuContextual">
      <div class="botonMenuCx" @click.stop="copiarId">{{ estaPersona.id }}</div>
      <div
        class="infoMenuCx"
        :key="index"
        v-for="(permiso, index) in estaPersona.permisos"
      >
        {{ permiso }}
      </div>
      <input type="text" v-model="nuevoPermiso" placeholder="Nuevo permiso" />
      <div class="botonMenuCx" @click.stop="addPermisos">Dar permiso</div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"

export default {
  name: "IconoPersona",
  data() {
    return {nuevoPermiso:null};
  },
  props: {
    estaPersona: Object,
    aceptado: Boolean,
    seleccionado: Boolean,
    menuContextual:Boolean
  },
  computed: {
    soyYo: function () {
      return this.$store.state.usuario.id == this.estaPersona.id ? true : false;
    },
  },
  methods:{
    addPermisos(){
      console.log(
        `enviando ${this.nuevoPermiso} para el usuario con id ${this.estaPersona.id}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($nuevoPermiso: String!, $idUsuario: ID!) {
              addPermisoUsuario(
                nuevoPermiso: $nuevoPermiso
                idUsuario: $idUsuario
              ) {
                id                
                permisos
              }
            }            
          `,
          variables: {
            nuevoPermiso:this.nuevoPermiso,
            idUsuario: this.estaPersona.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    }
  }

};
</script>

<style scoped>
.iconoPersona {
  cursor: pointer;
  position: relative;
  border-radius: 50%;
  user-select: none;
  width: 70px;
  height: 70px;
  margin-bottom: 20px;
}

#fotografia {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
}

.yo {
  border: 1px solid purple;
}

#nombres {
  position: absolute;
  top: 105%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}
.seleccionado {
  border: 2px solid black;
}
.botonMenuCx {
  cursor: pointer;
  font-size: 14px;
  padding: 3px 7px;
}
.seccionMenuCx {
  font-size: 15px;
  color: rgb(71, 71, 71);
}
.infoMenuCx {
  font-size: 15px;
  color: rgb(107, 107, 107);
}
.botonMenuCx:hover {
  background-color: gray;
}
#menuCxPersona{
  position: absolute;
  top: 110%;
  left: 110%;
  min-width: 140px;
  
  z-index: 10;
  background-color: rgb(177, 177, 159);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
</style>