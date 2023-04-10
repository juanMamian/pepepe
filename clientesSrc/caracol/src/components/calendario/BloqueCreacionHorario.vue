<template>
  <div class="bloqueCreacionHorario">
    <select
      name="selectEspacio"
      id="selectEspacio"
      ref="selectEspacio"
      v-model="idEspacioSeleccionado"
      @change="$emit('espacioSeleccionado', $event.target.value)"
    >
    <option value=null disabled>Seleccionar un espacio</option>
      <option
        :value="espacio.id"
        v-for="espacio of espaciosControladosUsuario"
        :key="espacio.id"
      >
        {{ espacio.nombre }}
      </option>
    </select>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core"
import { fragmentoEspacio } from '../frags';
export default {
  name: "bloqueCreacionHorario",
  apollo: {
    espaciosControladosUsuario: {
      query: gql`
        query {
          espaciosControladosUsuario {
            ...fragEspacio
          }
        }
        ${fragmentoEspacio}
      `,
    },
  },
  props:{
    esteBloque:Object,
  },
  data() {
    return {
        idEspacioSeleccionado:null,

    };
  },

  methods: {
    iniciarCreacion() {},
  },

  mounted(){
    this.$refs.selectEspacio.click();
  }
};
</script>

<style>
.bloqueCreacionHorario {
  height: 110px;
  background-color: #a04d4d;
  position: absolute;
  top: 0px;
  box-sizing: border-box;
  border: 1px solid rgb(110, 110, 110);
  box-shadow: 5px 5px 5px rgb(117, 117, 117);
  
}

#selectEspacio{
    font-size: 18px;
    padding: 5px 10px;

    background-color: rgba(255, 255, 255, 0.322);
}
</style>