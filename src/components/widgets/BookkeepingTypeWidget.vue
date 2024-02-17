<template>
  <q-select
    label="Bookkeeping type"
    hint="Bookkeeping type"
    v-model="bookkeping_type"
    option-label="label"
    :options="bookkeping_type_options"
    @filter="filter_bookkeping_type_select"
    use-input
    fill-input
    hide-selected
    dense
    filled
  />
</template>

<script>
import { ref, defineComponent } from "vue";

const all_bookkeping_type_set = [
  { label: "Track this item", value: "k" },
  { label: "private use, don't track", value: "p" },
];

export default defineComponent({
  setup() {
    const bookkeping_type = ref();
    const bookkeping_type_options = ref(all_bookkeping_type_set);

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
      bookkeping_type,
      bookkeping_type_options,

      filter_bookkeping_type_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          bookkeping_type_options,
          all_bookkeping_type_set
        );
      },
    };
  },
});
</script>
