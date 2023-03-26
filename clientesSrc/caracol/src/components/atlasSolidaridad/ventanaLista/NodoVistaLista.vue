<template>
  <div
    class="nodoVistaLista"
    @mouseleave="mostrando = mostrando === 'opcionesCrear' ? null : mostrando"
    :class="{ deshabilitado: enviandoQueryGeneral }"
  >
    <div class="elementoLista" :class="{ mostrandoBotonesBarraSuperior }">
      <div
        id="barraSuperior"
        :class="{
          seleccionado,
          mostrandoBotonesBarraSuperior,
          deshabilitado: nodoSiendoArrastrado && !usuarioAdministrador,
        }"
        @mousedown.stop="grabbing"
        @mouseup.stop="finalizarArrastre"
        @mousemove="movimientoDeArrastre"
        @mouseleave="
          recibiendoArrastradoEn = null;
          grabbed = false;
          grabAttempt = 0;
        "
        @click="
          $emit(
            'nodoSeleccionado',
            idNodoSeleccionado === esteNodo.id ? null : esteNodo.id
          )
        "
        :style="[
          colorBarraSuperior,
          estiloRecibiendoArrastrado,
          { opacity: siendoArrastrado ? '0.3' : '1' },
        ]"
        v-show="
          (modoLista === 'todo' ||
            (modoLista === 'usuarioResponsable' &&
              (usuarioResponsable || descendienteUsuarioResponsable))) &&
          (visible || seleccionado)
        "
      >
        <div
          id="zonaIconoNodo"
          @click.stop="
            mostrandoNodosUnder =
              requeridos.length > 0 ? !mostrandoNodosUnder : false
          "
        >
          <div
            id="trianguloAbrirChildren"
            class="trianguloBullet"
            :class="{
              waitingFetchChildren: idsNodosNeedingFetchMore.includes(
                esteNodo.id
              ),
            }"
            :title="
              idsNodosNeedingFetchMore.includes(esteNodo.id)
                ? 'Descargando nodos...'
                : mostrandoNodosUnder
                ? 'Cerrar subnodos'
                : 'Abrir subnodos'
            "
            :style="[
              {
                transform: mostrandoNodosUnder ? 'rotate(90deg)' : '',
                visibility: esteNodo.vinculos.length > 0 ? 'visible' : 'hidden',
              },
            ]"
          ></div>

          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="cog"
            class="svg-inline--fa fa-cog fa-w-16 iconoTipoNodo"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            v-if="esteNodo.tipoNodo === 'trabajo'"
            :style="{
              opacity:
                idNodoOver && idNodoOver != esteNodo.nodoParent ? '0.5' : '1',
            }"
          >
            <path
              :fill="colorIcono"
              d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"
            ></path>
          </svg>
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="star"
            class="svg-inline--fa fa-star fa-w-18 iconoTipoNodo"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            v-else
            :style="{
              opacity:
                idNodoOver && idNodoOver != esteNodo.nodoParent ? '0.5' : '1',
            }"
          >
            <path
              :fill="colorIcono"
              d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"
            ></path>
          </svg>
        </div>
        <input
          @keypress.enter.prevent="guardarNuevoNombre"
          ref="inputNuevoNombre"
          v-model="nuevoNombre"
          style="width: 250px"
          @click.stop=""
          @blur="editandoNombre = false"
          @keydown="keydownInputNuevoNombre"
          v-show="editandoNombre"
          type="text"
          class="inputNuevoNombre inputNombreCosa"
          :class="{ deshabilitado: enviandoNuevoNombre }"
        />
        <loading texto="" v-show="enviandoNuevoNombre" />
        <div
          id="elNombre"
          :class="{
            mostrandoBotonesBarraSuperior,
            deshabilitado: enviandoNuevoNombre,
          }"
          v-show="!editandoNombre"
          @click="toggleEditandoNombre"
        >
          {{ esteNodo.nombre }}
        </div>
        <img
          id="botonAbrirBotonesBarraSuperior"
          class="boton"
          src="@/assets/iconos/chevronCircle.svg"
          title="Ver opciones"
          :class="{ mostrandoBotonesBarraSuperior }"
          :style="{
            transform: !mostrandoBotonesBarraSuperior ? 'rotate(90deg)' : '',
          }"
          @click.stop="
            mostrandoBotonesBarraSuperior = !mostrandoBotonesBarraSuperior
          "
        />
        <div
          id="contenedorBotonesBarraSuperior"
          :class="{
            mostrandoBotonesBarraSuperior,
            mostrandoOpcionesCrear: mostrando === 'opcionesCrear',
          }"
          @click.stop=""
        >
          <div
            class="contenedorBotones"
            id="contenedorBotonesSelectoresContenidoNodo"
            :style="{ visibility: mostrando != null ? 'visible' : '' }"
          >
            <div
              class="boton botonSelectorContenidoNodo botonBarraSuperior"
              :class="{
                deshabilitado:
                  (!esteNodo.descripcion ||
                    esteNodo.descripcion.length < 1 ||
                    esteNodo.descripcion === 'Sin descripcion' ||
                    esteNodo.descripcion === 'Sin descripción') &&
                  !usuarioAdministrador,
              }"
              :style="{
                borderColor: mostrando === 'descripcion' ? 'white' : 'black',
              }"
              @dblclick.stop.prevent="
                $emit('toggleContenidoTodos', {
                  contenido: 'descripcion',
                  estado: mostrando != 'descripcion',
                })
              "
              @click="
                mostrando = mostrando === 'descripcion' ? null : 'descripcion'
              "
              :title="mostrando === 'descripcion' ? '' : 'Mostrar descripción'"
            >
              <img src="@/assets/iconos/info.svg" alt="Descripción" />
            </div>
            <div
              class="boton botonSelectorContenidoNodo botonBarraSuperior"
              :style="{
                borderColor: mostrando === 'responsables' ? 'white' : 'black',
              }"
              @dblclick.stop.prevent="
                $emit('toggleContenidoTodos', {
                  contenido: 'responsables',
                  estado: mostrando != 'responsables',
                })
              "
              @click="
                mostrando = mostrando === 'responsables' ? null : 'responsables'
              "
              :title="
                mostrando === 'responsables'
                  ? ''
                  : 'Mostrar responsables del nodo'
              "
            >
              <img src="@/assets/iconos/user.svg" alt="Responsables" />
            </div>
            <div
              class="boton botonSelectorContenidoNodo botonBarraSuperior"
              v-if="usuarioAdministrador"
              :style="{
                borderColor: mostrando === 'keywords' ? 'white' : 'black',
              }"
              :class="{
                deshabilitado:
                  !esteNodo.keywords || esteNodo.keywords.length < 1,
              }"
              @dblclick.stop.prevent="
                $emit('toggleContenidoTodos', {
                  contenido: 'keywords',
                  estado: mostrando != 'keywords',
                })
              "
              @click="mostrando = mostrando === 'keywords' ? null : 'keywords'"
              :title="mostrando === 'keywords' ? '' : 'Mostrar palabras clave'"
            >
              <img src="@/assets/iconos/tag.svg" alt="Keywords" />
            </div>
            <div
              class="boton botonSelectorContenidoNodo botonBarraSuperior"
              @dblclick.stop.prevent="
                $emit('toggleContenidoTodos', {
                  contenido: 'recursosExternos',
                  estado: mostrando != 'recursosExternos',
                })
              "
              @click="
                mostrando =
                  mostrando === 'recursosExternos' ? null : 'recursosExternos'
              "
              :style="{
                borderColor:
                  mostrando === 'recursosExternos' ? 'white' : 'black',
              }"
              :class="{
                deshabilitado:
                  !esteNodo.recursosExternos ||
                  esteNodo.recursosExternos.length < 1,
              }"
              :title="
                mostrando === 'recursosExternos'
                  ? ''
                  : 'Mostrar recursosExternos'
              "
            >
              <img src="@/assets/iconos/link.svg" alt="Enlace" />
            </div>
            <div
              class="boton botonSelectorContenidoNodo botonBarraSuperior"
              :style="{
                borderColor: mostrando === 'calendario' ? 'white' : 'black',
              }"
              @click="
                mostrando = mostrando === 'calendario' ? null : 'calendario'
              "
              :title="
                mostrando === 'calendario'
                  ? 'Ocultar calendario'
                  : 'Mostrar en calendario'
              "
            >
              <img src="@/assets/iconos/calendar.svg" alt="calendario" />
            </div>
          </div>
          <div class="contenedorBotones" id="botonesAccionesNodo">
            <div
              class="boton botonBarraSuperior"
              v-show="usuarioAdministrador || usuarioSuperadministrador"
              :title="esteNodo.publicitado ? 'No publicitar' : 'Publicitar'"
              :style="[{filter:esteNodo.publicitado?'var(--atlasFilterVerde)':''}]"
              @click="togglePublicitado"
              
            >
              <img src="@/assets/iconos/productHunt.svg" alt="P" />
            </div>
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="far"
              data-icon="check-circle"
              class="
                svg-inline--fa
                fa-check-circle fa-w-16
                boton
                botonBarraSuperior
              "
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              :title="
                esteNodo.estadoDesarrollo === 'completado'
                  ? 'Desmarcar como completado'
                  : 'Marcar como completado'
              "
              id="botonMarcarCompletado"
              :class="{
                deshabilitado: togglingEstado || !usuarioAdministrador,
              }"
              v-show="!togglingEstado"
              @click.stop="toggleEstadoNodo()"
            >
              <path
                :fill="
                  esteNodo.estadoDesarrollo === 'completado'
                    ? 'var(--atlasVerde)'
                    : ''
                "
                d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267l-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"
              ></path>
            </svg>

            <loading texto="" v-show="togglingEstado" />
            <div
              id="botonCrear"
              :class="{
                deshabilitado: creandoSubNodo || !usuarioResponsableAmplio,
              }"
            >
              <img
                src="@/assets/iconos/plusCircle.svg"
                alt="Mas..."
                title="Nuevo..."
                id="botonCrearNuevoNodo"
                class="boton botonBarraSuperior"
                :style="[
                  {
                    borderColor:
                      mostrando === 'opcionesCrear' ? 'white' : 'transparent',
                  },
                ]"
                v-show="mostrando != 'opcionesCrear'"
                @click="
                  mostrando =
                    mostrando === 'opcionesCrear' ? null : 'opcionesCrear'
                "
              />
              <div
                id="contenedorOpcionesCrear"
                v-show="mostrando === 'opcionesCrear'"
                :style="[
                  {
                    borderColor:
                      mostrando === 'opcionesCrear' ? 'white' : 'transparent',
                  },
                ]"
              >
                <img
                  src="@/assets/iconos/starSolid.svg"
                  alt="Objetivo"
                  title="Crear nuevo objetivo"
                  class="boton botonBarraSuperior opcionCrear"
                  v-show="esteNodo.tipoNodo === 'objetivo'"
                  @click="
                    crearNuevoNodoUnder({ tipoNodo: 'objetivo' }, esteNodo.id)
                  "
                />
                <img
                  src="@/assets/iconos/cog.svg"
                  alt="Trabajo"
                  title="Crear nuevo trabajo"
                  class="boton botonBarraSuperior opcionCrear"
                  @click="
                    crearNuevoNodoUnder({ tipoNodo: 'trabajo' }, esteNodo.id)
                  "
                />
                <loading texto="" v-show="creandoSubNodo" />
              </div>
            </div>
          </div>

          <div class="contenedorBotones" id="botonesEnlacesNodo">
            <a :href="clienteUrl + '/#/homeNodoSolidaridad/' + esteNodo.id">
              <img
                src="@/assets/iconos/home.svg"
                alt="Home"
                title="Ir a la página de este nodo"
                id="botonHomeNodo"
                class="boton botonBarraSuperior"
              />
            </a>
          </div>

          <div class="contenedorBotones" id="botonesEliminarNodo">
            <img
              src="@/assets/iconos/trash.svg"
              alt="Eliminar"
              title="Eliminar este nodo"
              id="botonEliminarNodo"
              class="boton botonBarraSuperior"
              v-show="usuarioAdministrador"
              @click="eliminarse"
            />
          </div>
        </div>
      </div>

      <!-- Campos de contenidos nodo -->
      <div id="contenidos">
        <div
          id="zonaDescripcion"
          class="zonaPrimerNivel"
          v-show="mostrando === 'descripcion'"
        >
          <div
            id="descripcion"
            class="contenidoTexto"
            ref="descripcion"
            v-show="!editandoDescripcion"
            @click="toggleEditandoDescripcion"
          >
            {{ esteNodo.descripcion }}
          </div>

          <textarea
            id="inputNuevoDescripcion"
            ref="inputNuevoDescripcion"
            class="inputTextoNodo"
            :class="{ letrasRojas: nuevoDescripcionIlegal }"
            v-model="nuevoDescripcion"
            v-show="editandoDescripcion"
          />
          <div class="contenedorBotonesCampo" v-show="editandoDescripcion">
            <img
              src="@/assets/iconos/save.svg"
              class="botonGuardarCampo"
              alt="Guardar"
              title="Guardar descripción"
              id="botonGuardarDescripcion"
              @click="guardarNuevoDescripcion"
            />
            <img
              src="@/assets/iconos/equis.svg"
              class="botonGuardarCampo"
              alt="Cancelar"
              title="Cancelar edición"
              id="botonCancelarEdicionDescripcion"
              @click="editandoDescripcion = false"
            />
          </div>
          <loading v-show="enviandoNuevoDescripcion" texto="Enviando..." />
        </div>

        <div
          id="zonaKeywords"
          class="zonaPrimerNivel"
          v-show="mostrando === 'keywords'"
        >
          <div
            id="keywords"
            class="contenidoTexto"
            ref="keywords"
            v-show="!editandoKeywords"
            @click="toggleEditandoKeywords"
          >
            {{ esteNodo.keywords }}
          </div>

          <textarea
            id="inputNuevoKeywords"
            ref="inputNuevoKeywords"
            class="inputTextoNodo"
            :class="{ letrasRojas: nuevoKeywordsIlegal }"
            v-model="nuevoKeywords"
            v-show="editandoKeywords"
            @keydown.esc.stop="editandoKeywords = false"
            @keydown.enter.prevent.stop="guardarNuevoKeywords"
          />
          <div class="contenedorBotonesCampo" v-show="editandoKeywords">
            <img
              src="@/assets/iconos/save.svg"
              class="botonGuardarCampo"
              alt="Guardar"
              title="Guardar palabras clave"
              id="botonGuardarKeywords"
              @click="guardarNuevoKeywords"
            />
            <img
              src="@/assets/iconos/equis.svg"
              class="botonGuardarCampo"
              alt="Cancelar"
              title="Cancelar edición"
              id="botonCancelarEdicionKeywords"
              @click="editandoKeywords = false"
            />
          </div>
          <loading v-show="enviandoNuevoKeywords" texto="Enviando..." />
        </div>

        <div
          id="zonaRecursosExternos"
          class="zonaPrimerNivel"
          v-show="mostrando === 'recursosExternos'"
        >
          <recurso-externo-nodo
            v-for="recursoExterno of esteNodo.recursosExternos"
            :key="recursoExterno.id"
            :usuarioResponsableAmplio="usuarioResponsableAmplio"
            :esteRecurso="recursoExterno"
            :idNodo="esteNodo.id"
          />
        </div>

        <div
          id="zonaResponsables"
          class="zonaPrimerNivel"
          v-show="mostrando === 'responsables'"
        >
          <div class="contenedorBotonesZona" id="contenedorBotonesResponsables">
            <img
              src="@/assets/iconos/mas.svg"
              alt="Entrar"
              :title="
                (esteNodo.responsables.length < 1 &&
                  esteNodo.tipoParent != 'usuario') ||
                usuarioParent
                  ? 'Asumir'
                  : 'Solicitar participación'
              "
              id="botonEntrarResponsables"
              class="botonControlZona botonControlResponsables"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-show="
                !usuarioResponsable &&
                !usuarioPosibleResponsable &&
                !idResponsableSeleccionado
              "
              @click.stop="entrarResponsables"
            />
            <img
              src="@/assets/iconos/minus.svg"
              alt="Salir"
              title="Abandonar"
              id="botonAbandonarResponsables"
              class="botonControlZona botonControlResponsables"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-show="
                (usuarioResponsable || usuarioPosibleResponsable) &&
                !idResponsableSeleccionado
              "
              @click.stop="abandonarListaResponsables"
            />
            <img
              src="@/assets/iconos/minus.svg"
              alt="Sacar"
              title="Retirar usuario"
              id="botonRetirarUsuarioFromResponsables"
              class="boton botonControlZona botonControlResponsables"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-show="
                idResponsableSeleccionado &&
                (usuarioSuperadministrador || usuarioParent)
              "
              @click.stop="
                retirarUsuarioFromListaResponsables(idResponsableSeleccionado)
              "
            />
            <img
              src="@/assets/iconos/handshake.svg"
              alt="Aceptar"
              title="Aceptar como responsable"
              id="botonAbandonarResponsables"
              class="botonControlZona botonControlResponsables"
              :class="{ deshabilitado: enviandoQueryResponsables }"
              v-show="
                usuarioResponsableAmplio &&
                idResponsableSeleccionado &&
                !esteNodo.responsables.includes(idResponsableSeleccionado)
              "
              @click="aceptarResponsable(idResponsableSeleccionado)"
            />
            <loading texto="" v-show="enviandoQueryResponsables" />
          </div>
          <div
            id="listaResponsables"
            @click.stop="idResponsableSeleccionado = null"
          >
            <icono-persona-autonomo
              v-for="idResponsable of esteNodo.responsables.concat(
                esteNodo.posiblesResponsables
              )"
              :style="{
                opacity: esteNodo.posiblesResponsables.includes(idResponsable)
                  ? 0.5
                  : 1,
              }"
              :key="idResponsable"
              :idPersona="idResponsable"
              :seleccionado="idResponsableSeleccionado == idResponsable"
              :factorEscala="'0.7'"
              @click.native.stop="idResponsableSeleccionado = idResponsable"
            />
          </div>
        </div>

        <div
          id="zonaCalendario"
          class="zonaPrimerNivel"
          v-if="mostrando === 'calendario'"
        >
          <div
            class="contenedorBotonesZona"
            id="contenedorBotonesCalendario"
            style="flex-direction: row-reverse"
          >
            <div
              class="boton botonControlCalendario"
              v-if="usuarioAdministrador"
              v-show="mostrando === 'calendario' && !creandoEvento"
              :title="'Programar una sesión de ' + esteNodo.nombre"
              @click="iniciarCreacionEvento"
            >
              <img src="@/assets/iconos/calendarPlus.svg" alt="Calendario" />
            </div>
            <div
              class="boton"
              title="Cancelar"
              @click="creandoEvento = false"
              v-show="creandoEvento"
            >
              <img src="@/assets/iconos/times.svg" alt="Cancelar" />
            </div>
          </div>
          <calendario
            :idUsuarioTarget="usuario.id"
            ref="calendario"
            :idParent="esteNodo.id"
            enfasis="eventosPersonales"
            tipoParent="nodoSolidaridad"
            @iniciaCreacionEvento="creandoEvento = false"
            @eventoCreado="responderEventoCreado($event, 'calendario')"
            @eventoEliminado="responderEventoEliminado($event, 'calendario')"
          />
        </div>
      </div>
      <!-- Lista de nodos children -->
      <div
        id="sublista"
        v-if="requeridos.length > 0"
        v-show="mostrandoNodosUnder"
      >
        <div id="lineaLista" v-show="mostrandoNodosUnder"></div>

        <nodo-vista-lista
          v-for="(nodo, index) of requeridos"
          ref="nodosRequeridos"
          :key="nodo.id"
          :esteNodo="nodo"
          :index="index"
          :idNodoSeleccionado="idNodoSeleccionado"
          :id="'nodoEnLista' + nodo.id"
          :mostrarColoresCompletado="seleccionado"
          :mostrandoNodosCompletados="mostrandoNodosCompletados"
          :verCompletados="verCompletados"
          :modoLista="modoLista"
          :indiceNodosUnder="indiceNodosUnder"
          :descendienteUsuarioResponsable="
            usuarioResponsable || descendienteUsuarioResponsable
          "
          :usuarioResponsableAmplioNodoOver="usuarioResponsableAmplio"
          :idsNodosNeedingFetchMore="idsNodosNeedingFetchMore"
          :nodoSiendoArrastrado="nodoSiendoArrastrado"
          :idNodoOver="esteNodo.id"
          tipoNodoOver="nodoSolidaridad"
          :underNodoSeleccionado="
            (idNodoSeleccionado && idNodoSeleccionado === esteNodo.id) ||
            underNodoSeleccionado
          "
          @nodoSeleccionado="$emit('nodoSeleccionado', $event)"
          @nodosRenderizados="$emit('nodosRenderizados', $event)"
          @inicioArrastre="$emit('inicioArrastre', $event)"
          @finDeArrastre="$emit('finDeArrastre', $event)"
          @toggleContenidoTodos="$emit('toggleContenidoTodos', $event)"
          @meElimine="$emit('nodoEliminado', nodo.id)"
          @nodoEliminado="$emit('nodoEliminado', $event)"
          @nodoSolidaridadCreado="$emit('nodoSolidaridadCreado', $event)"
        />
        <div id="lineaFinal"></div>
      </div>
    </div>
  </div>
