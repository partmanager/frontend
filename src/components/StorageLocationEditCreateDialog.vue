<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="storage_location.name"
          label="Name"
          hint="Storage Location Name"
          filled
        />
        <q-input
          v-model="storage_location.description"
          type="textarea"
          label="Description"
          hint="Description"
          filled
        />
        <q-select
          v-model="storage_location.folder"
          option-label="name"
          :options="filtered_folders_options"
          @filter="folder_filter"
          :selected="storage_location.folder"
          label="Folder"
          filled
          use-input
          fill-input
          hide-selected
          clearable
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
import { ref, onUpdated, defineComponent } from "vue";

export default defineComponent({
  name: "StorageLocationEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    folders: {
      type: Array,
    },
    storage_location_initial_data: {
      type: Object,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    var initial_name = null;
    if (props.storage_location_initial_data) {
      // eslint-disable-next-line
      initial_name = props.storage_location_initial_data.name;
    }
    const folder_select = ref();
    const storage_location = ref({
      name: initial_name,
      description: "",
      folder: null,
    });
    const filtered_folders_options = ref([]);

    function validate_and_submit() {
      props.onsave(storage_location.value);
    }

    function folder_filter(val, update, abort) {
      update(() => {
        if (val === "") {
          filtered_folders_options.value = props.folders;
        } else {
          const needle = val.toLowerCase();
          filtered_folders_options.value = props.folders.value.filter(
            (v) => v.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    onUpdated(() => {
      if (props.storage_location_initial_data) {
        storage_location.value = props.storage_location_initial_data;
      }
    });

    return {
      folder_select,
      storage_location,
      filtered_folders_options,

      folder_filter,
      validate_and_submit,
    };
  },
});
</script>
