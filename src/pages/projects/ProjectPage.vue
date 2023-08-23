<template>
  <div class="q-pa-md">
    <q-table
      :title="project_name"
      :columns="columns"
      :rows="rows"
      :wrap-cells="true"
    >
      <template v-slot:top>
        <div class="q-pa-md q-gutter-sm">
          <div class="q-table__title">{{ project_name }}</div>
          <q-btn
            color="primary"
            label="Create project version"
            title="Create project version"
            @click="project_version_create_dialog = true"
          />
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

    <q-dialog v-model="project_version_create_dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Create Project Version</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="new_project_version_name"
            autofocus
            @keyup.enter="prompt = false"
            label="Project version name"
            hint="New project version name"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Save"
            color="primary"
            type="submit"
            @click="create_project_version_validate_and_submit()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

const columns = [
  { name: "name", label: "Project Version", field: "name" },
  { name: "action", label: "Action", field: "id" },
  { name: "boms_count", label: "BOMs", field: "boms" },
  { name: "assembly_count", label: "Assemblies", field: "assembly" },
  { name: "creation", label: "Creation date", field: "creation" },
];

export default {
  setup() {
    const route = useRoute();
    const active_id = route.params.id;
    const rows = ref();
    const project_name = ref();
    const project_delete_dialog = ref();
    const active_item = ref();
    const project_version_create_dialog = ref();
    const new_project_version_name = ref();

    function load_project() {
      api.get(`/api/project/${active_id}`).then((response) => {
        project_name.value = response.data.name;
        rows.value = response.data.projectversion_set;
      });
    }

    function show_delete_confirmation_dialog(row) {
      active_item.value = row;
      project_delete_dialog.value = true;
    }

    function create_project_version_validate_and_submit() {
      const data = {
        project: active_id,
        name: new_project_version_name.value,
      };
      api
        .post("/api/project-version/", data)
        .then((response) => {
          load_project();
          new_project_version_name.value = "";
        })
        .finally(() => {
          project_version_create_dialog.value = false;
        });
    }

    function on_project_version_delete() {
      api
        .delete(`api/project-version/${active_item.value.id}`)
        .then((response) => {
          load_project();
          project_delete_dialog.value = false;
        });
    }

    onMounted(() => {
      load_project();
    });

    return {
      columns,
      rows,
      project_name,
      active_item,
      project_delete_dialog,
      show_delete_confirmation_dialog,
      on_project_version_delete,

      project_version_create_dialog,
      new_project_version_name,
      create_project_version_validate_and_submit,
    };
  },
  components: {
    DeleteConfirmationDialog,
  },
};
</script>
