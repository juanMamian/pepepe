<template>
  <div class="perfilPersonal">
    <div id="categorias">
      <div class="categorias" @click="seccion = categorias">
        Datos personales
      </div>
      <div class="categorias" @click="seccion = contacto">
        Información de contacto
      </div>
      <div class="categorias" @click="seccion = conocimientos">
        Conocimientos
      </div>
    </div>
    <div id="contenidos">
      <div class="contenidos editables" id="datosPersonales">
        <div
          class="botonEditar hoverGris"
          @click="
            editandoDatosPersonales = editandoDatosPersonales ? false : true
          "
        >
          {{ editandoDatosPersonales ? "Volver" : "Editar" }}
        </div>
        <div id="fotografia" @click.self="seleccionarFoto">
          <img id="laFotografia" :src="serverUrl+'/api/usuarios/fotografias/'+yo.id" alt="">
          <input
            type="file"
            id="inputNuevaFoto"
            ref="inputNuevaFoto"
            @change="subirNuevaFoto"
          />
        </div>
        <div id="textosDatosPersonales">
          <template v-if="!editandoDatosPersonales">
            <div class="nombreApellido" id="miNombre">{{ yo.nombres }}</div>
            <div class="nombreApellido" id="miApellido">{{ yo.apellidos }}</div>
            <br />
            <div id="miEdad">{{ yo.edad }} años</div>
          </template>
          <template v-else>
            <input
              v-model="edicionDatosPersonales.nombres"
              type="text"
              name="nombres"
              placeholder="Nombres"
            /><br />
            <input
              v-model="edicionDatosPersonales.apellidos"
              type="text"
              name="apellidos"
              placeholder="Apellidos"
            /><br /><br />
            <label for="fechaNacimiento">Fecha de nacimiento</label><br />
            <input
              v-model="edicionDatosPersonales.fechaNacimiento"
              type="date"
              name="fechaNacimiento"
            /><br />
            <button @click="enviarDatosPersonales">Enviar</button>
          </template>
        </div>
      </div>

      <div class="contenidos editables" id="informacionContacto">
        <div
          class="botonEditar hoverGris"
          @click="editandoDatosContacto = editandoDatosContacto ? false : true"
        >
          {{ editandoDatosContacto ? "Volver" : "Editar" }}
        </div>
        <template v-if="!editandoDatosContacto">
          <div id="miResidencia">Residencia: {{ yo.lugarResidencia }}</div>
          <div id="miEmail">Correo electrónico: {{ yo.email }}</div>
          <div id="miTelefono">Mi número telefónico: {{ yo.numeroTel }}</div>
        </template>
        <template v-else>
          <input
            v-model="edicionDatosContacto.lugarResidencia"
            type="text"
            placeholder="Residencia"
          /><br />
          <input
            v-model="edicionDatosContacto.email"
            type="email"
            placeholder="Correo electronico"
          /><br />
          <input
            v-model="edicionDatosContacto.numeroTel"
            type="text"
            placeholder="Número telefónico"
          /><br />
          <button @click="enviarDatosContacto">Enviar</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { validarDatosUsuario } from "./utilidades/validacionDatosUsuario";
import axios from "axios"

const fragmentoDatosPersonales = gql`
  fragment DatosPersonales on Usuario {
    nombres
    apellidos
    fechaNacimiento
    edad
  }
`;

const fragmentoDatosContacto = gql`
  fragment DatosContacto on Usuario {
    lugarResidencia
    email
    numeroTel
  }
`;

