<template>
  <q-dialog @before-show="load_initial_data">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ props.title }}</div>
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
          @click="validate_and_submit()"
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
  name: "CreateProjectDialog",
  props: {
    project_id: {
      type: Number,
    },
    title: {
      type: String,
      default: "Create Project",
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const new_project_name = ref();
    const description = ref();
    const $q = useQuasar();

    function load_initial_data() {
      if (props.project_id) {
        api.get(`/api/project/${props.project_id}/`).then((response) => {
          new_project_name.value = response.data.name;
          description.value = response.data.description;
        });
      }
    }

    function validate_and_submit() {
      const data = {
        name: new_project_name.value,
        description: description.value,
      };

      if (props.project_id) {
        edit_project(data);
      } else {
        create_project(data);
      }
    }

    function edit_project(validated_data) {
      api
        .put(`/api/project/${props.project_id}/`, validated_data)
        .then((response) => {
          new_project_name.value = "";
          $q.notify({
            color: "positive",
            message: `Project ${response.data.name} updated`,
          });
          ctx.emit("onUpdated");
        })
        .catch(() => {
          $q.notify({
            color: "negative",
            position: "top",
            message: "Unable to update project",
            icon: "report_problem",
          });
        });
    }

    function create_project(validated_data) {
      api
        .post("/api/project/", validated_data)
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
      props,
      new_project_name,
      description,
      validate_and_submit,
      load_initial_data,
    };
  },
};
</script>
