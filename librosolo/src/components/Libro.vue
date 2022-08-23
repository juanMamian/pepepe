<template>
  <div id="libro">
    <div id="contenedorHojas" v-if="libro.paginas">
      <div
        class="hoja"
        :class="{ girada: numeroH - 1 < centroHojas, tapada: Math.abs((numeroH-1)-centroHojas)>=1 }"
        v-for="numeroH of Math.ceil(libro.paginas.length / 2)"
        :key="numeroH"
        :style="[
          {
            zIndex:
              numeroH - 1 == hojaMovida
                ? '0'
                : -Math.abs(numeroH - 1 - hojaMovida),
          },
        ]"
      >
        <pagina
          :estaPagina="pagina"
          v-for="(pagina, index) of libro.paginas.slice(
            (numeroH - 1) * 2,
            (numeroH - 1) * 2 + 2
          )"
          :key="pagina.id"
          :class="{ reverso: index % 2 > 0 }"
          :numPagina="index+((numeroH-1)*2)"
          :idLibro="idLibro"
          @mousedown.left.native="swipingPagina = true"
          @mouseup.left.native="endSwipe"
          @mousemove.native="
            swipePagina($event, index % 2 > 0 ? 'atras' : 'adelante', index)
          "
          @mouseleave.native="endSwipe"
          @touchstart.native.prevent="iniciaTouch"
          @touchend.native.prevent="endTouch"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "apollo-server-core";
import Pagina from "./Pagina.vue";
export const fragmentoCuadroTexto = gql`
  fragment fragCuadroTexto on CuadroTextoCuento {
    id
    texto
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
    formato {
      fontSize
      colorLetra
      tipoLetra
      alineacion
    }
  }
`;

export const fragmentoCuadroImagen = gql`
  fragment fragCuadroImagen on CuadroImagenCuento {
    id
    sinArchivo
    tipoActivacionSecundario
    posicionZeta
    posicion {
      x
      y
    }
    size {
      x
      y
    }
    audio {
      tipoReproduccion
    }
  }
`;

const fragmentoPagina = gql`
  fragment fragPagina on PaginaCuento {
    id
    numPag
    color
    cuadrosTexto {
      ...fragCuadroTexto
    }
    cuadrosImagen {
      ...fragCuadroImagen
    }
  }
  ${fragmentoCuadroTexto}
  ${fragmentoCuadroImagen}
`;

const QUERY_LIBRO = gql`
  query($idLibro: ID!) {
    libro(idLibro: $idLibro) {
      id
      idsEditores
      titulo
      paginas {
        ...fragPagina
      }
      idForo
    }
  }
  ${fragmentoPagina}
`;
export default {
  components: { Pagina },
  name: "Libro",
  apollo: {
    libro: {
      query: QUERY_LIBRO,
      variables() {
        return {
          idLibro: this.idLibro,
        };
      },
      skip() {
        return this.idLibro == null;
      },
      fetchPolicy: "cache-and-network",
    },
  },
  props: {
    idLibro: String,
  },
  data() {
    return {
      libro: {
        paginas: null,
      },
      hojaMovida: 0,
      centroHojas: -0.5,

      swipingPagina: false,
      swipeAcumulado: 0,
      inicioDeTouch:{
        x:null,
        y:null,
      }
    };
  },
  methods: {
    swipePagina(e, direccion) {
      if (!this.swipingPagina) return;
      if (
        (e.movementX < 0 && direccion == "adelante") ||
        (e.movementX > 0 && direccion == "atras")
      ) {
        this.swipeAcumulado += e.movementX;
      }

      // if(direccion=='adelante' && e)
    },
    endSwipe() {
      if (Math.abs(this.swipeAcumulado) < 5) {
        this.swipingPagina = false;
        this.swipeAcumulado = 0;
        return;
      }
      if (this.swipeAcumulado < 0) {
        console.log(`Avanzar una hoja`);
        this.navegarHojas(1);
      } else {
        console.log(`Retroceder una hoja`);
        this.navegarHojas(-1);

      }
      this.swipingPagina = false;
      this.swipeAcumulado = 0;
    },
    navegarHojas(num) {
      this.centroHojas += num;
      if(num<0){
        this.hojaMovida=this.centroHojas+0.5;
      }
      else{
        this.hojaMovida=this.centroHojas-0.5;
      }
    },

    iniciaTouch(e){
      console.log("Inicio de touch")
      this.$set(this.inicioDeTouch, "x", e.changedTouches[0].screenX);
      this.$set(this.inicioDeTouch, "y", e.changedTouches[0].screenY);
      
    },
    endTouch(e){
      console.log("End touch");
      if(!this.inicioDeTouch.x || !this.inicioDeTouch.y){
        return 
      }
      const umbralSwipe=20;
      var currentX=e.changedTouches[0].screenX;
      var currentY=e.changedTouches[0].screenY;

      var deltaX=currentX-this.inicioDeTouch.x;
      var deltaY=currentY-this.inicioDeTouch.y;

      console.log(`Fin de touch con deltax ${deltaX} y deltaY: ${deltaY}`);

      if(deltaX<-umbralSwipe){
        console.log("Navegar hacia atrás");
        this.navegarHojas(-1);
      }
      else if(deltaX>umbralSwipe){
        this.navegarHojas(1);
        console.log("Navegar hacia adelante");

      }

      this.$set(this.inicioDeTouch, "x", null );
      this.$set(this.inicioDeTouch, "y", null );
    }
  },
};
</script>

<style scoped>
#libro{
  overflow: hidden;
}
#contenedorHojas {
  width: 138vh;
  height: 92vh;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  perspective: 4000px;

}
.hoja {
  position: absolute;
  left: 50%;
  /* width: 450px;
  height: 600px; */
  height: 92vh;
  width: 69vh;
  perspective-origin: left bottom;
  transform-origin: 0% 0%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.tapada{
  pointer-events: none;
}
.girada {
  transform: rotateY(-180deg);
}
.hoja:not(.girada)>.reverso{
  pointer-events: none;
}
.girada>.pagina:not(.reverso){
  pointer-events: none;
}

.reverso {
  transform: rotateY(180deg);
}
.pagina {
  position: absolute;
  top: 0px;
  left: 0px;
  backface-visibility: hidden;
  transform-style: preserve-3d;

}

</style>