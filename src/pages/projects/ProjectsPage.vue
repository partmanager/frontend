<template>
  <div class="q-pa-md">
    <q-table
      title="Projects"
      :columns="columns"
      :rows="rows"
      :wrap-cells="true"
    >
      <template v-slot:top>
        <div class="q-pa-md q-gutter-sm">
          <div class="q-table__title">Projects</div>
          <q-btn
            color="primary"
            label="Create"
            title="Create project"
            @click="project_create_dialog = true"
          />
          <q-btn
            color="primary"
            label="Import"
            @click="projects_import_dialog = true"
          />
          <q-btn color="primary" label="Export" />
        </div>
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
              @click="show_project_edit_dialog(props.row)"
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

    <q-dialog v-model="project_create_dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create Project</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="new_project_name"
            autofocus
            @keyup.enter="prompt = false"
            label="Project name"
            hint="New project name"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            type="submit"
            @click="create_project_validate_and_submit()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import DeleteConfirmationDialog from "components/DeleteConfirmationDialog.vue";

const columns = [
  { name: "name", label: "Project Name", field: "name" },
  { name: "action", label: "Action", field: "id" },
  { name: "creation", label: "Creation date", field: "creation" },
];

export default {
  setup() {
    const rows = ref();
    const project_create_dialog = ref();
    const project_delete_dialog = ref();
    const projects_import_dialog = ref();
    const new_project_name = ref();
    const active_item = ref();

    function load_projects() {
      api.get("/api/project").then((response) => {
        rows.value = response.data;
      });
    }

    function show_delete_confirmation_dialog(row) {
      active_item.value = row;
      project_delete_dialog.value = true;
    }

    function create_project_validate_and_submit() {
      const data = { name: new_project_name.value };
      api
        .post("/api/project/", data)
        .then((response) => {
          load_projects();
          new_project_name.value = "";
        })
        .finally(() => {
          project_create_dialog.value = false;
        });
    }

    function on_project_delete() {
      api.delete(`api/project/${active_item.value.id}`).then((response) => {
        load_projects();
        project_delete_dialog.value = false;
      });
    }

    onMounted(() => {
      load_projects();
    });

    return {
      columns,
      rows,
      active_item,
      projects_import_dialog,

      project_create_dialog,
      new_project_name,
      create_project_validate_and_submit,

      project_delete_dialog,
      show_delete_confirmation_dialog,
      on_project_delete,
    };
  },
  components: {
    DeleteConfirmationDialog,
  },
};
</script>
