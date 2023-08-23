<template>
  <q-dialog @before-show="bom_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-form>
        <q-input v-model="bom.name" filled label="Name" hint="BOM name" />
        <q-input
          v-model="bom.quantity"
          type="number"
          filled
          label="Quantity"
          hint="BOM quantity"
        />
        <q-input
          v-model="bom.description"
          filled
          label="Description"
          hint="Description"
        />
        <q-input v-model="bom.note" filled label="Note" hint="Note" />
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

export default defineComponent({
  name: "BOMEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    bom_initial_id: {
      type: Number,
    },
    project_id: {
      type: Number,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const bom = ref({
      name: "",
      quantity: "",
      description: "",
      note: "",
    });

    function validate_and_submit() {
      var data = {
        name: bom.value.name,
        multiply: bom.value.quantity,
        description: bom.value.description,
        note: bom.value.note,
      };

      if (props.bom_initial_id) {
        api.put(`/api/bom/${props.bom_initial_id}/`, data).finally(() => {
          props.onsave();
        });
      } else {
        data.project = props.project_id;

        api
          .post(`/api/bom/`, data)
          .then((response) => {})
          .finally(() => {
            props.onsave();
          });
      }
    }

    function bom_edit_load_data() {
      if (props.bom_initial_id) {
        api.get(`/api/bom/${props.bom_initial_id}/`).then((response) => {
          bom.value.name = response.data.name;
          bom.value.quantity = response.data.multiply;
          bom.value.description = response.data.description;
          bom.value.note = response.data.note;
        });
      }
    }

    return {
      bom,
      validate_and_submit,
      bom_edit_load_data,
    };
  },
});
</script>
