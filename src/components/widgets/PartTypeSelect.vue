<template>
  <q-select
    @before-show="load_initial_data"
    v-model="partType"
    option-label="display_name"
    :options="filtered_set"
    @filter="filter_manufacturers_select"
    use-input
    fill-input
    hide-selected
    clearable
    label="Part Type"
  />
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "PartTypeSelect",
  setup() {
    const partType = ref();
    const all_options_set = ref([]);
    const filtered_set = ref();

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
            (v) => v.display_name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    function filter_manufacturers_select(val, update, abort) {
      return filterFn(val, update, abort, filtered_set, all_options_set.value);
    }

    function load_initial_data() {
      if (all_options_set.value.length == 0) {
        api.options("/api/part/resistors/?pageSize=1000").then((response) => {
          all_options_set.value = response.data.actions.POST.part_type.choices;
        });
      }
    }

    onMounted(() => {
      load_initial_data();
    });

    return {
      partType,
      filtered_set,

      load_initial_data,
      filter_manufacturers_select,
    };
  },
});
</script>
