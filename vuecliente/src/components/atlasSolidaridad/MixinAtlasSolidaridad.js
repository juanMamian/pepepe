import gql from "graphql-tag"
import debounce from "debounce";
import { fragmentoNodoSolidaridad, fragmentoPersonaAtlas } from "./frags";


export const QUERY_NODOS_SOLIDARIDAD = gql`
    query{
      nodosSolidaridad{
        ...fragNodoSolidaridad
      }
    }
    ${fragmentoNodoSolidaridad}
    `

export const QUERY_PERSONAS = gql`
    query{
      personas{
        ...fragPersonaAtlas
      }
    }
    ${fragmentoPersonaAtlas}
`

export const MixinAtlasSolidaridad = {
  apollo: {
    nodoRoot: {
      query: gql`
        query($idNodo: ID!, $tipoNodo: String!){
          nodoAtlasSolidaridadByIdAndTipo(idNodo:$idNodo, tipoNodo: $tipoNodo){
            nodoSolidaridad{
              ...fragNodoSolidaridad
            }
            persona{
              ...fragPersonaAtlas
            }
          }
        }
        ${fragmentoNodoSolidaridad}
        ${fragmentoPersonaAtlas}
      `,
      variables() {
        return {
          idNodo: this.idNodoRoot,
          tipoNodo: this.tipoNodoRoot
        }
      },
      skip() {
        return !this.idNodoRoot;
      },
      update({ nodoAtlasSolidaridadByIdAndTipo }) {
        var nodosSolidaridad = nodoAtlasSolidaridadByIdAndTipo.nodoSolidaridad ? [nodoAtlasSolidaridadByIdAndTipo.nodoSolidaridad] : []
        var personas = nodoAtlasSolidaridadByIdAndTipo.persona ? [nodoAtlasSolidaridadByIdAndTipo.persona] : []

        if (!this.cacheNodosInicializado) {
          console.log(`Al descargar nodo root se subiran al cache de apollo ${nodosSolidaridad.length} nodos solidaridad y ${personas.length} personas`);
          const store = this.$apollo.provider.defaultClient;
          store.writeQuery({
            query: QUERY_NODOS_SOLIDARIDAD,
            data: { nodosSolidaridad }
          });
          store.writeQuery({
            query: QUERY_PERSONAS,
            data: { personas }
          });
          this.cacheNodosInicializado = true;
        }

        if (nodoAtlasSolidaridadByIdAndTipo.nodoSolidaridad) {
          return nodoAtlasSolidaridadByIdAndTipo.nodoSolidaridad
        }
        else if (nodoAtlasSolidaridadByIdAndTipo.persona) {
          return nodoAtlasSolidaridadByIdAndTipo.persona
        }
        else {
          console.log(`Fallo al obtener nodoRoot`);
          return null;
        }
      }
    },
    nodosSolidaridad: {
      query: QUERY_NODOS_SOLIDARIDAD,
      fetchPolicy: "cache-only",
      skip() {
        return !this.nodoRoot
      }
    },
    personas: {
      query: QUERY_PERSONAS,
      fetchPolicy: "cache-only",
      skip() {
        return !this.nodoRoot
      }
    },
    $subscribe: {
      nodoEditado: {
        query: gql`
          subscription ($centro: CoordsInput!, $radio: Int!) {
            nodoEditado(centro: $centro, radio: $radio) {
              ...fragNodoSolidaridad
            }
          }
          ${fragmentoNodoSolidaridad}
        `,
        variables() {
          return {
            centro: {
              x: 0,
              y: 0,
            },
            radio: 0,
          };
        },
        result : function({ data: { nodoEditado } }){    
          console.log(`nodo ${nodoEditado.nombre} editado`);      
        },
      },
      nodoEliminado: {
        query: gql`
          subscription ($centro: CoordsInput!, $radio: Int!) {
            nodoEliminado(centro: $centro, radio: $radio)
          }
        `,
        variables() {
          return {
            centro: {
              x: 0,
              y: 0,
            },
            radio: 0,
          };
        },
        result({ data: { nodoEliminado } }) {
          console.log(`Eliminando de cache a ${nodoEliminado}`);
          this.eliminarNodoCache(nodoEliminado);
        },
      },
      nodosEliminados: {
        query: gql`
          subscription {
            nodosEliminados
          }
        `,
        result({ data: { nodosEliminados } }) {
          console.log(`Eliminando de cache a ${nodosEliminados}`);
          nodosEliminados.forEach((ne) => {
            this.removeNodoFromNodosSolidaridad(ne);
          });
        },
      },
      
    },
  },
  data() {
    return {
      datosYoDescargados: false,
      nodosSolidaridad: [],
      personas: [],
      idsNodosEverPassedToFetchMore: [],
      infoNodosEverRendered: [],
      cacheNodosInicializado:false,
    }
  },
  methods: {
    addNodoToNodosSolidaridad(nuevoNodo){
      console.log(`Adding nuevo nodo a nodosSolidaridad`);
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query: QUERY_NODOS_SOLIDARIDAD,        
      })

      var nuevoCache=JSON.parse(JSON.stringify(cache));
      
      const indexN=nuevoCache.nodosSolidaridad.findIndex(n=>n.id===nuevoNodo.id);
      if(indexN===-1){
        nuevoCache.nodosSolidaridad.push(nuevoNodo);
        store.writeQuery({
          query: QUERY_NODOS_SOLIDARIDAD,
          data: nuevoCache,
        })
      }
      this.idNodoSeleccionado=nuevoNodo.id
    },
    removeNodoFromNodosSolidaridad(id){
      if(this.idNodoSeleccionado===id){
        this.idNodoSeleccionado=null;
      }
      const store=this.$apollo.provider.defaultClient;
      const cache=store.readQuery({
        query: QUERY_NODOS_SOLIDARIDAD,        
      })

      var nuevoCache=JSON.parse(JSON.stringify(cache));
      
      const indexN=nuevoCache.nodosSolidaridad.findIndex(n=>n.id===id);
      if(indexN>-1){
        nuevoCache.nodosSolidaridad.splice(indexN, 1);
        store.writeQuery({
          query: QUERY_NODOS_SOLIDARIDAD,
          data: nuevoCache,
        })
      }
    },
    fetchRelacionesNodosNeedingFetchMore: debounce(function () {
      console.log(
        `Fetching nodos relacionados de ${this.infoNodosNeedingFetchMore.length} nodos ahead of despliegue`
      );

      this.$apollo
        .query({
          query: gql`
            query($infoNodos: [InfoNodoDeAtlasSolidaridad!]!) {
              relacionesNodosAtlasByIds(infoNodos: $infoNodos) {
                  nodosSolidaridad {
                    ...fragNodoSolidaridad
                }
                  personas {
                    ...fragPersonaAtlas
                }
              }
            }
            ${fragmentoNodoSolidaridad}
            ${fragmentoPersonaAtlas}
            `,
          variables: {
            infoNodos: this.infoNodosNeedingFetchMore,
          },
        })
        .then(({ data: { relacionesNodosAtlasByIds } }) => {
          this.idsNodosEverPassedToFetchMore = arrayUnique(
            this.idsNodosEverPassedToFetchMore.concat(
              this.idsNodosNeedingFetchMore
            )
          );
          //Add to cache de nodosSolidaridad
          const idsActualesNodosSolidaridad = this.nodosSolidaridad.map(ns => ns.id);

          const store = this.$apollo.provider.defaultClient;
          const cacheNS = store.readQuery({
            query: QUERY_NODOS_SOLIDARIDAD
          });
          var nuevoCacheNS = JSON.parse(JSON.stringify(cacheNS));
          if (!nuevoCacheNS.nodosSolidaridad) nuevoCacheNS.nodosSolidaridad = [];
          nuevoCacheNS.nodosSolidaridad.push(...relacionesNodosAtlasByIds.nodosSolidaridad.filter(ns => !idsActualesNodosSolidaridad.includes(ns.id)))

          store.writeQuery({
            query: QUERY_NODOS_SOLIDARIDAD,
            data: nuevoCacheNS
          });

          //Add to cache de personas
          const idsActualesPersonas = this.personas.map(p => p.id);

          const cacheP = store.readQuery({
            query: QUERY_PERSONAS
          });
          var nuevoCacheP = JSON.parse(JSON.stringify(cacheP));
          if (!nuevoCacheNS.personas) nuevoCacheNS.nodosSolidaridad = [];
          nuevoCacheP.personas.push(...relacionesNodosAtlasByIds.personas.filter(p => !idsActualesPersonas.includes(p.id)))

          store.writeQuery({
            query: QUERY_PERSONAS,
            data: nuevoCacheP
          });
        });
    }, 2000),
  },
  computed: {
    indiceNodosUnder() {
      if (this.nodosSolidaridad.length + this.personas.length < 1) return null;
      var objetoFinal = {};

      this.todosNodos.forEach((nodo) => {
        let idsVinculos = nodo.vinculos
          .filter((v) => v.tipo === "requiere")
          .map((v) => v.idRef);
        let requeridos = this.nodosSolidaridad
          .filter((n) => idsVinculos.includes(n.id))
          .sort(
            (a, b) => idsVinculos.indexOf(a.id) - idsVinculos.indexOf(b.id)
          );
        let children = requeridos.filter((n) => n.nodoParent === nodo.id);
        let responsables = this.personas.filter((p) =>
          nodo.responsables.includes(p.id)
        );
        objetoFinal[nodo.id] = {
          nodosChildren: children,
          nodosRequeridos: requeridos,
          responsables,
        };
      });

      return objetoFinal;
    },
    infoNodosNeedingFetchMore() {
      return this.infoNodosEverRendered.filter(
        (i) => !this.idsNodosEverPassedToFetchMore.includes(i.id)
      );
    },
    todosNodos() {
      return this.nodosSolidaridad.concat(this.personas);
    },
    idsNodosNeedingFetchMore() {
      return this.infoNodosNeedingFetchMore.map((info) => info.id);
    },
  },
  watch: {
    idsNodosNeedingFetchMore(nuevo) {
      if (nuevo.length > 0) {
        this.fetchRelacionesNodosNeedingFetchMore();
      }
    },
  }
}

const arrayUnique = function (array) {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
}