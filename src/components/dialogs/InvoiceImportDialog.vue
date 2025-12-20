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
        <q-card-section>
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

        <q-card-section>
          <q-input
            name="invoice_date"
            filled
            v-model="date"
            mask="date"
            :rules="['date']"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="date">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-section>
          <q-file
            name="file"
            filled
            v-model="invoice_importer_file"
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

export default {
  name: "InvoiceImportDialog",
  components: {},
  props: {},
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const invoice_distributor_options = ref(get_distributor_set());

    return {
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
