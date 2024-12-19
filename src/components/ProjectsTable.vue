<template>
  <q-table title="Projects List" :columns="columns" :wrap-cells="true">
    <template v-slot:top>
      <q-space />
      <q-input
        borderless
        dense
        debounce="300"
        v-model="filter"
        placeholder="Search"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <div>
          <a :href="'#/project/' + props.row.id"> {{ props.value }}</a>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn
            padding="xs"
            color="primary"
            icon="edit"
            title="Edit"
            @click="$emit('editProjectClick', props.row)"
          />
          <q-btn
            padding="xs"
            color="red"
            icon="delete"
            title="Delete"
            @click="$emit('deleteProjectClick', props.row)"
          />
        </div>
      </q-td> </template
  ></q-table>
</template>

<script>
import { ref } from "vue";

const columns = [
  {
    name: "name",
    label: "Project Name",
    field: "name",
    sortable: true,
    required: true,
  },
  { name: "action", label: "Action", field: "id" },
  {
    name: "creation",
    label: "Creation date",
    field: "creation_date",
    sortable: true,
  },
];

export default {
  name: "ProjectsTable",
  setup() {
    const filter = ref();
    return { columns, filter };
  },
};
</script>
