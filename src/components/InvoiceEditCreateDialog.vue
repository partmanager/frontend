<template>
  <q-dialog @before-show="load_invoice_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-input
        v-model="invoice.number"
        filled
        label="Number"
        hint="Invoice number"
        dense
      />

      <q-input filled v-model="date" label="Date" hint="Invoice Date" dense>
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="date" mask="YYYY-MM-DD">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <br />

      <q-input
        filled
        v-model="due_date"
        label="Due date"
        hint="Invoice Due Date"
        dense
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="due_date" mask="YYYY-MM-DD">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <br />

      <q-checkbox v-model="paid" label="Paid" />

      <br />

      <DistributorSelect
        v-model="distributor"
        ref="distributor_ref"
      ></DistributorSelect>
      <br />

      <q-file
        v-model="file"
        filled
        label="Invoice file"
        hint="Invoice file"
        dense
      />

      <q-input
        v-model="note"
        type="textarea"
        filled
        autogrow
        label="Note"
        :value="invoice.note"
      />

      <q-separator />

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
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
import { api } from "boot/axios";
import DistributorSelect from "./widgets/DistributorSelect.vue";

export default defineComponent({
  name: "InvoiceEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    id_to_edit: { type: Number },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const date = ref();
    const due_date = ref();
    const paid = ref();
    const file = ref();
    const note = ref();
    const distributor = ref();
    const invoice = ref({ number: null, date: null, note: null });

    function validate() {
      return true;
    }

    function fields_to_api_form_data() {
      const data = {
        number: invoice.value.number,
        invoice_date: date.value,
        due_date: due_date.value,
        paid: paid.value,
        note: note.value,
        distributor: distributor.value.id,
      };
      let formData = new FormData();
      if (file.value) {
        formData.append("invoice_file", file.value);
      }
      formData.append("number", data.number);
      formData.append("invoice_date", data.invoice_date);
      formData.append("due_date", data.due_date);
      formData.append("paid", data.paid);
      formData.append("note", data.note);
      formData.append("distributor", data.distributor);
      return formData;
    }

    function validate_and_submit() {
      if (validate()) {
        if (props.id_to_edit) {
          const formData = fields_to_api_form_data();
          api
            .put(`/api/invoice/invoice/${props.id_to_edit}/`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {})
            .finally(() => {
              if (props.onsave) {
                props.onsave(invoice);
              }
            });
        } else {
          const formData = fields_to_api_form_data();
          api
            .post(`/api/invoice/invoice`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {})
            .finally(() => {
              if (props.onsave) {
                props.onsave(invoice);
              }
            });
        }
      }
    }

    function load_invoice_data() {
      if (props.id_to_edit) {
        api
          .get(`/api/invoice/invoice/${props.id_to_edit}/`)
          .then((response) => {
            invoice.value.number = response.data.number;
            invoice.value.date = response.data.invoice_date;

            date.value = response.data.invoice_date;
            due_date.value = response.data.due_date;
            paid.value = response.data.paid;
            note.value = response.data.note;

            distributor.value = response.data.distributor;
          });
      }
    }

    return {
      date,
      due_date,
      paid,
      file,
      note,
      distributor,
      invoice,

      load_invoice_data,
      validate_and_submit,
    };
  },
  components: { DistributorSelect },
});
</script>
