<template>
  <div>
    <q-btn
      label="Add Flag"
      :disable="props.flagged"
      color="purple"
      @click="flag_item(true)"
    ></q-btn>
    <q-btn
      label="Remove Flag"
      :disable="!props.flagged"
      color="purple"
      @click="flag_item(false)"
    ></q-btn>
    <q-btn
      label="Archive"
      :disable="props.quantity > 0 || props.archived"
      color="red"
      @click="archive_item(true)"
    ></q-btn>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

export default {
  name: "InventoryItemFlagArchiveButtons",
  props: {
    invoice_item_id: {
      type: Number,
      required: true,
    },
    flagged: {
      type: Boolean,
      required: true,
    },
    archived: {
      type: Boolean,
      required: true,
    },
    quantity: {
      type: Number,
    },
  },
  emits: ["onUpdated"],
  setup(props, ctx) {
    const $q = useQuasar();

    function archive_item(archive_or_remove_archived_flag) {
      api
        .post(`/inventory/api/archive/${props.invoice_item_id}`, null, {
          params: { archive: archive_or_remove_archived_flag },
        })
        .then((response) => {
          if (response.data.status == "OK") {
            $q.notify({
              color: "positive",
              message: `Item successfully archived.`,
            });
            ctx.emit("onUpdated");
          }
        });
    }

    function flag_item(flag_or_unflag) {
      api
        .post(`/inventory/api/flag/${props.invoice_item_id}`, null, {
          params: { flag: flag_or_unflag },
        })
        .then((response) => {
          if (response.data.status == "OK") {
            $q.notify({
              color: "positive",
              message: `Item successfully flaged.`,
            });
            ctx.emit("onUpdated");
          }
        });
    }

    return { props, archive_item, flag_item };
  },
};
</script>
