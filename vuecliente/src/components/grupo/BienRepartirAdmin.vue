<template>
  <div class="bienRepartirAdmin" @mouseenter="hovered=true" @mouseleave="hovered=false">
    <div class="renglonPrincipal">
      <img
        src="@/assets/iconos/iconoBienProyecto.png"
        style="width: 30px; height: 30px"
        alt="Bien"
      />

      <div
        id="nombre"
        ref="nombre"
        class="campo"
        v-show="!editandoNombre"
        @click="iniciarEditNombre"
      >
        {{ esteBien.nombre }}
      </div>
      <input
        type="text"        
        ref="inputNuevoNombre"
        class="campo"
        v-show="editandoNombre"
        :class="{
          deshabilitado: enviandoNuevoNombre,
          letrasRojas: nuevoNombreIlegal,
        }"
        v-model="nuevoNombre"
        @keydown="aceptarCambioCampo"
        @keypress.esc="
          editandoNombre = false;
          nuevoNombre = esteBien.nombre;
        "
        @blur="guardarNuevoNombre"
      />

      <div
        id="unidad"
        ref="unidad"
        class="campo"
        v-show="!editandoUnidad"
        @click="iniciarEditUnidad"
      >
        {{ esteBien.unidad }}
      </div>
      <input
        type="text"
        ref="inputNuevoUnidad"
        class="campo"
        v-show="editandoUnidad"
        :class="{
          deshabilitado: enviandoNuevoUnidad,
          letrasRojas: nuevoUnidadIlegal,
        }"
        v-model="nuevoUnidad"
        @keydown="aceptarCambioCampo"
        @keypress.esc="
          editandoUnidad = false;
          nuevoUnidad = esteBien.unidad;
        "
        @blur="guardarNuevoUnidad"
      />

      <div
        id="cantidad"
        ref="cantidad"
        class="campo"
        v-show="!editandoCantidad"
        @click="iniciarEditCantidad"
      >
        {{ esteBien.cantidad }}
      </div>
      <input
        type="number"
        ref="inputNuevoCantidad"
        class="campo"
        v-show="editandoCantidad"
        :class="{ deshabilitado: enviandoNuevoCantidad }"
        v-model="nuevoCantidad"
        @keydown="aceptarCambioCampo"
        @keypress.esc="
          editandoCantidad = false;
          nuevoCantidad = esteBien.cantidad;
        "
        @
        @blur="guardarNuevoCantidad"
      />

      <div
        id="fechaCierre"
        ref="fechaCierre"
        class="campo"
        v-show="!editandoFechaCierre"
        @click="iniciarEditFechaCierre"
      >
        {{ fechaCierreFormateada }}
      </div>
      <input
        type="date"
        ref="inputNuevoFechaCierre"
        class="campo"
        v-show="editandoFechaCierre"
        :class="{ deshabilitado: enviandoNuevoFechaCierre }"
        v-model="nuevoFechaCierre"
        @change="guardarNuevoFechaCierre"
        @keypress.esc="
          editandoFechaCierre = false;
          nuevoFechaCierre = esteBien.fechaCierre;
        "
        @blur="editandoFechaCierre=false"
      />

      <div
        id="fechaReparticion"
        ref="fechaReparticion"
        class="campo"
        v-show="!editandoFechaReparticion"
        @click="iniciarEditFechaReparticion"
        @blur="editandoFechaCierre=false"
      >
        {{ fechaReparticionFormateada }}
      </div>
      <input
        type="date"
        ref="inputNuevoFechaReparticion"
        id="inputNuevoFechaReparticion"
        class="campo"
        v-show="editandoFechaReparticion"
        :class="{ deshabilitado: enviandoNuevoFechaReparticion }"
        v-model="nuevoFechaReparticion"
        @change="guardarNuevoFechaReparticion"
        @keypress.esc="
          editandoFechaReparticion = false;
          nuevoFechaReparticion = esteBien.fechaReparticion;
        "
        @blur="editandoFechaReparticion=false"

      />

      <div id="botonEliminar" @click.stop="eliminarse" class="botonEquis" :style="[{visibility: hovered?'visible':'hidden'}]">
        <div class="linea1"></div>
        <div class="linea2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

