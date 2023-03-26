<template>
  <div class="iteracionRepaso" :class="{ deshabilitado: eliminandose }">
    <div id="bloqueIntervalo">
      <div
        id="intervalo"
        @click="iniciarEdicionIntervalo"
        v-show="!editandoIntervalo"
      >
      <div id="porcentajeTranscurrido" v-if="primero" :style="[{width: porcentajeIntervaloTranscurrido+'%'}]"></div>
        <div id="textoIntervalo">
        {{ intervaloFormateado }}
        </div>
  
      </div>
      <div id="bloqueEdicionIntervalo" v-show="editandoIntervalo">
        <input
          id="inputCantidadIntervalo"
          v-model="nuevoCantidadIntervalo"
          :class="{deshabilitando: guardandoNuevoIntervalo}"
          :max="
            nuevoTipoCantidadIntervalo === 'dia'
              ? 6
              : nuevoTipoCantidadIntervalo === 'semana'
              ? 3
              : 12
          "
          type="number"
        />
        <select v-model="nuevoTipoCantidadIntervalo" :class="{deshabilitando: guardandoNuevoIntervalo}">
          <option value="dia">Dias</option>
          <option value="semana">Semanas</option>
          <option value="mes">Meses</option>
        </select>
        <div class="boton" title="Guardar" v-show="!guardandoNuevoIntervalo" @click="guardarNuevoIntervalo">
          <img src="@/assets/iconos/save.svg" alt="Guardar" />
        </div>
        <loading texto="" v-show="guardandoNuevoIntervalo" />
      </div>
    </div>
    <div id="icono" @dblclick="eliminarse" @contextmenu.prevent.stop="eliminarse" :style="[colorBolita]">
      <img src="@/assets/iconos/estudiante.png" alt="Estudiante" />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from '../utilidades/Loading.vue';
export default {
  components: { Loading },
  props: {
    estaIteracion: Object,
    idNodo: String,
    urgente: Boolean,
    porcentajeIntervaloTranscurrido:Number,
    primero:Boolean,
  },
  name: "IteracionRepaso",
  data() {
    return {
      eliminandose: false,

      editandoIntervalo: false,
      nuevoTipoCantidadIntervalo: "dia",
      nuevoCantidadIntervalo: 1,
      guardandoNuevoIntervalo:false,
    };
  },
  computed: {
    intervaloFormateado() {
      const semana = 604800000;
      const dia = 86400000;
      const mes = 2592000000;
      var cantidad = 0;
      var textoTipoCantidad = this.tipoCantidadIntervalo;
      if (this.tipoCantidadIntervalo === "dia") {
        cantidad = this.estaIteracion.intervalo / dia;
        textoTipoCantidad = "día";
      } else if (this.tipoCantidadIntervalo === "semana") {
        cantidad = this.estaIteracion.intervalo / semana;
        textoTipoCantidad = "sem";
      } else if (this.tipoCantidadIntervalo === "mes") {
        cantidad = this.estaIteracion.intervalo / mes;
      }

      var texto = cantidad + " " + textoTipoCantidad;
      if (cantidad > 1 && textoTipoCantidad!="mes") {
        texto += "s";
      }

      return texto;
    },
    tipoCantidadIntervalo() {
      var tipo = "dia";
      if (this.estaIteracion.intervalo > 518400000) {
        tipo = "semana";
        if (this.estaIteracion.intervalo > 1814400000) {
          tipo = "mes";
        }
      }
      return tipo;
    },  
    colorBolita(){
      var color= "whitesmoke";
      if(this.urgente){
        color="var(--atlasConocimientoRepaso)";
      }
      return {
        backgroundColor: color
      }
    }
  },
  methods: {
      iniciarEdicionIntervalo(){
          this.nuevoTipoCantidadIntervalo=this.tipoCantidadIntervalo;
          this.nuevoCantidadIntervalo=1;
          this.editandoIntervalo=true;
      },
    eliminarse() {
      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idUsuario: ID!, $idNodo: ID!, $idIteracion: ID!) {
              eliminarIteracionRepaso(
                idUsuario: $idUsuario
                idNodo: $idNodo
                idIteracion: $idIteracion
              )
            }
          `,
          variables: {
            idUsuario: this.usuario.id,
            idNodo: this.idNodo,
            idIteracion: this.estaIteracion.id,
          },
        })
        .then(() => {
          this.eliminandose = false;
          this.$emit("meElimine");
        })
        .catch((error) => {
          this.eliminandose = false;
          console.log(`Error: ${error}`);
        });
    },
    guardarNuevoIntervalo(){
        if(this.nuevoCantidadIntervalo<1){
            return;
        }
        const semana = 604800000;
        const dia = 86400000;
        const mes = 2592000000;
        var nuevoIntervalo=0;
        if(this.nuevoTipoCantidadIntervalo==='dia'){
            if(this.nuevoCantidadIntervalo>6){
                return;
            }
            nuevoIntervalo=dia*this.nuevoCantidadIntervalo;
        }
        else if(this.nuevoTipoCantidadIntervalo==='semana'){
            if(this.nuevoCantidadIntervalo>3){
                return;
            }
            nuevoIntervalo=semana*this.nuevoCantidadIntervalo;

        }
        else if(this.nuevoTipoCantidadIntervalo==='mes'){
            if(this.nuevoCantidadIntervalo>12){
                return;
            }
            nuevoIntervalo=mes*this.nuevoCantidadIntervalo;
        }            
        
        if(nuevoIntervalo===0 || nuevoIntervalo===this.estaIteracion.intervalo){
            return;
        }
            this.guardandoNuevoIntervalo=true;

        this.$apollo.mutate({
            mutation: gql`
                mutation($idUsuario: ID!, $idNodo:ID!, $idIteracion:ID!, $nuevoIntervalo:Float!){
                    setIntervaloIteracionRepaso(idUsuario: $idUsuario, idNodo: $idNodo, idIteracion: $idIteracion, nuevoIntervalo: $nuevoIntervalo){
                        id
                        intervalo
                    }
                }
            `,
            variables:{
                idUsuario: this.usuario.id,
                idNodo:this.idNodo,
                idIteracion: this.estaIteracion.id,
                nuevoIntervalo
            }
        }).then(()=>{
            this.guardandoNuevoIntervalo=false;
            this.editandoIntervalo=false;
        }).catch((error)=>{
            console.log(`Error: ${error}`);
            this.guardandoNuevoIntervalo=false;
        })
    }
  },
};
</script>

<style scoped>
.iteracionRepaso {
  display: flex;
  margin: 5px 0px;
}
#bloqueIntervalo {
  display: flex;
  align-items: center;
  font-family: Salsa, cursive;
}
#intervalo{
  position:relative;
}
#icono {
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;
  box-sizing: border-box;
}
#icono img {
  height: 100%;
}
#inputCantidadIntervalo {
  width: 50px;
  padding: 5px;
  margin: 5px;
}
#bloqueEdicionIntervalo {
  display: flex;
  align-items: center;
}
#porcentajeTranscurrido{
  position:absolute;
  top:50%;
  transform: translateY(-50%) scale(1.1);
  left: -2%;

  height: 50%;
  background-color: var(--atlasConocimientoRepaso);
}
#textoIntervalo{
  position: relative;
  z-index: 1;
  margin: 0px 5px;
}
</style>