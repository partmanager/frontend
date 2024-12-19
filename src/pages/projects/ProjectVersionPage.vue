<template>
  <div class="q-pa-md">
    <q-card align="justify">
      <q-card-section>
        <div class="text-h6">{{ project_name }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        Version: <strong>{{ project_version_name }}</strong></q-card-section
      >
      <q-card-actions>
        <q-btn
          color="primary"
          label="Edit"
          title="Edit Project"
          @click="project_edit_dialog = true"
        />
        <q-btn
          color="secondary"
          label="Create Assembly"
          title="Create Assembly"
          @click="assembly_create_dialog = true"
        />
        <q-btn
          color="secondary"
          label="Create BOM"
          title="Create BOM"
          @click="bom_create_dialog = true"
        />
        <q-btn
          color="red"
          label="Delete"
          title="Delete -> TODO <-"
          @click="assembly_create_dialog = true"
        />
      </q-card-actions>
    </q-card>
    <br />
    <q-tabs
      v-model="bom_assembliees_tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="bom" label="BOM" />
      <q-tab name="assemblies_jobs" label="Assemblies Jobs" />
      <q-tab name="assemblies" label="Assemblies" />
    </q-tabs>

    <q-tab-panels v-model="bom_assembliees_tab" animated>
      <q-tab-panel name="bom">
        <BOMItemsTable :bom_id="bom_id"></BOMItemsTable>
      </q-tab-panel>
      <q-tab-panel name="assemblies_jobs">
        <q-table
          title="Assemblies Jobs"
          :columns="[
            { name: 'date', label: 'Date', field: 'creation_date' },
            { name: 'name', label: 'Name', field: 'name' },
            { name: 'status', label: 'Status', field: 'status' },
            { name: 'action', label: 'Action', align: 'left', field: 'id' },
            { name: 'quantity', label: 'Quantity', field: 'quantity' },
            { name: 'price', label: 'Price', field: 'price' },
            { name: 'unit_price', label: 'Price per device', field: 'price' },
            { name: 'description', label: 'Description', field: 'description' },
          ]"
          :rows="assembly_set"
          :wrap-cells="true"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div>
                <a :href="'#/assembly-job/' + props.row.id">
                  {{ props.value }}</a
                >
                <q-badge
                  v-if="!props.part && !props.manufacturer_order_number"
                  color="red"
                  title="Part unassigned."
                >
                  <q-icon name="warning" color="white" class="q-ml-xs" />
                </q-badge>
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
                  @click="show_assembly_edit_dialog(props.row)"
                />
                <q-btn
                  padding="xs"
                  color="red"
                  icon="delete"
                  title="Delete"
                  @click="show_delete_assembly_confirmation_dialog(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
      <q-tab-panel name="assemblies">
        <AssembliesTable></AssembliesTable>
      </q-tab-panel>
    </q-tab-panels>

    <BOMEditCreateDialog
      v-model="bom_create_dialog"
      title="Create BOM"
      :project_id="project_version_id"
      :onsave="on_bom_save"
    >
    </BOMEditCreateDialog>

    <BOMEditCreateDialog
      v-model="bom_edit_dialog"
      title="Edit BOM"
      :bom_initial_id="active_bom.id"
      :onsave="on_bom_save"
    >
    </BOMEditCreateDialog>

    <BOMImportDialog
      v-model="bom_import_dialog"
      :project_id="project_version_id"
      :onsave="on_bom_save"
    ></BOMImportDialog>

    <AssemblyEditCreateDialog
      v-model="assembly_create_dialog"
      title="Create Assembly"
      :project_version_id="project_version_id"
      :onsave="on_assembly_save"
    ></AssemblyEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="bom_delete_dialog"
      :title="'Delete BOM'"
      :ondelete="onBOMDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_bom.name }}</strong>
        item from <strong>{{ project_name }}</strong
        >?
      </template>
    </DeleteConfirmationDialog>

    <DeleteConfirmationDialog
      v-model="assembly_delete_dialog"
      :title="'Delete Assembly'"
      :ondelete="onAssemblyDelete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_assembly.name }}</strong>
        assembly from <strong>{{ project_name }}</strong
        >?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { api } from "boot/axios";
