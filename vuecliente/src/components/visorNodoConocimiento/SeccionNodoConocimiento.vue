<template>
  <div class="seccionNodoConocimiento">
    <div class="contenedorControles">
      <div class="boton" v-if="usuarioExperto" @click="editando = !editando">
        <img src="@/assets/iconos/edit.svg" alt="Editar" />
      </div>
    </div>
    <div id="zonaFront" v-show="!editando" :key="versionArchivo">
      <iframe
        id="iframeSeccion"
        :src="direccionNodo + '/' + estaSeccion.id + '/?v=' + versionArchivo"
        v-if="estaSeccion.tipoPrimario.substring(0,5)!='image'"
        frameborder="0"
      ></iframe>
      <img
      :src="direccionNodo + '/' + estaSeccion.id + '/?v=' + versionArchivo"
      v-if="estaSeccion.tipoPrimario.substring(0,5)==='image'"
      />
    </div>

    <div id="zonaAdministracion" v-if="usuarioExperto" v-show="editando">
      <div id="nombre" v-show="!editandoNombre" @click="iniciarEdicionNombre">
        {{ estaSeccion.nombre }}
      </div>
      <input
        v-show="editandoNombre"
        type="text"
        name=""
        :value="estaSeccion.nombre"
        id="inputNuevoNombre"
        ref="inputNuevoNombre"
        :class="{deshabilitado: enviandoNuevoNombre}"
        @blur="guardarNuevoNombre"
        @keypress.enter="guardarNuevoNombre"
      />
      <loading texto="" v-show="enviandoNuevoNombre"/>
      <div class="contenedorControles">
        <div
          class="boton"
          title="Subir un archivo"
          @click="$refs.inputArchivoContenido.click()"
          v-show="!subiendoArchivo"
        >
          <img src="@/assets/iconos/plusCircle.svg" alt="Plus" />
        </div>
        <loading texto="" v-show="subiendoArchivo" />

        <div
          class="boton"
          :title="
            estaSeccion.modo === 'archivo'
              ? 'Cambiar modo a enlace'
              : 'Cambiar modo a archivo'
          "
        >
          <img
            src="@/assets/iconos/file.svg"
            v-show="estaSeccion.modo === 'archivo'"
            alt="Archivo"
          />
          <img
            src="@/assets/iconos/link.svg"
            v-show="estaSeccion.modo === 'enlace'"
            alt="Archivo"
          />
        </div>
      </div>

      <div id="listaArchivos" v-show="estaSeccion.modo === 'archivo'">
        <input
          type="file"
          class="inputArchivoContenido"
          ref="inputArchivoContenido"
          v-show="false"
          @change="subirArchivoContenido($event)"
        />
        <archivo-seccion-nodo
          :esteArchivo="archivo"
          :usuarioExperto="usuarioExperto"
          :idNodo="idNodo"
          :idSeccion="estaSeccion.id"
          v-for="archivo of archivosOrdenados"
          :key="archivo.id"
          @meElimine="$emit('archivoEliminado', archivo.nombre)"
          @soyPrimario="
            $emit('tengoNuevoPrimario', archivo.nombre);
            versionArchivo++;
          "
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import ArchivoSeccionNodo from "./archivoSeccionNodo.vue";
import Loading from "../utilidades/Loading.vue";
import { charProhibidosNombreCosa } from "../configs";
import gql from "graphql-tag";

export default {
  props: {
    estaSeccion: Object,
    idNodo: String,
    usuarioExperto: Boolean,
  },
  components: {
    ArchivoSeccionNodo,
    Loading,
  },
  name: "SeccionNodoConocimiento",
  data() {
    return {
      editando: false,
      subiendoArchivo: false,
      versionArchivo: 0,

      editandoNombre: false,
      enviandoNuevoNombre: false,
    };
  },
  methods: {
    subirArchivoContenido(e) {
      const inputArchivo = e.target;
      var datos = new FormData();
      const nuevoArchivo = inputArchivo.files[0];

      datos.append("nuevoArchivo", nuevoArchivo);
      datos.append("idNodo", this.idNodo);
      datos.append("idSeccion", this.estaSeccion.id);
      this.subiendoArchivo = true;
      axios({
        method: "post",
        url: this.serverUrl + "/api/atlas/subirArchivoContenidoSeccionNodo",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data: { infoArchivo } }) => {
          this.subiendoArchivo = false;
          this.versionArchivo++;
          this.$emit("subiArchivo", infoArchivo);
        })
        .catch((error) => {
          this.subiendoArchivo = false;

          console.log(`Error subiendo archivo. E: ${error}`);
        });
    },
    iniciarEdicionNombre() {
      this.$refs.inputNuevoNombre.value = this.estaSeccion.nombre;
      this.editandoNombre = true;
    },
    guardarNuevoNombre() {
      var nuevoNombre = this.$refs.inputNuevoNombre.value.trim();
      if (nuevoNombre == this.estaSeccion.nombre) {
        this.editandoNombre = false;
        return;
      }

      if (nuevoNombre.length < 1) {
        return;
      }
      if (charProhibidosNombreCosa.test(nuevoNombre)) {
        console.log(`Caracteres ilegales`);
        return;
      }

      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idSeccion: ID!
              $nuevoNombre: String!
            ) {
              editarNombreSeccionNodoConocimiento(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idSeccion: this.estaSeccion.id,
            nuevoNombre: nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
  },
  computed: {
    direccionNodo: function () {
      return this.serverUrl + "/assetsAtlas/contenidosNodos/" + this.idNodo;
    },
    archivosOrdenados() {
      var archivos = JSON.parse(JSON.stringify(this.estaSeccion.archivos));
      archivos.sort((a) => {
        if (a.primario) return -1;
        return 0;
      });
      return archivos;
    },
  },
};
</script>

<style scoped>
.seccionNodoConocimiento {
  width: 100%;
}
#zonaFront{
  height: 100vh;
  max-width:100vw;
  margin: 5px auto;
}
#zonaFront iframe{
  height: 100%;
  width: 100%;
}
#zonaFront img{
  max-width: 100%;
  display:block;
}
#iframeSeccion {
  width: 100%;
  height: 100vh;
}
#zonaAdministracion {
  width: min(500px, 90vw);
  border-radius: 10px;
  margin: 0px auto;
  background-color: var(--paletaMain);
  padding: 10px 0px;
  min-height: 300px;
}
#nombre {
  text-align: center;
}
#inputNuevoNombre {
  display: block;
  margin: 15px auto;
  padding: 5px;
  border-radius: 5px;
  font-size: 16px;
  color: rgb(48, 48, 48);
}
</style>
