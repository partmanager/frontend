<template>
  <q-select
    label="Storage Location"
    v-model="storage_location"
    option-label="location"
    :options="storage_location_options"
    @filter="filter_storage_location_select"
    use-input
    fill-input
    hide-selected
    filled
  />
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "StorageLocationSelect",
  setup() {
    const storage_location = ref();
    const all_storage_location_set = ref([]);
    const storage_location_options = ref();

    function load_distributors() {
      if (all_storage_location_set.value.length == 0) {
        api.get("/api/storage_location/").then((response) => {
          all_storage_location_set.value = response.data;
        });
      }
    }

    onMounted(() => {
      load_distributors();
    });

    function filterFn(
      val,
      update,
      abort,
      filtered_options,
      all_available_options
    ) {
      update(() => {
        if (val === "") {
          filtered_options.value = all_available_options;
        } else {
          const needle = val.toLowerCase();
          filtered_options.value = all_available_options.filter(
            (v) => v.location.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    return {
      storage_location,
      storage_location_options,

      filter_storage_location_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          storage_location_options,
          all_storage_location_set.value
        );
      },
    };
  },
});
</script>
