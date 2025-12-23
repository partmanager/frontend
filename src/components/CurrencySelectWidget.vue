<template>
  <q-select
    ref="currencySelectRef"
    v-model="currency_model"
    label="Currency"
    hint="Currency"
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
    const currencySelectRef = ref(null);
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
      currencySelectRef,
      currency_model,
      currency_options,

      filter_currency_select(val, update, abort) {
        return filterFn(val, update, abort, currency_options, all_currency_set);
      },
    };
  },
  methods: {
    validate() {
      return this.$refs.currencySelectRef.validate();
    },
  },
});
</script>
