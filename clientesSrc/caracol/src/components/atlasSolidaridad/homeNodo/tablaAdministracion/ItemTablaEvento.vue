<template>
  <div
    class="itemTablaEvento"
    :class="{ deshabilitado: eliminandose }"
  >
    <div id="barraPrincipal">
      <img
        src="@/assets/iconos/exclamationCircle.svg"
        alt="Exclamación"
        title="Evento"
        class="iconoItem"
      />

      <!-- Fecha -->

      <div class="celdaCampo" id="celdaFecha">
        <input
          id="inputNuevoFecha"
          class="inputNuevoFecha"
          @keydown.tab.prevent="guardarNuevoFecha('next')"
          @keypress.enter.prevent="guardarNuevoFecha"
          @change="guardarNuevoFecha"
          ref="inputNuevoFecha"
          v-model="nuevoFecha"
          @click.stop=""
          @blur="editandoFecha = false"
          @keydown.esc="$refs.inputNuevoFecha.blur()"
          v-show="editandoFecha"
          type="date"
          :class="{ deshabilitado: enviandoNuevoFecha }"
        />
        <div
          id="fecha"
          class="contenidoCampo"
          v-show="!editandoFecha"
          :class="{ deshabilitado: enviandoNuevoFecha }"
          @click="toggleEditandoFecha"
        >
          {{ fechaFormateada }}
        </div>
      </div>

      <!-- Nombre -->
      <div class="celdaCampo" title="Nombre" id="celdaNombre">
        <input
          @keydown.tab.prevent="guardarNuevoNombre('descripcion')"
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          v-model="nuevoNombre"
          @click.stop=""
          @blur="editandoNombre = false"
          @keydown.esc="$refs.inputNuevoNombre.blur()"
          v-show="editandoNombre"
          type="text"
          class="inputNuevoNombre inputNombreCosa"
          :class="{ deshabilitado: enviandoNuevoNombre }"
        />
        <div
          id="nombre"
          class="contenidoCampo"
          :class="{
            deshabilitado: enviandoNuevoNombre,
          }"
          v-show="!editandoNombre"
          @click="toggleEditandoNombre"
        >
          {{ esteEvento.nombre }}
        </div>
      </div>                 

      <div class="controlesItem">        
        <div
          title="Ver descripción de este evento"
          @click.stop="mostrandoDescripcion = !mostrandoDescripcion"
          :class="{
            deshabilitado:
              (!esteEvento.descripcion ||
                esteEvento.descripcion.length === 0) &&
              !usuarioResponsableAmplioNodo,
          }"
          id="botonVerInformacion"
          class="boton"
        >
          <img src="@/assets/iconos/info.svg" alt="Descripcion" />
        </div>

        <div
          title="Eliminar este evento"
          @click.stop="eliminarse"
          class="boton"
          v-show="!eliminandose"
        >
          <img src="@/assets/iconos/trash.svg" alt="Delete" />
        </div>
        <loading texto="" v-show="eliminandose"/>
      </div>
    </div>
    <div id="infoNodoOwner" v-if="esteEvento.nodoOwner">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="cog"
        class="svg-inline--fa fa-cog fa-w-16 iconoNodoOwner"
        v-if="esteEvento.nodoOwner.tipoNodo === 'trabajo'"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
        ></path>
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="star"
        class="svg-inline--fa fa-star fa-w-18 iconoNodoOwner"
        v-if="esteEvento.nodoOwner.tipoNodo === 'objetivo'"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 576 512"
      >
        <path
          fill="currentColor"
          d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
        ></path>
      </svg>
      <div id="nombreNodoOwner">{{ esteEvento.nodoOwner.nombre }}</div>
    </div>
    <div id="contenidoSeleccionado">
      <div
        id="zonaDescripcion"
        class="zonaContenidoSeleccionado"
        v-show="mostrandoDescripcion"
        @click="toggleEditandoDescripcion"
      >
        <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
          {{ esteEvento.descripcion }}
        </div>

        <textarea
          id="inputNuevoDescripcion"
          class="inputTextoNodo"
          ref="inputNuevoDescripcion"
          :class="{ deshabilitado: enviandoNuevoDescripcion }"
          v-model="nuevoDescripcion"
          v-show="editandoDescripcion"
          @click.stop=""
        />
        <div
          class="contenedorBotonesCampo"
          @click.stop=""
          v-show="editandoDescripcion"
        >
          <img
            src="@/assets/iconos/save.svg"
            class="botonGuardarCampo"
            alt="Guardar"
            title="Guardar descripción"
            id="botonGuardarDescripcion"
            v-show="!enviandoNuevoDescripcion"
            @click="guardarNuevoDescripcion"
          />
          <loading texto="" v-show="enviandoNuevoDescripcion"/>
          <img
            src="@/assets/iconos/equis.svg"
            class="botonGuardarCampo"
            alt="Cancelar"
            title="Cancelar edición"
            id="botonCancelarEdicionDescripcion"
            @click="editandoDescripcion = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import {
  charProhibidosNombreCosa,
  charProhibidosTexto,
} from "../../configuracion";
import Loading from "../../../utilidades/Loading.vue";
export default {
  components: { Loading },
  name: "ItemTablaEvento",
  props: {
    esteEvento: Object,
    idNodo: String,
    usuarioResponsableAmplioNodo: Boolean,
  },
  data() {
    return {
      eliminandose: false,
      mostrandoDescripcion: false,

      nuevoFecha: Date.now(),
      editandoFecha: false,
      enviandoNuevoFecha: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,      
    };
  },
  computed: {
    fechaFormateada() {
      return this.esteEvento.fecha.substr(0, 10);
    },
    nuevoFechaIlegal() {
      if (this.nuevoFecha.length < 1) {
        return true;
      }
      return false;
    },
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreCosa.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosTexto.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },    
  },
  methods: {
    eliminarse() {
      if (
        !confirm(
          "¿Confirmar la eliminación de este evento? (Esta acción no puede deshacerse)"
        )
      ) {
        return;
      }
      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idEvento: ID!) {
              eliminarEventoNodoSolidaridad(
                idNodo: $idNodo
                idEvento: $idEvento
              )
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idEvento: this.esteEvento.id,
          },
        })
        .then(() => {
          this.$emit("meElimine");
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          this.eliminandose = false;
        });
    },
    guardarNuevoFecha(next) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoFechaIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoFecha == this.esteEvento.fecha) {
        this.editandoFecha = false;
        if (this.next === "next") {
          this.toggleEditandoNombre();
        }
        return;
      }
      console.log(`guardando nuevo fecha`);
      this.enviandoNuevoFecha = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idEvento: ID!
              $nuevoFecha: Date!
            ) {
              editarFechaEventoNodoSolidaridad(
                idNodo: $idNodo
                idEvento: $idEvento
                nuevoFecha: $nuevoFecha
              ) {
                id
                fecha
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            idNodo: this.idNodo,
            nuevoFecha: this.nuevoFecha,
          },
        })
        .then(() => {
          this.enviandoNuevoFecha = false;
          this.editandoFecha = false;
        })
        .catch((error) => {
          this.enviandoNuevoFecha = false;
          console.log(`Error. E :${error}`);
        });

      if (next === "next") {
        this.toggleEditandoNombre();
      }
    },
    guardarNuevoNombre(next) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      console.log(`guardando nuevo nombre. Next: ${next}`);

      if (this.nuevoNombre == this.esteEvento.nombre) {
        this.editandoNombre = false;
        if (next==='descripcion') {
            
            this.mostrandoDescripcion=true
            this.toggleEditandoDescripcion(true);
        }
        return;
      }
      this.enviandoNuevoNombre = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idEvento: ID!
              $nuevoNombre: String!
            ) {
              editarNombreEventoNodoSolidaridad(
                idNodo: $idNodo
                idEvento: $idEvento
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            idNodo: this.idNodo,
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

      if (next==='descripcion') {
          this.mostrandoDescripcion=true;        
          this.toggleEditandoDescripcion(true);
      }
    },
    guardarNuevoDescripcion() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoDescripcionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoDescripcion == this.esteEvento.descripcion) {
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
              $idEvento: ID!
              $nuevoDescripcion: String!
            ) {
              editarDescripcionEventoNodoSolidaridad(
                idNodo: $idNodo
                idEvento: $idEvento
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idEvento: this.esteEvento.id,
            idNodo: this.idNodo,
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
    toggleEditandoFecha() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.editandoFecha = !this.editandoFecha;
      this.nuevoFecha = this.esteEvento.fecha.substr(0, 10);

      this.$nextTick(() => {
        this.$refs.inputNuevoFecha.focus();
      });
    },
    toggleEditandoNombre() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteEvento.nombre;

      this.$nextTick(() => {
        this.$refs.inputNuevoNombre.focus();
      });
    },    
    toggleEditandoDescripcion(valor) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      console.log(`toggling edit de descripción`);
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = valor || !this.editandoDescripcion;
      console.log(`Queda en ${this.editandoDescripcion}`);
      this.nuevoDescripcion = this.esteEvento.descripcion;

      if (this.editandoDescripcion === true) {
        this.$nextTick(() => {
          this.$refs.inputNuevoDescripcion.focus();
        });
      }
    },    
  },
  watch: {    
    mostrandoDescripcion(mostrando) {
      console.log(`Se abre descripción`);
      if (mostrando) {
        if (
          !this.esteEvento.descripcion ||
          this.esteEvento.descripcion.length < 1
        ) {
          console.log(`Editar`);
          if(!this.editandoDescripcion){
              this.toggleEditandoDescripcion(true);
          }
        }
      }
      else{
        this.editandoDescripcion=false;
      }
    },
  },
};
</script>

