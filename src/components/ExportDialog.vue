<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw" :loading="loading">
      <q-card-section>
        <div class="text-h6">Export</div>
      </q-card-section>

      <q-separator />

      <q-card-section style="max-height: 60vh" class="scroll">
        <q-select
          v-model="exporter"
          option-label="name"
          :options="exporter_options"
          filled
          label="Exporter"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn
          flat
          label="Export"
          color="primary"
          type="submit"
          @click="onexport"
        />
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { backendURL } from "src/boot/backend";

const exporter_options = [
  { name: "All", url: backendURL + "/export" },
  { name: "Distributors", url: backendURL + "/distributors/export" },
  { name: "Inventory", url: backendURL + "/inventory/export" },
  { name: "Invoices", url: backendURL + "/invoices/export" },
  { name: "Manufacturers", url: backendURL + "/manufacturers/export" },
];

export default defineComponent({
  name: "ExportDialog",
  props: {},
  setup(props) {
    const exporter = ref();
    const loading = ref(false);

    function onexport() {
      loading.value = true;
      document.location.href = exporter.value.url;
      loading.value = false;
    }

    return {
      exporter,
      exporter_options,
      loading,

      onexport,
    };
  },
});
</script>