</template>

<script>
import IconoPersonaAutonomo from "../../usuario/IconoPersonaAutonomo.vue";
import {
  MixinEdicionNodoSolidaridad,
  MixinEdicionVinculosNodoSolidaridad,
  MixinGeneralNodoSolidaridad,
  MixinPermisosUsuarioNodoSolidaridad,
  MixinVisualesNodosSolidaridad,
} from "../ConfiguracionNodoSolidaridad";
import Loading from "../../utilidades/Loading.vue";
import RecursoExternoNodo from "../homeNodo/RecursoExternoNodo.vue";
import Calendario from "../../utilidades/Calendario.vue";
import { gql } from "@apollo/client/core"

export default {
  name: "NodoVistaLista",
  components: {
    IconoPersonaAutonomo,
    Loading,
    RecursoExternoNodo,
    Calendario,
  },
  props: {
    idNodoOver: String,
    tipoNodoOver: String,
    underNodoSeleccionado: Boolean,
    index: Number,
    usuarioResponsableAmplioNodoOver: Boolean,
    nodoSiendoArrastrado: String,
    esteNodo: Object,
    indiceNodosUnder: Object,
    idNodoSeleccionado: String,
    mostrarColoresCompletado: Boolean,
    mostrandoNodosCompletados: Boolean,
    verCompletados: Boolean,
    modoLista: String,
    descendienteUsuarioResponsable: Boolean,
    idsNodosNeedingFetchMore: {
      type: Array,
      default: () => [],
    },
  },
  mixins: [
    MixinEdicionNodoSolidaridad,
    MixinEdicionVinculosNodoSolidaridad,
    MixinPermisosUsuarioNodoSolidaridad,
    MixinGeneralNodoSolidaridad,
    MixinVisualesNodosSolidaridad,
  ],
  data() {
    return {
      grabbed: false,
      grabAttempt: 0,
      recibiendoArrastradoEn: null,
      mostrandoNodosUnder: false,

      mostrando: null,
      montado: false,

      mostrandoBotonesBarraSuperior: false,

      creandoEvento: false,
      settingPublicitado:false,
    };
  },
  methods: {
    desplegarIfTargetUnder(idTarget) {
      var desplegar = false;
      (this.$refs.nodosRequeridos || []).forEach((nodo) => {
        if (
          nodo.desplegarIfTargetUnder(idTarget) ||
          nodo.esteNodo.id === idTarget
        ) {
          this.mostrandoNodosUnder = true;
          desplegar = true;
        }
      });

      return desplegar;
    },
    grabbing() {
      if (this.usuarioResponsableAmplioNodoOver) {
        this.grabbed = true;
      }
    },
    movimientoDeArrastre(e) {
      if (this.grabbed) {
        this.attemptToGrab(e);
      }
      if (
        this.nodoSiendoArrastrado &&
        !this.siendoArrastrado &&
        this.usuarioAdministrador
      ) {
        const posContenedor = this.$el.getBoundingClientRect();
        const topPixeles = e.clientY - posContenedor.top;
        const heightContenedor = posContenedor.bottom - posContenedor.top;
        const topPercentage = (topPixeles * 100) / heightContenedor;
        const umbralTop = 20;
        const umbralBottom = 80;
        if (topPercentage < umbralTop) {
          this.recibiendoArrastradoEn = "antes";
        } else if (topPercentage > umbralBottom) {
          this.recibiendoArrastradoEn = "despues";
        } else {
          this.recibiendoArrastradoEn = "dentro";
        }
      }
    },
    attemptToGrab(e) {
      if (!this.grabbed) {
        return;
      }
      const distanciaMinima = 15;
      const distancia = Math.abs(e.movementX) + Math.abs(e.movementY);
      this.grabAttempt += distancia;
      if (this.grabAttempt > distanciaMinima && !this.siendoArrastrado) {
        this.$emit("inicioArrastre", {
          idNodoArrastrado: this.esteNodo.id,
          idNodoSource: this.idNodoOver,
          tipoNodoSource: this.tipoNodoOver,
        });
        this.grabbed = false;
        this.grabAttempt = 0;
      }
    },
    finalizarArrastre() {
      this.grabbed = false;
      this.grabAttempt = 0;

      const infoDrop = {
        idNodoTarget:
          this.recibiendoArrastradoEn === "dentro"
            ? this.esteNodo.id
            : this.idNodoOver,
        tipoNodoTarget:
          this.recibiendoArrastradoEn === "dentro"
            ? "nodoSolidaridad"
            : this.tipoNodoOver,
        index:
          this.recibiendoArrastradoEn === "antes"
            ? this.index
            : this.recibiendoArrastradoEn === "despues"
            ? this.index + 1
            : this.esteNodo.vinculos.length,
      };
      this.$emit("finDeArrastre", infoDrop);
    },
    afterCrearNodoUnder(nuevoNodo) {
      this.mostrandoNodosUnder = true;
      this.$emit("nodoSolidaridadCreado", nuevoNodo);
    },
    globalSetMostrarContenido(contenido, estado) {
      if (estado) {
        if (this.esteNodo[contenido]) {
          if (
            this.esteNodo[contenido].length < 1 &&
            (contenido === "descripcion" ||
              contenido === "keywords" ||
              contenido === "recursosExternos")
          ) {
            //no se muestra
          } else {
            this.mostrando = contenido;
          }
        }
      } else {
        if (this.mostrando === contenido) {
          this.mostrando = null;
        }
      }
      if (this.$refs.nodosRequeridos && this.$refs.nodosRequeridos.length > 0) {
        this.$refs.nodosRequeridos.forEach((n) =>
          n.globalSetMostrarContenido(contenido, estado)
        );
      }
    },
    iniciarCreacionEvento() {
      this.creandoEvento = true;
    },
    responderEventoCreado() {
      console.log(`...`);
    },
    responderEventoEliminado() {
      console.log(`...`);
    },
    togglePublicitado(){
      const nuevoEstado=!this.esteNodo.publicitado;
      console.log(`Setting publicitado en ${nuevoEstado}`);
      
      this.settingPublicitado=true;

      this.$apollo.mutate({
        mutation: gql`
          mutation($idNodo:ID!, $nuevoEstado: Boolean!){
            setPublicitadoNodoSolidaridad(idNodo: $idNodo, nuevoEstado:$nuevoEstado){
              id
              publicitado
            }
          } 
        `,
        variables:{
          idNodo:this.esteNodo.id,
          nuevoEstado
        }
      }).then(()=>{
        this.settingPublicitado=false;
      }).catch((error)=>{
        console.log(`Error: ${error}`);
        this.settingPublicitado=false;        
      })
    }
  },
  computed: {
    siendoArrastrado() {
      return this.nodoSiendoArrastrado === this.esteNodo.id;
    },
    estiloRecibiendoArrastrado() {
      if (this.recibiendoArrastradoEn === "antes") {
        return {
          borderTop: "2px solid black",
        };
      } else if (this.recibiendoArrastradoEn === "despues") {
        return {
          borderBottom: "2px solid black",
        };
      } else if (this.recibiendoArrastradoEn === "dentro") {
        return {
          border: "2px solid black",
        };
      }
      return {};
    },
    colorBarraSuperior() {
      var backgroundColor = "transparent";
      if (this.seleccionado) {
        backgroundColor = "var(--atlasNaranja)";
      } else if (this.underNodoSeleccionado) {
        backgroundColor = "#ef72299c";
      }
      return { backgroundColor };
    },
    seleccionado() {
      return (
        this.idNodoSeleccionado && this.esteNodo.id === this.idNodoSeleccionado
      );
    },
    visible() {
      var visto =
        this.esteNodo.estadoDesarrollo != "completado" || this.verCompletados;

      return visto;
    },
    children() {
      const item = this.indiceNodosUnder[this.esteNodo.id];
      if (!item) {
        return [];
      }
      return item.nodosChildren || [];
    },
    requeridos() {
      const item = this.indiceNodosUnder[this.esteNodo.id];
      if (!item) {
        return [];
      }

      return item.nodosRequeridos || [];
    },
  },
  watch: {
    seleccionado(seleccionado) {
      if (!seleccionado) {
        this.editandoNombre = false;
      }
    },

    mostrandoNodosUnder(mostrando) {
      if (mostrando) {
        this.$emit(
          "nodosRenderizados",
          this.esteNodo.vinculos.map((v) => v.idRef)
        );
      }
    },
    nodoSiendoArrastrado(nodo) {
      if (!nodo) {
        this.recibiendoArrastradoEn = null;
      }
    },
    creandoEvento(creando) {
      if (creando) {
        this.$refs.calendario.eventoSiendoCreado = {
          idParent: this.esteNodo.id,
          tipoParent: "nodoSolidaridad",
          tipoEvento: "eventoPersonal",
        };
      } else {
        this.$refs.calendario.eventoSiendoCreado = null;
      }
    },
  },
  mounted() {
    this.montado = true;
  },
};
</script>
<style scoped>
@import "../estilosNodoSolidaridad.css";
</style>
<style scoped>
.nodoVistaLista {
  position: relative;
  user-select: none;
}
.nodoVistaLista:hover {
  z-index: 1;
}
#barraSuperior {
  cursor: pointer;
  padding: 3px 0px;
  display: flex;
  align-items: center;
  z-index: 1;
  min-height: 45px;
}
#barraSuperior #contenedorBotonesBarraSuperior {
  visibility: hidden;
}
#barraSuperior:hover #contenedorBotonesBarraSuperior {
  visibility: visible;
}

