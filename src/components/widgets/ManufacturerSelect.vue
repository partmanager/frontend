<template>
  <q-select
    @before-show="load_initial_data"
    v-model="manufacturer_model"
    option-label="name"
    :options="filtered_manufacturer_set"
    @filter="filter_manufacturers_select"
    use-input
    fill-input
    hide-selected
    clearable
    filled
    class="col-3"
    label="Manufacturer"
  />
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "ManufacturerSelect",
  setup() {
    const manufacturer_model = ref();
    const manufacturer_set = ref([]);
    const filtered_manufacturer_set = ref();

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

    function filter_manufacturers_select(val, update, abort) {
      return filterFn(
        val,
        update,
        abort,
        filtered_manufacturer_set,
        manufacturer_set.value
      );
    }

    function load_initial_data() {
      if (manufacturer_set.value.length == 0) {
        api.get("api/manufacturer").then((response) => {
          manufacturer_set.value = response.data;
        });
      }
    }

    onMounted(() => {
      load_initial_data();
    });

    return {
      manufacturer_model,
      filtered_manufacturer_set,

      load_initial_data,
      filter_manufacturers_select,
    };
  },
  created() {
    this.$watch(
      () => this.$props.initial_manufacturer_id,
      (toParams, previousParams) => {
        this.load_initial_data();
      }
    );
  },
});
</script>
