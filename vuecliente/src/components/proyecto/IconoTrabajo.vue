<template>
  <div class="iconoTrabajo" :class="{ trabajoSeleccionado: seleccionado }">
    <div
      id="nombre"
      ref="nombre"
      :contenteditable="permisosEdicion == true && seleccionado == true"
      @blur="guardarNombre"
      @input="setNombreEditandose"
      @keypress.enter="blurNombre"
    >
      {{ esteTrabajo.nombre }}
    </div>
    <img src="iconos/iconoTrabajo.png" alt="" id="imagenIcono" />

    <template v-if="seleccionado">
      <div id="zonaDescripcion">
        Descripcion: <br />

        <div
          id="descripcion"
          ref="descripcion"
          :contenteditable="permisosEdicion == true && seleccionado == true"
          @blur="guardarDescripcion"
          @input="setDescripcionEditandose"
          @keypress.enter="blurDescripcion"
        >
          {{ esteTrabajo.descripcion }}
        </div>
      </div>

      <div id="zonaResponsables" class="zonaPrimerNivel">
        <div class="nombreZona">Responsables</div>
        <div id="controlesResponsables" class="controlesZona">
          <div
            class="controlesResponsables hoverGris botonesControles"
            v-if="usuarioLogeado == true && usuarioResponsableTrabajo == false"
            id="botonParticipar"
            @click="asumirComoResponsable"
          >
            Participar
          </div>

          <div
            class="controlesResponsables hoverGris botonesControles"
            v-if="usuarioresponsableTrabajo == true"
            @click="abandonarListaResponsables"
          >
            Abandonar
          </div>
        </div>
        <div id="listaResponsables">
          <icono-persona
            :estaPersona="persona"
            :aceptado="true"
            :key="persona.id"
            v-for="persona of esteTrabajo.responsables"
          />
        </div>
      </div>

      <div id="controlesTrabajo" v-show="seleccionado">
        <div class="controlesTrabajo hoverGris" @click="eliminarse">
          Eliminar
        </div>
      </div>
    </template>
  </div>
</template>

<script>
var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

export default {
  name: "IconoTrabajo",
  data() {
    return {
      nombreEditandose: false,
      descripcionEditandose: false,
    };
  },
  props: {
    esteTrabajo: Object,
    idTrabajoSeleccionado: String,
    permisosEdicion: Boolean,
    usuarioResponsableProyecto: Boolean,
  },
  computed: {
    seleccionado: function () {
      return this.idTrabajoSeleccionado == this.esteTrabajo.id ? true : false;
    },
    usuarioResponsableTrabajo: function () {
      return this.esteTrabajo.responsables.includes(
        this.$store.state.usuario.id
      )
        ? true
        : false;
    },
  },
  methods: {
    eliminarse() {
      this.$emit("eliminandose", this.esteTrabajo.id);
    },
    setNombreEditandose() {
      if (this.esteTrabajo.nombre != this.$refs.nombre.innerHTML.trim()) {
        this.nombreEditandose = true;
      } else {
        this.nombreEditandose = false;
      }
    },
    setDescripcionEditandose() {
      this.descripcionEditandose = true;
    },
    blurNombre() {
      this.$refs.nombre.blur();
    },
    blurDescripcion() {
      this.$refs.descripcion.blur();
    },
    async guardarNombre() {
      let nuevoNombre = this.$refs.nombre.innerHTML.trim();
      let idTrabajo = this.esteTrabajo.id;

      if (!this.nombreEditandose || nuevoNombre == this.esteTrabajo.nombre) {
        return;
      }

      nuevoNombre = nuevoNombre.replace(charProhibidosNombre, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

      this.$emit("cambiandoNombre", { idTrabajo, nuevoNombre });
    },
    async guardarDescripcion() {
      let nuevaDescripcion = this.$refs.descripcion.innerHTML.trim();
      let idTrabajo = this.esteTrabajo.id;

      if (
        !this.descripcionEditandose ||
        nuevaDescripcion == this.esteTrabajo.descripcion
      ) {
        return;
      }

      nuevaDescripcion = nuevaDescripcion.replace(charProhibidosNombre, "");
      nuevaDescripcion = nuevaDescripcion.replace(/\s\s+/g, " ");

      this.$emit("cambiandoDescripcion", { idTrabajo, nuevaDescripcion });
    },
  },
};
</script>

<style scoped>
.iconoTrabajo {
  border: 2px solid blue;
  border-radius: 5px;
  min-height: 50px;
  cursor: pointer;
  position: relative;
  padding: 5px 10px;
  padding-bottom: 20px;
  background-color: rgb(230, 247, 247);
}

.trabajoSeleccionado {
  height: 200px;
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
}

#controlesTrabajo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesTrabajo {
  padding: 3px 5px;
}
#nombre {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}
#descripcion {
  min-width: 100px;
  min-height: 50px;
  border: 2px solid pink;
  padding: 3px 30px;
}
#imagenIcono {
  width: 30px;
  height: 30px;
}
.zonaPrimerNivel {
  border: 2px solid black;
}
</style>