#botonAbrirBotonesBarraSuperior {
  display: none;
}
#zonaIconoNodo {
  padding: 0px 10px;
  padding-right: 20px;
  display: flex;
  align-items: center;
}
#trianguloAbrirChildren {
  display: block;
  border-left-color: rgb(48, 48, 48);
}
#trianguloAbrirChildren.waitingFetchChildren {
  opacity: 0.6;
}
.iconoTipoNodo {
  width: 20px;
  height: 20px;
  filter: inherit;
}
#contenedorBotonesBarraSuperior {
  display: flex;
  margin-left: auto;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.contenedorBotones {
  margin: 0px 14px;
  display: flex;
  flex-wrap: wrap;
}
#botonesAccionesNodo {
  display: flex;
  position: relative;
}
#contenedorOpcionesCrear {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  padding: 0px 4px;
  margin-left: 3px;
  flex-wrap: wrap;
}
.opcionCrear {
  cursor: pointer;
  display: block;
  margin: 0px 3px;
}
#contenedorBotonesSelectoresContenidoNodo > .botonBarraSuperior {
  border-width: 1px;
  border-style: solid;
}
.botonBarraSuperior.mostrando {
  border-color: white;
}
.botonBarraSuperior:not(.mostrando) {
  border-color: transparent;
}
.botonBarraSuperior {
  width: 19px;
  height: 19px;
  margin-left: 10px;
}
.botonSelectorContenidoNodo {
  padding: 2px;
}