import BOMEditCreateDialog from "src/components/BOMEditCreateDialog.vue";
import BOMImportDialog from "src/components/BOMImportDialog.vue";
import BOMItemsTable from "components/BOMItemsTable.vue";
import AssemblyEditCreateDialog from "components/AssemblyEditCreateDialog.vue";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import AssembliesTable from "components/AssembliesTable.vue";

export default {
  setup() {
    const route = useRoute();
    const project_version_id = Number(route.params.id);
    const bom_create_dialog = ref();
    const bom_import_dialog = ref(false);
    const bom_delete_dialog = ref();
    const bom_edit_dialog = ref();
    const bom_filter_text = ref();
    const assembly_set = ref();

    const assembly_create_dialog = ref();
    const assembly_delete_dialog = ref();

    const bom_assembliees_tab = ref("bom");

    const project_name = ref();
    const project_version_name = ref();
    const boms = ref([]);
    const active_bom = ref({ id: null, name: null });
    const active_assembly = ref({ id: null, name: null });
    const bom_id = ref(null);

    function load_project_details() {
      api.get(`/api/project-version/${project_version_id}`).then((response) => {
        project_name.value = response.data.project.name;
        project_version_name.value = response.data.name;
        boms.value = response.data.bom_set;
        bom_id.value = Number(boms.value[0].id);
      });

      api.get(`/api/assembly-job/`).then((response) => {
        assembly_set.value = response.data;
      });
    }

    function on_assembly_save() {
      load_project_details();
      assembly_create_dialog.value = false;
    }

    function on_bom_save() {
      bom_create_dialog.value = false;
      bom_edit_dialog.value = false;
      bom_import_dialog.value = false;
      load_project_details();
    }

    function onBOMDelete() {
      api.delete(`api/bom/${active_bom.value.id}`).then((response) => {
        load_project_details();
        bom_delete_dialog.value = false;
      });
    }

    function show_bom_item_edit_dialog(row) {
      active_bom.value.id = row.id;
      active_bom.value.name = row.name;
      bom_edit_dialog.value = true;
    }

    function show_delete_confirmation_dialog(row) {
      active_bom.value.id = row.id;
      active_bom.value.name = row.name;
      bom_delete_dialog.value = true;
    }

    function show_assembly_edit_dialog(row) {}

    function show_delete_assembly_confirmation_dialog(row) {
      active_assembly.value.id = row.id;
      active_assembly.value.name = row.name;
      assembly_delete_dialog.value = true;
    }

    function onAssemblyDelete() {
      api
        .delete(`api/assembly-job/${active_assembly.value.id}`)
        .then((response) => {
          load_project_details();
          assembly_delete_dialog.value = false;
        });
    }

    onMounted(() => {
      load_project_details();
    });

    return {
      bom_create_dialog,
      bom_import_dialog,
      bom_filter_text,

      bom_id,

      bom_edit_dialog,
      show_bom_item_edit_dialog,

      bom_delete_dialog,
      show_delete_confirmation_dialog,
      onBOMDelete,

      assembly_create_dialog,
      on_assembly_save,
      show_assembly_edit_dialog,

      assembly_delete_dialog,
      active_assembly,
      show_delete_assembly_confirmation_dialog,
      onAssemblyDelete,

      bom_assembliees_tab,

      project_name,
      project_version_name,
      boms,
      assembly_set,
      project_version_id,
      active_bom,
      on_bom_save,
    };
  },
  components: {
    AssembliesTable,
    BOMEditCreateDialog,
    BOMImportDialog,
    BOMItemsTable,
    AssemblyEditCreateDialog,
    DeleteConfirmationDialog,
  },
};
</script>
