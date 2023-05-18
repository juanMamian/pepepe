<template>
    <div class="bloqueSubscripcion" :class="{ deshabilitado: eliminandose }">
        <div class="barraSuperior">
            <div id="duracion">
                {{ esteBloque.duracion }}
            </div>
            <div id="valorPagado">
                {{ esteBloque.valorPagado }}
            </div>
            {{ toReadableDate(esteBloque.dateInicio) }} - {{ toReadableDate(dateFinal) }}
            <loading v-show="eliminandose" style="margin-left: auto" />
            <div class="boton" style="margin-left: auto; height: 20px" @click.stop="eliminarse" v-show="!eliminandose">
                <img src="@/assets/iconos/equis.svg" alt="X">
            </div>
        </div>
    </div>
</template>
<script>

const millisDia = 86400000;
import { fragmentoBloqueSubscripcion, QUERY_BLOQUES_SUBSCRIPCION } from "../frags/fragsSubscripciones.js"
import { gql } from "@apollo/client/core"
import Loading from "../utilidades/Loading.vue"


export default {

    name: "BloqueSubscripcion",
    components: { Loading },
    props: {
        esteBloque: Object,
        seleccionado: Boolean,
        idPersona: String,
    },
    data() {
        return {
            eliminandose: false,
        }
    },
    computed: {
        dateFinal() {
            return new Date(new Date(this.esteBloque.dateInicio).getTime() + this.esteBloque.duracion * millisDia * 30);
        }
    },
    methods: {
        eliminarse() {
            if (!this.usuarioSuperadministrador) {
                console.log("No autorizado");
                return;
            }
            if (!confirm("¿Confirmar la eliminación del bloque de subscripción? (Esta acción no puede deshacerse)")) {
                return
            }

            this.eliminandose = true;
            this.$apollo.mutate({
                mutation: gql`
                mutation($idUsuario: ID!, $idBloque: ID!){
                    eliminarBloqueSubscripcionUsuario(idUsuario: $idUsuario, idBloque: $idBloque)
                }
                `,
                variables: {
                    idUsuario: this.idPersona,
                    idBloque: this.esteBloque.id,
                },
            }).then(() => {
                console.log("Bloque eliminado");
                this.eliminandose = false;
                const store = this.$apollo.provider.defaultClient;
                const cache = store.readQuery({
                    query: QUERY_BLOQUES_SUBSCRIPCION,
                    variables: {
                        idUsuario: this.idPersona,
                    }
                });
                let nuevoCache = JSON.parse(JSON.stringify(cache));
                let bloques = nuevoCache.Usuario.bloquesSubscripcion;
                let indexB = bloques.findIndex(bl => bl.id === this.esteBloque.id);
                if (indexB > -1) {
                    bloques.splice(indexB, 1);
                    store.writeQuery({
                        query: QUERY_BLOQUES_SUBSCRIPCION,
                        variables: {
                            idUsuario: this.idPersona,
                        },
                        data: nuevoCache,
                    })
                }
                else {
                    console.log("El bloque no estaba en caché");
                }
            }).catch((error) => {
                console.log("Error: " + error);
                this.eliminandose = false;
            })


        },

    },


}
</script>

<style scoped>
.bloqueSubscripcion {
    display: flex;
    padding: 10px 10px;
    margin: 0px 0px;
    box-shadow: 2px 2px 2px 2px gray;
    color: black;
}

.barraSuperior {
    width: 100%;
    display: flex;
    gap: 10px;
    align-items:center;
}

#duracion {
    border-radius: 50%;
    height: 40px;
    width: 40px;
    background-color: var(--mainColor);
    display: flex;
    justify-content:center;
    align-items: center;
    color: black;
}
</style>
