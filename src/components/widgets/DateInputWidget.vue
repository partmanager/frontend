<template>
  <q-input
    filled
    v-model="date"
    @update:modelValue="(newValue) => $emit('update:modelValue', newValue)"
    ><template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="date"
            mask="YYYY-MM-DD"
            @update:modelValue="
              (newValue) => $emit('update:modelValue', newValue)
            "
          >
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon> </template
  ></q-input>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "DateInputWidget",
  setup(props) {
    const date = ref();
    return { date };
  },
});
</script>
