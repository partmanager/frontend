<template>
  <q-dialog
    ><q-card>
      <q-card-section>
        <div class="text-h6">Part quantity reservation</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model.number="quantity"
          type="number"
          :min="props.min_qty"
          :max="props.inventory_item.stock"
        />
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup @click="$emit('onCancel')" />
        <q-btn
          flat
          label="Reserv"
          color="primary"
          type="submit"
          @click="validate_and_submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "InventoryItemQtyReservationDialog",
  props: {
    inventory_item: {
      type: Object,
      required: true,
    },
    min_qty: {
      type: Number,
      required: true,
    },
    assembly: {
      type: Object,
      required: true,
    },
  },
  emits: ["onCreated", "onUpdated", "onCancel"],
  setup(props, ctx) {
    const quantity = ref(props.min_qty);

    function validate_and_submit() {
      ctx.emit("onCreated", quantity.value);
    }

    return {
      props,
      quantity,

      validate_and_submit,
    };
  },
});
</script>
