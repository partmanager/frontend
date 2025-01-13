<template>
  <q-dialog>
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

      <q-card-section
        ><q-input
          v-model="description"
          dense
          filled
          type="textarea"
          label="description"
          hint="New project version descrption"
      /></q-card-section>

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
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

export default {
  name: "CreateProjectVersionDialog",
  props: {
    project_id: {
      type: Number,
      required: true,
    },
  },
  emits: ["onCreated"],
  setup(props, ctx) {
    const $q = useQuasar();
    const new_project_version_name = ref();
    const description = ref();

    function create_project_version_validate_and_submit() {
      const data = {
        project: props.project_id,
        name: new_project_version_name.value,
      };
      if (description.value) {
        data.description = description.value;
      }
      api
        .post("/api/project-version/", data)
        .then((response) => {
          new_project_version_name.value = "";
          description.value = null;
          $q.notify({
            color: "positive",
            message: `Project Version ${response.data.name} created`,
          });
          ctx.emit("onCreated");
        })
        .catch(() => {
          $q.notify({
            color: "negative",
            position: "top",
            message: "Unable to create project version",
            icon: "report_problem",
          });
        });
    }

    return {
      new_project_version_name,
      description,
      create_project_version_validate_and_submit,
    };
  },
};
</script>
