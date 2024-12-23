<template>
  <q-card>
    <q-card-actions>
      <div class="q-table__title">Reworks</div>
      <q-space />

      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />
        <q-table
          :columns="columns"
          :rows="rows"
          :loading="loading"
          selection="multiple"
          v-model:selected="selected"
          @update:selected="$emit('updateSelected', selected)"
        ></q-table>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";

const columns = [
  {
    name: "name",
    required: true,
    label: "Name",
    align: "left",
    field: "name",
    sortable: true,
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "closed",
    label: "Closed",
    align: "left",
    field: "closed",
  },
  {
    name: "date",
    label: "Creation date",
    align: "left",
    field: "date",
  },
];

export default {
  name: "ReworkSelectCard",
  props: {
    assembly_id: {
      type: Number,
      required: true,
    },
  },
  emits: ["updateSelected"],
  setup(props) {
    const expanded = ref();
    const loading = ref(false);
    const rows = ref([]);
    const selected = ref();

    function load_rework_items() {
      if (props.assembly_id) {
        loading.value = true;
        api
          .get(`/api/rework/?assembly=${props.assembly_id}`)
          .then((response) => {
            rows.value = response.data;
            loading.value = false;
          });
      }
    }

    onMounted(() => {
      load_rework_items();
    });

    return { expanded, loading, columns, rows, selected };
  },
};
</script>
