<template>
  <div id="buscadorNodosConocimiento">
    <input type="text" placeholder="Buscar" v-model="palabraBuscada" />
    <img id="imagenTentativa" src="" alt="" />
    <div class="opciones">
      <div class="opcion" :key="opcion.id" v-for="opcion of opciones">
        {{ opcion.nombre }}
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

export default {
  name: "BuscadorNodosConocimiento",
  data() {
    return {
      palabraBuscada: "",
      cantidadPalabrasValidas: 0,
      opciones: [],
    };
  },
  watch: {
    palabraBuscada: function (nueva) {
      //   console.log(`nueva palabra: ${nueva}`);
      nueva = nueva.trim();
      nueva = nueva.replace(charProhibidosNombre, "");
      nueva = nueva.replace(/\s\s+/g, " ");

      let palabras = nueva.split(" ");
      let palabrasValidas = [];
      let indexValidas = 0;
      for (let i = 0; i < palabras.length; i++) {
        if (palabras[i].length >= 3) {
          palabrasValidas[indexValidas] = palabras[i];
          indexValidas++;
        }
      }
      this.palabrasValidas = palabrasValidas;
      this.cantidadPalabrasValidas = palabrasValidas.length;
      console.log(`cantidad palabras validas: ${this.cantidadPalabrasValidas}`);
    },
    cantidadPalabrasValidas: function (actual, anterior) {
      if (actual > anterior) {
        console.log(`Descargando nuevas opciones`);
        this.$apollo
          .query({
            query: gql`
              query($palabrasBuscadas: [String]!) {
                busquedaAmplia(palabrasBuscadas: $palabrasBuscadas) {
                  id
                  nombre
                  resumen
                }
              }
            `,
            variables: {
              palabrasBuscadas: this.palabrasValidas,
            },
            fetchPolicy: "network-only",
          })
          .then(({ data: { busquedaAmplia } }) => {
            console.log(`respuesta: ${JSON.stringify(busquedaAmplia)}`);
            this.opciones = busquedaAmplia;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
          });
      }
    },
  },
};
</script>

<style scoped>
</style>