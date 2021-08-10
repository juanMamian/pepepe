<template>
  <div class="ventanitaObjetivo" :class="{ seleccionado }" @mouseup.left.stop="">
    <div
      id="zonaNombre"
      :class="{ bordeAbajo: seleccionado }"
      class="zonaPrimerNivel"
    >
      <div id="nombre">
        <div id="elPropioNombre" v-show="!editandoNombre">
          {{ esteObjetivo.nombre }}
        </div>
        <input
          type="text"
          class="inputNuevoNombre"
          :class="{ letrasRojas: nuevoNombreIlegal }"
          v-model="nuevoNombre"
          v-show="editandoNombre"
          @keypress.enter="guardarNuevoNombre"
        />
        <div class="controlesLateralesZona" v-if="usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del objetivo"
            @click.stop="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click.stop="guardarNuevoNombre"
          />
        </div>
      </div>
      <loading v-show="enviandoNuevoNombre" texto="Enviando..." />
      <img
        src="@/assets/iconos/estrella.png"
        alt=""
        id="imagenIcono"
        :class="{ iconoCompletado: esteObjetivo.estado === 'cumplido', deshabilitado:togglingEstado }"
        @click="usuarioResponsableProyecto? toggleEstadoObjetivo():null"
      />
    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
        <div class="controlesZona" v-show="usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarDescripcion"
            class="bEditar"
            title="Editar descripcion del objetivo"
            v-show="usuarioResponsableProyecto"
            @click.stop="toggleEditandoDescripcion"
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
            @click.stop="guardarNuevoDescripcion"
          />
        </div>
      </div>

      <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
        {{ esteObjetivo.descripcion }}
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
    <div id="controlesObjetivo">
      <div
        class="controlesObjetivo hoverGris bEliminar"
        @click="eliminarse"
        v-show="usuarioResponsableProyecto || usuarioSuperadministrador"
      >
        Eliminar
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "../utilidades/Loading.vue";

const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;

export default {
  name: "VentanitaObjetivo",
  components: { Loading },
  data() {
    return {
      deshabilitado: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      togglingEstado:false,
    };
  },
  props: {
    idProyecto: String,
    esteObjetivo: Object,
    seleccionado: Boolean,
    usuarioResponsableProyecto: Boolean,
  },
  computed: {
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreObjetivo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionObjetivo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
  },
  methods: {
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteObjetivo.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idObjetivo: ID!
              $nuevoNombre: String!
            ) {
              editarNombreObjetivoProyecto(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idObjetivo: this.esteObjetivo.id,
            idProyecto: this.idProyecto,
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
      if (this.nuevoDescripcion == this.esteObjetivo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idObjetivo: ID!
              $nuevoDescripcion: String!
            ) {
              editarDescripcionObjetivoProyecto(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idObjetivo: this.esteObjetivo.id,
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
      this.nuevoNombre = this.esteObjetivo.nombre;
    },
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteObjetivo.descripcion;
    },
    eliminarse() {
      console.log(`Objetivo eliminandose`);
      if (!confirm("¿Seguro de eliminar este objetivo?")) {
        return;
      }
      this.deshabilitado = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idObjetivo: ID!) {
              eliminarObjetivoDeProyecto(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
              )
            }
          `,
          variables: {
            idProyecto: this.idProyecto,
            idObjetivo: this.esteObjetivo.id,
          },
        })
        .then(({ data: { eliminarObjetivoDeProyecto } }) => {
          this.deshabilitado = false;
          console.log(`Resultado: ${eliminarObjetivoDeProyecto}`);
          this.$emit("meElimine");
        })
        .catch((error) => {
          this.deshabilitado = false;
          console.log(`Error. E: ${error}`);
        });
    },
    toggleEstadoObjetivo(){
      var nuevoEstado="noCumplido";
      if(this.esteObjetivo.estado==="noCumplido"){
        nuevoEstado="cumplido";
      }

      this.togglingEstado=true;

      this.$apollo.mutate({
        mutation:gql`
          mutation($idProyecto:ID!, $idObjetivo:ID!, $nuevoEstado:String!){
            setEstadoObjetivoProyecto(idProyecto:$idProyecto, idObjetivo:$idObjetivo, nuevoEstado:$nuevoEstado){
              id
              estado
            }
          }
        `,
        variables:{
          idProyecto:this.idProyecto,
          idObjetivo:this.esteObjetivo.id,
          nuevoEstado,
        }
      }).then(()=>{
      this.togglingEstado=false;
        console.log(`toggled`);
      }).catch((error)=>{
        this.togglingEstado=false;
        console.log(`Error: E:${error}`);
      })
    }
  },
};
</script>

<style scoped>
.ventanitaObjetivo {
  border: 2px solid #b4b4bd;
  border-radius: 5px;
  min-height: 10px;

  position: relative;
  padding: 5px 10px;
  padding-bottom: 10px;
  background-color: rgb(231, 182, 182);
}
.ventanitaObjetivo:not(.seleccionado) {
  cursor: pointer;
}

.seleccionado {
  box-shadow: 2px 2px 2px 2px rgb(54, 54, 54);
  padding-bottom: 25px;
}

#controlesObjetivo {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  flex-direction: row-reverse;
}
.controlesObjetivo {
  padding: 3px 5px;
  cursor: pointer;
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
  border-radius: 50%;
}

#imagenIcono:hover {
  background-color: cadetblue;
}
.iconoCompletado {
  background-color: rgb(44, 136, 44);
}

.zonaPrimerNivel {
  position: relative;
  min-height: 50px;
}
.barraSuperiorZona {
  display: flex;
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 20px;
  display: grid;
  grid-template-columns: 1fr 5fr 1fr;
  margin-bottom: 15px;
}

#elPropioNombre {
  font-size: 19px;
  padding: 5px;
  font-weight: bolder;
  text-align: center;
  grid-column: 2/3;
}

.inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
  grid-column: 2/3;
  width: 100%;
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

#inputNuevoDescripcion {
  width: 95%;
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 10px auto;
  resize: vertical;
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
.bGuardar:hover {
  background-color: rgb(209, 209, 209);
}
.bEliminar:hover {
  background-color: red;
}
.controlesLateralesZona {
  grid-column: 3/4;
  display: flex;
  flex-direction: row-reverse;
}
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
</style>