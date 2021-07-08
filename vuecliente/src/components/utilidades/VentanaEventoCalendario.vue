<template>
  <div class="ventanaEventoCalendario" @click.stop="" @mouseup.left.stop="">
    <div id="zonaNombre" class="zonaPrimerNivel">
      <div class="controlesZona" v-show="usuarioResponsableEvento">
        <img
          src="@/assets/iconos/editar.png"
          alt="Editar"
          id="bEditarNombre"
          class="bEditar"
          title="Editar nombre del evento"
          @click="toggleEditandoNombre"
        />
        <img
          src="@/assets/iconos/guardar.png"
          alt="Guardar"
          title="guardar"
          class="bGuardar"
          id="bGuardarNuevoNombre"
          v-show="editandoNombre == true && nuevoNombreIlegal == false"
          @click="guardarNuevoNombre"
        />
      </div>
      <div id="nombre" v-show="!editandoNombre">
        {{ esteEvento.nombre }}
      </div>
      <input
        type="text"
        id="inputNuevoNombre"
        :class="{ letrasRojas: nuevoNombreIlegal }"
        v-model="nuevoNombre"
        v-show="editandoNombre"
        @keypress.enter="guardarNuevoNombre"
      />
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />      
    </div>

    <div id="zonaDescripcion" class="zonaPrimerNivel">
        <div class="barraSuperiorZona">
          <div
            class="nombreZona"            
          >            
            Detalles
          </div>
        </div>        
          <div class="controlesZona" v-if="usuarioResponsableEvento">
            <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              id="bEditarrDescripcion"
              class="bEditar"
              title="Editar descripcion del evento"
              @click="toggleEditandoDescripcion"
            />
            <img
              src="@/assets/iconos/guardar.png"
              alt="Guardar"
              title="guardar"
              class="bGuardar"
              id="bGuardarNuevoDescripcion"
              v-show="
                editandoDescripcion == true && nuevoDescripcionIlegal == false
              "
              @click="guardarNuevoDescripcion"
            />
          </div>
          <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
            {{ esteEvento.descripcion }}
          </div>

          <textarea
            id="inputNuevoDescripcion"
            ref="inputNuevoDescripcion"
            :class="{ letrasRojas: nuevoDescripcionIlegal }"
            v-model="nuevoDescripcion"
            v-show="editandoDescripcion"
          />
          <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />        
      </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';
import Loading from './Loading.vue';
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionEvento = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  components: { Loading },
  name: "VentanaEventoCalendario",
  props: {
    esteEvento: Object,
  },
  data() {
    return {
      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,
    };
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteEvento.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($idEvento: ID!, $nuevoNombre: String!) {
              editarNombreEventoCalendario(
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
    },
    guardarNuevoDescripcion() {
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
            mutation ($idEvento: ID!, $nuevoDescripcion: String!) {
              editarDescripcionEventoCalendario(
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
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteEvento.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteEvento.descripcion;
    },
  },
  computed: {
    usuarioResponsableEvento() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteEvento.responsables.includes(this.usuario.id);
    },
    nuevoNombreIlegal() {
      if (!this.nuevoNombre || this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreEvento.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionEvento.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.ventanaEventoCalendario {
  background-color: rgb(127, 202, 202);
}

.zonaPrimerNivel {
  border: 2px solid black;
  position: relative;
  min-height: 10px;
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.bEditar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.bEditar:hover {
  background-color: rgb(209, 209, 209);
}
.bGuardar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

#nombre {
  margin-top: 15px;
  font-size: 23px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

#descripcion {
  font-size: 19px;
  width: 95%;
  margin: 10px auto;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  border: none;
  background-color: transparent;
  white-space: pre-wrap;
}
#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
}

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
}
</style>