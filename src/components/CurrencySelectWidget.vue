<template>
  <q-select
    label="Currency"
    hint="Currency"
    v-model="currency_model"
    option-label="label"
    :options="currency_options"
    @filter="filter_currency_select"
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
import { currency_set } from "src/boot/choices.js";

const all_currency_set = currency_set;

export default defineComponent({
  setup() {
    const currency_model = ref();
    const currency_options = ref();

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
      currency_model,
      currency_options,

      filter_currency_select(val, update, abort) {
        return filterFn(val, update, abort, currency_options, all_currency_set);
      },
    };
  },
});
</script>
