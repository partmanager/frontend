<template>
  <q-input
    ref="inputRef"
    :model-value="props.modelValue"
    mask="####-##-##"
    @update:modelValue="(newValue) => $emit('update:modelValue', newValue)"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            :model-value="props.modelValue"
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
      </q-icon>
    </template>
  </q-input>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "DateInputWidget",
  props: { modelValue: { type: String, default: null } },
  setup(props) {
    const inputRef = ref(null);
    return { props, inputRef };
  },
  methods: {
    validate() {
      return this.$refs.inputRef.validate();
    },
  },
});
</script>
