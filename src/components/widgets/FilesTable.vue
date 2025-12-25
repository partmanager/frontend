<template>
  <div>
    <q-table
      title="Attachments"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      @request="onAttachmentRequest"
    >
      <template v-slot:top>
        <div class="q-gutter-sm row">
          <div class="q-table__title">Attachment</div>
          <q-btn
            color="primary"
            label="Add Attachment"
            title="Add Attachment"
            @click="attachment_create_dialog = true"
          />
        </div>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <div class="q-gutter-sm">
            <q-btn
              padding="xs"
              color="primary"
              icon="info"
              title="Open attachment file"
              :href="props.row.attachment"
              :disable="!props.row.attachment"
            />
            <q-btn
              padding="xs"
              color="primary"
              icon="edit"
              title="Edit"
              @click="editAttachment(props.row)"
            />
            <q-btn
              padding="xs"
              color="red"
              icon="delete"
              title="Delete attachment"
              @click="deleteAttachment(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <FileEditCreateDialog
      v-model="attachment_create_dialog"
      :invoice_id="props.invoice_id"
      @onCreated="onAttachmentCreated"
    ></FileEditCreateDialog>

    <FileEditCreateDialog
      v-if="active_attachment"
      v-model="attachment_edit_dialog"
      :invoice_id="props.invoice_id"
      :attachment_id="active_attachment.id"
      @onUpdated="onAttachmentUpdated"
    ></FileEditCreateDialog>

    <DeleteConfirmationDialog
      v-model="delete_confirmation_dialog"
      title="Delete Attachment"
      :ondelete="api_call_delete_attachment"
    >
      <template v-slot:message>
        Are you sure you want to delete Attachment?
      </template>
    </DeleteConfirmationDialog>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import { api } from "boot/axios";
import { api_invoice_attachment_delete } from "boot/invoices_api.js";
import FileEditCreateDialog from "src/components/dialogs/FileEditCreateDialog.vue";
import DeleteConfirmationDialog from "src/components/DeleteConfirmationDialog.vue";

const columns = [
  {
    name: "file",
    label: "File",
    align: "left",
    field: "attachment",
    sortable: true,
  },
  { name: "action", label: "Action", align: "left" },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
    sortable: true,
  },
  {
    name: "note",
    label: "Note",
    align: "left",
    field: "note",
  },
];

export default defineComponent({
  name: "FilesTable",
  components: { FileEditCreateDialog, DeleteConfirmationDialog },
  props: { invoice_id: { type: Number } },
  setup(props) {
    const rows = ref([]);
    const loading = ref(false);
    const active_attachment = ref();
    const attachment_create_dialog = ref(false);
    const attachment_edit_dialog = ref(false);
    const delete_confirmation_dialog = ref(false);

    function onAttachmentRequest() {
      if (props.invoice_id) {
        loading.value = true;
        api
          .get(
            `/api/invoice/attachment/?invoice=${props.invoice_id}&pageSize=100`
          )
          .then((response) => {
            if (response.data.count > 0) {
              rows.value = response.data.results;
            } else {
              rows.value = [];
            }
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    function onAttachmentCreated() {
      attachment_create_dialog.value = false;
      onAttachmentRequest();
    }

    function editAttachment(row) {
      active_attachment.value = row;
      attachment_edit_dialog.value = true;
    }

    function onAttachmentUpdated() {
      attachment_edit_dialog.value = false;
      onAttachmentRequest();
    }

    function deleteAttachment(row) {
      active_attachment.value = row;
      delete_confirmation_dialog.value = true;
    }

    function api_call_delete_attachment() {
      api_invoice_attachment_delete(active_attachment.value.id).finally(() => {
        delete_confirmation_dialog.value = false;
        onAttachmentRequest();
      });
    }

    onMounted(() => {
      onAttachmentRequest();
    });

    return {
      props,

      columns,
      rows,
      loading,

      active_attachment,
      onAttachmentRequest,

      attachment_create_dialog,
      onAttachmentCreated,

      attachment_edit_dialog,
      editAttachment,
      onAttachmentUpdated,

      delete_confirmation_dialog,
      deleteAttachment,
      api_call_delete_attachment,
    };
  },
});
</script>
