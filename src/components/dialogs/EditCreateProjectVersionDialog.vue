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
  name: "CreateProjectVersionDialog",
  props: {
    title: {
      type: String,
      default: "Create Project Version",
    },
    project_id: {
      type: Number,
      required: true,
    },
    project_version_id: {
      type: Number,
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const $q = useQuasar();
    const new_project_version_name = ref();
    const description = ref();

    function load_initial_data() {
      if (props.project_version_id) {
        api
          .get(`/api/project-version/${props.project_version_id}/`)
          .then((response) => {
            new_project_version_name.value = response.data.name;
            description.value = response.data.description;
          });
      } else {
        clear_dialog();
      }
    }

    function validate_and_submit() {
      let data = {
        project: props.project_id,
        name: new_project_version_name.value,
      };
      if (description.value) {
        data.description = description.value;
      }

      if (props.project_version_id) {
        edit_project_version(data);
      } else {
        create_project_version(data);
      }
    }

    function clear_dialog() {
      new_project_version_name.value = "";
      description.value = null;
    }

    function edit_project_version(validated_data) {
      api
        .put(
          `/api/project-version/${props.project_version_id}/`,
          validated_data
        )
        .then((response) => {
          clear_dialog();
          $q.notify({
            color: "positive",
            message: `Project Version ${response.data.name} updated`,
          });
          ctx.emit("onCreated");
        })
        .catch(() => {
          $q.notify({
            color: "negative",
            position: "top",
            message: "Unable to edit project version",
            icon: "report_problem",
          });
        });
    }

    function create_project_version(validated_data) {
      api
        .post("/api/project-version/", validated_data)
        .then((response) => {
          clear_dialog();
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
      props,
      new_project_version_name,
      description,
      load_initial_data,
      validate_and_submit,
    };
  },
};
</script>
