<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">BOM Import</div>
      </q-card-section>

      <q-separator />

      <q-form>
        <q-input v-model="bom.name" filled label="Name" hint="BOM name" />
        <q-input
          v-model="bom.quantity"
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

        <q-file
          v-model="bom.file"
          filled
          label="BOM file"
          hint="BOM file"
          dense
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

export default defineComponent({
  name: "BOMImportDialog",
  props: {
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
      file: "",
    });

    function build_form_data() {
      const data = {
        name: bom.value.name,
        multiplity: bom.value.quantity,
        description: bom.value.description,
        project: props.project_id,
        file: bom.value.file,
      };
      let formData = new FormData();

      formData.append("bom_file", data.file);
      formData.append("name", data.name);
      formData.append("multiply", data.multiplity);
      formData.append("description", data.description);
      formData.append("project", data.project);
      return formData;
    }

    function validate_and_submit() {
      const formData = build_form_data();
      api
        .post("/api/bom-import/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {})
        .finally(() => {
          props.onsave();
        });
    }

    return {
      bom,
      validate_and_submit,
    };
  },
});
</script>
