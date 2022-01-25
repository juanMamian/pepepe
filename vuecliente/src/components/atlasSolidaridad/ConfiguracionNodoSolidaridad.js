import gql from "graphql-tag";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./configuracion";

import { fragmentoNodoSolidaridad, fragmentoPersonaAtlas } from "./frags";

export const charProhibidosNombreNodo = charProhibidosNombreCosa;
export const charProhibidosDescripcionNodo = charProhibidosTexto
export const charProhibidosKeywords = /[^ a-zA-Zñ0-9]/;
export const QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD = gql`
  query {
    yo {
      id
      nombre
      coords{
        x
        y
      }
      vinculos{
      id
        tipo
        idRef
      }
      fuerzaCentroMasa{
      fuerza
      direccion
    }
    fuerzaColision{
      fuerza
      direccion  
    }
      atlasSolidaridad {
        id
        coordsVista {
          x
          y
        }
        idsNodosDesplegados
      }
    }
  }
`;

export var MixinGeneralNodoSolidaridad = {
  data() {
    return {
      enviandoQueryGeneral: false,
    }
  },
  methods: {
    eliminarse() {
      if (!this.usuarioSuperadministrador && !this.usuarioAdministrador) {
        console.log(`No autorizado`);
        return;
      }
      if (
        !confirm(
          "¿Confirmar eliminación de nodo? (Esta acción no puede deshacerse"
        )
      ) {
        return;
      }
      this.enviandoQueryGeneral = true;
      const dis = this;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!) {
                    eliminarNodoSolidaridad(idNodo: $idNodo)
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
          },
        })
        .then(() => {
          dis.enviandoQueryGeneral = false;
          this.$emit("meElimine")
        })
        .catch((error) => {
          console.log(`Error: ${error}`);
          dis.enviandoQueryGeneral = false;
        });
    },
  }
}

