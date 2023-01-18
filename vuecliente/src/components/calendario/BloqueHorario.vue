<template>
  <div
    class="bloqueHorario"
    :class="{seleccionado, deshabilitado: eliminandose}"
    :style="[{ width: duracionMinutos * factorZoom + 'px', backgroundColor: miColor }]"
    @contextmenu.exact.prevent.stop="
      $emit('menuContextual', esteBloque.id)
    "
    @click.left="$emit('seleccionado')"
  >
    <div id="nombre">
      {{ esteBloque.nombreEspacio }}
    </div>

    <div id="menuContextual" :class="{seleccionado}" @click.stop="" v-show="mostrandoMenuContextual">
      <div class="itemMenuContextual" v-if="usuarioAdministrador || usuarioSuperadministrador" @click="eliminarse">Eliminar</div>
      <div class="itemMenuContextual" @click="$refs.inputColor.click()">
        Seleccionar color
      </div>

      <input
        type="color"
        ref="inputColor"
        @change="setColorEspacio"
        v-show="false"
        id="inputColor"
      />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
export default {
  name: "BloqueHorario",
  props: {
    esteBloque: Object,
    idBloqueSeleccionado: String,
    factorZoom: Number,
    idBloqueMenuContextual: String,
  },

  data() {
    var coloresEspacios = localStorage.getItem("coloresEspacios")
      ? JSON.parse(localStorage.getItem("coloresEspacios"))
      : [];

    return {
      coloresEspacios,
      eliminandose:false,
    };
  },
  computed: {
    duracionMinutos() {
      return Math.round(
        (this.esteBloque.millisFinal - this.esteBloque.millisInicio) / 60000
      );
    },
    mostrandoMenuContextual() {
      return this.idBloqueMenuContextual === this.esteBloque.id;
    },
    miColor() {
      if (!this.coloresEspacios) {
        return "#a04d4d";
      }
      const miIndex = this.coloresEspacios.findIndex(
        (d) => d[0] === this.esteBloque.idEspacio
      );

      if (miIndex > -1) {
        return this.coloresEspacios[miIndex][1];
      }

      return "#a04d4d";
    },
    seleccionado(){
        return this.idBloqueSeleccionado===this.esteBloque.id;
    },
    usuarioAdministrador(){
        return this.usuario.id===this.esteBloque.idAdministradorEspacio;
    }
  },
  methods: {
    setColorEspacio() {
      const inputColor = this.$refs.inputColor;
      console.log(
        `Setting color en ${inputColor.value} para el espacio ${this.esteBloque.nombreEspacio} con id ${this.esteBloque.idEspacio}`
      );

      const indexDupla = this.coloresEspacios.findIndex(
        (d) => d[0] === this.esteBloque.idEspacio
      );

      if (indexDupla > -1) {
        this.$set(this.coloresEspacios, indexDupla, [
          this.esteBloque.idEspacio,
          inputColor.value,
        ]);
      } else {
        this.coloresEspacios.push([
          this.esteBloque.idEspacio,
          inputColor.value,
        ]);
      }

      localStorage.setItem(
        "coloresEspacios",
        JSON.stringify(this.coloresEspacios)
      );
    },
    eliminarse(){
        if(!this.usuarioAdministrador && !this.superadministrador){
            console.log("No autorizado");
            return 
        }

        this.eliminandose=true;
        this.$apollo.mutate({
            mutation: gql`
                mutation($idEspacio: ID!, $idIteracion: ID!){
                    eliminarIteracionSemanalEspacio(idEspacio: $idEspacio, idIteracion: $idIteracion)                                             
                }
                `,
                variables:{
                    idEspacio: this.esteBloque.idEspacio,
                    idIteracion: this.esteBloque.id
                }
            }).then(()=>{
                this.eliminandose=false;
                this.$emit('meElimine');
                    
            }).catch((error)=>{
                console.log('Error: '+ error);
                this.eliminandose=false;
            })
    }
  },
};
</script>

<style scoped>
.bloqueHorario {
  height: 100px;
  background-color: #a04d4d;
  position: absolute;
  top: 0px;
  box-sizing: border-box;
}
.bloqueHorario.seleccionado {
    border: 2px solid black;
    filter: brightness(1.7);
}



#nombre {
  text-align: center;
  margin: 20px 0px;
}

#menuContextual {
  position: absolute;
  top: 50%;
  left: 50%;
}

#menuContextual.seleccionado {
    color: black
}

#menuContextual:not(.seleccionado) {
    color: antiquewhite
}
.itemMenuContextual {
  padding: 10px 10px;
  font-size: 12px;
  cursor: pointer;
}
.itemMenuContextual:hover {
  background-color: rgb(59, 59, 59);
}
</style>