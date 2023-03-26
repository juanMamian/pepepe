<template>
  <div
    class="recursoExternoNodo"
    :class="{ deshabilitado: eliminando, editandose: editandoRecurso }"
  >
    <div id="barraSuperior" @click="clickEnRecurso">
      <img
        id="iconoTipoRecurso"
        src="@/assets/iconos/link.svg"
        v-if="esteRecurso.tipo === 'enlace'"
      />
      <img id="iconoTipoRecurso" src="@/assets/iconos/file.svg" v-else />
      <div id="zonaNombre">
        <input
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          v-model="nuevoNombre"
          v-show="editandoRecurso"
          type="text"
          class="inputNuevoNombre inputNombreCosa"
          :class="{deshabilitado: enviandoNuevoNombre}"
          @click.stop=""
        />
        <div id="elNombre" v-show="!editandoRecurso">
          {{ esteRecurso.nombre }}
        </div>
      </div>

      <div id="zonaBotonesControl" v-show="usuarioResponsableAmplio">
        <img
          src="@/assets/iconos/lapiz.svg"
          alt="Editar"
          title="Editar recurso"
          v-show="!editandoRecurso"
          @click.stop="iniciarEditandoRecurso"
          class="botonControl"
        />
        <img
          src="@/assets/iconos/equis.svg"
          alt="Cancelar"
          title="Cancelar edición"
          v-show="editandoRecurso"
          @click.stop="editandoRecurso = false"
          class="botonControl"
        />
        <img
          src="@/assets/iconos/trash.svg"
          alt="Eliminar"
          title="Eliminar recurso"
          v-show="!editandoRecurso"
          class="botonControl"
          @click.stop="eliminarse"
        />
      </div>
      <loading texto="" v-show="eliminando" />
    </div>
    <div id="zonaEdicionRecurso" v-show="editandoRecurso">
      <div id="bloqueBotonesSetTarget">
        <div
          class="boton botonSetTarget"
          :style="[
            { borderColor: settingTarget === 'file' ? 'white' : 'transparent' },
          ]"
          title="Subir archivo"
        >
          <img src="@/assets/iconos/uploadCloud.svg" alt="Upload" />
        </div>
        <div
          class="boton botonSetTarget"
          @click.stop="iniciarInputLink"
          :style="[
            { borderColor: settingTarget === 'link' ? 'white' : 'transparent' },
          ]"
          title="Introducir enlace"
        >
          <img src="@/assets/iconos/link.svg" alt="Enlace" />
        </div>
      </div>
      <div id="zonaInputNuevoLink">
        <input
          ref="inputNuevoLink"
          @click.stop=""
          @keypress.enter="guardarNuevoLink"
          v-show="settingTarget === 'link'"
          type="text"
          placeholder="Introduce el enlace"
          class="inputNuevoLink"
          style="width: 90%"
          v-model="nuevoLink"
          :class="{deshabilitado:enviandoNuevoLink}"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { charProhibidosNombreCosa } from "../configuracion";
import gql from "graphql-tag";
import Loading from "../../utilidades/Loading.vue";

