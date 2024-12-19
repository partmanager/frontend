<template>
  <div class="q-pa-md">
    <q-card class="q-mb-sm"
      ><q-card-section>
        {{ project.name }} -> {{ assembly.project_version.name }} ->
        {{ assembly.name }}
      </q-card-section>
      <q-separator />
      <q-card-section>
        SN: {{ assembly.serial_number }}<br />
        Reworks: {{ assembly.rework_set.length }} <br />
        Component Cost:<br />
        Build Cost:<br />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn>Rework</q-btn>
      </q-card-actions>
    </q-card>

    <AssemblyItemTable :assembly_id="active_id"></AssemblyItemTable>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import AssemblyItemTable from "components/AssemblyItemTable.vue";

export default {
  components: { AssemblyItemTable },
  setup() {
    const route = useRoute();
    const active_id = Number(route.params.id);
    const assembly = ref({
      serial_number: null,
      rework_set: [],
      project_version: { name: "" },
    });
    const project = ref({ name: null });

    function load_assembly_details() {
      api.get(`/api/assembly/${active_id}`).then((response) => {
        assembly.value = response.data;
        project.value = response.data.project_version.project;
      });
    }

    onMounted(() => {
      load_assembly_details();
    });

    return {
      active_id,
      assembly,
      project,
    };
  },
};
</script>
