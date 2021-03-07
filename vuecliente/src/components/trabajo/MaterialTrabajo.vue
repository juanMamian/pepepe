<template>
  <div class="materialTrabajo" :class="{ deshabilitado, seleccionado }">
    <div id="campoNombre" class="campoPrimerNivel">
      <span id="nombreMaterial" v-show="!editandoNombre">
        {{ esteMaterial.nombre }}
      </span>
      <div
        class="controlesCampo"
        id="controlesCampoNombre"
        v-show="usuarioResponsableTrabajo && seleccionado"
      >
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarrNombre"
          class="bEditar"
          title="Editar nombre del material"
          @click="toggleEditandoNombre"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bGuardar"
          id="bGuardarNuevoNombre"
          v-show="editandoNombre == true && nuevoNombreIlegal == false"
          @click="guardarNuevoNombre"
        />
      </div>
      <input
        type="text"
        class="inputNuevoNombre"
        :class="{ letrasRojas: nuevoNombreIlegal }"
        v-model="nuevoNombre"
        v-show="editandoNombre"
        @keypress.enter="guardarNuevoNombre"
      />
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
    </div>

    <div class="campoPrimerNivel" id="campoCantidades">
      <input
        type="number"
        min="0"
        class="inputsCantidad"
        id="inputNuevoCantidadDisponible"
        ref="inputNuevoCantidadDisponible"
        v-model="nuevoCantidadDisponible"
        v-show="editandoCantidades"
      />
      <span class="campoCantidad" v-show="!editandoCantidades">
        {{ esteMaterial.cantidadDisponible }}
      </span>
      /
      <span class="campoCantidad" v-show="!editandoCantidades">
        {{ esteMaterial.cantidadNecesaria }}
      </span>
      <input
        type="number"
        min="1"
        class="inputsCantidad"
        id="inputNuevoCantidadNecesaria"
        ref="inputNuevoCantidadNecesaria"
        v-model="nuevoCantidadNecesaria"
        v-show="editandoCantidades"
      />

      <div
        class="controlesCampo"
        id="controlesCampoCantidades"
        v-show="usuarioResponsableTrabajo && seleccionado"
      >
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarrCantidades"
          class="bEditar"
          title="Editar cantidades del material"
          @click="toggleEditandoCantidades"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bGuardar"
          id="bGuardarNuevoCantidades"
          v-show="editandoCantidades == true && nuevoCantidadesIlegal == false"
          @click="guardarNuevoCantidades"
        />
      </div>
    </div>

    <div id="campoDescripcion" class="campoPrimerNivel" v-show="seleccionado">
      <div class="controlesCampo" v-show="usuarioResponsableTrabajo">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarrDescripcion"
          class="bEditar"
          title="Editar descripcion del material"
          @click="toggleEditandoDescripcion"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bGuardar"
          id="bGuardarNuevoDescripcion"
          v-show="
            editandoDescripcion == true && nuevoDescripcionIlegal == false
          "
          @click="guardarNuevoDescripcion"
        />
      </div>

      <!-- <textarea
        id="descripcion"
        readonly
        :value="esteMaterial.descripcion"
        v-show="!editandoDescripcion"
      /> -->
      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ esteMaterial.descripcion }}
      </div>

      <textarea
        id="inputNuevoDescripcion"
        ref="inputNuevoDescripcion"
        :class="{ letrasRojas: nuevoDescripcionIlegal }"
        v-model="nuevoDescripcion"
        v-show="editandoDescripcion"
      />
      <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
    </div>

    <div id="bEliminar" v-show="seleccionado && usuarioResponsableTrabajo" @click="eliminarse">
      Eliminar
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";

