<template>
  <div class="q-pa-md">
    <q-card class="q-mb-md" bordered>
      <q-card-section>
        <div class="text-h6">{{ project_name }}</div>
        Created: {{ project_creation_date }}
      </q-card-section>
      <q-card-section> Description: {{ project_description }} </q-card-section>
      <q-card-actions>
        <q-btn
          color="primary"
          label="Create project version"
          title="Create project version"
          @click="project_version_create_dialog = true"
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

    <q-table
      :title="project_name"
      :columns="columns"
      :rows="rows"
      :wrap-cells="true"
    >
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
            <a :href="'#/project-version/' + props.row.id">
              {{ props.value }}</a
            >
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
              @click="show_project_version_edit_dialog(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete"
              @click="show_delete_confirmation_dialog(props.row)"
            />
          </div>
        </q-td> </template
    ></q-table>

    <EditCreateProjectVersionDialog
      v-model="project_version_create_dialog"
      :project_id="project_id"
      @onCreated="on_project_version_created"
    ></EditCreateProjectVersionDialog>

    <EditCreateProjectVersionDialog
      v-model="project_version_edit_dialog"
      title="Edit Project Version"
      :project_id="project_id"
      :project_version_id="active_item ? active_item.id : null"
      @onCreated="on_project_version_created"
    ></EditCreateProjectVersionDialog>

    <DeleteConfirmationDialog
      v-model="project_delete_dialog"
      title="Delete Project Verson"
      :ondelete="on_project_version_delete"
    >
      <template v-slot:message>
        Are you sure you want to delete
        <strong>{{ active_item.name }}</strong>
        from {{ project_name }} project.
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";
import EditCreateProjectVersionDialog from "components/dialogs/EditCreateProjectVersionDialog.vue";

const columns = [
  { name: "name", label: "Project Version", field: "name" },
  { name: "action", label: "Action", field: "id" },
  { name: "boms_count", label: "BOMs", field: "boms" },
  { name: "assembly_count", label: "Assemblies", field: "assembly" },
  { name: "creation", label: "Creation date", field: "creation_date" },
];

export default {
  setup() {
    const route = useRoute();
    const project_id = Number(route.params.id);
    const project_name = ref();
    const project_description = ref();
    const project_creation_date = ref();
    const expanded = ref();
    const rows = ref([]);
    const filter = ref();
    const active_item = ref();

    const project_delete_dialog = ref();
    const project_version_create_dialog = ref();
    const project_version_edit_dialog = ref();

    function load_project() {
      api.get(`/api/project/${project_id}`).then((response) => {
        project_name.value = response.data.name;
        project_description.value = response.data.description;
        project_creation_date.value = response.data.creation_date;
        rows.value = response.data.projectversion_set;
      });
    }

    function show_delete_confirmation_dialog(row) {
      active_item.value = row;
      project_delete_dialog.value = true;
    }

    function show_project_version_edit_dialog(row) {
      active_item.value = row;
      project_version_edit_dialog.value = true;
    }

    function on_project_version_delete() {
      api
        .delete(`api/project-version/${active_item.value.id}`)
        .then((response) => {
          load_project();
          project_delete_dialog.value = false;
        });
    }

    function on_project_version_created() {
      project_version_create_dialog.value = false;
      load_project();
    }

    onMounted(() => {
      load_project();
    });

    return {
      project_id,
      project_name,
      project_description,
      project_creation_date,

      expanded,
      columns,
      rows,
      filter,

      active_item,

      project_delete_dialog,
      show_delete_confirmation_dialog,
      on_project_version_delete,

      project_version_create_dialog,
      on_project_version_created,

      project_version_edit_dialog,
      show_project_version_edit_dialog,
    };
  },
  components: {
    DeleteConfirmationDialog,
    EditCreateProjectVersionDialog,
  },
};
</script>
