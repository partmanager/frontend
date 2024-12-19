<template>
  <q-dialog @before-show="assembly_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-form>
        <q-input
          v-model="assembly.name"
          filled
          label="Name"
          hint="Assembly name"
        />
        <q-input
          v-model="assembly.description"
          filled
          label="Description"
          hint="Description"
        />
        <q-input
          v-model="assembly.contractor"
          filled
          label="Assembly contractor"
          hint="Assembly contractor"
        />
        <q-input
          v-model="assembly.quantity"
          filled
          type="number"
          label="Quantity"
          hint="Quantity"
        />
      </q-form>

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
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "AssemblyEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    assembly_initial_id: {
      type: Number,
    },
    project_version_id: {
      type: Number,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const assembly = ref({
      name: null,
      description: null,
      contractor: null,
      quantity: null,
    });

    function validate_and_submit() {
      const data = {
        name: assembly.value.name,
        quantity: assembly.value.quantity,
        contractor: assembly.value.contractor,
        description: assembly.value.description,
        project_version: props.project_version_id,
      };
      if (props.assembly_initial_id) {
        api
          .put(`/api/assembly-job/${props.assembly_initial_id}/`, data)
          .finally(() => {
            props.onsave();
          });
      } else {
        api
          .post(`/api/assembly-job/`, data)
          .then((response) => {
            $q.notify({
              color: "positive",
              message: `Assembly Job ${response.data.name} created`,
            });
          })
          .finally(() => {
            props.onsave();
          });
      }
    }

    function assembly_edit_load_data() {
      if (props.assembly_initial_id) {
        api
          .get(`/api/assembly-job/${props.assembly_initial_id}/`)
          .then((response) => {
            assembly.value.name = response.data.name;
            assembly.value.description = response.data.description;
            assembly.value.quantity = response.data.quantity;
          });
      }
    }

    return {
      assembly,
      validate_and_submit,
      assembly_edit_load_data,
    };
  },
});
</script>
