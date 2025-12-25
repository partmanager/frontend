<template>
  <q-dialog @before-show="load_initial_data">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-sm">
        <q-file
          ref="fileRef"
          v-model="file"
          label="File"
          clearable
          filled
          dense
        />

        <q-input
          ref="descriptionRef"
          v-model="description"
          type="textarea"
          filled
          autogrow
          label="Description"
        />

        <q-input v-model="note" type="textarea" filled autogrow label="Note" />
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="on_save()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import {
  api_invoice_attachment_create,
  api_invoice_attachment_update,
} from "boot/invoices_api.js";

export default {
  name: "FileEditCreateDialog",
  components: {},
  props: {
    title: {
      type: String,
      default: "Payment Confirmation",
    },
    invoice_id: {
      type: Number,
    },
    attachment_id: {
      type: Number,
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const fileRef = ref(null);
    const descriptionRef = ref(null);

    const file = ref();
    const description = ref();
    const note = ref(null);
    const loading = ref(false);

    function validate() {
      let valid = true;
      valid &= fileRef.value.validate();
      valid &= descriptionRef.value.validate();
      return valid;
    }

    function on_save() {
      if (props.attachment_id) {
        validate_and_update(props.attachment_id);
      } else {
        validate_and_create();
      }
    }

    function validate_and_create() {
      if (validate()) {
        const formData = fields_to_form_data();
        api_invoice_attachment_create(formData).finally(() => {
          ctx.emit("onCreated");
        });
      }
    }

    function validate_and_update(id) {
      if (validate()) {
        const formData = fields_to_form_data();
        api_invoice_attachment_update(id, formData).finally(() => {
          ctx.emit("onUpdated");
        });
      }
    }

    function fields_to_form_data() {
      let formData = new FormData();
      formData.append("invoice", props.invoice_id);
      if (file.value) {
        formData.append("attachment", file.value);
      }
      formData.append("description", description.value);
      formData.append("note", note.value);
      return formData;
    }

    function load_initial_data() {
      load_file();
    }

    function load_file() {
      if (props.attachment_id) {
        loading.value = true;
        api
          .get(`/api/invoice/attachment/${props.attachment_id}/`)
          .then((response) => {
            if (response.data.attachment) {
              file.value = new File([], response.data.attachment);
            } else {
              file.value = null;
            }

            description.value = response.data.description;
            note.value = response.data.note;
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    return {
      fileRef,
      descriptionRef,

      file,
      description,
      note,

      load_initial_data,

      on_save,
    };
  },
};
</script>
