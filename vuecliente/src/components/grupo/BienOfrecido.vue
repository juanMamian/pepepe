<template>
  <div class="bienOfrecido">
    <div class="renglonPrincipal">
      <img
        src="@/assets/iconos/iconoBienProyecto.png"
        style="width: 30px; height: 30px"
        alt="Bien"
      />
      <div id="relatoBien">
        {{ esteBien.cantidad }} {{ esteBien.cantidad!=1?unidadPlural:esteBien.unidad }} de {{esteBien.nombre}}
      </div>      
      <img
        src="@/assets/iconos/carrito.png"
        alt="Carrito"
        style="width: 25px"
        id="botonPedir"
        @click="creandoPeticion=!creandoPeticion"
        :title="creandoPeticion?'Cancelar': 'Pedir'"
      />

      <div id="miPeticion" v-if="miPeticion">
        {{ miPeticion.cantidadSolicitada }}
      </div>
    </div>

    <div id="ventanaPedir" v-show="creandoPeticion">
      <div id="tituloSolicitud">¿Cuanto solicitas?</div>
      <input
        type="range"
        min="0"
        :max="esteBien.cantidad"
        name="rangeCantidadSolicitada"
        id="rangeCantidadSolicitada"
        v-model="cantidadSolicitada"
      />
      <div id="cantidadSolicitada">
        <input
          type="number"
          min="0"
          :max="esteBien.cantidad"
          id="inputCantidadSolicitada"
          v-model="cantidadSolicitada"
        />
        {{ cantidadSolicitada!=1?unidadPlural:esteBien.unidad }} de {{ esteBien.nombre }}
      </div>
      <img
        src="@/assets/iconos/guardar.png"
        alt="Guardar"
        style="width: 25px"
        id="botonGuardarPeticion"
        @click="guardarPeticion"
      />
      <loading texto="Enviando..." v-show="enviandoPeticion"/>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from '../../../../libro/src/components/utilidades/Loading.vue';

export default {
  components: { Loading },
  name: "BienOfrecido",
  props: {
    esteBien: Object,
    idProyecto: String,
  },
  data() {
    return {
      cantidadSolicitada: 1,
      enviandoPeticion:false,
      creandoPeticion:false,
    };
  },
  methods: {
    guardarPeticion() {
      if (!this.usuario) return;
      this.enviandoPeticion=true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idProyecto: ID!
              $idBien: ID!
              $peticion: InputPeticionBienProyecto!
            ) {
              addPeticionBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                peticion: $peticion
              ) {
                id
                idBeneficiario
                cantidadSolicitada
                cantidadAsignada
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            peticion: {
              idBeneficiario: this.usuario.id,
              cantidadSolicitada: Number(this.cantidadSolicitada)
            },
          },
        })
        .then(({data:{addPeticionBienProyecto}}) => {
            this.enviandoPeticion=false;
            this.creandoPeticion=false;
            this.$emit("nuevaPeticionCreada", addPeticionBienProyecto)
        }).catch(()=>{
            this.enviandoPeticion=false;
        });
    },
  },
  computed: {
    miPeticion() {
      if (!this.usuarioLogeado) return null;

      return this.esteBien.listaPeticiones.find(
        (p) => p.idBeneficiario == this.usuario.id
      );
    },
    unidadPlural(){
      for(let i of "aeiouáéíóúAEIOUÁÉÍÓÚ"){
        if(this.esteBien.unidad.endsWith(i)){
          return this.esteBien.unidad+"s";
        }
      }
      return this.esteBien.unidad+"es"
    },   
  },
};
</script>

<style scoped>
.bienOfrecido:hover {
  background-color: rgba(194, 194, 194, 0.521);
}
.renglonPrincipal {
  padding: 5px 10px;
  display: flex;
}
#relatoBien{
  margin-left: 20px;
  width: 400px
}
#botonPedir {
  cursor: pointer;
  border-radius: 50%;
}
#botonPedir:hover {
  background-color: rgba(128, 128, 128, 0.438);
}
#miPeticion{
  border-radius: 50%;
  background-color: orange;
  padding: 4px;
  margin-left: 10px;
}
#ventanaPedir{
  padding-left: 15px;
}
#inputCantidadSolicitada {
  padding: 3px 5px;
  width: 70px;
}
#botonGuardarPeticion{
  padding: 3px;
  border-radius: 50%;
  cursor: pointer;
}
#botonGuardarPeticion:hover{
  background-color: rgba(95, 158, 160, 0.658);
}
</style>