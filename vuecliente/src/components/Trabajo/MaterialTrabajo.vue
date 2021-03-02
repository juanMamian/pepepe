<template>
  <div class="materialTrabajo" :class="{deshabilitado}">
    <div id="campoNombre" class="campo">
      <div class="controlesCampo" v-show="usuarioResponsableTrabajo">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarrNombre"
          class="bEditar"
          title="Editar nombre del trabajo"
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
      <div id="nombreTrabajo" v-show="!editandoNombre">
        {{ esteMaterial.nombre }}
      </div>
      <input
        type="text"
        id="inputNuevoNombre"
        :class="{ letrasRojas: nuevoNombreIlegal }"
        v-model="nuevoNombre"
        v-show="editandoNombre"
        @keypress.enter="guardarNuevoNombre"
      />
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
    </div>

    <div id="cantidad">{{ esteMaterial.cantidad }}</div>

    <div id="eliminar">
      <div class="bEquis">
        <div class="linea1"><div class="linea2"></div></div>
      </div>
    </div>

    <div id="campoDescripcion" class="campo">
      <div class="controlesCampo" v-show="usuarioResponsableTrabajo">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarDescripcion"
          class="bEditar"
          title="Editar descripcion del material"
          v-show="usuarioResponsableTrabajo"
          @click.stop="toggleEditandoDescripcion"
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
          @click.stop="guardarNuevoDescripcion"
        />
      </div>

      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ esteMaterial.descripcion }}
      </div>

      <textarea
        id="inputNuevoDescripcion"
        ref="inputNuevoDescripcion"
        :class="{ letrasRojas: nuevoDescripcionIlegal }"
        v-model="nuevoDescripcion"
        v-show="editandoDescripcion"
        placeholder="Escribe una descripción de este material"
      />
      <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";

const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  components: { Loading },
  name: "MaterialTrabajo",
  props: {
    idTrabajo: String,
    esteMaterial: Object,
    usuarioResponsableTrabajo: Boolean,
  },
  data() {
    return {
      deshabilitado: false,

      nuevoNombre: null,
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: null,
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,
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
  },

  methods: {
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
            idTrabajo: this.idTrabajo,
            idMaterial: this.esteMaterial.id,
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
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteMaterial.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight > 100
          ? this.$refs.descripcion.offsetHeight + "px"
          : 100 + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteMaterial.descripcion;
    },
    eliminarse() {
      console.log(`Material eliminandose`);
      if (!confirm("¿Seguro de eliminar este Material?")) {
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
};
</script>

<style scoped>
.materialTrabajo {
  display: grid;
  grid-template-columns: 1fr 60px 100px;
  grid-template-rows: 50px 200px;
  grid-template-areas:
    "nombre cantidad eliminar"
    "descripcion descripcion descripcion";
}
#campoNombre {
  grid-area: nombre;
  font-size: 15px;
  font-weight: bold;
}
.campo:hover > .controlesCampo {
  opacity: 1;
}

#cantidad {
  grid-area: cantidad;
}

#descripcion {
  grid-area: descripcion;
}

.bEquis {
  width: 20px;
  height: 20px;
  background-color: rgb(255, 113, 113);
  border: 1px solid black;
  position: relative;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
}
.bEquis:hover {
  background-color: red;
}

.linea1 {
  height: 16px;
  width: 2px;
  margin-top: 2px;
  margin-left: 9px;
  background-color: black;
  transform: rotate(45deg);
  z-index: 1;
}

.linea2 {
  height: 16px;
  width: 2px;
  background-color: black;
  transform: rotate(90deg);
  z-index: 2;
}
.controlesCampo {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
  margin-right: 20px;
  opacity: 0.1;
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

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}
</style>