<template>
  <div class="libro">

  </div>
</template>

<script>
import gql from 'graphql-tag'

const QUERY_LIBRO=gql`
  query($idLibro:ID!){
    libro{
      paginas{
        cuadrosTexto{
          texto
          posicion{
            x
            y
          },
          size{
            x
            y
          }
          audio{
            tipoReproduccion
          }
        }
        cuadrosImagen{
          tipoActivacion
          posicion{
            x
            y
          }
          size{
            x
            y
          }
          audio{
            tipoReproduccion
          }
        }
      }
    }
  }
`

export default {
    name: "Libro",
    apollo:{
      libro:{
        query:QUERY_LIBRO,
        variables(){
          return {
            idLibro:this.$route.params.idLibro
          }
        }
      }
    }
}
</script>

<style scoped>

</style>