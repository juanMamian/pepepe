<template>
    <div class="landing">
        <div id="bloquePortada">
            <div id="contenedorImagen">
                <img src="@/assets/landing/caracol.png" alt="Caracol" />
            </div>
            <div id="contenedorCabecera">
                <div id="titulo">La estrategia del caracol</div>
                <div id="subtitulo">Plataforma de aprendizaje.</div>
            </div>
        </div>

        <router-view @logearse="$emit('logearse', $event)"> </router-view>
        <div id="bloqueInfoUsuario" v-if="usuarioLogeado">
            <div id="bloquePersonal">
                <div id="contenedorFotoUsuario">
                    <img :src="serverUrl +
                        '/api/usuarios/fotografias/' +
                        usuario.id +
                        '?v=' +
                        versionFoto
                        " alt="Fotografía" />
                </div>

                <div id="nombreUsuario">{{ yo.nombres + " " + yo.apellidos }}</div>
            </div>
            <div id="contenedorPerksUsuario">
                <router-link :to="nodoTarget.id
                        ? {
                            name: 'visorNodoConocimiento',
                            params: { tipoBrowse: 'mapa', idBrowsed: 'idNodo', idNodo: nodoTarget.id },
                        }
                        : ''
                    " id="perkNodoTarget" class="perkStatus">
                    <div class="contenedorImagenPerk">
                        <img class="perkImage" src="@/assets/iconos/crosshairsSolid.svg" alt="Mira" :style="[
                                { filter: nodoTarget.id ? 'var(--filtroAtlasSeleccion)' : '' },
                            ]" />
                    </div>
                    <div class="perkTexto">
                        {{
                            idNodoTarget
                            ? nodoTarget.nombre || ""
                            : "¡Aún no tienes un nodo en la mira!"
                        }}
                    </div>
                </router-link>
                <router-link :to="nodoOlvidado?.id
                            ? {
                                name: 'visorNodoConocimiento',
                                params: { tipoBrowse: 'mapa', idBrowsed: nodoOlvidado.id, idNodo: nodoOlvidado.id },
                            }
                            : ''
                        " id="perkNodoOlvidado" v-if="idNodoOlvidado && nodoOlvidado.tipoNodo" class="perkStatus">
                    <div class="bolitaPerkNodo contenedorImagenPerk"
                        style="background-color: var(--atlasConocimientoRepasar)">
                        <img v-if="nodoOlvidado.tipoNodo === 'concepto'" class="perkImage"
                            src="@/assets/iconos/atlas/lightbulbEmpty.svg" alt="Skill" />
                        <img v-else src="@/assets/iconos/atlas/fireSolid.svg" alt="Skill" class="perkImage" />
                    </div>
                    <div class="perkTexto">
                        {{ nodoOlvidado.nombre }}
                    </div>
                </router-link>
                <router-link v-if="coleccionMostrada" :to="coleccionMostrada?.id
                        ? {
                            name: 'atlas',
                            params: { tipoBrowse: 'browseColeccion', idBrowsed: coleccionMostrada.id },
                        }
                        : ''
                    " id="perkColeccion" class="perkStatus">
                    <pie-progreso :mostrarNumero="false" :progreso="coleccionMostrada ? coleccionMostrada.progreso : 0"
                        :size="widthScreen < 900 ? 50 : 75">
                        <img src="@/assets/iconos/userNodes.png" alt="Coleccion" class="perkImage" />
                    </pie-progreso>
                    <div class="perkTexto">
                        {{
                            $apollo.queries.yo.loading
                            ? ""
                            : coleccionMostrada.nombre ||
                            "¡Aún no has creado tu primera colección!"
                        }}
                    </div>
                </router-link>
            </div>
        </div>
        <router-link :to="{ name: 'atlas', params: { tipoBrowse: 'mapa', idBrowsed: '123' } }" id="bigBotonAtlas"
            class="bigBoton">
            <div class="ladoTexto">
                <div class="tituloBigBoton">Atlas de conocimiento</div>
                <div class="subtituloBigBoton">
                    Explora un universo de conocimientos y habilidades.
                </div>
            </div>
            <div class="ladoImagen">
                <img src="@/assets/landing/bigBotonAtlas.png" alt="Atlas" />
            </div>
        </router-link>
    </div>
