<template>
  <q-card>
    <q-card-section>
      <div class="text-subtitle2">{{ props.title }}</div>
    </q-card-section>

    <q-separator inset />

    <q-card-section
      >From
      <DateInputWidget v-model="dateRange.from" dense></DateInputWidget>
    </q-card-section>

    <q-card-section
      >To
      <DateInputWidget v-model="dateRange.to" dense></DateInputWidget>
    </q-card-section>
  </q-card>
</template>

<script>
import { ref, defineComponent, watch } from "vue";
import DateInputWidget from "./DateInputWidget.vue";

export default defineComponent({
  name: "DateRangeCard",
  components: { DateInputWidget },
  props: { title: { type: String, default: "Date Range" } },
  emits: ["on_change", "date-range"],
  setup(props, { emit }) {
    const dateRange = ref({ from: null, to: null });

    watch(dateRange.value, (current, previous) => {
      emit("date-range", {
        from: dateRange.value.from,
        to: dateRange.value.to,
      });
    });

    return { props, dateRange };
  },
});
</script>