.zonaPrimerNivel {
  border: 1px solid white;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.342);
  padding: 20px;
  margin: 0px 10px;
}
.contenedorBotonesCampo {
  margin: 5px auto;
  display: flex;
  justify-content: center;
}
.botonGuardarCampo {
  width: 15px;
  cursor: pointer;
  margin: 0px 5px;
  opacity: 0.8;
}

#zonaResponsables {
  padding: 20px 0px;
}
#zonaRecursosExternos {
  padding: 0px;
  border-radius: 0px;
}
.contenedorBotonesZona {
  display: flex;
  padding: 5px;
}
.botonControlZona {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0px 5px;
}
#listaResponsables {
  margin-top: 10px;
}
#elNombre {
  max-width: 70%;
  font-size: max(12px, 0.8vw);
}
.iconoPersonaAutonomo {
  position: relative;
  margin: 0px 15px;
}

#inputNuevoDescripcion {
  display: block;
  resize: vertical;
  width: 100%;
  border-radius: 5px;
  background-color: transparent;
}
#sublista {
  padding-left: 21px;
  position: relative;
}
#lineaLista {
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0px;
  left: 20px;
  background-color: rgba(70, 70, 70, 0.685);
}
#lineaFinal {
  width: 40%;
  height: 1px;
  background-color: rgba(70, 70, 70, 0.685);
  position: relative;
  left: -1px;
}
.calendario {
  width: 100%;
}
@media only screen and (max-width: 1300px) {
  .elementoLista.mostrandoBotonesBarraSuperior {
    background-color: rgba(128, 128, 128, 0.233);
  }
  .nodoVistaLista {
    font-size: 12px;
  }
  #barraSuperior {
    flex-wrap: wrap;
    position: relative;
  }
  #barraSuperior.mostrandoBotonesBarraSuperior {
    background-color: rgba(128, 128, 128, 0.144);
  }

  .iconoTipoNodo {
    width: min(4vw, 22px);
    height: min(4vw, 22px);
  }

  #elNombre {
    max-width: 70%;
    font-size: 14px;
  }
  #barraSuperior #contenedorBotonesBarraSuperior {
    visibility: visible;
    width: 100%;
    padding-top: 10px;
  }
  #contenedorBotonesBarraSuperior:not(.mostrandoBotonesBarraSuperior) {
    display: none;
  }
  .contenedorBotones {
    width: 30px;
    flex-direction: column;
  }
  #contenedorBotonesSelectoresContenidoNodo {
    margin-left: 26px;
  }
  #contenedorOpcionesCrear {
    width: 100%;
    margin: 0px;
    margin-left: 0px;
    border-color: transparent;
    padding: 2px 0px;
  }
  #botonesEliminarNodo {
    margin-left: auto;
  }
  .botonBarraSuperior {
    width: 25px;
    height: 25px;
    margin: 10px 0px;
  }
  .botonSelectorContenidoNodo {
    padding: 4px;
  }
  #botonAbrirBotonesBarraSuperior {
    width: 25px;
    height: 25px;

    cursor: pointer;
    display: block;
    margin-left: auto;
    margin-right: 10px;
    transition: transform 0.1s;
  }
  .botonControlZona {
    width: 22px;
    height: 22px;
  }
}

@media (hover: none) and (pointer: coarse) {
}
</style>