</template>
<script>
import { gql } from "@apollo/client/core";
import PieProgreso from "../components/utilidades/PieProgreso.vue";
export default {
    name: "Landing",
    components: {
        PieProgreso,
    },
    apollo: {
        yo: {
            query: gql`
        query {
          yo {
            nombres
            apellidos
            atlas {
              id
              idNodoTarget
              colecciones {
                id
                nombre
              }
              datosNodos {
                id
                idNodo
                estadoAprendizaje
              }
            }
          }
        }
      `,
            fetchPolicy: "cache-first",
            skip() {
                return !this.usuario?.id;
            },
        },
        coleccionMostrada: {
            query: gql`
        query ($idColeccion: ID!, $idUsuario: ID!) {
          coleccionNodosConocimiento(
            idColeccion: $idColeccion
            idUsuario: $idUsuario
          ) {
            id
            nombre
            progreso
          }
        }
      `,
            variables() {
                return {
                    idColeccion: this.idColeccionMostrada,
                    idUsuario: this.usuario?.id,
                };
            },
            update({ coleccionNodosConocimiento }) {
                return coleccionNodosConocimiento;
            },
            skip() {
                return !this.usuario?.id || !this.idColeccionMostrada;
            },
        },
        nodoTarget: {
            query: gql`
        query ($idNodo: ID!) {
          nodo(idNodo: $idNodo) {
            id
            nombre
          }
        }
      `,
            variables() {
                return {
                    idNodo: this.idNodoTarget,
                };
            },
            update({ nodo }) {
                return nodo;
            },
            skip() {
                return !this.idNodoTarget;
            },
        },
        nodoOlvidado: {
            query: gql`
        query ($idNodo: ID!) {
          nodo(idNodo: $idNodo) {
            id
            nombre
            tipoNodo
          }
        }
      `,
            variables() {
                return {
                    idNodo: this.idNodoOlvidado,
                };
            },
            update({ nodo }) {
                return nodo;
            },
            skip() {
                return !this.idNodoOlvidado;
            },
        },
    },
    data() {
        return {
            coleccionMostrada: {
                idsNodos: [],
                idsRed: [],
            },
            yo: {
                atlas: {
                    colecciones: [],
                    datosNodos: [],
                },
            },
            nodoTarget: {},
            nodoOlvidado: {},
            versionFoto: 0,
        };
    },
    computed: {
        idColeccionMostrada() {
            let colecciones = this.yo.atlas.colecciones;
            let cant = colecciones.length;
            if (cant < 1) {
                return;
            }
            return colecciones[Math.floor(Math.random() * cant)].id;
        },
        idNodoTarget() {
            return this.yo.atlas.idNodoTarget;
        },
        idNodoOlvidado() {
            let datoNodoOlvidado = this.yo.atlas.datosNodos.find(
                (dn) => dn.estadoAprendizaje === "OLVIDADO"
            );
            return datoNodoOlvidado?.idNodo;
        },
    },
};
</script>
<style scoped>
.landing {
    display: flex;
    flex-direction: column;
    padding: 6vh 8vw;
    align-items: center;
}

#bloquePortada {
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
}

#contenedorImagen {
    width: 46vw;
    flex-shrink: 0;
}

#contenedorImagen img {
    width: 100%;
}

#contenedorCabecera {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

#titulo {
    font-size: 1.3em;
}

#subtitulo {
    font-size: 0.6em;
    font-style: normal;
}

#bloqueInfoUsuario {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 90px auto;
    gap: 8vw;
}

#bloquePersonal {
    width: 50%;
}

#contenedorFotoUsuario {
    width: 50%;
    margin: 0px auto;
    overflow: hidden;
    border-radius: 50%;
}

#contenedorFotoUsuario img {
    width: 100%;
}

#bloqueDatosUsuario {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

#nombreUsuario {
    text-align: center;
    font-size: 0.7em;
}

#contenedorPerksUsuario {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
}

#contenedorPerksUsuario {
    display: flex;
    gap: 30px;
}

.perkStatus {
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.perkStatus img {
    height: 30px;
}

.perkTexto {
    font-size: 0.6em;
    text-align: center;
    max-height: 4em;
    overflow-y: hidden;
}

.contenedorImagenPerk {
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 25%;
    border-radius: 50%;
    height: 30px;
    width: 30px;
    overflow: hidden;
}

.bolitaPerkNodo {}

.bolitaPerkNodo .img {
    height: 100%;
}

.bigBoton {
    display: flex;
    gap: 30px;
    align-items: center;
    background: linear-gradient(173.19deg,
            rgba(255, 216, 216, 0.49) 35.75%,
            rgba(255, 255, 255, 0) 106.41%);
    padding: 10px 40px;
    width: min(400px, 90vw);
    border-radius: 15px;
}

.ladoTexto {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    gap: 20px;
    flex-grow: 3;
}

.subtituloBigBoton {
    font-size: 0.5em;
}

.ladoImagen {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 2;
    width: 40%;
}

.ladoImagen img {
    width: 100%;
}

@media screen and (min-width: 900px) {
    .landing {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15vw;
    }

    #bloquePortada {
        flex-direction: column-reverse;
        align-items: center;
        width: 27vw;
        flex-shrink: 0;
        flex-grow: 0;
    }

    #contenedorImagen {
        width: 30vw;
        flex-grow: 0;
    }

    #titulo {
        font-size: 5em;
    }

    #subtitulo {
        font-size: 1em;
    }

    #contenedorFotoUsuario {
        width: 100%;
    }

    #nombreUsuario {
        font-size: 1em;
        margin-top: 20px;
    }

    .perkStatus {
        width: 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .perkStatus img {
        height: 45px;
    }

    .perkTexto {
        font-size: 0.7em;
        text-align: center;
        max-height: 6em;
        overflow-y: hidden;
    }

    .bigBoton {
        width: min(500px, 90vw);
    }

    .tituloBigBoton {
        font-size: 1.4em;
    }

    .subtituloBigBoton {
        font-size: 0.7em;
    }
}
</style>
