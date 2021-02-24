<template>
  <div class="visorNodoConocimiento">
    <div id="layout">
      <div id="zonaNombre">
        <div
          class="controlesZona"
          v-show="usuarioExperto || usuarioSuperadministrador || usuarioAdministradorAtlas"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarrNombre"
            class="bEditar botonesControlesZona"
            title="Editar nombre del nodo"
            @click="toggleEditandoNombre"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar botonesControlesZona"
            id="bGuardarNuevoNombre"
            v-show="editandoNombre == true && nuevoNombreIlegal == false"
            @click="guardarNuevoNombre"
          />
        </div>
        <p id="nombre" v-show="!editandoNombre">{{ esteNodo.nombre }}</p>
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
      <div id="barraLateral">
        <div
          class="selectorSeccion"
          v-for="(seccion) of seccionesOrganizadas"
          :class="{selectorSeleccionado: seccionSeleccionada==seccion.nombre}"
          :key="seccion.nombre"
          @click="seccionSeleccionada = seccion.nombre"
        >
          {{ seccion.texto }}
         
        </div>
      </div>

      <div
        id="seccionDescripcion"
        class="seccionPrimerNivel"
        v-show="seccionSeleccionada == 'descripcion'"
      >
        <div
          class="controlesZona"
          v-show="usuarioExperto || usuarioSuperadministrador || usuarioAdministradorAtlas"
        >
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarDescripcion"
            class="bEditar botonesControlesZona"
            title="Editar Descripción del nodo"
            @click.stop="toggleEditandoDescripcion"
          />
          <img
            src="@/assets/iconos/guardar.png"
            alt="Guardar"
            title="guardar"
            class="bGuardar botonesControlesZona"
            id="bGuardarNuevoDescripcion"
            v-show="
              editandoDescripcion == true && nuevoDescripcionIlegal == false
            "
            @click.stop="guardarNuevoDescripcion"
          />
        </div>
        <div id="descripcion" ref="descripcion" v-show="!editandoDescripcion">
          {{ esteNodo.descripcion }}
        </div>

        <textarea
          id="inputNuevoDescripcion"
          ref="inputNuevoDescripcion"
          :class="{ letrasRojas: nuevoDescripcionIlegal }"
          v-model="nuevoDescripcion"
          v-show="editandoDescripcion"
          placeholder="¡Escribe una descripción acerca de este tema!"
        />
        <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
      </div>
      
      <div :key="seccion.nombre" v-for="seccion of esteNodo.secciones" class="seccionPrimerNivel seccionContenidoExterno" :class="'seccion'+seccion.nombre" v-show="seccionSeleccionada == seccion.nombre">        
        <div class="barraControlesContenidosExternos" v-if="usuarioExperto==true || usuarioAdministradorAtlas==true || usuarioSuperadministrador==true">
          <img
              src="@/assets/iconos/editar.png"
              alt="Editar"
              :id="'bEditarSeccion'+seccion.nombre"
              class="bEditar botonesEditarContenidosExternos"
              title="Seleccionar archivos de contenido"
              @click.stop="editandoArchivosContenidos=!editandoArchivosContenidos"
            />
        </div>
        <iframe
          id="visorContenido"
          :ref="'contenidoExterno'+seccion.nombre"
          :src="direccionNodo+'/'+seccion.nombre+'/'"
          v-show="!editandoArchivosContenidos"
          
        ></iframe>
        <div class="cuadroCargaArchivos" v-if="usuarioExperto==true || usuarioAdministradorAtlas==true || usuarioSuperadministrador==true" v-show="editandoArchivosContenidos">
          <div class="archivoExistente" :class="{deshabilitado:archivo.enviandoInfo}" :key="index" v-for="(archivo, index) of seccion.archivos"><div class="botonMarcarPrimario" :class="{rojo:archivo.primario}" @click="marcarPrimario(archivo, seccion.nombre)"></div>{{archivo.nombre}} <span class="botonBorrarArchivoExistente" @click="borrarArchivoExistenteSeccionNodo(archivo, seccion.nombre)">Borrar</span></div>
          <input type="file" class="inputArchivoContenido" @change="subirArchivoContenido($event,seccion)"/>
        </div>
      </div>
      

      <div
        id="seccionExpertos"
        class="seccionPrimerNivel"
        v-show="seccionSeleccionada == 'expertos'"
      >
        <div id="controlesExpertos" class="controlesZona">
          <loading v-show="enviandoQueryExpertos" texto="Esperando..." />
          <div
            class="controlesExpertos hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryExpertos }"
            v-if="usuarioLogeado == true && (usuarioSuperadministrador==true || usuarioAdministradorAtlas==true) && !usuarioExperto" 
            id="asumirExperto"
            @click="asumirComoExperto"
          >
            Asumir
          </div>
          <div
            class="controlesExpertos hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryExpertos }"
            v-if="usuarioLogeado && !usuarioExperto && !usuarioPosibleExperto"
            id="botonAddExperto"
            @click="entrarListaPosiblesExpertos"
          >
            Quiero aportar como experto
          </div>
          <div
            class="controlesExpertos hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryExpertos }"
            v-if="
              usuarioLogeado == true &&
              (usuarioExperto == true || usuarioPosibleExperto == true)
            "
            @click="abandonarListaExpertos"
          >
            Abandonar
          </div>
          <div
            class="controlesExpertos hoverGris botonesControles"
            :class="{ deshabilitado: enviandoQueryExpertos }"
            v-if="
              (usuarioLogeado == true && usuarioExperto == true) ||
              usuarioSuperadministrador == true
            "
            v-show="
              idExpertoSeleccionado != null &&
              expertoSeleccionadoEstaAceptado == false
            "
            @click="aceptarExperto(idExpertoSeleccionado)"
          >
            Aceptar como experto
          </div>
        </div>
        <div id="listaExpertos">
          <icono-persona-autonomo
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteNodo.expertos"
            :seleccionado="idExpertoSeleccionado == idPersona"
            @click.native.stop="
              idExpertoSeleccionado = idPersona;
              expertoSeleccionadoEstaAceptado = true;
            "
          />

          <icono-persona-autonomo
            class="personaPosibleExperto"
            :idPersona="idPersona"
            :key="idPersona"
            v-for="idPersona of esteNodo.posiblesExpertos"
            :seleccionado="idExpertoSeleccionado == idPersona"
            @click.native.stop="
              idExpertoSeleccionado = idPersona;
              expertoSeleccionadoEstaAceptado = false;
            "
            @dblclick.native.shift="aceptarExperto(idPersona)"
          />
        </div>
      </div>

      <div
        id="seccionForos"
        ref="zonaForos"
        class="seccionPrimerNivel"
        v-show="seccionSeleccionada == 'foros'"
      >
        <div class="nombreForo" v-if="usuarioExperto">Foro expertos</div>
        <foro
          :parent="infoAsParent"
          v-if="usuarioExperto"
          :idForo="esteNodo.idForoExpertos"
        />
        <br v-if="usuarioExperto" />
        <div class="nombreForo">Foro público</div>
        <foro :parent="infoAsParent" :idForo="esteNodo.idForoPublico" />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import Loading from "./utilidades/Loading.vue";
