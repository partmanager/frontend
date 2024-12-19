<template>
  <q-table
    title="Assemblies List"
    :columns="columns"
    :rows="rows"
    :wrap-cells="true"
  >
    <template v-slot:body-cell-assembly="props">
      <q-td :props="props">
        <div>
          <a :href="'#/assembly/' + props.row.id"> {{ props.value }}</a>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";

const columns = [
  {
    name: "name",
    label: "Project Name",
    field: (row) => row.assembly_job.project_version.project.name,
    sortable: true,
    required: true,
  },
  {
    name: "version",
    label: "Project Verson",
    field: (row) => row.assembly_job.project_version.name,
    sortable: true,
    required: true,
  },
  {
    name: "assembly_job",
    label: "Assembly Job",
    field: (row) => row.assembly_job.name,
    sortable: true,
  },
  {
    name: "assembly",
    label: "Assembly",
    field: "name",
    sortable: true,
    required: true,
  },
  { name: "action", label: "Action", field: "id" },

  {
    name: "sn",
    label: "Serial Number",
    field: "serial_number",
    sortable: true,
  },
  {
    name: "creation",
    label: "Creation date",
    field: "creation_date",
    sortable: true,
  },
];

export default {
  name: "AssembliesTable",
  setup() {
    const filter = ref();
    const rows = ref([]);

    function load_project_details() {
      api.get(`/api/assembly/`).then((response) => {
        rows.value = response.data;
      });
    }

    onMounted(() => {
      load_project_details();
    });

    return { columns, rows, filter };
  },
};
</script>
