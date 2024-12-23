<template>
  <q-dialog
    ><q-card>
      <q-card-section>
        <div class="text-h6">Create Rework</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="name"
          autofocus
          @keyup.enter="prompt = false"
          label="Rework name"
          hint="New rework name"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="description"
          @keyup.enter="prompt = false"
          label="Description"
          hint="Description"
        />
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="create_rework_validate_and_submit()"
        />
      </q-card-actions> </q-card
  ></q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "ReworkEditCreateDialog",
  props: {
    assembly_id: {
      type: Number,
      required: true,
    },
    rework_id: {
      type: Number,
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const name = ref();
    const description = ref();

    function validate_and_submit() {
      const data = {
        assembly: props.assembly_id,
        name: name.value,
        description: description.value,
      };
      if (props.rework_id) {
        api.patch(`/api/rework/${props.rework_id}/`, data).then((response) => {
          ctx.emit("onUpdated", response.data.id);
        });
      } else {
        api.post(`/api/rework/`, data).then((response) => {
          ctx.emit("onCreated", response.data.id);
        });
      }
    }

    function create_rework_validate_and_submit() {
      validate_and_submit();
    }

    return {
      name,
      description,
      create_rework_validate_and_submit,
    };
  },
});
</script>