import IconoPersonaAutonomo from "./proyecto/IconoPersonaAutonomo.vue";
import Foro from "./Foro.vue";
import axios from 'axios';

const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;
const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;

const QUERY_NODO = gql`
  query($idNodo: ID!) {
    nodo(idNodo: $idNodo) {
      nombre
      id
      descripcion
      expertos
      posiblesExpertos
      idForoPublico
      idForoExpertos
      secciones{
        nombre
        archivos{
          nombre
          primario
        }
        tipoPrimario
      }
      vinculos {
        idRef
        rol
        tipo
      }
    }
  }
`;

export default {
  components: { Loading, IconoPersonaAutonomo, Foro },
  name: "VisorNodoConocimiento",
  apollo: {
    esteNodo: {
      query: QUERY_NODO,
      variables() {
        return {
          idNodo: this.$route.params.idNodo,
        };
      },
      update({ nodo }) {
        nodo.secciones.forEach(seccion=>{          
          seccion.subiendoArchivo=false;
          seccion.archivos.forEach(archivo=>{
            archivo.enviandoInfo=false;
          })         
        })
        return nodo;
      },
    },
  },
  data() {
    return {
      esteNodo: {
        expertos: [],
        posiblesExpertos: [],
        secciones:[]
      },
      secciones: [{nombre: "descripcion", texto:"Descripción"}, {nombre:"expertos", texto: "Expertos"}, {nombre: "foros", texto:"Foros"}],
      indexInicioContenidos:1,
      seccionesContenidos:[{nombre:"explicacion", texto:"Explicación", editandose:false, subiendoArchivo:false}],
      seccionSeleccionada: "descripcion",

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: null,
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      idExpertoSeleccionado: null,
      expertoSeleccionadoEstaAceptado: false,
      enviandoQueryExpertos: false,

      editandoArchivosContenidos:false,

      versionExplicacionRef:0,
    };
  },
  computed: {
    seccionesOrganizadas(){
      let lasSecciones=this.secciones;
      lasSecciones.splice(this.indexInicioContenidos, 0, ...this.seccionesContenidos);
      return lasSecciones
    },
    direccionNodo: function () {
      return (
        this.serverUrl +
        "/assetsAtlas/contenidosNodos/" +
        this.$route.params.idNodo
      );
    },
    usuarioExperto: function () {
      if (!this.esteNodo.expertos) return false;

      if (this.esteNodo.expertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    usuarioPosibleExperto: function () {
      if (!this.esteNodo.posiblesExpertos) return false;

      if (this.esteNodo.posiblesExpertos.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    nuevoNombreIlegal() {
      if (this.nuevoNombre.length < 1) {
        return true;
      }
      if (charProhibidosNombreNodo.test(this.nuevoNombre)) {
        return true;
      }
      return false;
    },
    nuevoDescripcionIlegal() {
      if (!this.nuevoDescripcion || this.nuevoDescripcion.length < 1) {
        return true;
      }
      if (charProhibidosDescripcionNodo.test(this.nuevoDescripcion)) {
        return true;
      }
      return false;
    },
    infoAsParent() {
      return {
        id: this.esteNodo.id,
        tipo: "nodoConocimiento",
        nombre: this.esteNodo.nombre,
      };
    },
    usuarioAdministradorAtlas: function () {
      if (!this.$store.state.usuario.permisos) return false;
      return (this.$store.state.usuario.permisos.includes("atlasAdministrador")) ? true : false
    },
  },
  methods: {
    toggleEditandoDescripcion() {
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteNodo.descripcion;
    },
    toggleEditandoNombre() {
      this.editandoNombre = !this.editandoNombre;
      this.nuevoNombre = this.esteNodo.nombre;
    },
    guardarNuevoDescripcion() {
      if (this.nuevoDescripcionIlegal) {
        console.log(`Descripción ilegal`);
        return;
      }
      if (this.nuevoDescripcion == this.esteNodo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $nuevoDescripcion: String!) {
              editarDescripcionNodoConocimiento(
                idNodo: $idNodo
                nuevoDescripcion: $nuevoDescripcion
              ) {
                id
                descripcion
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoDescripcion: this.nuevoDescripcion,
          },
        })
        .then(() => {
          this.enviandoNuevoDescripcion = false;
          this.editandoDescripcion = false;
        })
        .catch(({ graphQLErrors }) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${graphQLErrors}`);
        });
    },
    abandonarListaExpertos() {
      console.log(`Abandonando la responsabilidad en este nodo`);
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $idUsuario: ID!) {
              removeExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                expertos
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    aceptarExperto(idPosibleExperto) {
      console.log(`aceptando como experto al usuario ${idPosibleExperto}`);
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $idUsuario: ID!) {
              addExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                expertos
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: idPosibleExperto,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
          this.expertoSeleccionadoEstaAceptado = true;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    entrarListaPosiblesExpertos() {
      console.log(
        `Enviando peticion de entrar a la lista de posibles expertos del nodo con id ${this.esteNodo.id}`
      );
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $idUsuario: ID!) {
              addPosibleExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: this.$store.state.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    asumirComoExperto() {
      console.log(
        `enviando id ${this.$store.state.usuario.id} para la lista de expertos del nodo con id ${this.esteNodo.id}`
      );
      this.enviandoQueryExpertos = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $idUsuario: ID!) {
              addExpertoNodo(idNodo: $idNodo, idUsuario: $idUsuario) {
                id
                expertos
                posiblesExpertos
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryExpertos = false;
        })
        .catch((error) => {
          this.enviandoQueryExpertos = false;
          console.log("error: " + error);
        });
    },
    guardarNuevoNombre() {
      if (this.nuevoNombreIlegal) {
        console.log(`No enviado`);
        return;
      }
      if (this.nuevoNombre == this.esteNodo.nombre) {
        this.editandoNombre = false;
        return;
      }
      console.log(`guardando nuevo nombre`);
      this.enviandoNuevoNombre = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($idNodo: ID!, $nuevoNombre: String!) {
              editarNombreNodo(idNodo: $idNodo, nuevoNombre: $nuevoNombre) {
                modificados {
                  id
                  nombre
                }
              }
            }
          `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoNombre: this.nuevoNombre,
          },
        })
        .then((data) => {
          console.log(`fin de la mutacion. Data: ${JSON.stringify(data)} `);
          this.enviandoNuevoNombre = false;
          this.editandoNombre = false;
        })
        .catch((error) => {
          this.enviandoNuevoNombre = false;
          console.log(`Error. E :${error}`);
        });
    },
    subirArchivoContenido(e, seccion){
      let inputArchivo =e.target;
      var datos = new FormData();
      const nuevoArchivo = inputArchivo.files[0];
      
      datos.append("nuevoArchivo", nuevoArchivo);
      datos.append("idNodo", this.esteNodo.id);
      datos.append("nombreSeccion", seccion.nombre);
      seccion.subiendoArchivo = true;
      axios({
        method: "post",
        url: this.serverUrl + "/api/atlas/subirArchivoContenidoSeccionNodo",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data :{infoArchivo}}) => {
          seccion.subiendoArchivo = false;

          const store=this.$apollo.provider.defaultClient;
          const cache=store.readQuery({
            query: QUERY_NODO,
            variables:{
              idNodo:this.$route.params.idNodo
            }
          });

          var nuevoCache=JSON.parse(JSON.stringify(cache));
          var laSeccion=nuevoCache.nodo.secciones.find(s=>s.nombre==seccion.nombre);
          laSeccion.archivos.push(infoArchivo);
          store.writeQuery({
            query:QUERY_NODO,
            variables:{
              idNodo:this.$route.params.idNodo
            },
            data:nuevoCache
          });
        })
        .catch((error) => {
          seccion.subiendoArchivo = false;
          console.log(`Error subiendo archivo. E: ${error}`);
        });
        
    },
    borrarArchivoExistenteSeccionNodo(archivo, nombreSeccion){
      const nombreArchivo=archivo.nombre;
      if(!confirm("Borrando archivo ¿Continuar?")){
        console.log(`Cancelado`);
        return
      }
      const dis=this;
      archivo.enviandoInfo=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo:ID!, $nombreSeccion:String!, $nombreArchivo:String!){
            eliminarArchivoSeccionNodo(idNodo:$idNodo, nombreSeccion:$nombreSeccion, nombreArchivo:$nombreArchivo)
          }
        `,
        variables:{
          idNodo:this.$route.params.idNodo,
          nombreSeccion,
          nombreArchivo
        },
        update(store, {data:{eliminarArchivoSeccionNodo}}){
          archivo.enviandoInfo=false;
          
          if(!eliminarArchivoSeccionNodo){
            console.log(`Archivo no eliminado`);
            return
          }
          const cache=store.readQuery({
            query: QUERY_NODO,
            variables:{
              idNodo:dis.$route.params.idNodo
            }
          });
          var nuevoCache=JSON.parse(JSON.stringify(cache));

          var laSeccion=nuevoCache.nodo.secciones.find(s=>s.nombre==nombreSeccion);
          if(!laSeccion){
            console.log(`Seccion no encontrada`);
            return;
          }

          var indexA=laSeccion.archivos.findIndex(a=>a.nombre==nombreArchivo);
          if(indexA>-1){
            laSeccion.archivos.splice(indexA, 1);
            store.writeQuery({
              query: QUERY_NODO,
              variables:{
                idNodo:dis.$route.params.idNodo
              },
              data:nuevoCache
            })
          }
          else{
            console.log(`Archivo no encontrado`);
          }
        }
      }).then(()=>{

      }).catch((error)=>{
        archivo.enviandoInfo=false;
        console.log(`Error. E: ${error}`);
      })
    },
    marcarPrimario(archivo, nombreSeccion){
      const nombreArchivo=archivo.nombre;
      
      const dis=this;
      archivo.enviandoInfo=true;
      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo:ID!, $nombreSeccion:String!, $nombreArchivo:String!){
            marcarPrimarioArchivoSeccionNodo(idNodo:$idNodo, nombreSeccion:$nombreSeccion, nombreArchivo:$nombreArchivo)
          }
        `,
        variables:{
          idNodo:this.$route.params.idNodo,
          nombreSeccion,
          nombreArchivo
        },
        update(store, {data:{marcarPrimarioArchivoSeccionNodo}}){
          archivo.enviandoInfo=false;
          
          if(!marcarPrimarioArchivoSeccionNodo){
            console.log(`Archivo no marcado`);
            return
          }
          const cache=store.readQuery({
            query: QUERY_NODO,
            variables:{
              idNodo:dis.$route.params.idNodo
            }
          });
          var nuevoCache=JSON.parse(JSON.stringify(cache));

          var laSeccion=nuevoCache.nodo.secciones.find(s=>s.nombre==nombreSeccion);
          if(!laSeccion){
            console.log(`Seccion no encontrada`);
            return;
          }

          laSeccion.archivos.forEach(archivo=>{
            archivo.primario=archivo.nombre==nombreArchivo?true:false;
          })
          
          store.writeQuery({
            query: QUERY_NODO,
            variables:{
              idNodo:dis.$route.params.idNodo
            },
            data:nuevoCache
          })
          
        }
      }).then(()=>{
      }).catch((error)=>{
        archivo.enviandoInfo=false;
        console.log(`Error. E: ${error}`);
      })
    }
  },
  
};
</script>

