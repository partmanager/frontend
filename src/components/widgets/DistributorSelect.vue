<template>
  <q-select
    ref="selectRef"
    v-model="distributor"
    label="Distributor"
    option-label="name"
    :options="distributor_options"
    @filter="filter_distributors_select"
    use-input
    fill-input
    filled
  />
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "DistributorSelect",
  setup() {
    const selectRef = ref(null);
    const distributor = ref();
    const all_distributor_set = ref([]);
    const distributor_options = ref();

    function load_distributors() {
      if (all_distributor_set.value.length == 0) {
        api.get("/api/distributor/?pageSize=1000").then((response) => {
          all_distributor_set.value = response.data.results;
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
      selectRef,
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
  methods: {
    validate() {
      return this.$refs.selectRef.validate();
    },
  },
});
</script>
