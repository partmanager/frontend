<template>
  <q-table
    title="Assembled Parts"
    :columns="columns"
    :rows="rows"
    row-key="id"
    :filter="filter"
    :loading="loading"
    selection="multiple"
    v-model:selected="selected"
  >
    <template v-slot:top-right>
      <q-input
        borderless
        dense
        debounce="300"
        placeholder="Search"
        v-model="filter"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { api } from "boot/axios";

const columns = [
  {
    name: "designator",
    required: true,
    label: "Designator",
    align: "left",
    field: "designator",
    sortable: true,
  },
  {
    name: "part",
    label: "Part",
    field: (row) => row.part.manufacturer_part_number,
    sortable: true,
  },
  {
    name: "description",
    label: "Description",
    field: (row) => row.part.description,
    sortable: true,
  },
  {
    name: "lot",
    label: "LOT",
    field: "lot",
  },
  {
    name: "note",
    label: "Note",
    field: "note",
  },
  {
    name: "invoice",
    label: "Invoice",
    field: "invoice",
  },
  {
    name: "price",
    label: "Price",
    field: "price",
  },
];

export default {
  name: "AssemblyItemTable",
  props: {
    assembly_id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const loading = ref(false);
    const filter = ref("");
    const selected = ref([]);
    const rows = ref([]);

    function load_assembly_items() {
      if (props.assembly_id) {
        loading.value = true;
        api
          .get(`/api/assembly-item/?assembly=${props.assembly_id}`)
          .then((response) => {
            rows.value = response.data;
            loading.value = false;
          });
      }
    }

    watch(
      () => props.assembly_id,
      (current, previous) => {
        load_assembly_items();
      }
    );

    onMounted(() => {
      load_assembly_items();
    });

    return {
      loading,
      filter,
      columns,
      rows,
      selected,
    };
  },
};
</script>
