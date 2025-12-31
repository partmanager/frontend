<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">Invoice Import</div>
      </q-card-section>

      <q-form
        :action="backendURL + '/api/invoiceImport'"
        method="post"
        enctype="multipart/form-data"
        class="q-gutter-md"
      >
        <q-card-section>
          <q-select
            name="importer"
            filled
            v-model="invoice_importer_importer"
            :options="invoice_importer_options"
            label="Importer"
          />
        </q-card-section>
        <q-card-section
          v-if="invoice_importer_importer == 'Generic CSV file importer'"
        >
          <q-select
            name="distributor"
            filled
            v-model="invoice_distributor"
            :options="invoice_distributor_options"
            option-label="name"
            option-value="name"
            label="Distributor"
          />
        </q-card-section>

        <q-card-section
          v-if="invoice_importer_importer == 'Generic CSV file importer'"
        >
          <DateInputWidget
            ref="dateRef"
            v-model="date"
            filled
          ></DateInputWidget>
        </q-card-section>

        <q-card-section>
          <q-file
            ref="fileRef"
            v-model="file"
            name="file"
            filled
            label="Invoice file"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Import" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { backendURL } from "src/boot/backend";
import { get_distributor_set } from "src/boot/distributor_set";
import DateInputWidget from "src/components/widgets/DateInputWidget.vue";

export default {
  name: "InvoiceImportDialog",
  components: { DateInputWidget },
  props: {},
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const fileRef = ref(null);
    const dateRef = ref(null);

    const file = ref();
    const date = ref(null);
    const invoice_distributor_options = ref(get_distributor_set());

    return {
      fileRef,
      dateRef,

      file,
      date,

      backendURL,
      invoice_importer_importer: ref(),
      invoice_importer_options: [
        "Archive importer",
        "TME CSV file importer",
        "Generic CSV file importer",
      ],

      invoice_distributor: ref(),
      invoice_distributor_options,
    };
  },
};
</script>
