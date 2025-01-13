<template>
  <q-dialog>
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
          hint="Project name"
        />
        <q-input
          dense
          type="textarea"
          v-model="description"
          label="Project description"
          hint="Project description"
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
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

export default {
  // name: 'ComponentName',
  emits: ["onCreated"],
  setup(props, ctx) {
    const new_project_name = ref();
    const description = ref();
    const $q = useQuasar();

    function create_project_validate_and_submit() {
      const data = {
        name: new_project_name.value,
        description: description.value,
      };
      api
        .post("/api/project/", data)
        .then((response) => {
          new_project_name.value = "";
          $q.notify({
            color: "positive",
            message: `Project ${response.data.name} created`,
          });
          ctx.emit("onCreated");
        })
        .catch(() => {
          $q.notify({
            color: "negative",
            position: "top",
            message: "Unable to create project",
            icon: "report_problem",
          });
        });
    }

    return {
      new_project_name,
      description,
      create_project_validate_and_submit,
    };
  },
};
</script>
