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
    <img src="@/assets/iconos/iconoTrabajo.png" alt="" id="imagenIcono" />

    <template v-if="seleccionado">
      <div id="zonaDescripcion">
        <div class="nombreZona">Descripcion</div>

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
            v-if="usuarioResponsableTrabajo == true"
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

      <div id="zonaNodosConocimiento" class="zonaPrimerNivel">
        <div class="nombreZona">Nodos de conocimiento involucrados</div>
        <div id="controlesNodosConocimiento" class="controlesZona">
          <div
            class="controlesNodosConocimiento hoverGris botonesControles"
            v-if="usuarioResponsableProyecto == true"
          >
            Añadir
          </div>
          <div
            class="controlesNodosConocimiento hoverGris botonesControles"
            v-if="usuarioResponsableProyecto == true && idNodoSeleccionado!=null && esteTrabajo.nodosConocimiento.some(n=>n.id==idNodoSeleccionado)"
          >
            Remover
          </div>
        </div>
        <div id="listaNodosConocimiento" @click.self="idNodoSeleccionado=null">
          <icono-nodo-conocimiento
            :esteNodo="nodo"
            :key="nodo.id"
            v-for="nodo of esteTrabajo.nodosConocimiento"
            @click.native="idNodoSeleccionado=nodo.id"
          />
          <buscador-nodos-conocimiento/>
        </div>
      </div>

      <div id="controlesTrabajo" v-show="seleccionado">
        <div class="controlesTrabajo hoverGris" @click="eliminarse" v-if="usuarioResponsableProyecto==true">
          Eliminar
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import gql from "graphql-tag"
import {fragmentoResponsables} from "../utilidades/recursosGql"
import IconoPersona from "./IconoPersona.vue"
import BuscadorNodosConocimiento from '../atlasConocimiento/BuscadorNodosConocimiento.vue';

var charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;

export default {
  name: "IconoTrabajo",
  components:{
    IconoPersona,
    BuscadorNodosConocimiento
  },
  data() {
    return {
      nombreEditandose: false,
      descripcionEditandose: false,
      idNodoSeleccionado:null,
    };
  },
  props: {
    esteTrabajo: Object,
    idEsteProyecto:String,
    idTrabajoSeleccionado: String,
    permisosEdicion: Boolean,
    usuarioResponsableProyecto: Boolean,
  },
  computed: {
    seleccionado: function () {
      return this.idTrabajoSeleccionado == this.esteTrabajo.id ? true : false;
    },
    usuarioResponsableTrabajo: function () {
      return this.esteTrabajo.responsables.some(r=>
        r.id==this.$store.state.usuario.id
      )
        ? true
        : false;
    },
  },
  methods: {
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de responsables del trabajo con id ${this.esteTrabajo.id} en el proyecto con id ${this.idEsteProyecto}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo: ID!, $idUsuario: ID!) {
              addResponsableTrabajo(
                idProyecto: $idProyecto
                idTrabajo:$idTrabajo
                idUsuario: $idUsuario                
              ) {
                id
                responsables {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.idEsteProyecto,
            idTrabajo: this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    abandonarListaResponsables() {
      console.log(`Abandonando este trabajo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo:ID! $idUsuario: ID!) {
              removeResponsableTrabajo(
                idProyecto: $idProyecto
                idTrabajo:$idTrabajo
                idUsuario: $idUsuario
              ) {
                id
                responsables {
                  ...fragResponsables
                }                
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.idEsteProyecto,
            idTrabajo:this.esteTrabajo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    eliminarse() {
      this.$emit("eliminandose", this.esteTrabajo.id);
    },
    setNombreEditandose() {
      if (this.esteTrabajo.nombre != this.$refs.nombre.innerText.trim()) {
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
      let nuevoNombre = this.$refs.nombre.innerText.trim();
      let idTrabajo = this.esteTrabajo.id;

      if (!this.nombreEditandose || nuevoNombre == this.esteTrabajo.nombre) {
        return;
      }

      nuevoNombre = nuevoNombre.replace(charProhibidosNombre, "");
      nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");

      this.$emit("cambiandoNombre", { idTrabajo, nuevoNombre });
    },
    async guardarDescripcion() {
      let nuevaDescripcion = this.$refs.descripcion.innerText.trim();
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
  padding-bottom: 40px;
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
  margin-bottom: 10px;
}
.zonaPrimerNivel {
  border: 2px solid black;
}
.controlesZona {
  display: flex;
  font-size: 13px;
  flex-direction: row-reverse;
}
.botonesControles {
  padding: 3px 5px;
  cursor: pointer;
}
.nombreZona {
  font-size: 18px;
  background-color: rgb(199, 110, 8);
  padding: 3px 5px;
}
#listaResponsables {
  display: flex;
  padding-bottom:40px;
}
.iconoPersona {
  margin-right: 10px;
  margin-left: 5px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>