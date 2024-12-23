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
    @update:selected="onSelectionUpdate"
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
    name: "assembled",
    required: true,
    label: "Assembled?",
    align: "left",
    field: "assembled",
    sortable: true,
  },
  {
    name: "sourced_externally",
    required: true,
    label: "Externally sourced?",
    align: "left",
    field: "sourced_externally",
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
    field: "invoice_item",
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
    rework_filter_id: {
      type: Array,
    },
  },
  setup(props) {
    const loading = ref(false);
    const filter = ref("");
    const selected = ref([]);
    const assembly_items = ref([]);
    const rows = ref([]);

    function load_assembly_items() {
      if (props.assembly_id) {
        loading.value = true;
        api
          .get(`/api/assembly-item/?assembly=${props.assembly_id}`)
          .then((response) => {
            assembly_items.value = response.data;
            rows.value = response.data;
            loading.value = false;
          });
      }
    }

    function filter_reworks(items) {
      if (props.rework_filter_id && props.rework_filter_id.length > 0) {
        rows.value = items.filter((x) => {
          return props.rework_filter_id.includes(x.rework);
        });
      } else {
        rows.value = items;
      }
    }

    function onSelectionUpdate() {
      if (selected.value.length == 0) {
        filter_reworks(assembly_items.value);
      } else {
        filter_reworks(
          assembly_items.value.filter((x) =>
            x.part ? x.part.id == selected.value[0].part.id : false
          )
        );
      }
    }

    watch(
      () => props.assembly_id,
      (current, previous) => {
        load_assembly_items();
      }
    );

    watch(
      () => props.rework_filter_id,
      (current, previous) => {
        console.log("updated rework id", props.rework_filter_id);
        onSelectionUpdate();
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

      onSelectionUpdate,
    };
  },
};
</script>
