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
        <q-btn
          @click="rework_create_dialog = true"
          :disable="selection == null || selection.length == 0"
          >Create new Rework</q-btn
        >
        <q-btn @click="closeRework">Close Rework</q-btn>
        <q-btn
          @click="assembly_item_rework_dialog = true"
          :disable="selection == null || selection.length == 0"
          >Rework selected parts</q-btn
        >
      </q-card-actions>
    </q-card>

    <ReworkSelectCard
      class="q-mb-md"
      :assembly_id="active_id"
      @updateSelected="onReworkSelected"
    ></ReworkSelectCard>

    <AssemblyItemTable
      :assembly_id="active_id"
      :rework_filter_id="selectedReworks"
      v-model:selected="selection"
    ></AssemblyItemTable>

    <ReworkEditCreateDialog
      v-model="rework_create_dialog"
      :assembly_id="active_id"
      @onCreated="onReworkCreated"
    ></ReworkEditCreateDialog>

    <AssemblyItemReworkDialog
      v-model="assembly_item_rework_dialog"
      :assembly_item_id="
        selection && selection.length > 0 ? selection[0].id : null
      "
      @onUpdated="assembly_item_rework_dialog = false"
    ></AssemblyItemReworkDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import ReworkSelectCard from "components/widgets/ReworkSelectCard.vue";
import AssemblyItemTable from "components/AssemblyItemTable.vue";
import ReworkEditCreateDialog from "components/dialogs/ReworkEditCreateDialog.vue";
import AssemblyItemReworkDialog from "components/dialogs/AssemblyItemReworkDialog.vue";

export default {
  components: {
    AssemblyItemTable,
    ReworkSelectCard,
    ReworkEditCreateDialog,
    AssemblyItemReworkDialog,
  },
  setup() {
    const route = useRoute();
    const active_id = Number(route.params.id);
    const assembly = ref({
      serial_number: null,
      rework_set: [],
      project_version: { name: "" },
    });
    const project = ref({ name: null });
    const rework_create_dialog = ref();
    const assembly_item_rework_dialog = ref();
    const selection = ref();
    const selectedReworks = ref([]);

    function load_assembly_details() {
      api.get(`/api/assembly/${active_id}`).then((response) => {
        assembly.value = response.data;
        project.value = response.data.project_version.project;
      });
    }

    function onReworkSelected(selected) {
      console.log(selected);
      if (selected && selected.length > 0) {
        selectedReworks.value = selected.map((x) => x.id);
      } else {
        selectedReworks.value = [];
      }
    }

    function onReworkCreated(id) {
      console.log("Created rework, id", id);
      rework_create_dialog.value = false;
      for (const assembly_item of selection.value) {
        let data = assembly_item;
        data.inventoryreservation_set = [];
        data.part = assembly_item.part.id;
        data.rework = id;
        api.post(`/api/assembly-item/`, data).then((response) => {});
      }
    }

    function closeRework() {
      api
        .post(`/api/close-rework/${selectedReworks.value[0]}/`)
        .then((response) => {});
    }

    onMounted(() => {
      load_assembly_details();
    });

    return {
      active_id,
      assembly,
      project,
      selection,
      selectedReworks,

      rework_create_dialog,
      assembly_item_rework_dialog,

      onReworkCreated,
      onReworkSelected,
      closeRework,
    };
  },
};
</script>