<style scoped>
.visorNodoConocimiento {
  width: 100%;
  height: 100%;
  background-color: #ffdbaf;
}
#layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  grid-template-rows: 70px 1fr;
  grid-template-areas:
    "nombre nombre nombre"
    "barraLateral contenido contenido";
}
#zonaNombre {
  grid-area: nombre;
  display: flex;
  background-color: burlywood;
}
#nombre {
  font-size: 23px;
  text-align: center;
  padding: 10px 30px;
  border-radius: 13px;
  border: 1px solid rgb(80, 0, 0);
  background-color: rgb(255 219 175);
  margin: auto;
}
#inputNuevoNombre {
  font-size: 23px;
  display: block;
  margin: 10px auto;
}
#barraLateral {
  grid-area: barraLateral;
  background-color: burlywood;
}

#visorContenido {
  grid-area: contenido;
  width: 100%;
  height: 100%;
}
.selectorSeccion {
  padding: 15px;
  font-size: 23px;
  cursor: pointer;
}
.selectorSeccion:hover {
  background-color: bisque;
}
.selectorSeleccionado{
    background-color: bisque;
}
.seccionPrimerNivel {
  grid-area: contenido;
}
#seccionDescripcion {
  min-width: 100px;
  min-height: 100px;
}

#descripcion {
  border: 1px solid rgb(0, 0, 44);
  background-color: #fdeedb;
  border-radius: 10px;
  margin: 65px auto;
  width: min(600px, 90%);
  font-size: 19px;
  padding: 10px;
  min-height: 100px;
  resize: vertical;
  white-space: pre-wrap;
}
#inputNuevoDescripcion {
  width: min(600px, 90%);
  font-size: 19px;
  height: 70px;
  display: block;
  margin: 65px auto;
  resize: vertical;
}
.botonesControlesZona {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
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
#listaExpertos {
  display: flex;
  padding: 10px 20px;
  padding-bottom: 65px;
}
.iconoPersonaAutonomo {
  margin: 25px;
}
.personaPosibleExperto {
  opacity: 0.5;
}
.nombreForo {
  padding: 5px 10px;
  background-color: #5fbf78;
}
.seccionContenidoExterno{
  position: relative;
}
.barraControlesContenidosExternos{
  position: absolute;
  transform: translateY(-100%);
  top:0%;
  left:0%;
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  opacity: 0.5;
  padding: 5px;
}
.barraControlesContenidosExternos:hover{
  opacity: 1;
}
.botonesEditarContenidosExternos{
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
}
.botonesEditarContenidosExternos:hover{
  background-color: grey;
}
.cuadroCargaArchivos{
  margin: 50px auto;
}
.archivoExistente{
  padding: 5px 10px;
  border-radius: 5px;
  background-color: rgb(107, 235, 107);
  border: 1px solid rgb(0, 48, 0);
  margin: 2px 10px;
  display: flex;
  font-size: 17px;
}
.botonBorrarArchivoExistente{
  margin-left:auto;
  cursor:pointer;
  padding: 3px 5px;
  border-radius: 3px;
  font-size: 13px
  ;
}
.botonBorrarArchivoExistente:hover{
  background-color: grey;
}
.botonMarcarPrimario{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid black;  
  cursor: pointer;
  margin-right: 10px;
}
.rojo{
  background-color: red;
}
</style>
