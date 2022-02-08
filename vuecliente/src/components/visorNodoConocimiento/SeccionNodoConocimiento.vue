<template>
  <div class="seccionNodoConocimiento">
    <div class="contenedorControles">
      <div class="boton" v-if="usuarioExperto" @click="editando = !editando">
        <img src="@/assets/iconos/edit.svg" alt="Editar" />
      </div>
    </div>
    <div id="zonaFront" v-show="!editando">
      <iframe
        id="iframeSeccion"
        :src="direccionNodo + '/' + estaSeccion.id + '/'"
        frameborder="0"
      ></iframe>
    </div>

    <div id="zonaAdministracion" v-if="usuarioExperto" v-show="editando">
      <div class="contenedorControles">
        <div class="boton" title="Subir un archivo" @click="$refs.inputArchivoContenido.click()" v-show="!subiendoArchivo">
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
          v-for="archivo of estaSeccion.archivos"
          :key="archivo.id"
          @meElimine="$emit('archivoEliminado', archivo.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import ArchivoSeccionNodo from "./archivoSeccionNodo.vue";
import Loading from '../utilidades/Loading.vue';


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

          this.$emit('subiArchivo', infoArchivo);
        })
        .catch((error) => {
          this.subiendoArchivo = false;

          console.log(`Error subiendo archivo. E: ${error}`);
        });
    },
  },
  computed: {
    direccionNodo: function () {
      return this.serverUrl + "/assetsAtlas/contenidosNodos/" + this.idNodo;
    },
  },
};
</script>

<style scoped>
.seccionNodoConocimiento {
  width: 100%;
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
</style>