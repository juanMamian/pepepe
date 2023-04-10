<template>
  <div class="nodoConocimientoVistaListaAdmin">
    <div class="barraSuperior" :class="{ deUsuario: usuarioExperto }">
      <a
        :href="clienteUrl + '/#/atlas/nodoConocimiento/' + esteNodo.id"
        target="_blank"
      >
        <div class="nombre">
          {{ esteNodo.nombre }}
        </div>
      </a>
    </div>
    <div id="listaSecciones">
      <div
        class="seccion"
        v-for="seccion of esteNodo.secciones"
        :key="seccion.id"
      >
        <div class="barraSuperior">
          <div class="imagenTipoSeccion">
            <img
              src="@/assets/iconos/link.svg"
              alt="Enlace"
              v-if="seccion.modo === 'enlace'"
            />
            <img
              src="@/assets/iconos/file.svg"
              alt="Archivo"
              v-if="seccion.modo === 'archivo'"
            />
          </div>

          <div class="nombre">
            {{ seccion.nombre }}
          </div>

          <div class="zonaSource">
            <input
              type="text"
              :value="seccion.enlace"
              @keypress.enter="guardarEnlaceSeccion($event, seccion.id)"
              class="inputEnlace"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

export default {
  name: "NodoConocimientoVistaListaAdmin",
  props: {
    esteNodo: Object,
  },
  data() {
    return {};
  },
  computed: {
    usuarioExperto() {
      if (!this.usuarioLogeado) return false;
      return this.esteNodo.expertos.includes(this.usuario.id);
    },
  },
  methods: {
    guardarEnlaceSeccion(e, idSeccion) {
      var nuevoEnlace = e.target.value.trim();
      console.log("Guardando nuevo enlace: " + nuevoEnlace);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idSeccion: ID!, $nuevoEnlace: String!) {
              setNuevoEnlaceSeccionNodo(
                idNodo: $idNodo
                idSeccion: $idSeccion
                nuevoEnlace: $nuevoEnlace
              ) {
                id
                modo
                enlace
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idSeccion,
            nuevoEnlace,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("Error: " + error);
        });
    },
  },
};
</script>

<style scoped>
.nodoConocimientoVistaListaAdmin{
    margin-top: 15px;
}
.barraSuperior {
  display: flex;
  padding: 10px 10px;
}

#listaSecciones {
  padding-left: 15px;
}

.barraSuperior.deUsuario {
  background-color: rgb(83, 163, 83);
}

.imagenTipoSeccion {
  width: 20px;
  height: 20px;
}

.imagenTipoSeccion img {
  height: 100%;
}

.seccion .nombre{
    margin: 0px 10px;
}
</style>