<template>
  <div class="proyecto">
    <div id="nombreProyecto">{{ esteProyecto.nombre }}</div>

    <div id="zonaResponsables" class="zonaPrimerNivel">
      <div class="nombreZona">Responsables</div>
      <div id="controlesResponsables" class="controlesZona">
        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioLogeado == true && esteProyecto.responsables.length < 1"
          id="asumirResponsable"
          @click="asumirComoResponsable"
        >
          Asumir
        </div>
        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="
            usuarioLogeado &&
            !usuarioResponsableProyecto &&
            !usuarioPosibleResponsableProyecto &&
            esteProyecto.responsables.length > 0
          "
          id="botonAddResponsable"
          @click="entrarListaPosiblesResponsables"
        >
          Quiero hacerme responsable
        </div>
        <div
          class="controlesResponsables hoverGris botonesControles"
          v-if="usuarioLogeado == true && (usuarioResponsableProyecto == true || usuarioPosibleResponsableProyecto==true)"
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
          v-for="persona of esteProyecto.responsables"
        />

        <icono-persona
          class="personaPosibleResponsable"
          :estaPersona="persona"
          :key="persona.id"
          :aceptado="false"
          v-for="persona of esteProyecto.posiblesResponsables"
          @dblclick.native.shift="aceptarResponsable(persona.id)"
        />
      </div>
    </div>

    <div id="zonaObjetivos" class="zonaPrimerNivel">
      <div class="nombreZona">Objetivos</div>
      <div id="controlesObjetivos" class="controlesZona">
        <div
          class="controlesObjetivos botonesControles hoverGris"
          v-if="usuarioResponsableProyecto"
          @click="crearNuevoObjetivo"
        >
          Crear objetivo
        </div>
      </div>
      <div id="listaObjetivos" @click.self="idObjetivoSeleccionado = null">
        <iconoObjetivo
          v-for="objetivo of esteProyecto.objetivos"
          :key="objetivo.id"
          :esteObjetivo="objetivo"
          :idObjetivoSeleccionado="idObjetivoSeleccionado"
          :permisosEdicion="permisosEdicion"
          @click.native="idObjetivoSeleccionado = objetivo.id"
          @eliminandose="eliminarObjetivo"
          @cambiandoNombre="cambiarNombreObjetivo"
          @cambiandoDescripcion="cambiarDescripcionObjetivo"
        />
      </div>
    </div>

    <div id="zonaTrabajos" class="zonaPrimerNivel">
      <div class="nombreZona">Trabajos:</div>
      <div id="controlesTrabajos" class="controlesZona">
        <div
          class="controlesTrabajos hoverGris botonesControles"
          @click="crearNuevoTrabajo"
          v-if="usuarioResponsableProyecto"
        >
          Crear trabajo
        </div>
      </div>
      <div id="listaTrabajos" @click.self="idTrabajoSeleccionado = null">
        <iconoTrabajo
          v-for="trabajo of esteProyecto.trabajos"
          :class="{opacar: (idTrabajoSeleccionado!=null && idTrabajoSeleccionado != trabajo.id)}"
          :key="trabajo.id"
          :esteTrabajo="trabajo"
          :idEsteProyecto="esteProyecto.id"
          :idTrabajoSeleccionado="idTrabajoSeleccionado"
          :permisosEdicion="permisosEdicion"
          :usuarioLogeado="usuarioLogeado"
          :usuarioResponsableProyecto="usuarioResponsableProyecto"
          @click.native="idTrabajoSeleccionado = trabajo.id"
          @eliminandose="eliminarTrabajo"
          @cambiandoNombre="cambiarNombreTrabajo"
          @cambiandoDescripcion="cambiarDescripcionTrabajo"
        />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import IconoTrabajo from "./proyecto/IconoTrabajo.vue";
import IconoPersona from "./proyecto/IconoPersona.vue";
import IconoObjetivo from "./proyecto/IconoObjetivo.vue";
import {fragmentoResponsables} from "./utilidades/recursosGql"


const QUERY_PROYECTO = gql`
  query($idProyecto: ID!) {
    proyecto(idProyecto: $idProyecto) {
      id
      nombre
      responsables {
        ...fragResponsables
      }
      posiblesResponsables {
        ...fragResponsables
      }
      trabajos {
        id
        nombre
        descripcion
        responsables {
          ...fragResponsables
        }
      }
      objetivos {
        id
        nombre
        descripcion
      }
    }
  }
  ${fragmentoResponsables}
`;