export var MixinEdicionNodoSolidaridad = {
  data() {
    return {
      idResponsableSeleccionado: null,
      enviandoQueryResponsables: false,

      nuevoNombre: "Nuevo nombre",
      editandoNombre: false,
      enviandoNuevoNombre: false,

      nuevoDescripcion: "Nueva descripcion",
      editandoDescripcion: false,
      enviandoNuevoDescripcion: false,

      nuevoKeywords: null,
      editandoKeywords: false,
      enviandoNuevoKeywords: false,

      togglingEstado: false,
    };
  },
  methods: {

    guardarNuevoNombre() {
      this.nuevoNombre = this.$refs.inputNuevoNombre.value;

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
                  mutation ($idNodo: ID!, $nuevoNombre: String!) {
                    editarNombreNodoSolidaridad(
                      idNodo: $idNodo
                      nuevoNombre: $nuevoNombre
                    ) {
                      id
                      nombre
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
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
      if (this.nuevoDescripcion == this.esteNodo.descripcion) {
        this.editandoDescripcion = false;
        return;
      }
      console.log(`guardando nuevo descripcion`);
      this.enviandoNuevoDescripcion = true;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!, $nuevoDescripcion: String!) {
                    editarDescripcionNodoSolidaridad(
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
        .catch((error) => {
          this.enviandoNuevoDescripcion = false;
          console.log(`Error. E :${error}`);
        });
    },
    guardarNuevoKeywords() {
      if (this.nuevoKeywordsIlegal) {
        console.log(`Keywords ilegal`);
        return;
      }
      if (this.nuevoKeywords == this.esteNodo.keywords) {
        this.editandoKeywords = false;
        return;
      }
      console.log(`guardando nuevo keywords`);
      this.enviandoNuevoKeywords = true;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!, $nuevoKeywords: String!) {
                    editarKeywordsNodoSolidaridad(
                      idNodo: $idNodo
                      nuevoKeywords: $nuevoKeywords
                    ) {
                      id
                      keywords
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoKeywords: this.nuevoKeywords,
          },
        })
        .then(() => {
          this.enviandoNuevoKeywords = false;
          this.editandoKeywords = false;
        })
        .catch(({ graphQLErrors }) => {
          this.enviandoNuevoKeywords = false;
          console.log(`Error. E :${graphQLErrors}`);
        });
    },
    toggleEditandoDescripcion() {
      if (!this.usuarioAdministrador) {
        return;
      }
      this.$refs.inputNuevoDescripcion.style.height =
        this.$refs.descripcion.offsetHeight + "px";
      this.editandoDescripcion = !this.editandoDescripcion;
      this.nuevoDescripcion = this.esteNodo.descripcion;

      if (this.editandoDescripcion) {
        this.$nextTick(() => {
          this.$refs.inputNuevoDescripcion.focus();
        })
      }
    },
    toggleEditandoKeywords() {
      if (!this.usuarioAdministrador) {
        return;
      }
      this.$refs.inputNuevoKeywords.style.height =
        this.$refs.keywords.offsetHeight + "px";
      this.editandoKeywords = !this.editandoKeywords;
      this.nuevoKeywords = this.esteNodo.keywords;

      if (this.editandoKeywords) {
        this.$nextTick(() => {
          this.$refs.inputNuevoKeywords.focus();
        })
      }
    },
    toggleEstadoNodo() {
      if (!this.usuarioAdministrador) return;
      var nuevoEstado = "noCompletado";
      if (this.esteNodo.estadoDesarrollo === "noCompletado") {
        nuevoEstado = "completado";
      }
      this.togglingEstado = true;

      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!, $nuevoEstado: String!) {
                    setEstadoNodoSolidaridad(
                      idNodo: $idNodo
                      nuevoEstado: $nuevoEstado
                    ) {
                      id
                      estadoDesarrollo
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
            nuevoEstado,
          },
        })
        .then(() => {
          this.togglingEstado = false;
          console.log(`toggled`);
        })
        .catch((error) => {
          this.togglingEstado = false;
          console.log(`Error: E:${error}`);
        });
    },
    entrarResponsables() {
      console.log(
        `Enviando peticion de entrar a la lista de responsables del nodo con id ${this.esteNodo.id}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!) {
                    usuarioEntrarResponsableNodoSolidaridad(idNodo: $idNodo) {
                      id
                      responsables
                      posiblesResponsables
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    abandonarListaResponsables() {
      console.log(`Abandonando la responsabilidad en este nodo`);
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!, $idUsuario: ID!) {
                    removeResponsableNodoSolidaridad(
                      idNodo: $idNodo
                      idUsuario: $idUsuario
                    ) {
                      id
                      responsables
                      posiblesResponsables
                      administradores
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: this.usuario.id,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    aceptarResponsable(idPosibleResponsable) {
      console.log(
        `aceptando como responsable al usuario ${idPosibleResponsable}`
      );
      this.enviandoQueryResponsables = true;
      this.$apollo
        .mutate({
          mutation: gql`
                  mutation ($idNodo: ID!, $idUsuario: ID!) {
                    addResponsableNodoSolidaridad(
                      idNodo: $idNodo
                      idUsuario: $idUsuario
                    ) {
                      id
                      responsables
                      posiblesResponsables
                      responsablesSolicitados
                      administradores
                    }
                  }
                `,
          variables: {
            idNodo: this.esteNodo.id,
            idUsuario: idPosibleResponsable,
          },
        })
        .then(() => {
          this.enviandoQueryResponsables = false;
          this.responsableSeleccionadoEstaAceptado = true;
          this.versionCalendario++;
        })
        .catch((error) => {
          this.enviandoQueryResponsables = false;
          console.log("error: " + error);
        });
    },
    toggleEditandoNombre(e) {
      if (!this.seleccionado && !this.noSeleccionable) {
        return
      }
      if (this.usuarioAdministrador) {
        e.stopPropagation();

        this.editandoNombre = true;
        this.nuevoNombre = this.esteNodo.nombre;
        this.$nextTick(() => {
          this.$refs.inputNuevoNombre.focus();
        })
      }
    },
    keydownInputNuevoNombre(e) {
      if (e.key === "Escape") {
        this.$refs.inputNuevoNombre.blur();
      }
    },

  },
  computed: {

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
    nuevoKeywordsIlegal() {
      if (!this.nuevoKeywords || this.nuevoKeywords.length < 1) {
        return true;
      }
      if (charProhibidosKeywords.test(this.nuevoKeywords)) {
        return true;
      }
      return false;
    },
  },
  watch: {
    mostrando(mostrando) {
      if (mostrando != "descripcion") this.editandoDescripcion = false;
      if (mostrando != "keywords") this.editandoKeywords = false;

      if (mostrando === "descripcion") {
        if (
          !this.esteNodo.descripcion ||
          this.esteNodo.descripcion.length < 1 ||
          this.esteNodo.descripcion === "Sin descripción" ||
          this.esteNodo.descripcion === "Sin descripcion"
        ) {
          if (!this.editandoDescripcion) {
            this.toggleEditandoDescripcion();
          }
        }
      }
      else if (mostrando === "keywords") {
        if (
          !this.esteNodo.keywords ||
          this.esteNodo.keywords.length < 1
        ) {
          if (!this.editandoKeywords) {
            this.toggleEditandoKeywords();
          }
        }
      }
    },
  }
}

export var MixinPermisosUsuarioNodoSolidaridad = {
  computed: {
    usuarioResponsable() {
      if (!this.usuarioLogeado || !this.usuario || !this.usuario.id)
        return false;
      return (
        this.esteNodo.responsables &&
        this.esteNodo.responsables.includes(this.usuario.id)
      );
    },
    usuarioResponsableAmplio() {
      if (!this.usuarioLogeado || !this.usuario || !this.usuario.id)
        return false;
      return (
        this.esteNodo.responsablesAmplio &&
        this.esteNodo.responsablesAmplio.includes(this.usuario.id)
      );
    },
    usuarioPosibleResponsable: function () {
      if (!this.esteNodo.posiblesResponsables) return false;

      if (this.esteNodo.posiblesResponsables.includes(this.usuario.id)) {
        return true;
      }
      return false;
    },
    usuarioAdministrador() {
      if (!this.usuario || !this.usuario.id) return false;
      return this.esteNodo.administradores.includes(this.usuario.id);
    },
  }
}

export var MixinEdicionVinculosNodoSolidaridad = {
  data() {
    return {
      creandoSubNodo: false,
      enviandoEditVinculos: false,
    }
  },
  methods: {
    crearRequerimento(idNodoRequiriente, tipoRequiriente, idNodoRequerido) {
      console.log(
        `Se fijara que ${idNodoRequiriente} requiere a ${idNodoRequerido}`
      );
      this.enviandoEditVinculos = true;
      this.$apollo.mutate({
        mutation: gql`
            mutation ($idNodoRequiriente: ID!, $tipoRequiriente: String!, $idNodoRequerido: ID!) {
              crearRequerimentoEntreNodosAtlasSolidaridad(
                idNodoRequiriente: $idNodoRequiriente
                tipoRequiriente:$tipoRequiriente
                idNodoRequerido: $idNodoRequerido
              ) {
                nodosModificados{
                  __typename
                  id
                  vinculos {
                    id
                    idRef
                    tipo                
                  }
                  administradores
                  nodoParent
                }
                usuariosModificados{
                  id
                  vinculos {
                    id
                    idRef
                    tipo                
                  }
                }
                
              }
            }
          `,
        variables: {
          idNodoRequiriente,
          tipoRequiriente,
          idNodoRequerido,
        },
      }).then(() => {
        this.enviandoEditVinculos = false;
      }).catch((error) => {
        this.enviandoEditVinculos = false;
        console.log(`Error: ${error}`);
      });
    },
    crearParenting(idNodoRequiriente, tipoRequiriente, idNodoRequerido) {
      if (!this.usuarioSuperadministrador) {
        console.log(`Opción exclusiva de súperadministrador`);
        return
      }
      console.log(
        `Se fijara que ${idNodoRequiriente} es parent de ${idNodoRequerido}`
      );
      this.$apollo.mutate({
        mutation: gql`
            mutation ($idNodoRequiriente: ID!, $tipoRequiriente:String!, $idNodoRequerido: ID!) {
              crearParentingEntreNodosAtlasSolidaridad(
                idNodoRequiriente: $idNodoRequiriente
                tipoRequiriente: $tipoRequiriente
                idNodoRequerido: $idNodoRequerido
              ) {
                nodosModificados{
                  id
                  vinculos {
                    id
                    idRef
                    tipo                
                  }
                  administradores
                  nodoParent
                }
                usuariosModificados{
                  id
                  vinculos {
                    id
                    idRef
                    tipo                
                  }
                }
              }
            }
          `,
        variables: {
          idNodoRequiriente,
          tipoRequiriente,
          idNodoRequerido,
        },
      });
    },
    eliminarRequerimento(idNodoRequiriente, tipoRequiriente, idNodoRequerido) {
      console.log(`Se eliminará el requerimento entre el nodo ${idNodoRequiriente} de tipo ${tipoRequiriente} y el nodo ${idNodoRequerido}`);
      this.enviandoEditVinculos = true;

      this.$apollo.mutate({
        mutation: gql`
            mutation ($idNodoRequiriente: ID!, $tipoRequiriente:String!, $idNodoRequerido: ID!) {
              deleteRequerimentoNodosAtlasSolidaridad(
                idNodoRequiriente: $idNodoRequiriente
                tipoRequiriente: $tipoRequiriente
                idNodoRequerido: $idNodoRequerido
              ) {
                  nodosModificados{
                    id
                    vinculos {
                      id
                      idRef
                      tipo                
                    }
                    administradores
                    nodoParent
                  }
                  usuariosModificados{
                    id
                    vinculos {
                      id
                      idRef
                      tipo                
                    }                                        
                  }              
              }
            }
          `,
        variables: {
          idNodoRequiriente,
          tipoRequiriente,
          idNodoRequerido,
        },
      }).then(() => {
        this.enviandoEditVinculos = false;

      }).catch((error) => {
        console.log(`Error: ${error}`);
        this.enviandoEditVinculos = false;
      });
    },
    afterCrearNodoUnder(nuevoNodo) {
      this.$emit("nodoSolidaridadCreado", nuevoNodo)
    },
    crearNuevoNodoUnder(infoNodo) {
      console.log(`Creando nodo under ${this.esteNodo.__typename}`);
      this.creandoSubNodo = true;
      this.$apollo
        .mutate({
          mutation: gql`
            mutation ($infoNodo: NodoSolidaridadInput!, $idNodoParent: ID!, $tipoParent:String!) {
              crearNuevoNodoSolidaridadUnderNodo(
                infoNodo: $infoNodo
                idNodoParent: $idNodoParent
                tipoParent:$tipoParent
              ) {
                nuevoNodo{
                  ...fragNodoSolidaridad
                }
                nodosModificados{
                  ...fragNodoSolidaridad                      
                }
                usuariosModificados{
                  ...fragPersonaAtlas
                }
              }
            }
            ${fragmentoNodoSolidaridad}
            ${fragmentoPersonaAtlas}
          `,
          variables: {
            infoNodo,
            idNodoParent: this.esteNodo.id,
            tipoParent: this.esteNodo.__typename.charAt(0).toLowerCase() + this.esteNodo.__typename.slice(1),
          },
        })
        .then(({ data: { crearNuevoNodoSolidaridadUnderNodo } }) => {
          this.creandoSubNodo = false;
          this.afterCrearNodoUnder(crearNuevoNodoSolidaridadUnderNodo.nuevoNodo);
        })
        .catch((error) => {
          this.creandoSubNodo = false;
          console.log(`Error: ${error}`);
        });
    },
  }
}

export var MixinVisualesNodosSolidaridad = {
  computed: {
    colorIcono() {

      if (this.esteNodo.estadoDesarrollo === "completado") {
        return "#2c710c"
      }
      if (this.usuarioResponsableAmplio) {
        return "var(--atlasMorado)";
      }
      if (this.usuarioAdministrador) {
        return "var(--atlasParent)";
      }
      return "black";

    },
  }

}


//Logica para un nodo desplegadado gráficamente en la red del atlas
export var MixinNodoAtlas = {
  props: {
    seleccionadoEsResponsable: Boolean,
    esteNodo: Object,
    todosNodos: Array,
    idNodoSeleccionado: String,
    requeridoPorSeleccionado: Boolean,
    requiereAlSeleccionado: Boolean,
    nodoSeleccionado: Object,
    menuCx: Boolean,
    factorZoom: Number,
    callingPosiciones: Boolean,
    transparentoso: Boolean,
    usuarioAdministradorNodoSeleccionado: Boolean,
    usuarioResponsableNodoSeleccionado: Boolean,
    usuarioResponsableAmplioNodoSeleccionado: Boolean,
    childSeleccionado: Boolean,
    idsNodosDesplegados: Array,
    nodoParent: Object,
    idsNodosNeedingFetchMore: Array,
    transicionarPosicionNodos: Boolean,
  },
  data() {
    return {
      estiloNombreBase: {
        minWidth: 80,
        fontSize: 16,
        minHeight: 15,
        padding: 8,
        borderRadius: 5,
      },
      posicion: this.nodoParent
        ? { x: this.nodoParent.coords.x, y: this.nodoParent.coords.y }
        : { x: 0, y: 0 },
      widthBase: 150,
      heightBase: 100,
      size: {
        x: 30,
        y: 30,
      },
      primeraUbicacionCompletada: false,
    }

  },
  methods: {
    toggleDesplegar() {
      const store = this.$apollo.provider.defaultClient;
      const cache = store.readQuery({
        query: QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD,
      });
      const nuevoCache = JSON.parse(JSON.stringify(cache));
      const indexN = nuevoCache.yo.atlasSolidaridad.idsNodosDesplegados.indexOf(
        this.esteNodo.id
      );
      if (indexN > -1 != !this.desplegado) {
        if (indexN === -1) {
          nuevoCache.yo.atlasSolidaridad.idsNodosDesplegados.push(
            this.esteNodo.id
          );
        } else {
          nuevoCache.yo.atlasSolidaridad.idsNodosDesplegados.splice(indexN, 1);
        }
        store.writeQuery({
          query: QUERY_DATOS_USUARIO_ATLAS_SOLIDARIDAD,
          data: nuevoCache,
        });
      } else {
        console.log(`Confusión`);
      }
    },   
  },
  computed: {
    waitingFetchChildren() {
      return this.idsNodosNeedingFetchMore.includes(this.esteNodo.id);
    },
    sizeEfectivo() {
      // const factorAmpliacion = 1.2;
      // if (this.seleccionado) {
      //   return {
      //     x: Math.round(this.size.x * factorAmpliacion),
      //     y: Math.round(this.size.y * factorAmpliacion),
      //   };
      // }
      return this.size;
    },
    estiloPosicion() {
      if (this.montado) {
        return {
          left:
            (this.posicion.x - this.sizeEfectivo.x / 2) * this.factorZoom +
            "px",
          top:
            (this.posicion.y - this.sizeEfectivo.y / 2) * this.factorZoom +
            "px",
        };
      }
      return {
        top: "0px",
        left: "0px",
      };
    },
    estiloZeta() {
      let valorZ = 0;
      if (this.arrastrandoNodo > this.umbralArrastreNodo || this.seleccionado) {
        valorZ = 100;
      }
      if (this.menuCx) {
        valorZ = 200;
      }
      return {
        zIndex: valorZ,
      };
    },
    estiloSize() {
      return {
        width: Math.round(this.sizeEfectivo.x * this.factorZoom) + "px",
        height: Math.round(this.sizeEfectivo.y * this.factorZoom) + "px",
        fontSize: Math.round(14 * this.factorZoom) + "px",
      };
    },
    // estiloOpacidad() {
    //   return {
    //     opacity:
    //       transparentoso
    //         ? "0.2"
    //         : "1",
    //   };
    // },
    seleccionado() {
      return (
        this.idNodoSeleccionado && this.idNodoSeleccionado == this.esteNodo.id
      );
    },
    estiloCartelNombre() {
      return {
        minWidth:
          parseInt(this.estiloNombreBase.minWidth * this.factorZoom) + "px",
        fontSize:
          parseInt(this.estiloNombreBase.fontSize * this.factorZoom) + "px",
        minHeight:
          parseInt(this.estiloNombreBase.minHeight * this.factorZoom) + "px",
        padding:
          parseInt(this.estiloNombreBase.padding * this.factorZoom) + "px",
        borderRadius:
          parseInt(this.estiloNombreBase.borderRadius * this.factorZoom) + "px",
        // maxHeight: this.seleccionado ? "" : "90%",
      };
    },
    colorCartelNombre() {
      var color = "var(--atlasGris)";
      var borde = "1px solid black"
      if (this.usuarioResponsableAmplio) {
        borde = "1px solid var(--atlasMorado)"
      }
      if (this.esteNodo.estadoDesarrollo === "completado") {
        color = "rgb(91 146 66)";
        borde = "1px solid var(--atlasVerde)";
      }

      return {
        backgroundColor: color,
        border: borde
      };
    },
    parentDeSeleccionado() {
      if (!this.nodoSeleccionado) return false;
      if (this.nodoSeleccionado.nodoParent === this.esteNodo.id) return true;
      return false;
    },
    estiloBolita() {
      var elColor = "rgba(105, 199, 199, 0.9)";

      if (this.seleccionado) {
        elColor = "var(--atlasNaranja)";
      } else if (this.parentDeSeleccionado) {
        elColor = "var(--atlasParent)";
      }

      var borde = "";

      if (this.usuarioResponsable) {
        borde =
          Math.round(3 * this.factorZoom) + "px dotted var(--atlasMorado)";
      }
      if (this.childSeleccionado) {
        borde =
          Math.round(3 * this.factorZoom) + "px solid var(--atlasNaranja)";
      }

      return {
        backgroundColor: elColor,
        border: borde,
      };
    },
    desplegado() {
      return this.idsNodosDesplegados.includes(this.esteNodo.id);
    },
    estiloTransicion() {
      const transicion = '';
      // var transicion='left 0.4s, top 0.4s'
      // if(this.primeraUbicacionCompletada){
      //   transicion='left 5s, right 5s'
      // }


      return {
        transition: transicion
      }

    },
    enVentanita() {
      return this.idNodoPaVentanita && this.idNodoPaVentanita === this.esteNodo.id
    }
  },
  watch: {
    esteNodo() {
      this.$set(this.posicion, "x", this.esteNodo.coords.x);
      this.$set(this.posicion, "y", this.esteNodo.coords.y);
    },
  },
  mounted() {
    if (this.esteNodo.nombre === 'Responder preguntas fundamentales') {
      console.log(`Recien montado, está en ${JSON.stringify(this.posicion)}`);
    }
    this.montado = true;


    this.$nextTick(() => {

      this.$set(this.posicion, "x", this.esteNodo.coords.x);
      this.$set(this.posicion, "y", this.esteNodo.coords.y);
      if (this.esteNodo.nombre === 'Responder preguntas fundamentales') {
        console.log(`Ahora está en ${JSON.stringify(this.posicion)}`);
      }

      setTimeout(() => {
        this.primeraUbicacionCompletada = true;
      }, 500)
    });


  },

}