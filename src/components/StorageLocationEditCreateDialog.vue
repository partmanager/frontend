<template>
  <q-dialog @before-show="load_initial_data">
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
import { api } from "boot/axios";

export default defineComponent({
  name: "StorageLocationEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    storage_location_id: {
      type: Number,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const loading = ref();
    const folders = ref();
    const folder_select = ref();
    const storage_location = ref({
      name: "",
      description: "",
      folder: null,
    });
    const filtered_folders_options = ref([]);

    function validate_and_submit() {
      // props.onsave(storage_location.value);
      save_edited_storage_location(storage_location.value);
    }

    function load_initial_data() {
      load_folders_data();
      if (props.storage_location_id) {
        loading.value = true;
        api
          .get(`api/storage_location/${props.storage_location_id}/`)
          .then((response) => {
            storage_location.value.id = response.data.id;
            storage_location.value.name = response.data.location;
            storage_location.value.description = response.data.description;

            storage_location.value.folder = folders.value.find(
              (x) => x.id === response.data.folder
            );
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    function save_edited_storage_location(storage_location) {
      var folder_id = null;

      if (storage_location.folder) {
        folder_id = storage_location.folder.id;
      }
      const data = {
        location: storage_location.name,
        description: storage_location.description,
        folder: folder_id,
      };
      if (props.storage_location_id) {
        api
          .put(`api/storage_location/${storage_location.id}/`, data)
          .then((response) => {})
          .finally(() => {
            props.onsave(storage_location.value);
          });
      } else {
        var new_id = null;
        api
          .post(`api/storage_location/`, data)
          .then((response) => {
            new_id = response.id;
          })
          .finally(() => {
            props.onsave(new_id);
          });
      }
    }

    function load_folders_data() {
      api
        .get("api/storage_location_folder/")
        .then((response) => {
          folders.value = response.data;
        })
        .finally(() => {});
    }

    function folder_filter(val, update, abort) {
      update(() => {
        if (val === "") {
          filtered_folders_options.value = folders.value;
        } else {
          const needle = val.toLowerCase();
          filtered_folders_options.value = folders.value.filter(
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
      load_initial_data,
    };
  },
});
</script>
