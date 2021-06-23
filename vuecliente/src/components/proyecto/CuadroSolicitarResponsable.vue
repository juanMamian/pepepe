<template>
  <div id="cuadroSolicitarResponsable">
    <div id="zonaIcono" class="zona">
      <div id="selectorCantidad">
        <div
          id="botonSubirCantidad"
          class="botonCantidad"
          style="transform: rotateZ(180deg)"
        ></div>
        <div id="cantidad">{{ cantidadSolicitados }}</div>
        <div id="botonSubirCantidad" class="botonCantidad"></div>
      </div>
      <img src="@/assets/iconos/user.png" alt="Usuario" id="iconoUsuario" />
    </div>

    <div id="zonaDescripcion" class="zona">
      <div class="barraSuperiorZona">
        <span class="nombreZona"> Descripcion </span>
        <div class="controlesZona">
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            style="width: 25px"
            class="controlZona"
            id="botonGuardarDescripcion"
            v-show="
              editandoDescripcion == true && nuevoDescripcionIlegal == false
            "
            @click="guardarNuevoDescripcion"
          />
          <img
            src="@/assets/iconos/editar.png"
            style="width: 25px"
            class="controlZona"
            id="botonEditarDescripcion"
            @click="toggleEditandoDescripcion"
          />
        </div>
      </div>
      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ estaSolicitud.descripcion }}
      </div>

      <textarea
        id="inputNuevoDescripcion"
        ref="inputNuevoDescripcion"
        :class="{ letrasRojas: nuevoDescripcionIlegal }"
        v-model="nuevoDescripcion"
        v-show="editandoDescripcion"
      />
    </div>

    <div id="zonaKeywords" class="zona">
      <div class="barraSuperiorZona">
        <div class="nombreZona">Palabras clave</div>
        <div class="controlesZona">
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            style="width: 25px"
            class="controlZona"
            id="botonGuardarKeywords"
            v-show="
              editandoKeywords == true && nuevoKeywordsIlegal == false
            "
            @click="guardarNuevoKeywords"
          />
          <img
            src="@/assets/iconos/editar.png"
            style="width: 25px"
            class="controlZona"
            id="botonEditarKeywords"
            @click="toggleEditandoKeywords"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const charProhibidosDescripcionSolicitud =
  /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
const charProhibidosKeywordsSolicitud = /[^ a-zA-Zñ,]/;

import gql from "graphql-tag";

export default {
  name: "CuadroSolicitarResponsable",
  props:{
      idProyecto:String,
  },
  data() {
    return {
      cantidadSolicitados: 1,
      estaSolicitud: {},

      editandoDescripcion: false,
      nuevoDescripcion: "",
      enviandoNuevoDescripcion:false,

      editandoKeywords: false,
      nuevoKeywords: "",
      enviandoNuevoKeywords:false,

    };
  },
  methods: {
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.estaSolicitud.descripcion;
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.estaSolicitud.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $nuevoDescripcion: String!) {
              editarDescripcionSolicitudResponsableProyecto(
                idProyecto: $idProyecto
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
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
    guardarNuevoKeywords() {
      if (this.nuevoKeywordsIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoKeywords == this.estaSolicitud.keywords) {
        this.editandoKeywords = false;
        return;
      }
      console.log(`guardando nuevo keywords`);
      this.enviandoNuevoKeywords = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idSolicitud: ID!
              $nuevoKeywords: String!
            ) {
              editarKeywordsSolicitudResponsableProyecto(
                idProyecto: $idProyecto
                idSolicitud: $idSolicitud
                nuevoKeywords: $nuevoKeywords
              ) {
                id
                keywords
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idSolicitud: this.estaSolicitud.id,
            nuevoKeywords: this.nuevoKeywords,
          },
        })
        .then(() => {
          this.enviandoNuevoKeywords = false;
          this.editandoKeywords = false;
        })
        .catch((error) => {
          this.enviandoNuevoKeywords = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoKeywords() {
      this.$refs.inputNuevoKeywords.style.height =
        this.$refs.keywords.offsetHeight + "px";
      this.editandoKeywords = !this.editandoKeywords;
      this.nuevoKeywords = this.estaSolicitud.keywords;
    },
  },
  computed: {
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionSolicitud.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    nuevoKeywordsIlegal() {
      if (this.nuevoKeywords.length < 1) {
        return true;
      }
      if (charProhibidosKeywordsSolicitud.test(this.nuevoKeywords)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
#cuadroSolicitarResponsable {
  border-radius: 15px;
  box-shadow: 2px 2px 2px 2px rgb(190, 190, 190);
}

#zonaIcono {
  display: grid;
  grid-template-columns: 1fr 40px 100px 40px 1fr;
  grid-template-areas: "... cantidad icono ... ...";
}

#selectorCantidad {
  grid-area: cantidad;
}

.botonCantidad {
  width: 1px;
  height: 1px;
  border: 10px solid transparent;
  border-top-color: black;
  cursor: pointer;
}

#iconoUsuario {
  grid-area: icono;
}

.barraSuperiorZona {
  background-color: cadetblue;
  min-height: 27px;
}

.nombreZona {
  font-size: 16px;
  padding: 5px 20px;
  font-weight: bold;
}

.controlesZona {
  float: right;
}

.controlZona {
  cursor: pointer;
}

#descripcion {
  font-size: 15px;
  width: 95%;
  margin: 7px auto;
  padding: 5px;
  min-height: 70px;
  resize: vertical;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 14px;
  height: 70px;
  display: block;
  margin: 7px auto;
  resize: vertical;
}
</style>