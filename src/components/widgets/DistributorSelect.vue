<template>
  <q-select
    label="Distributor"
    v-model="distributor"
    option-label="name"
    :options="distributor_options"
    @filter="filter_distributors_select"
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
  name: "DistributorSelect",
  setup() {
    const distributor = ref();
    const all_distributor_set = ref([]);
    const distributor_options = ref();

    function load_distributors() {
      if (all_distributor_set.value.length == 0) {
        api.get("/api/distributor/").then((response) => {
          all_distributor_set.value = response.data;
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
            (v) => v.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    return {
      distributor,
      distributor_options,

      filter_distributors_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          distributor_options,
          all_distributor_set.value
        );
      },
    };
  },
});
</script>
