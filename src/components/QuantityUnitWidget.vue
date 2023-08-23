<template>
  <q-select
    label="Quantity Unit"
    hint="Quantity Unit"
    v-model="quantity_unit"
    option-label="label"
    :options="quantity_unit_options"
    @filter="filter_quantity_unit_select"
    use-input
    fill-input
    hide-selected
    clearable
    dense
    filled
  />
</template>

<script>
import { ref, defineComponent } from "vue";

const all_quantity_units_set = [
  { label: "pcs", value: 1 },
  { label: "kg", value: 2 },
  { label: "m", value: 3 },
];

export default defineComponent({
  setup() {
    const quantity_unit = ref();
    const quantity_unit_options = ref(all_quantity_units_set);

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
            (v) => v.label.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    return {
      quantity_unit,
      quantity_unit_options,

      filter_quantity_unit_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          quantity_unit_options,
          all_quantity_units_set
        );
      },
    };
  },
});
</script>
