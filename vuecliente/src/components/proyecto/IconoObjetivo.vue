<template>
  <div class="iconoObjetivo" :class="{ seleccionado }">

    <div id="zonaNombre" :class="{bordeAbajo: seleccionado}" class="zonaPrimerNivel">
      <div class="barraSuperiorZona">
        <div class="controlesZona" v-show="seleccionado && usuarioResponsableProyecto">
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar"
            title="Editar nombre del objetivo"
            v-show="usuarioResponsableProyecto"
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
      <div id="nombre" v-show="!editandoNombre">
        {{ esteObjetivo.nombre }}
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
          <img src="@/assets/iconos/iconoObjetivo.png" alt="" id="imagenIcono" />

    </div>
    <div id="zonaDescripcion" class="zonaPrimerNivel" v-show="seleccionado">
      <div class="barraSuperiorZona">
        <span class="nombreZona">Descripcion</span>
        <div class="controlesZona" v-show="seleccionado && usuarioResponsableProyecto">
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
    <div id="controlesObjetivo" v-show="seleccionado">
      <div class="controlesObjetivo hoverGris bEliminar" @click="eliminarse" v-show="usuarioResponsableProyecto || usuarioSuperadministrador">
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
  name: "IconoObjetivo",
  components: { Loading },
  data() {
    return {
      deshabilitado:false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,
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
            mutation($idProyecto: ID!, $idObjetivo:ID!, $nuevoNombre: String!) {
              editarNombreObjetivoProyecto(
                idProyecto: $idProyecto,
                idObjetivo:$idObjetivo,
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
      if(!confirm("¿Seguro de eliminar este trabajo?")){
        return
      }
      this.deshabilitado=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idProyecto: ID!, $idObjetivo:ID!){
            eliminarObjetivoDeProyecto(idProyecto:$idProyecto, idObjetivo: $idObjetivo)
          }
        `,
        variables:{
          idProyecto:this.idProyecto,
          idObjetivo:this.esteObjetivo.id
        }
      }).then(({data:{eliminarObjetivoDeProyecto}})=>{
        this.deshabilitado=false;
        console.log(`Resultado: ${eliminarObjetivoDeProyecto}`);
        this.$emit("meElimine");
      }).catch((error)=>{
        this.deshabilitado=false;
        console.log(`Error. E: ${error}`);
      });
    },
  },
};
</script>

<style scoped>
.iconoObjetivo {
  border: 2px solid #b4b4bd;
  border-radius: 5px;
  min-height: 10px;
  
  position: relative;
  padding: 5px 10px;
  padding-bottom: 10px;
  background-color: rgb(219 240 255);
}
.iconoObjetivo:not(.seleccionado){
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
  cursor:pointer;
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
  position: relative;
  min-height: 50px;
}
.barraSuperiorZona{
  display:flex
}
.nombreZona {
  font-size: 18px;
  padding: 5px 20px;
  
}
#nombre {
  margin-top: 15px;
  font-size: 19px;
  padding: 5px 20px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}

#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
  width:80%;
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
.bEliminar:hover{
  background-color: red;
}
.controlesZona {
  margin-left: auto;
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
</style>