export default {
  components: { Loading },
  name: "RecursoExternoNodo",
  props: {
    esteRecurso: Object,
    seleccionado: Boolean,
    usuarioResponsableAmplio: Boolean,
    idNodo: String,
  },
  data() {
    return {
      nuevoNombre: "Nuevo nombre",
      enviandoNuevoNombre: false,

      nuevoLink: null,
      enviandoNuevoLink: false,

      editandoRecurso: false,
      eliminando: false,
      settingTarget: null,
    };
  },
  computed: {
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreCosa.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoLinkIlegal() {
      if (this.nuevoLink.length < 5) {
        return true;
      }
      return false;
    },
  },
  methods: {
    clickEnRecurso() {
      if(this.editandoRecurso){
        return
      }
      if (this.esteRecurso.tipo === "enlace") {
        window.open(this.esteRecurso.link, "_blank");
      }
    },
    guardarNuevoNombre() {
      this.nuevoNombre=this.$refs.inputNuevoNombre.value;

      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteRecurso.nombre) {
        this.editando
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idRecursoExterno: ID!
              $nuevoNombre: String!
            ) {
              editarNombreRecursoExternoNodoSolidaridad(
                idNodo: $idNodo
                idRecursoExterno: $idRecursoExterno
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idRecursoExterno: this.esteRecurso.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoRecurso = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoLink() {
      if (this.nuevoLinkIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoLink == this.esteRecurso.link) {
        return;
      }
      console.log(`guardando nuevo link`);
      this.enviandoNuevoLink = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idRecursoExterno: ID!
              $nuevoLink: String!
            ) {
              editarLinkRecursoExternoNodoSolidaridad(
                idNodo: $idNodo
                idRecursoExterno: $idRecursoExterno
                nuevoLink: $nuevoLink
              ) {
                id
                link
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idRecursoExterno: this.esteRecurso.id,
            nuevoLink: this.nuevoLink,
          },
        })
        .then(() => {
          this.enviandoNuevoLink = false;
          this.settingTarget = null;
        })
        .catch((error) => {
          this.enviandoNuevoLink = false;
          console.log(`Error. E :${error}`);
        });
    },
    iniciarEditandoRecurso() {
      this.nuevoNombre = this.esteRecurso.nombre;
      this.editandoRecurso = true;
    },
    eliminarse() {
      if (
        !confirm(
          "¿Confirmar la eliminación de este elemento? (Esta acción no puede deshacerse)"
        )
      ) {
        return;
      }
      this.eliminando = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idRecursoExterno: ID!) {
              eliminarRecursoExternoNodoSolidaridad(
                idNodo: $idNodo
                idRecursoExterno: $idRecursoExterno
              )
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idRecursoExterno: this.esteRecurso.id,
          },
        })
        .then(() => {
          this.eliminando = false;
          this.$emit('meElimine')
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.eliminando = false;
        });
    },
    iniciarInputLink() {
      this.settingTarget = "link";
      this.$nextTick(() => {
        this.$refs.inputNuevoLink.focus();
      });
    },
  },
  watch: {
    settingTarget(modo, prev) {
      if (modo === "link" && prev != "link") {
        this.nuevoLink = this.esteRecurso.link;
        this.$refs.inputNuevoLink.focus();
      }
    },
    editandoRecurso(editando) {
      if (!editando) {
        this.settingTarget = null;
      }
    },
  },
};
</script>

<style scoped>
.recursoExternoNodo {
  cursor: pointer;
}
.recursoExternoNodo:hover,
.recursoExternoNodo.editandose {
  background-color: rgba(0, 0, 0, 0.062);
}
.recursoExternoNodo #zonaBotonesControl {
  visibility: hidden;
}

.recursoExternoNodo:hover #zonaBotonesControl {
  visibility: visible;
}
#barraSuperior {
  padding: 2% 5%;
  display: flex;
  align-items: center;
}
#iconoTipoRecurso {
  height: 15px;
  margin-right: 2%;
}
.inputNuevoNombre{
  width: 80%;
}
#zonaBotonesControl {
  display: flex;
  margin-left: auto;
  position: relative;
}
.botonControl {
  height: 15px;
  opacity: 0.5;
  cursor: pointer;
  margin: 0px 5px;
}
.botonControl:hover {
  opacity: 1;
}
#zonaEdicionRecurso {
  padding-bottom: 10px;
  padding-left: 5%;
}
.botonSetTarget {
  height: 25px;
  margin-right: 2%;
  border-width: 1px;
  border-style: solid;
  border-radius: 50%;
  padding: 3px;
  display: flex;
  align-items: center;
}
.botonSetTarget > img {
  height: 90%;
}
#bloqueBotonesSetTarget {
  display: flex;
}

@media (hover: none) and (pointer: coarse) {
  .recursoExternoNodo #zonaBotonesControl {
    visibility: visible;
  }
}
</style>