const charProhibidosNombreBien = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

export default {
  name: "BienRepartirAdmin",
  props: {
    esteBien: Object,
    idProyecto: String,
  },
  data() {
    return {
      hovered:false,

      nuevoNombre: null,
      nuevoUnidad: null,
      nuevoCantidad: null,
      nuevoFechaCierre: null,
      nuevoFechaReparticion: null,

      editandoNombre: false,
      editandoUnidad: false,
      editandoCantidad: false,
      editandoFechaCierre: false,
      editandoFechaReparticion: false,

      enviandoNuevoNombre: false,
      enviandoNuevoUnidad: false,
      enviandoNuevoCantidad: false,
      enviandoNuevoFechaCierre: false,
      enviandoNuevoFechaReparticion: false,
    };
  },
  methods: {
    aceptarCambioCampo(e){    
      console.log(`${e.which}`);  
      if(e.which==13){
        e.target.blur();
      }

      if(e.which==9){
        e.preventDefault();
        e.target.blur();
        if(e.target.id==="inputNuevoNombre"){
          this.$refs.unidad.click();
        }
        else if(e.target.id==="inputNuevoUnidad"){
          this.$refs.cantidad.click();          
        }
        else if(e.target.id==="inputNuevoCantidad"){
          this.$refs.fechaCierre.click();          
        }
      }
      

    },

    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        return;
      }
      if (this.nuevoNombre === this.esteBien.nombre) {
        this.editandoNombre = false;
        return;
      }
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idBien: ID!, $nuevoNombre: String!) {
              setNombreBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
          console.log(`Nombre guardado`);
        })
        .catch(() => {
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        });
    },
    iniciarEditNombre() {
      this.nuevoNombre = this.esteBien.nombre;
      this.editandoNombre = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoNombre.focus();
      });
    },

    guardarNuevoUnidad() {
      if (this.nuevoUnidadIlegal) {
        return;
      }
      if (this.nuevoUnidad === this.esteBien.unidad) {
        this.editandoUnidad = false;
        return;
      }
      this.enviandoNuevoUnidad = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idBien: ID!, $nuevoUnidad: String!) {
              setUnidadBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                nuevoUnidad: $nuevoUnidad
              ) {
                id
                unidad
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            nuevoUnidad: this.nuevoUnidad,
          },
        })
        .then(() => {
          this.enviandoNuevoUnidad = false;
          this.editandoUnidad = false;
          console.log(`Unidad guardado`);
        })
        .catch(() => {
          this.enviandoNuevoUnidad = false;
          this.editandoUnidad = false;
        });
    },
    iniciarEditUnidad() {
      this.nuevoUnidad = this.esteBien.unidad;
      this.editandoUnidad = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoUnidad.focus();
      });
    },

    guardarNuevoCantidad() {
      if (this.nuevoCantidad === this.esteBien.cantidad) {
        this.editandoCantidad = false;
        return;
      }
      this.enviandoNuevoCantidad = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idBien: ID!, $nuevoCantidad: Float!) {
              setCantidadBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                nuevoCantidad: $nuevoCantidad
              ) {
                id
                cantidad
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            nuevoCantidad: Number(this.nuevoCantidad),
          },
        })
        .then(() => {
          this.enviandoNuevoCantidad = false;
          this.editandoCantidad = false;
          console.log(`Cantidad guardado`);
        })
        .catch(() => {
          this.enviandoNuevoCantidad = false;
          this.editandoCantidad = false;
        });
    },
    iniciarEditCantidad() {
      this.nuevoCantidad = this.esteBien.cantidad;
      this.editandoCantidad = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoCantidad.focus();
      });
    },

    guardarNuevoFechaCierre() {
      if (this.nuevoFechaCierre === this.esteBien.fechaCierre) {
        this.editandoFechaCierre = false;
        return;
      }
      this.enviandoNuevoFechaCierre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idProyecto: ID!
              $idBien: ID!
              $nuevoFechaCierre: Date!
            ) {
              setFechaCierreBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                nuevoFechaCierre: $nuevoFechaCierre
              ) {
                id
                fechaCierre
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            nuevoFechaCierre: this.nuevoFechaCierre,
          },
        })
        .then(() => {
          this.enviandoNuevoFechaCierre = false;
          this.editandoFechaCierre = false;
          console.log(`FechaCierre guardado`);
        })
        .catch(() => {
          this.enviandoNuevoFechaCierre = false;
          this.editandoFechaCierre = false;
        });
    },
    iniciarEditFechaCierre() {
      this.nuevoFechaCierre = this.esteBien.fechaCierre.substr(0, 10);
      this.editandoFechaCierre = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoFechaCierre.focus();
      });
    },

    guardarNuevoFechaReparticion() {
      if (this.nuevoFechaReparticion === this.esteBien.fechaReparticion) {
        this.editandoFechaReparticion = false;
        return;
      }
      this.enviandoNuevoFechaReparticion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idProyecto: ID!
              $idBien: ID!
              $nuevoFechaReparticion: Date!
            ) {
              setFechaReparticionBienProyecto(
                idProyecto: $idProyecto
                idBien: $idBien
                nuevoFechaReparticion: $nuevoFechaReparticion
              ) {
                id
                fechaReparticion
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
            nuevoFechaReparticion: this.nuevoFechaReparticion,
          },
        })
        .then(() => {
          this.enviandoNuevoFechaReparticion = false;
          this.editandoFechaReparticion = false;
          console.log(`FechaReparticion guardado`);
        })
        .catch(() => {
          this.enviandoNuevoFechaReparticion = false;
          this.editandoFechaReparticion = false;
        });
    },
    iniciarEditFechaReparticion() {
      this.nuevoFechaReparticion = this.esteBien.fechaReparticion.substr(0, 10);
      this.editandoFechaReparticion = true;
      this.$nextTick(() => {
        this.$refs.inputNuevoFechaReparticion.focus();
      });
    },

    eliminarse() {
      if (!confirm("¿Eliminar este bien? (Esta acción no puede deshacerse)"))
        return;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idProyecto: ID!, $idBien: ID!) {
              eliminarBienProyecto(idProyecto: $idProyecto, idBien: $idBien)
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idBien: this.esteBien.id,
          },
        })
        .then(({ data: { eliminarBienProyecto } }) => {
          if (eliminarBienProyecto) {
            this.$emit("meElimine");
          }
        });
    },
  },
  computed: {
    nuevoNombreIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreBien.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoUnidadIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreBien.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },

    fechaCierreFormateada: function () {
      var laFecha = new Date(this.esteBien.fechaCierre).toString();

      var indexGMT = laFecha.indexOf("GMT");
      if (indexGMT > -1) {
        var fechaCorta = laFecha.substr(0, indexGMT - 10);
      }
      return fechaCorta;
    },
    fechaReparticionFormateada: function () {
      var laFecha = new Date(this.esteBien.fechaReparticion).toString();

      var indexGMT = laFecha.indexOf("GMT");
      if (indexGMT > -1) {
        var fechaCorta = laFecha.substr(0, indexGMT - 10);
      }
      return fechaCorta;
    },
  },
  mounted() {
    this.nuevoNombre = this.esteBien.nombre;
    this.nuevoUnidad = this.esteBien.unidad;
    this.nuevoCantidad = this.esteBien.cantidad;
  },
};
</script>

<style scoped>
.bienRepartirAdmin:hover {
  background-color: rgba(194, 194, 194, 0.521);
}
.renglonPrincipal{
  padding: 15px 10px;
  display: flex;
}
.campo {
  margin: 0px 20px;
  width: 150px
}
#botonEliminar {
  position: relative;
  margin-left: auto;
  
}
</style>