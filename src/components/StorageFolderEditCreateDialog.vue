<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="storage_folder_name"
          label="Name"
          hint="Storage Location Name"
          filled
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
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "StorageFolderEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    storage_folder_initial_data: {
      type: Object,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const storage_folder_name = ref();

    function validate_and_submit() {
      api_create_storage_folder(storage_folder_name);
    }

    function api_create_storage_folder(folder_name) {
      const data = {
        name: folder_name.value,
      };
      api.post("api/storage_location_folder/", data).then((response) => {
        props.onsave(folder_name.value);
      });
    }

    return {
      storage_folder_name,

      validate_and_submit,
    };
  },
});
</script>