<style scoped>
.itemTablaEvento {
  min-height: 10px;
}
.itemTablaEvento:hover {
  background-color: rgba(128, 128, 128, 0.233);
}
#barraPrincipal {
  display: flex;
  align-items: center;
  padding-left: 10px;
}
.iconoItem {
  height: 20px;
}
.celdaCampo {
  padding: 3px 7px;
  min-width: 10px;
  height: 100%;
  flex: 1 1;
}
.celdaCampo input {
  width: 100%;
}
#celdaNombre {
  flex: 2;
  font-size: 14px;
}
#celdaFecha {
  width: 120px;
  font-size: 14px;
  max-width: 100px;
}
#celdaFecha input {
  font-size: 11px;
}
#barraPrincipal .controlesItem{
    visibility: hidden;
}
#barraPrincipal:hover .controlesItem{
    visibility: visible;
}
.controlesItem {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-right: 2%;
}
.controlesItem .boton {
  height: 15px;
  width: 15px;
  opacity: 0.7;
  margin: 0px 0.4vw;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.controlesItem .boton:hover {
  opacity: 1;
}
.controlesItem .boton img {
  height: 100%;
}
#botonVerInformacion.deshabilitado{
  opacity:0.4
}
.zonaContenidoSeleccionado {
  border: 1px solid white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.342);
  padding: 20px;
  margin: 0px 10px;
}
.contenedorBotonesCampo {
  margin: 5px auto;
  display: flex;
  justify-content: center;
}
.botonGuardarCampo {
  width: 15px;
  cursor: pointer;
  margin: 0px 5px;
  opacity: 0.8;
}
#inputNuevoDescripcion {
  width: 100%;
  min-height: 50px;
}

#infoNodoOwner {
  display: flex;
  align-items: center;
  opacity: 0.7;
  margin-right: 2%;
}
#nombreNodoOwner {
  font-size: 11px;
}
.iconoNodoOwner {
  height: 7px;
  margin-right: 5px;
  margin-left: auto;
}

@media only screen and (max-width: 850px) {
  .itemTablaEvento {
    width: 90vw;
  }
  #barraPrincipal {
    flex-wrap: wrap;
  }
  .controlesItem {
    justify-content: flex-end;
    width: 100%;
    margin-bottom: 10px;
  }
  .controlesItem .boton {
    margin: 0px 10px;
  }
  .iconoItem {
    height: 13px;
  }
  #celdaFecha {
    font-size: min(10px, 2vw);
  }
  #celdaNombre {
    font-size: min(14px, 3vw);
  }
  .controlesItem .boton {
    width: 11px;
    height: 11px;
  }
}

@media (hover: none) and (pointer: coarse) {
  #barraPrincipal .controlesItem{
    visibility: visible;
  }
}
</style>