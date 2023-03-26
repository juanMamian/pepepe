<template>
  <div class="tablaDato">
    <div id="camposDatoTabla">
      <table>
        <tr>
          <th
            class="nombreCampo"
            v-for="campo of esteDato.campos"
            :key="'nombreCampo' + campo"
          >
            {{ campo }}
          </th>
        </tr>
        <tr v-for="item of esteDato.items" :key="item.id">
            <td v-for="campo of esteDato.campos" :key="item.id+'valorCampo'+campo">
                {{item[campo]}}
            </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "TablaDato",
  props: {
    esteDato: Object,
  },
};
</script>

<style scoped>
.tablaDato {
  width: 100%;
  overflow-x: scroll;
}
#camposDatoTabla {
  display: flex;
}
.nombreCampo {
  padding: 2px 10px;
}
</style>