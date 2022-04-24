<template lang="pug">
.shortcuts
  Table(
    :data="rows"
    :columns="columns"
    keyField="description"
  )
    template(v-slot:checkbox="props")
      Checkbox(v-model:modelValue="props.row.checkbox")
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Button, Table, Checkbox } from '@voximplant/spaceui';

  export default defineComponent({
    name: 'Shortcuts',
    components: {
      Button,
      Table,
      Checkbox,
    },
    setup() {
      const columns = ref([
        {
          title: 'Description',
          field: 'description',
        },
        {
          title: 'Shortcut',
          field: 'shortcut',
        },
        {
          title: '',
          field: 'checkbox',
          slot: true,
        },
      ]);
      const rows = ref([
        {
          description: 'Function1',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function2',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function3',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function4',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function5',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function6',
          shortcut: 'q',
          checkbox: true,
        },
        {
          description: 'Function7',
          shortcut: 'q',
          checkbox: true,
        },
      ]);
      return {
        columns,
        rows,
      };
    },
  });
</script>

<style scoped>
  .shortcuts {
    &::v-deep(.sui-table-slot) {
      margin: 0;
      justify-content: center;
    }
    &::v-deep(.sui-checkbox) {
      margin: 0;
    }
  }
</style>
