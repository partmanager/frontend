<template>
  <q-select
    @before-show="load_initial_data"
    v-model="manufacturer"
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
import { get_manufacturer_set } from "src/boot/manufacturer_api";

export default defineComponent({
  name: "ManufacturerSelect",
  props: {
    initial_manufacturer_name: {
      type: String,
    },
  },
  setup(props) {
    const manufacturer = ref();
    const manufacturer_set = ref(get_manufacturer_set());
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
      if (props.initial_manufacturer_name) {
        const needle = props.initial_manufacturer_name.toLowerCase();
        filtered_manufacturer_set.value = manufacturer_set.value.filter(
          (v) => v.name.toLowerCase().indexOf(needle) > -1
        );

        //filtered_manufacturer_set;
        //filter_manufacturers_select(props.initial_manufacturer_name);
        //manufacturer.value = props.initial_manufacturer_name;
      }
    }

    onMounted(() => {
      load_initial_data();
    });

    return {
      manufacturer,
      filtered_manufacturer_set,

      load_initial_data,
      filter_manufacturers_select,
    };
  },
});
</script>
