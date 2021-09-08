<template>
  <div
    class="enlaceNodoSolidaridad"
    :class="{ deshabilitado: enviandoQueryGlobal }"
  >
    <div id="lineaPrincipal">
      <a :href="esteEnlace.link" target="blank">
      <img
        src="@/assets/iconos/abrirLink.png"
        alt="Abrir"
        title="Abrir enlace"
        id="botonAbrirEnlace"
        
      />
      </a>
      <img
        src="@/assets/iconos/descripcion.png"
        @click="mostrarDescripcion = !mostrarDescripcion"
        alt="Descripcion"
        :title="
          mostrarDescripcion ? 'Ocultar descripción' : 'MostrarDescripción'
        "
        id="botonMostrarDescripcion"
      />

      <div
        id="nombre"
        :class="{ deshabilitado: enviandoNuevoNombre }"
        v-show="!editandoNombre"
        @click="iniciarEdicionNombre"
      >
        {{ esteEnlace.nombre }}
      </div>

      <input
        ref="inputNuevoNombre"
        :class="{ deshabilitado: enviandoNuevoNombre }"
        type="text"
        @keypress.enter="guardarNuevoNombre"
        @blur="editandoNombre = false"
        v-model="nuevoNombre"
        class="inputNuevoNombre"
        v-show="editandoNombre"
      />

      <img
        src="@/assets/iconos/delete.png"
        alt="Eliminar"
        title="Eliminar enlace"
        id="botonEliminar"
        @click="eliminarse"
      />
    </div>

    <div
      id="campoDescripcion"
      :class="{ deshabilitado: enviandoNuevoDescripcion }"
      v-show="mostrarDescripcion"
    >
      <div
        id="link"
        :class="{ deshabilitado: enviandoNuevoLink }"
        v-show="!editandoLink"
        @click="iniciarEdicionLink"
      >
        {{ esteEnlace.link }}
      </div>

      <input
        ref="inputNuevoLink"
        :class="{ deshabilitado: enviandoNuevoLink }"
        type="text"
        @keypress.enter="guardarNuevoLink"
        @blur="editandoLink = false"
        v-model="nuevoLink"
        class="inputNuevoLink"
        v-show="editandoLink"
      />
      <div
        id="descripcion"
        class="campoDescripcion"
        v-show="!editandoDescripcion"
        @click="iniciarEdicionDescripcion"
      >
        {{ esteEnlace.descripcion }}
      </div>
      <textarea
        ref="inputNuevoDescripcion"
        v-model="nuevoDescripcion"
        class="campoDescripcion"
        id="inputNuevaDescripcion"
        v-show="editandoDescripcion"
        :class="{ deshabilitado: enviandoNuevoDescripcion }"
      />

      <div id="controlesEditarDescripcion">
        <img
          src="@/assets/iconos/guardar.png"
          width="25px"
          alt="Guardar"
          id="botonGuardarDescripcion"
          title="Guardar descripción"
          v-show="editandoDescripcion"
          @click="guardarNuevoDescripcion"
        />
        <img
          src="@/assets/iconos/cancelar.png"
          alt="Cancelar"
          title="Cancelar cambios"
          width="25px"
          id="botonCancelarEdicionDescripcion"
          v-show="editandoDescripcion"
          @click="editandoDescripcion = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

const charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
// const charProhibidosLink = /[^ a-zA-ZÀ-ž0-9_.-?/=:]/;
const charProhibidosDescripcion = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  name: "EnlaceNodoSolidaridad",
  props: {
    esteEnlace: Object,
    idNodo: String,
    tipoNodo: String,
  },
  data() {
    return {
      mostrarDescripcion: false,
      enviandoQueryGlobal: false,

      nuevoNombre: "",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Descripción",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      nuevoLink: "",
      editandoLink: false,
      enviandoNuevoLink: false,
    };
  },

  methods: {
    eliminarse() {
      if (!confirm("¿Eliminar enlace? (Esta operación no puede deshacerese"))
        return;

      this.enviandoQueryGlobal = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idEnlace: ID!, $tipoNodo: String!) {
              eliminarEnlaceNodoSolidaridad(
                idNodo: $idNodo
                idEnlace: $idEnlace
                tipoNodo: $tipoNodo
              )
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idEnlace: this.esteEnlace.id,
            tipoNodo: this.tipoNodo,
          },
        })
        .then(({ data: { eliminarEnlaceNodoSolidaridad } }) => {
          if (eliminarEnlaceNodoSolidaridad) {
            this.$emit("meElimine");
          }
          this.enviandoQueryGlobal = false;
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.enviandoQueryGlobal = false;
        });
    },
    iniciarEdicionNombre() {
      this.editandoNombre = true;
      this.nuevoNombre = this.esteEnlace.nombre;
      this.$nextTick(() => {
        this.$refs.inputNuevoNombre.focus();
      });
    },
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteEnlace.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $tipoNodo: String!
              $idEnlace: ID!
              $nuevoNombre: String!
            ) {
              editarNombreEnlaceNodoSolidaridad(
                idNodo: $idNodo
                tipoNodo: $tipoNodo
                idEnlace: $idEnlace
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idEnlace: this.esteEnlace.id,
            nuevoNombre: this.nuevoNombre,
            tipoNodo: this.tipoNodo,
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
    
    iniciarEdicionLink() {
      this.editandoLink = true;
      this.nuevoLink = this.esteEnlace.link;
      this.$nextTick(() => {
        this.$refs.inputNuevoLink.focus();
      });
    },
    guardarNuevoLink() {
      if (this.nuevoLinkIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoLink == this.esteEnlace.link) {
        this.editandoLink = false;
        return;
      }
      console.log(`guardando nuevo link`);
      this.enviandoNuevoLink = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $tipoNodo: String!
              $idEnlace: ID!
              $nuevoLink: String!
            ) {
              editarLinkEnlaceNodoSolidaridad(
                idNodo: $idNodo
                tipoNodo: $tipoNodo
                idEnlace: $idEnlace
                nuevoLink: $nuevoLink
              ) {
                id
                link
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idEnlace: this.esteEnlace.id,
            nuevoLink: this.nuevoLink,
            tipoNodo: this.tipoNodo,
          },
        })
        .then(() => {
          this.enviandoNuevoLink = false;
          this.editandoLink = false;
        })
        .catch((error) => {
          this.enviandoNuevoLink = false;
          console.log(`Error. E :${error}`);
        });
    },

    iniciarEdicionDescripcion() {
      this.editandoDescripcion = true;
      this.nuevoDescripcion = this.esteEnlace.descripcion;
      this.$nextTick(() => {
        this.$refs.inputNuevoDescripcion.focus();
      });
    },    
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteEnlace.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $tipoNodo: String!
              $idEnlace: ID!
              $nuevoDescripcion: String!
            ) {
              editarDescripcionEnlaceNodoSolidaridad(
                idNodo: $idNodo
                tipoNodo: $tipoNodo
                idEnlace: $idEnlace
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idEnlace: this.esteEnlace.id,
            nuevoDescripcion: this.nuevoDescripcion,
            tipoNodo: this.tipoNodo,
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
  },
  computed: {
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombre.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcion.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoLinkIlegal() {
      // if (!this.nuevoLink || this.nuevoLink.length < 1) {
      //   return true;
      // }
      // if (charProhibidosLink.test(this.nuevoLink)) {
      //   return true;
      // }
      return false;
    },
  },
};
</script>

<style scoped>
.enlaceNodoSolidaridad {
}
#lineaPrincipal {
  display: flex;
}
#botonEditar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
}
#botonEditar:hover {
  background-color: rgb(238, 108, 68);
}
#botonAbrirEnlace {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
#botonMostrarDescripcion {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
}
#botonEliminar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: auto;
}
#botonEliminar:hover {
  background-color: rgb(233, 61, 61);
}
#link {
  background-color: rgb(154, 204, 219);
  border-radius: 20px;
  border: 2px solid rgb(19, 55, 134);
  padding: 15px;
  width: 90%;
  margin: 5px auto;
}
.campoDescripcion {
  width: 90%;
  margin: 5px auto;
  min-height: 100px;
  display: block;
}
#descripcion {
  background-color: rgb(219, 154, 159);
  border-radius: 20px;
  border: 2px solid rgb(185, 64, 70);
  padding: 15px;
}
#inputNuevaDescripcion {
  resize: vertical;
}
#botonGuardarDescripcion {
  cursor: pointer;
  border-radius: 50%;
  padding: 5px;
}
#botonGuardarDescripcion:hover {
  background-color: rgba(128, 128, 128, 0.685);
}
#botonCancelarEdicionDescripcion {
  cursor: pointer;
}
#botonCancelarEdicionDescripcion:hover {
  background-color: rgba(128, 128, 128, 0.699);
  border-radius: 50%;
}

#controlesEditarDescripcion {
  display: flex;
  align-items: center;
}
</style>