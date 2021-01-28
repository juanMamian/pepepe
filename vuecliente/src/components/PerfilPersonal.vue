<template>
  <div class="perfilPersonal">
    <div id="categorias">
      <div class="categorias" @click="seccion = 'categorias'">
        Datos personales
      </div>
      <div class="categorias" @click="seccion = 'contacto'">
        Información de contacto
      </div>
      <div class="categorias" @click="seccion = 'conocimientos'">
        Conocimientos
      </div>
    </div>
    <div id="contenidos">
      <div class="contenidos editables" id="datosPersonales">
        <img
          src="@/assets/iconos/editar.png"
          class="botonEditar hoverGris"
          @click="editandoDatosPersonales = !editandoDatosPersonales"
        />
        <div id="fotografia">
          <loading
            v-show="subiendoNuevaFotoPersonal"
            :texto="'Enviando fotografía...'"
          />
          <img
            id="laFotografia"
            title="Cambiar fotografia"
            :src="
              serverUrl +
              '/api/usuarios/fotografias/' +
              yo.id +
              '?' +
              refreshImg
            "
            :class="{ deshabilitada: subiendoNuevaFotoPersonal }"
            alt=""
            @click="seleccionarFoto"
          />
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
              disabled
              v-model="edicionDatosPersonales.nombres"
              type="text"
              name="nombres"
              placeholder="Nombres"
            /><br />
            <input
              v-model="edicionDatosPersonales.apellidos"
              disabled
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
        <img
          src="@/assets/iconos/editar.png"
          class="botonEditar"
          @click="editandoDatosContacto = !editandoDatosContacto"
        />

        <template v-if="!editandoDatosContacto">
          <div id="miResidencia" class="infoContacto">Residencia: {{ yo.lugarResidencia }}</div>
          <div id="miEmail" class="infoContacto">Correo electrónico: {{ yo.email }}</div>
          <div id="miTelefono" class="infoContacto">Mi número telefónico: {{ yo.numeroTel }}</div>
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

      <div
        v-if="usuarioLogeado"
        class="contenidos editables"
        id="informacionPassword"
      >
        <div class="zonaBotonEditar">
          Cambiar contraseña
          <img
            src="@/assets/iconos/editar.png"
            alt="Editar"
            id="bEditarPassword"
            class="botonEditar"
            :title="editandoDatosPassword ? 'Volver' : 'Cambiar contraseña'"
            @click="
              editandoDatosPassword = !editandoDatosPassword;
              resetearCamposPassword;
            "
          />
        </div>

        <template v-if="!editandoDatosPassword"> </template>
        <form id="zonaInputsNuevoPassword" v-else>
          <label for="viejoPassword">Escribe tu contraseña actual: </label>
          <input
            v-model="edicionDatosPassword.viejoPassword"
            name="viejoPassword"
            type="password"
            placeholder="Contraseña actual"
            class="inputsNuevoPassword"
          />
          <label for="nuevoPassword">Escribe tu nueva contraseña: </label>
          <input
            name="nuevoPassword"
            v-model="edicionDatosPassword.nuevoPassword"
            type="password"
            placeholder="Nueva contraseña"
            class="inputsNuevoPassword"
            @input="compararNuevoPassConfirmacion"
          />
          <label for="nuevoPasswordConfirmacion"
            >Confirma tu nueva contraseña:
          </label>
          <input
            name="nuevoPasswordConfirmacion"
            v-model="edicionDatosPassword.nuevoPasswordConfirmacion"
            type="password"
            placeholder="Nueva contraseña"
            class="inputsNuevoPassword"
            :class="{ enRojo: !nuevoPasswordConfirmado }"
            @input="compararNuevoPassConfirmacion"
          />
          <button
            :disabled="!nuevoPasswordConfirmado"
            @click.prevent="enviarDatosPassword"
          >
            Enviar
          </button>
          <div id="resultadoEdicionPassword" v-show="resultadoEdicionPassword">
            {{ this.resultadoEdicionPassword }}
          </div>
        </form>
        <loading v-show="enviandoDatosPassword" texto="Enviando..." />
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { validarDatosUsuario } from "./utilidades/validacionDatosUsuario";
import axios from "axios";
import Loading from "./utilidades/Loading.vue";

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
  components: { Loading },
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
      skip(){
        return !this.usuarioLogeado;
      }
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
        grupoEstudiantil: "",
      },
      edicionDatosPassword: {
        viejoPassword: "",
        nuevoPassword: "",
        nuevoPasswordConfirmacion: "",
      },
      subiendoNuevaFotoPersonal: false,
      editandoDatosPersonales: false,
      editandoDatosContacto: false,
      editandoDatosPassword: false,
      nuevoPasswordConfirmado: false,
      enviandoDatosPassword: false,
      resultadoEdicionPassword: null,
      refreshImg: 0,
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
      let dis = this;
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
      dis.subiendoNuevaFotoPersonal = true;
      axios({
        method: "post",
        url: this.serverUrl + "/api/usuarios/updateFoto",
        data: datos,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data }) => {
          dis.subiendoNuevaFotoPersonal = false;
          console.log(`respuesta: ${JSON.stringify(data)}`);
          if (data.resultado == "ok") {
            dis.refreshImg++;
          }
          //resp=JSON.parse(resp);
        })
        .catch((error) => {
          dis.subiendoNuevaFotoPersonal = false;
          console.log(`Error subiendo foto. E: ${error}`);
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
      let datosEscritos = new Object();
      for (var dato in this.edicionDatosContacto) {
        console.log(`${dato} vale ${this.edicionDatosContacto[dato]}`);
        if (
          this.edicionDatosContacto[dato] != null &&
          this.edicionDatosContacto[dato] != undefined &&
          this.edicionDatosContacto[dato] != ""
        ) {
          datosEscritos[dato] = this.edicionDatosContacto[dato];
        }
      }

      let dis = this;
      console.log(
        `Enviando nuevos datos contacto: ${JSON.stringify(datosEscritos)}`
      );
      let errores = validarDatosUsuario(datosEscritos);
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
              nuevosDatos: datosEscritos,
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
    resetearCamposPassword() {
      this.$set(this.edicionDatosPassword, "viejoPassword", "");
      this.$set(this.edicionDatosPassword, "nuevoPassword", "");
      this.$set(this.edicionDatosPassword, "nuevoPasswordConfirmacion", "");
      this.resultadoEdicionPassword = null;
    },
    enviarDatosPassword() {
      console.log(`Iniciando envio de nuevo password`);
      if (!this.nuevoPasswordConfirmado) {
        console.log(`Nuevo password no confirmado`);
        return;
      }
      let dis = this;
      let datos = this.edicionDatosPassword;

      for (let dato in this.edicionDatosPassword) {
        if (!this.edicionDatosPassword[dato]) {
          alert("Te faltó introducir un campo");
          return;
        }
      }
      if (datos.nuevoPassword != datos.nuevoPasswordConfirmacion) {
        alert("Debes confirmar correctamente la nueva contraseña");
        return;
      }
      this.resultadoEdicionPassword = null;
      let errores = validarDatosUsuario({
        password: datos.viejoPassword,
      }).concat(validarDatosUsuario({ password: datos.nuevoPassword }));

      if (errores.length > 0) {
        alert(errores[0]);
      }

      dis.enviandoDatosPassword = true;
      axios({
        method: "post",
        url: this.serverUrl + "/api/usuarios/updatePassword",
        data: datos,
        headers: {
          Authorization: "Bearer " + this.$store.state.token,
        },
      })
        .then(({ data }) => {
          dis.enviandoDatosPassword = false;
          console.log(`Contraseña cambiada`);
          if (data.resultado == "ok") {
            this.resetearCamposPassword();
            if (data.msjUsuario) {
              this.resultadoEdicionPassword = data.msjUsuario;
            }
          }
          //resp=JSON.parse(resp);
        })
        .catch((error) => {
          dis.enviandoDatosPassword = false;
          console.log(`Error subiendo nuevo password. E: ${error}`);
          if (error.response) {
            this.resultadoEdicionPassword = error.response.msjUsuario;
          }
        });
    },
    compararNuevoPassConfirmacion() {
      if (
        this.edicionDatosPassword.nuevoPassword ==
        this.edicionDatosPassword.nuevoPasswordConfirmacion
      ) {
        this.nuevoPasswordConfirmado = true;
      } else {
        this.nuevoPasswordConfirmado = false;
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
  font-size: 22px;
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
.botonEditar {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  width: 25px;
  height: 25px;
  border-radius: 50%;
}
.botonEditar:hover {
  background-color: gray;
}
#bEditarPassword {
  margin-left: 10px;
  position: relative;
}
#zonaInputsNuevoPassword {
  margin-top: 10px;
  display: grid;
  max-width: 500px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  row-gap: 10px;
  justify-items: start;
  align-items: center;
}
.inputsNuevoPassword {
  border-radius: 5px;
  font-size: 18px;
  margin-left: auto;
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
  cursor: pointer;
}

#laFotografia {
  width: 100%;
  height: 100%;
  border-radius: 50%;
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

#inputNuevaFoto {
  display: none;
  cursor: pointer;
}
.loading {
  position: absolute;
  top: 50%;
  width: 100%;
}
.deshabilitada {
  opacity: 0.5;
  pointer-events: none;
}
#resultadoEdicionPassword {
  color: gray;
  font-size: 14px;
  text-align: center;
  font-style: italic;
}
.enRojo {
  color: red;
}
.loading {
  position: relative;
}
.infoContacto{
  margin-bottom: 10px;
}
</style>