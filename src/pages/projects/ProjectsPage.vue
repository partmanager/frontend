<template>
  <div class="q-pa-md">
    <q-card class="q-mb-md" bordered>
      <q-card-section>
        <div class="text-h6">Projects</div>
      </q-card-section>
      <q-card-actions>
        <q-btn
          color="primary"
          label="Create"
          title="Create project"
          @click="project_create_dialog = true"
        />
        <q-btn
          color="primary"
          label="Import"
          disable
          @click="projects_import_dialog = true"
        />
        <q-btn color="primary" label="Export" disable />

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
          <q-card-section> TODO add filters </q-card-section>
        </div>
      </q-slide-transition>
    </q-card>

    <ProjectsTable
      :rows="rows"
      @deleteProjectClick="show_delete_confirmation_dialog"
      @editProjectClick="show_project_edit_dialog"
    >
    </ProjectsTable>

    <EditCreateProjectDialog
      v-model="project_create_dialog"
      @onCreated="on_project_create"
    ></EditCreateProjectDialog>

    <EditCreateProjectDialog
      v-model="project_edit_dialog"
      title="Edit Project"
      :project_id="active_item ? active_item.id : null"
      @onCreated="on_project_create"
    ></EditCreateProjectDialog>

    <DeleteConfirmationDialog
      v-model="project_delete_dialog"
      :title="'Delete Project'"
      :ondelete="on_project_delete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_item.name }}</strong>
        project.
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import EditCreateProjectDialog from "components/dialogs/EditCreateProjectDialog.vue";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import ProjectsTable from "components/ProjectsTable.vue";

export default {
  setup() {
    const $q = useQuasar();
    const projects_table = ref();
    const project_create_dialog = ref();
    const project_edit_dialog = ref();
    const project_delete_dialog = ref();
    const projects_import_dialog = ref();
    const active_item = ref();
    const expanded = ref(false);
    const rows = ref([]);

    function show_delete_confirmation_dialog(row) {
      active_item.value = row;
      project_delete_dialog.value = true;
    }

    function load_projects() {
      api.get("/api/project").then((response) => {
        rows.value = response.data;
      });
    }

    function on_project_delete() {
      api.delete(`api/project/${active_item.value.id}`).then((response) => {
        $q.notify({
          color: "positive",
          message: `Project deleted`,
        });
        load_projects();
        project_delete_dialog.value = false;
      });
    }
    function on_project_create() {
      project_create_dialog.value = false;
      load_projects();
    }

    function show_project_edit_dialog(row) {
      active_item.value = row;
      project_edit_dialog.value = true;
    }

    onMounted(() => {
      load_projects();
    });

    return {
      expanded,
      projects_table,
      rows,
      active_item,
      projects_import_dialog,

      project_create_dialog,
      project_edit_dialog,
      show_project_edit_dialog,

      project_delete_dialog,
      show_delete_confirmation_dialog,
      on_project_delete,
      on_project_create,
    };
  },
  components: {
    EditCreateProjectDialog,
    DeleteConfirmationDialog,
    ProjectsTable,
  },
};
</script>