export default {
  name: "PerfilPersonal",
  apollo: {
    yo: {
      query: gql`
        query {
          yo {
            id
            nombres
            apellidos
            fechaNacimiento
            edad
            lugarResidencia
            numeroTel
            email
            username
            nodosConocimiento {
              nodoConocimiento {
                id
                nombre
              }
            }
          }
        }
      `,
      fetchPolicy: "network-only",
    },
  },
  data() {
    return {
      yo: {
        id: null,
        nombres: null,
        apellidos: null,
        fechaNacimiento: null,
        email: null,
        edad: null,
        fotografia: null,
        lugarResidencia: null,
        username: null,
        misNodos: [],
      },
      editandoDatosPersonales: false,
      editandoDatosContacto: false,
    };
  },
  computed: {
    edicionDatosPersonales: function () {
      return {
        nombres: this.yo.nombres,
        apellidos: this.yo.apellidos,
        fechaNacimiento: this.yo.fechaNacimiento.substr(0, 10),
      };
    },
    edicionDatosContacto: function () {
      return {
        lugarResidencia: this.yo.lugarResidencia,
        email: this.yo.email,
        numeroTel: this.yo.numeroTel,
      };
    },
  },
  methods: {
    subirNuevaFoto() {
      let inputFoto = this.$refs.inputNuevaFoto;
      var datos = new FormData();
      const nuevaFoto = inputFoto.files[0];
      const fileType = nuevaFoto["type"];
      const validImageTypes = ["image/jpeg", "image/png"];
      if (!validImageTypes.includes(fileType)) {
        console.log(`Archivo ilegal`);
        return;
      }
      datos.append("nuevaFoto", nuevaFoto);
      //console.log(`enviando nuevo icono con datos: : `);
      axios({
        method:'post',
        url: this.serverUrl+ "/api/usuarios/updateFoto",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": "Bearer "+this.$store.state.token
        },
        success: function (resp) {
          console.log(`respuesta: ${JSON.stringify(resp)}`);
          //resp=JSON.parse(resp);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          console.log(
            "errores: " + xhr + "**" + ajaxOptions + "**" + thrownError
          );
        },
      });
    },
    enviarDatosPersonales() {
      let dis = this;
      console.log(`Enviando nuevos datos personales`);
      let errores = validarDatosUsuario(this.edicionDatosPersonales);
      if (errores.length < 1) {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation($nuevosDatos: DatosEditablesUsuario) {
                editarDatosUsuario(nuevosDatos: $nuevosDatos) {
                  id
                  ...DatosPersonales
                }
              }
              ${fragmentoDatosPersonales}
            `,
            variables: {
              nuevosDatos: this.edicionDatosPersonales,
            },
          })
          .then(() => {
            console.log(`Datos correctamente editados`);
            dis.editandoDatosPersonales = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
          });
      } else {
        console.log(`Errores: ${errores}`);
      }
    },
    enviarDatosContacto() {
      let dis = this;
      console.log(
        `Enviando nuevos datos contacto: ${JSON.stringify(
          this.edicionDatosContacto
        )}`
      );
      let errores = validarDatosUsuario(this.edicionDatosContacto);
      if (errores.length < 1) {
        this.$apollo
          .mutate({
            mutation: gql`
              mutation($nuevosDatos: DatosEditablesUsuario) {
                editarDatosUsuario(nuevosDatos: $nuevosDatos) {
                  id
                  ...DatosContacto
                }
              }
              ${fragmentoDatosContacto}
            `,
            variables: {
              nuevosDatos: this.edicionDatosContacto,
            },
          })
          .then(() => {
            console.log(`Datos correctamente editados`);
            dis.editandoDatosContacto = false;
          })
          .catch((error) => {
            console.log(`Error: ${error}`);
          });
      } else {
        console.log(`Errores: ${errores}`);
      }
    },
    seleccionarFoto() {
      this.$refs.inputNuevaFoto.click();
    },
  },
};
</script>

<style scoped>
.perfilPersonal {
  display: grid;
  grid-template-columns: 250px 1fr;
}

#categorias {
  grid-column: 1/2;
  background-color: burlywood;
}
.categorias {
  font-size: 18px;
  padding: 10px 10px;
  cursor: pointer;
}
.categorias:hover {
  background-color: cornsilk;
}
#contenidos {
  grid-column: 2/3;
  background-color: cornsilk;
  padding-top: 20px;
  padding-left: 50px;
  padding-right: 50px;
}
.inputsTexto {
  font-size: 18px;
}

.contenidos {
  padding: 10px;
  border: 2px solid black;
  border-radius: 5px;
}

#datosPersonales {
  display: flex;
}

#fotografia {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: rgb(190, 190, 190);
  position: relative;
  margin-bottom: 15px;
  margin-right: 25px;
}

#laFotografia{
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
}

#textosDatosPersonales {
  padding: 15px 20px;
}

#miUsername {
  position: absolute;
  top: 105%;
  text-align: center;
  left: 50%;
  transform: translateX(-50%);
}

.nombreApellido {
  font-size: 18px;
}

.editables {
  position: relative;
}
.botonEditar {
  position: absolute;
  top: 0px;
  right: 0px;
  padding: 5px 10px;
  cursor: pointer;
}
#inputNuevaFoto {
  display: none;
  cursor: pointer;
}
</style>