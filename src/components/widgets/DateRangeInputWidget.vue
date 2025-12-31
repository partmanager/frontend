<template>
  <q-input filled :model-value="`${dateRange.from} - ${dateRange.to}`"
    ><template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="dateRange"
            range
            @update:modelValue="
              (newValue) =>
                $emit('update:modelValue', `${newValue.from} - ${newValue.to}`)
            "
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "DateRangeInputWidget",
  setup(props) {
    const dateRange = ref({ from: null, to: null });
    return { dateRange };
  },
});
</script>