const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  name: "MaterialTrabajo",
  components: {
    Loading,
  },
  props: {
    usuarioResponsableTrabajo: Boolean,
    seleccionado: Boolean,
    idTrabajo: String,
    esteMaterial: Object,
  },
  data() {
    return {
      deshabilitado: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      nuevoCantidadNecesaria: 1,
      nuevoCantidadDisponible: 0,
      editandoCantidades: false,
      enviandoNuevoCantidades: false,
    };
  },
  computed: {
    nuevoNombreIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreMaterial.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionMaterial.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoCantidadesIlegal() {
      if (this.nuevoCantidadNecesaria < 0 || this.nuevoCantidadDisponible < 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteMaterial.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteMaterial.descripcion;
    },
    toggleEditandoCantidades() {
      this.editandoCantidades = !this.editandoCantidades;
      this.nuevoCantidadNecesaria = this.esteMaterial.cantidadNecesaria;
      this.nuevoCantidadDisponible = this.esteMaterial.cantidadDisponible;
    },
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteMaterial.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idMaterial: ID!, $nuevoNombre: String!) {
              editarNombreMaterialTrabajo(
                idTrabajo: $idTrabajo
                idMaterial: $idMaterial
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idMaterial: this.esteMaterial.id,
            idTrabajo: this.idTrabajo,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteMaterial.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idTrabajo: ID!
              $idMaterial: ID!
              $nuevoDescripcion: String!
            ) {
              editarDescripcionMaterialTrabajo(
                idTrabajo: $idTrabajo
                idMaterial: $idMaterial
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idTrabajo: this.idTrabajo,
            idMaterial: this.esteMaterial.id,
            nuevoDescripcion: this.nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch((error) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoCantidades() {
      if (
        this.nuevoCantidadNecesaria == this.esteMaterial.cantidadNecesaria &&
        this.nuevoCantidadDisponible == this.esteMaterial.cantidadDisponible
      ) {
        this.editandoCantidades = false;
        return;
      }
      console.log(`guardando nuevo cantidades`);
      this.enviandoNuevoCantidades = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idTrabajo: ID!
              $idMaterial: ID!
              $nuevoCantidadNecesaria: Int!
              $nuevoCantidadDisponible: Int!
            ) {
              editarCantidadesMaterialTrabajo(
                idTrabajo: $idTrabajo
                idMaterial: $idMaterial
                nuevoCantidadNecesaria: $nuevoCantidadNecesaria
                nuevoCantidadDisponible: $nuevoCantidadDisponible
              ) {
                id
                cantidadNecesaria
                cantidadDisponible
              }
            }
          `,
          variables: {
            idTrabajo: this.idTrabajo,
            idMaterial: this.esteMaterial.id,
            nuevoCantidadNecesaria: parseInt(this.nuevoCantidadNecesaria),
            nuevoCantidadDisponible: parseInt(this.nuevoCantidadDisponible),
          },
        })
        .then(() => {
          this.enviandoNuevoCantidades = false;
          this.editandoCantidades = false;
        })
        .catch((error) => {
          this.enviandoNuevoCantidades = false;
          console.log(`Error. E :${error}`);
        });
    },
    eliminarse() {
      console.log(`Material eliminandose`);
      if (!confirm("¿Seguro de eliminar este material?")) {
        return;
      }
      this.deshabilitado = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idMaterial: ID!) {
              eliminarMaterialDeTrabajo(
                idTrabajo: $idTrabajo
                idMaterial: $idMaterial
              )
            }
          `,
          variables: {
            idTrabajo: this.idTrabajo,
            idMaterial: this.esteMaterial.id,
          },
        })
        .then(({ data: { eliminarMaterialDeTrabajo } }) => {
          this.deshabilitado = false;
          console.log(`Resultado: ${eliminarMaterialDeTrabajo}`);
          this.$emit("meElimine");
        })
        .catch((error) => {
          this.deshabilitado = false;
          console.log(`Error. E: ${error}`);
        });
    },
  },
  watch:{
    seleccionado(){
      if(this.seleccionado==false){
        this.editandoDescripcion=false;
        this.editandoNombre=false;
        this.editandoCantidades=false;
      }
    }
  }
};
</script>

<style scoped>
.materialTrabajo {
  padding: 7px;
  display: grid;
  grid-template-columns: 1fr 150px;
}

.materialTrabajo:hover {
  background-color: #c8e8e8;
}
.materialTrabajo.seleccionado {
  background-color: #c8e8e8;
  border-top: 2px solid cadetblue;
  border-bottom: 2px solid cadetblue;
}
.materialTrabajo:not(.seleccionado) {
  cursor: pointer;
}

.campoPrimerNivel:hover > .controlesCampo {
  opacity: 1;
}
#nombreMaterial {
  padding: 10px;
}

.controlesCampo {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
  opacity: 0.1;
}

#controlesCampoCantidades {
  margin-top: 10px;
}

#inputNuevoNombre{
  min-width: 150px;
  padding: 5px;
}

#controlesCampoNombre,
#controlesCampoCantidades {
  float: right;
}

#campoCantidades {
  padding: 10px;
}

.inputsCantidad {
  width: 50px;
  display: inline-block;
}

#campoDescripcion{
  grid-column: 1/3;
  border-top: 2px solid gray;
}
.bEditar {
  width: 30px;
  height: 30px;
  border-radius: 50%;

  cursor: pointer;
}
.bEditar:hover {
  background-color: rgb(209, 209, 209);
}
.bGuardar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.bGuardar:hover {
  background-color: rgb(209, 209, 209);
}
#descripcion {
  font-size: 19px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 100px;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}

#inputNuevoDescripcion{
    font-size: 19px;
    min-height: 100px;
    padding: 10px;
    resize: vertical;
  width: 95%;

}

#bEliminar{
  padding: 5px;
  align-self: end;
  cursor: pointer;
  margin: 10px;
  max-width: 100px;
  border-radius: 5px;
}

#bEliminar:hover{
  background-color: red;
}

.inputNuevoNombre{
  min-width: 300px;
  padding: 5px;
}
</style>