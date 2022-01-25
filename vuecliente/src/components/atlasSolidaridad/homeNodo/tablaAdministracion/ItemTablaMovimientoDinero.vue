<template>
  <div
    class="itemTablaMovimientoDinero"
    :class="{ deshabilitado: eliminandose }"
  >
    <div id="barraPrincipal">
      <img
        src="@/assets/iconos/receipt.svg"
        alt="Receta"
        title="Movimiento de dinero"
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

      <!-- Articulo -->
      <div class="celdaCampo" title="Articulo" id="celdaArticulo">
        <input
          @keydown.tab.prevent="guardarNuevoArticulo('cantidad')"
          @keypress.enter.prevent="guardarNuevoArticulo"
          ref="inputNuevoArticulo"
          v-model="nuevoArticulo"
          @click.stop=""
          @blur="editandoArticulo = false"
          @keydown.esc="$refs.inputNuevoArticulo.blur()"
          v-show="editandoArticulo"
          type="text"
          class="inputNuevoArticulo inputNombreCosa"
          :class="{ deshabilitado: enviandoNuevoArticulo }"
        />
        <div
          id="articulo"
          class="contenidoCampo"
          :class="{
            deshabilitado: enviandoNuevoArticulo,
          }"
          v-show="!editandoArticulo"
          @click="toggleEditandoArticulo"
        >
          {{ esteMovimiento.articulo }}
        </div>
      </div>

      <!-- Cantidad -->
      <div
        class="celdaCampo"
        id="celdaCantidad"
        title="Cantidad"
        @click="toggleEditandoCantidad"
      >
        <input
          @keypress.enter.prevent="guardarNuevoNumeros"
          ref="inputNuevoCantidad"
          v-model="nuevoCantidad"
          @click.stop=""
          @blur="
            editandoCantidad = false;
            nuevoCantidad = esteMovimiento.cantidad;
          "
          @keydown.esc="$refs.inputNuevoCantidad.blur()"
          @keydown.tab.prevent="guardarNuevoNumeros('movimientoUnitario')"
          v-show="editandoCantidad"
          type="number"
          min="0"
          class="inputNuevoCantidad"
          :class="{
            deshabilitado: enviandoNuevoCantidad || enviandoNuevoNumeros,
          }"
        />
        <div
          id="cantidad"
          class="contenidoCampo"
          :class="{
            deshabilitado: enviandoNuevoCantidad,
          }"
          v-show="!editandoCantidad"
        >
          {{ esteMovimiento.cantidad }}
        </div>
      </div>

      <!-- Movimiento unitario -->
      <div
        class="celdaCampo"
        title="Valor unitario"
        @click="toggleEditandoMovimientoUnitario"
      >
        <input
          @keypress.enter.prevent="guardarNuevoNumeros"
          @keydown.tab.prevent="guardarNuevoNumeros('movimientoTotal')"
          ref="inputNuevoMovimientoUnitario"
          v-model="nuevoMovimientoUnitario"
          @click.stop=""
          @blur="
            editandoMovimientoUnitario = false;
            nuevoMovimientoUnitario = esteMovimiento.movimientoUnitario;
          "
          @keydown.esc="$refs.inputNuevoMovimientoUnitario.blur()"
          v-show="editandoMovimientoUnitario"
          type="number"
          class="inputNuevoMovimientoUnitario"
          :class="{
            deshabilitado:
              enviandoNuevoMovimientoUnitario || enviandoNuevoNumeros,
          }"
        />
        <div
          id="movimientoUnitario"
          class="contenidoCampo contenidoCampoDinero"
          :class="{
            deshabilitado: enviandoNuevoMovimientoUnitario,
          }"
          v-show="
            !editandoMovimientoUnitario && movimientoDependiente != 'unitario'
          "
        >
          {{ esteMovimiento.movimientoUnitario }}
        </div>
        <div
          id="movimientoUnitarioDependiente"
          class="contenidoCampo contenidoCampoDinero movimientoDependiente"
          :class="{
            deshabilitado: enviandoNuevoMovimientoUnitario,
          }"
          v-show="
            !editandoMovimientoUnitario && movimientoDependiente === 'unitario'
          "
        >
          {{ nuevoMovimientoUnitario }}
        </div>
      </div>

      <!-- Movimiento total -->
      <div
        class="celdaCampo"
        title="Valor total"
        @click="toggleEditandoMovimientoTotal"
      >
        <input
          @keypress.enter.prevent="guardarNuevoNumeros"
          @keydown.tab.prevent="guardarNuevoNumeros()"
          ref="inputNuevoMovimientoTotal"
          v-model="nuevoMovimientoTotal"
          @click.stop=""
          @blur="
            editandoMovimientoTotal = false;
            nuevoMovimientoTotal = esteMovimiento.movimientoTotal;
          "
          @keydown.esc="$refs.inputNuevoMovimientoTotal.blur()"
          v-show="editandoMovimientoTotal"
          type="number"
          class="inputNuevoMovimientoTotal"
          :class="{
            deshabilitado: enviandoNuevoMovimientoTotal || enviandoNuevoNumeros,
          }"
        />
        <div
          id="movimientoTotal"
          class="contenidoCampo contenidoCampoDinero"
          :class="{
            deshabilitado: enviandoNuevoMovimientoTotal,
          }"
          v-show="!editandoMovimientoTotal && movimientoDependiente != 'total'"
        >
          {{ esteMovimiento.movimientoTotal }}
        </div>
        <div
          id="movimientoTotalDependiente"
          class="contenidoCampo contenidoCampoDinero movimientoDependiente"
          :class="{
            deshabilitado: enviandoNuevoMovimientoTotal,
          }"
          v-show="!editandoMovimientoTotal && movimientoDependiente === 'total'"
        >
          {{ nuevoMovimientoTotal }}
        </div>
      </div>

      <div class="controlesItem">
        <img
          src="@/assets/iconos/check.svg"
          alt="Check"
          :title="
            esteMovimiento.realizado
              ? 'Marcar que el movimiento no ha sido realizado'
              : 'Marcar quue el movimiento fue realizado'
          "
          class="boton"
          :class="{ deshabilitado: togglingMovimientoRealizado }"
          :style="{
            filter: esteMovimiento.realizado ? 'var(--atlasFilterVerde)' : '',
          }"
          v-show="!togglingMovimientoRealizado"
          @click="toggleMovimientoRealizado"
        />
        <loading texto="" v-show="togglingMovimientoRealizado" />
        <div
          title="Ver información de este movimiento"
          @click.stop="mostrandoInformacion = !mostrandoInformacion"
          :class="{
            deshabilitado:
              (!esteMovimiento.informacion ||
                esteMovimiento.informacion.length === 0) &&
              !usuarioResponsableAmplioNodo,
          }"
          id="botonVerInformacion"
          class="boton"
        >
          <img src="@/assets/iconos/info.svg" alt="Informacion" />
        </div>

        <div
          title="Eliminar este movimiento"
          @click.stop="eliminarse"
          class="boton"
          v-show="!eliminandose"
        >
          <img src="@/assets/iconos/trash.svg" alt="Delete" />
        </div>
        <loading texto="" v-show="eliminandose" />
      </div>
    </div>
    <div id="infoNodoOwner" v-if="esteMovimiento.nodoOwner">
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="cog"
        class="svg-inline--fa fa-cog fa-w-16 iconoNodoOwner"
        v-if="esteMovimiento.nodoOwner.tipoNodo === 'trabajo'"
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
        v-if="esteMovimiento.nodoOwner.tipoNodo === 'objetivo'"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 576 512"
      >
        <path
          fill="currentColor"
          d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
        ></path>
      </svg>
      <div id="nombreNodoOwner">{{ esteMovimiento.nodoOwner.nombre }}</div>
    </div>
    <div id="contenidoSeleccionado">
      <div
        id="zonaInformacion"
        class="zonaContenidoSeleccionado"
        v-show="mostrandoInformacion"
        @click="toggleEditandoInformacion"
      >
        <div id="informacion" ref="informacion" v-show="!editandoInformacion">
          {{ esteMovimiento.informacion }}
        </div>

        <textarea
          id="inputNuevoInformacion"
          class="inputTextoNodo"
          ref="inputNuevoInformacion"
          :class="{ deshabilitado: enviandoNuevoInformacion }"
          v-model="nuevoInformacion"
          v-show="editandoInformacion"
          @click.stop=""
        />
        <div
          class="contenedorBotonesCampo"
          @click.stop=""
          v-show="editandoInformacion"
        >
          <img
            src="@/assets/iconos/save.svg"
            class="botonGuardarCampo"
            alt="Guardar"
            title="Guardar descripción"
            id="botonGuardarInformacion"
            @click="guardarNuevoInformacion"
            v-show="!enviandoNuevoInformacion"
          />
          <loading texto="" v-show="enviandoNuevoInformacion" />
          <img
            src="@/assets/iconos/equis.svg"
            class="botonGuardarCampo"
            alt="Cancelar"
            title="Cancelar edición"
            id="botonCancelarEdicionInformacion"
            @click="editandoInformacion = false"
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
  name: "ItemTablaMovimientoDinero",
  props: {
    esteMovimiento: Object,
    idNodo: String,
    usuarioResponsableAmplioNodo: Boolean,
  },
  data() {
    return {
      eliminandose: false,
      mostrandoInformacion: false,

      movimientoDependiente: null,

      nuevoFecha: Date.now(),
      editandoFecha: false,
      enviandoNuevoFecha: false,

      nuevoArticulo: "Nuevo articulo",
      editandoArticulo: false,
      enviandoNuevoArticulo: false,

      nuevoInformacion: "Informacion",
      editandoInformacion: false,
      enviandoNuevoInformacion: false,

      nuevoCantidad: "1",
      editandoCantidad: false,
      enviandoNuevoCantidad: false,

      nuevoMovimientoUnitario: "10000",
      editandoMovimientoUnitario: false,
      enviandoNuevoMovimientoUnitario: false,

      nuevoMovimientoTotal: "10000",
      editandoMovimientoTotal: false,
      enviandoNuevoMovimientoTotal: false,

      enviandoNuevoNumeros: false,

      togglingMovimientoRealizado: false,
    };
  },
  computed: {
    fechaFormateada() {
      return this.esteMovimiento.fecha.substr(0, 10);
    },
    nuevoFechaIlegal() {
      if (this.nuevoFecha.length < 1) {
        return true;
      }
      return false;
    },
    nuevoArticuloIlegal() {
      if (this.nuevoArticulo.length < 1) {
        return true;
      }
      if (charProhibidosNombreCosa.test(this.nuevoArticulo)) {
        return true;
      }
      return false;
    },
    nuevoInformacionIlegal() {
      if (!this.nuevoInformacion || this.nuevoInformacion.length < 1) {
        return true;
      }
      if (charProhibidosTexto.test(this.nuevoInformacion)) {
        return true;
      }
      return false;
    },
    nuevoCantidadIlegal() {
      if (!this.nuevoCantidad || !this.nuevoCantidad > 0) return true;
      return false;
    },
    nuevoMovimientoUnitarioIlegal() {
      if (
        !this.nuevoMovimientoUnitario ||
        !Math.abs(Number(this.nuevoMovimientoUnitario)) > 0
      )
        return true;
      return false;
    },
    nuevoMovimientoTotalIlegal() {
      if (
        !this.nuevoMovimientoTotal ||
        !Math.abs(Number(this.nuevoMovimientoTotal)) > 0
      )
        return true;
      return false;
    },
  },
  methods: {
    eliminarse() {
      if (
        !confirm(
          "¿Confirmar la eliminación de este movimiento? (Esta acción no puede deshacerse)"
        )
      ) {
        return;
      }
      this.eliminandose = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idNodo: ID!, $idMovimientoDinero: ID!) {
              eliminarMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
              )
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idMovimientoDinero: this.esteMovimiento.id,
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
      if (this.nuevoFecha == this.esteMovimiento.fecha) {
        this.editandoFecha = false;
        if (this.next === "next") {
          this.toggleEditandoArticulo();
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
              $idMovimientoDinero: ID!
              $nuevoFecha: Date!
            ) {
              editarFechaMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoFecha: $nuevoFecha
              ) {
                id
                fecha
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
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
        this.toggleEditandoArticulo();
      }
    },
    guardarNuevoArticulo(next) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.nuevoArticulo = this.$refs.inputNuevoArticulo.value;
      if (this.nuevoArticuloIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoArticulo == this.esteMovimiento.articulo) {
        this.editandoArticulo = false;
        if (next === "cantidad") {
          this.toggleEditandoCantidad();
        }
        return;
      }
      console.log(`guardando nuevo articulo`);
      this.enviandoNuevoArticulo = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoArticulo: String!
            ) {
              editarArticuloMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoArticulo: $nuevoArticulo
              ) {
                id
                articulo
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoArticulo: this.nuevoArticulo,
          },
        })
        .then(() => {
          this.enviandoNuevoArticulo = false;
          this.editandoArticulo = false;
        })
        .catch((error) => {
          this.enviandoNuevoArticulo = false;
          console.log(`Error. E :${error}`);
        });

      if (next === "cantidad") {
        this.toggleEditandoCantidad();
      }
    },
    guardarNuevoInformacion() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoInformacionIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoInformacion == this.esteMovimiento.informacion) {
        this.editandoInformacion = false;
        return;
      }
      console.log(`guardando nuevo informacion`);
      this.enviandoNuevoInformacion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoInformacion: String!
            ) {
              editarInformacionMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoInformacion: $nuevoInformacion
              ) {
                id
                informacion
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoInformacion: this.nuevoInformacion,
          },
        })
        .then(() => {
          this.enviandoNuevoInformacion = false;
          this.editandoInformacion = false;
        })
        .catch((error) => {
          this.enviandoNuevoInformacion = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoCantidad(siguienteCampo) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoCantidadIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoCantidad == this.esteMovimiento.cantidad) {
        this.editandoCantidad = false;
        this.toggleEditandoMovimientoUnitario();
        return;
      }
      console.log(`guardando nuevo cantidad`);
      this.enviandoNuevoCantidad = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoCantidad: Float!
            ) {
              editarCantidadMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoCantidad: $nuevoCantidad
              ) {
                id
                cantidad
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoCantidad: Number(this.nuevoCantidad),
          },
        })
        .then(() => {
          this.enviandoNuevoCantidad = false;
          this.editandoCantidad = false;
        })
        .catch((error) => {
          this.enviandoNuevoCantidad = false;
          console.log(`Error. E :${error}`);
        });

      if (siguienteCampo === "movimientoUnitario") {
        this.toggleEditandoMovimientoUnitario();
      }
    },
    guardarNuevoMovimientoUnitario() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoMovimientoUnitarioIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (
        this.nuevoMovimientoUnitario == this.esteMovimiento.movimientoUnitario
      ) {
        this.editandoMovimientoUnitario = false;
        return;
      }
      console.log(`guardando nuevo movimientoUnitario`);
      this.enviandoNuevoMovimientoUnitario = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoMovimientoUnitario: Float!
            ) {
              editarMovimientoUnitarioMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoMovimientoUnitario: $nuevoMovimientoUnitario
              ) {
                id
                movimientoUnitario
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoMovimientoUnitario: Number(this.nuevoMovimientoUnitario),
          },
        })
        .then(() => {
          this.enviandoNuevoMovimientoUnitario = false;
          this.editandoMovimientoUnitario = false;
        })
        .catch((error) => {
          this.enviandoNuevoMovimientoUnitario = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoMovimientoTotal() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (this.nuevoMovimientoTotalIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoMovimientoTotal == this.esteMovimiento.movimientoTotal) {
        this.editandoMovimientoTotal = false;
        return;
      }
      console.log(`guardando nuevo movimientoTotal del movimiento`);
      this.enviandoNuevoMovimientoTotal = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoMovimientoTotal: Float!
            ) {
              editarNumerosMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoMovimientoTotal: $nuevoMovimientoTotal
              ) {
                id
                movimientoTotal
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoMovimientoTotal: Number(this.nuevoMovimientoTotal),
          },
        })
        .then(() => {
          this.enviandoNuevoMovimientoTotal = false;
          this.editandoMovimientoTotal = false;
        })
        .catch((error) => {
          this.enviandoNuevoMovimientoTotal = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoNumeros(next) {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      if (
        this.nuevoMovimientoTotalIlegal ||
        this.nuevoMovimientoUnitarioIlegal ||
        this.nuevoCantidadIlegal
      ) {
        console.log(
          `Valores ilegales Cantidad: ${this.nuevoCantidad}, valorUnitario: ${this.nuevoMovimientoUnitario}, MovTotal: ${this.nuevoMovimientoTotal}. No enviado`
        );
        return;
      }
      if (
        this.nuevoMovimientoTotal == this.esteMovimiento.movimientoTotal &&
        this.nuevoCantidad === this.esteMovimiento.cantidad &&
        this.nuevoMovimientoUnitario === this.esteMovimiento.movimientoUnitario
      ) {
        this.editandoMovimientoTotal = false;
        this.editandoMovimientoUnitario = false;
        this.editandoCantidad = false;
        return;
      }
      console.log(`guardando nuevo numeros`);
      this.enviandoNuevoNumeros = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoMovimientoTotal: Float!
              $nuevoMovimientoUnitario: Float!
              $nuevoCantidad: Float!
            ) {
              editarNumerosMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoMovimientoTotal: $nuevoMovimientoTotal
                nuevoMovimientoUnitario: $nuevoMovimientoUnitario
                nuevoCantidad: $nuevoCantidad
              ) {
                id
                movimientoTotal
                cantidad
                movimientoUnitario
              }
            }
          `,
          variables: {
            idMovimientoDinero: this.esteMovimiento.id,
            idNodo: this.idNodo,
            nuevoMovimientoTotal: Number(this.nuevoMovimientoTotal),
            nuevoMovimientoUnitario: Number(this.nuevoMovimientoUnitario),
            nuevoCantidad: Number(this.nuevoCantidad),
          },
        })
        .then(() => {
          this.enviandoNuevoNumeros = false;
          this.editandoMovimientoTotal = false;
          this.editandoMovimientoUnitario = false;
          this.editandoCantidad = false;
          if (next === "movimientoUnitario") {
            this.toggleEditandoMovimientoUnitario();
          } else if (next === "movimientoTotal") {
            this.toggleEditandoMovimientoTotal();
          }
        })
        .catch((error) => {
          this.enviandoNuevoNumeros = false;
          this.editandoMovimientoTotal = false;
          this.editandoMovimientoUnitario = false;
          this.editandoCantidad = false;
          console.log(`Error. E :${error}`);
        });
    },
    toggleEditandoFecha() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.editandoFecha = !this.editandoFecha;
      this.nuevoFecha = this.esteMovimiento.fecha.substr(0, 10);

      this.$nextTick(() => {
        this.$refs.inputNuevoFecha.click();
      });
    },
    toggleEditandoArticulo() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.editandoArticulo = !this.editandoArticulo;
      this.nuevoArticulo = this.esteMovimiento.articulo;

      this.$nextTick(() => {
        this.$refs.inputNuevoArticulo.focus();
      });
    },
    toggleEditandoCantidad() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.editandoCantidad = !this.editandoCantidad;
      this.nuevoCantidad = this.esteMovimiento.cantidad;
      this.nuevoMovimientoUnitario = this.esteMovimiento.movimientoUnitario;
      this.nuevoMovimientoTotal = this.esteMovimiento.movimientoTotal;

      this.$nextTick(() => {
        this.$refs.inputNuevoCantidad.focus();
      });
    },
    toggleEditandoInformacion() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      console.log(`toggling edit de información`);
      this.$refs.inputNuevoInformacion.style.height =
        this.$refs.informacion.offsetHeight + "px";
      this.editandoInformacion = !this.editandoInformacion;
      this.nuevoInformacion = this.esteMovimiento.informacion;

      if (this.editandoInformacion === true) {
        this.$nextTick(() => {
          this.$refs.inputNuevoInformacion.focus();
        });
      }
    },
    toggleEditandoMovimientoUnitario() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.movimientoDependiente = "total";

      this.editandoMovimientoUnitario = !this.editandoMovimientoUnitario;
      this.nuevoCantidad = this.esteMovimiento.cantidad;
      this.nuevoMovimientoUnitario = this.esteMovimiento.movimientoUnitario;
      this.nuevoMovimientoTotal = this.esteMovimiento.movimientoTotal;

      this.$nextTick(() => {
        this.$refs.inputNuevoMovimientoUnitario.focus();
      });
    },
    toggleEditandoMovimientoTotal() {
      if (!this.usuarioResponsableAmplioNodo) {
        console.log(`No autorizado`);
        return;
      }
      this.movimientoDependiente = "unitario";

      this.editandoMovimientoTotal = !this.editandoMovimientoTotal;
      this.nuevoCantidad = this.esteMovimiento.cantidad;
      this.nuevoMovimientoUnitario = this.esteMovimiento.movimientoUnitario;
      this.nuevoMovimientoTotal = this.esteMovimiento.movimientoTotal;

      this.$nextTick(() => {
        this.$refs.inputNuevoMovimientoTotal.focus();
      });
    },
    toggleMovimientoRealizado() {
      if (!this.usuarioResponsableAmplioNodo) return;
      console.log(`Toggling`);
      this.togglingMovimientoRealizado = true;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation (
              $idNodo: ID!
              $idMovimientoDinero: ID!
              $nuevoRealizado: Boolean!
            ) {
              setRealizadoMovimientoDineroNodoSolidaridad(
                idNodo: $idNodo
                idMovimientoDinero: $idMovimientoDinero
                nuevoRealizado: $nuevoRealizado
              ) {
                id
                realizado
              }
            }
          `,
          variables: {
            idNodo: this.idNodo,
            idMovimientoDinero: this.esteMovimiento.id,
            nuevoRealizado: !this.esteMovimiento.realizado,
          },
        })
        .then(() => {
          this.togglingMovimientoRealizado = false;
          console.log(`toggled`);
        })
        .catch((error) => {
          this.togglingMovimientoRealizado = false;
          console.log(`Error: E:${error}`);
        });
    },
  },
  watch: {
    nuevoMovimientoUnitario(movimientoUnitario) {
      if (this.movimientoDependiente === "unitario") {
        return;
      }

      this.nuevoMovimientoTotal =
        Number(this.nuevoCantidad) * Number(movimientoUnitario);
    },
    nuevoMovimientoTotal(movimientoTotal) {
      if (this.movimientoDependiente === "total") {
        return;
      }
      if (Number(this.nuevoCantidad) <= 0) {
        this.nuevoMovimientoUnitario = null;
      } else {
        this.nuevoMovimientoUnitario =
          Number(movimientoTotal) / Number(this.nuevoCantidad);
      }
    },
    nuevoCantidad() {
      if (this.movimientoDependiente === "unitario") {
        if (Number(this.nuevoCantidad) <= 0) {
          this.nuevoMovimientoUnitario = null;
        } else {
          this.nuevoMovimientoUnitario =
            Number(this.nuevoMovimientoTotal) / Number(this.nuevoCantidad);
        }
      } else if (this.movimientoDependiente === "total") {
        console.log(`Calculando movimiento total`);
        this.nuevoMovimientoTotal =
          Number(this.nuevoCantidad) * Number(this.nuevoMovimientoUnitario);
      }
    },
    esteMovimiento: {
      handler: function (mov) {
        this.nuevoCantidad = mov.cantidad;
        this.nuevoMovimientoTotal = mov.movimientoTotal;
        this.nuevoMovimientoUnitario = mov.movimientoUnitario;
      },
      inmediate: true,
    },
    mostrandoInformacion(mostrando) {
      console.log(`Se abre info`);
      if (mostrando) {
        if (
          !this.esteMovimiento.informacion ||
          this.esteMovimiento.informacion.length < 1
        ) {
          console.log(`Editar`);
          this.toggleEditandoInformacion();
        }
      } else {
        this.editandoInformacion = false;
      }
    },
  },
};
</script>

<style scoped>
.itemTablaMovimientoDinero {
  min-height: 10px;
}
.itemTablaMovimientoDinero:hover {
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
#celdaArticulo {
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
#celdaCantidad {
  flex-shrink: 2;
}
.contenidoCampoDinero {
  font-size: 12px;
}
.movimientoDependiente {
  color: rgb(54, 54, 54);
  font-weight: bold;
}
#barraPrincipal .controlesItem {
  visibility: hidden;
}
#barraPrincipal:hover .controlesItem {
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
#botonVerInformacion.deshabilitado {
  opacity: 0.4;
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
#inputNuevoInformacion {
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
  .itemTablaMovimientoDinero {
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
  #celdaArticulo {
    font-size: min(14px, 3vw);
  }

  .contenidoCampoDinero,
  #celdaCantidad {
    font-size: min(12px, 2.5vw);
  }

  .controlesItem .boton {
    width: 11px;
    height: 11px;
  }
}

@media (hover: none) and (pointer: coarse) {
  #barraPrincipal .controlesItem {
    visibility: visible;
  }
}
</style>