export default {
  components: { IconoTrabajo, IconoPersona, IconoObjetivo },
  name: "proyecto",
  apollo: {
    esteProyecto: {
      query: QUERY_PROYECTO,
      variables() {
        return {
          idProyecto: this.$route.params.idProyecto,
        };
      },
      update(respuesta) {
        return respuesta.proyecto;
      },
    },
  },
  data() {
    return {
      esteProyecto: {
        responsables: [],
      },
      idTrabajoSeleccionado: null,
      idObjetivoSeleccionado: null,
    };
  },
  computed: {
    usuarioResponsableProyecto: function () {
      if (!this.esteProyecto.responsables) return false;

      if (
        this.esteProyecto.responsables.some(
          (r) => r.id == this.$store.state.usuario.id
        )
      ) {
        return true;
      }
      return false;
    },
    usuarioPosibleResponsableProyecto: function () {
      if (!this.esteProyecto.posiblesResponsables) return false;

      if (
        this.esteProyecto.posiblesResponsables.some(
          (pr) => pr.id == this.$store.state.usuario.id
        )
      ) {
        return true;
      }
      return false;
    },
    permisosEdicion: function () {
      if (
        this.usuarioResponsableProyecto ||
        this.$store.state.usuario.permisos == "superadministrador"
      ) {
        return true;
      }
      return false;
    },
    
  },
  methods: {
    abandonarListaResponsables() {
      console.log(`Abandonando la responsabilidad en este proyecto`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idUsuario: ID!) {
              removeResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                responsables {
                  ...fragResponsables
                }
                posiblesResponsables {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    aceptarResponsable(idPosibleResponsable) {
      console.log(
        `aceptando como responsable al usuario ${idPosibleResponsable}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idUsuario: ID!) {
              addResponsableProyecto(
                idProyecto: $idProyecto
                idUsuario: $idUsuario
              ) {
                id
                responsables {
                  ...fragResponsables
                }
                posiblesResponsables {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: idPosibleResponsable,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    entrarListaPosiblesResponsables() {
      console.log(
        `Enviando peticion de entrar a la lista de posibles responsables del proyecto con id ${this.esteProyecto.id}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idUsuario: ID!) {
              addPosibleResponsableProyecto(idProyecto: $idProyecto, idUsuario: $idUsuario) {
                id
                posiblesResponsables {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    asumirComoResponsable() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de responsables del proyecto con id ${this.esteProyecto.id}`
      );
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idUsuario: ID!) {
              addResponsableProyecto(
                idProyecto: $idProyecto
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
            idProyecto: this.esteProyecto.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    crearNuevoTrabajo() {
      console.log(`enviando mutacion de crear nuevo trabajo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!) {
              crearTrabajoEnProyecto(idProyecto: $idProyecto) {
                id
                nombre
                descripcion
                responsables {
                  ...fragResponsables
                }
              }
            }
            ${fragmentoResponsables}
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
          },
          update: (store, { data: { crearTrabajoEnProyecto } }) => {
            console.log(`respuesta: ${JSON.stringify(crearTrabajoEnProyecto)}`);
            const nuevoTrabajo = crearTrabajoEnProyecto;
            try {
              let cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });
              cache.proyecto.trabajos.push(nuevoTrabajo);

              store.writeQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
                data: cache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          console.log(`respuesta. ${respuesta}`);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    eliminarTrabajo(idTrabajo) {
      if (!this.esteProyecto.trabajos.some((t) => t.id == idTrabajo)) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idTrabajo: ID!, $idProyecto: ID!) {
              eliminarTrabajoDeProyecto(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
              )
            }
          `,
          variables: {
            idTrabajo,
            idProyecto: this.esteProyecto.id,
          },
          update: (store, { data: { eliminarTrabajoDeProyecto } }) => {
            console.log(`data: ${JSON.stringify(eliminarTrabajoDeProyecto)}`);
            let eliminado = eliminarTrabajoDeProyecto;

            if (eliminado) {
              try {
                let cache = store.readQuery({
                  query: QUERY_PROYECTO,
                  variables: { idProyecto: this.esteProyecto.id },
                });
                let indexE = cache.proyecto.trabajos.findIndex(
                  (t) => t.id == idTrabajo
                );
                if (indexE > -1) {
                  cache.proyecto.trabajos.splice(indexE, 1);
                }
                store.writeQuery({
                  query: QUERY_PROYECTO,
                  variables: { idProyecto: this.esteProyecto.id },
                  data: cache,
                });
              } catch (error) {
                console.log(`Error actualizando cache`);
              }
            }
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    cambiarNombreTrabajo({ idTrabajo, nuevoNombre }) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!, $idTrabajo: ID!, $nuevoNombre: String!) {
              cambiarNombreTrabajo(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevoNombre: $nuevoNombre
              ) {
                id
                nombre
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idTrabajo,
            nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    cambiarDescripcionTrabajo({ idTrabajo, nuevaDescripcion }) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idTrabajo: ID!
              $nuevaDescripcion: String!
            ) {
              cambiarDescripcionTrabajo(
                idProyecto: $idProyecto
                idTrabajo: $idTrabajo
                nuevaDescripcion: $nuevaDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idTrabajo,
            nuevaDescripcion,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    crearNuevoObjetivo() {
      console.log(`enviando mutacion de crear nuevo objetivo`);
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idProyecto: ID!) {
              crearObjetivoEnProyecto(idProyecto: $idProyecto) {
                id
                nombre
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
          },
          update: (store, { data: { crearObjetivoEnProyecto } }) => {
            console.log(
              `respuesta: ${JSON.stringify(crearObjetivoEnProyecto)}`
            );
            const nuevoObjetivo = crearObjetivoEnProyecto;
            try {
              let cache = store.readQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
              });
              console.log(`cache: ${JSON.stringify(cache)}`);
              cache.proyecto.objetivos.push(nuevoObjetivo);
              console.log(`cache: ${JSON.stringify(cache)}`);

              store.writeQuery({
                query: QUERY_PROYECTO,
                variables: { idProyecto: this.esteProyecto.id },
                data: cache,
              });
              console.log(`cache actualizado`);
            } catch (error) {
              console.log(`Error actualizando cache: ${error}`);
              return;
            }
          },
        })
        .then((respuesta) => {
          console.log(`respuesta. ${respuesta}`);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    eliminarObjetivo(idObjetivo) {
      if (!this.esteProyecto.objetivos.some((t) => t.id == idObjetivo)) return;

      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idObjetivo: ID!, $idProyecto: ID!) {
              eliminarObjetivoDeProyecto(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
              )
            }
          `,
          variables: {
            idObjetivo,
            idProyecto: this.esteProyecto.id,
          },
          update: (store, { data: { eliminarObjetivoDeProyecto } }) => {
            console.log(`data: ${JSON.stringify(eliminarObjetivoDeProyecto)}`);
            let eliminado = eliminarObjetivoDeProyecto;

            if (eliminado) {
              try {
                let cache = store.readQuery({
                  query: QUERY_PROYECTO,
                  variables: { idProyecto: this.esteProyecto.id },
                });
                let indexE = cache.proyecto.objetivos.findIndex(
                  (o) => o.id == idObjetivo
                );
                if (indexE > -1) {
                  cache.proyecto.objetivos.splice(indexE, 1);
                }
                store.writeQuery({
                  query: QUERY_PROYECTO,
                  variables: { idProyecto: this.esteProyecto.id },
                  data: cache,
                });
              } catch (error) {
                console.log(`Error actualizando cache`);
              }
            }
          },
        })
        .then(() => {})
        .catch((error) => {
          console.log("error: " + error);
        });
    },
    cambiarNombreObjetivo({ idObjetivo, nuevoNombre }) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idObjetivo: ID!
              $nuevoNombre: String!
            ) {
              cambiarNombreObjetivo(
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
            idProyecto: this.esteProyecto.id,
            idObjetivo,
            nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
    cambiarDescripcionObjetivo({ idObjetivo, nuevaDescripcion }) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation(
              $idProyecto: ID!
              $idObjetivo: ID!
              $nuevaDescripcion: String!
            ) {
              cambiarDescripcionObjetivo(
                idProyecto: $idProyecto
                idObjetivo: $idObjetivo
                nuevaDescripcion: $nuevaDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idProyecto: this.esteProyecto.id,
            idObjetivo,
            nuevaDescripcion,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
        })
        .catch((error) => {
          console.log(`error: ${error}`);
        });
    },
  },
};
</script>

<style scoped>
.proyecto {
  padding: 5px 10px;
}

#nombreProyecto {
  margin-top: 15px;
  font-size: 23px;
  font-weight: bolder;
  text-align: center;
  margin-bottom: 15px;
}
#zonaResponsables {
  min-height: 40px;
  align-items: center;
}
.zonaPrimerNivel {
  border: 2px solid black;
}

#listaTrabajos {
  padding: 10px 25px;
}
.iconoTrabajo {
  margin-bottom: 30px;
}
.opacar{
  opacity: 0.3;
}
#listaObjetivos {
  padding: 10px 25px;
}
.iconoObjetivo {
  margin-bottom: 30px;
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
  background-color: teal;
  padding: 3px 5px;
}
#listaResponsables {
  display: flex;
}
.iconoPersona {
  margin-right: 10px;
  margin-left: 5px;
  vertical-align: middle;
  margin-top: 5px;
  margin-bottom: 5px;
}
.personaPosibleResponsable{
  opacity: 0.5;
}
</style>