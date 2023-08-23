<template>
  <q-table
    :rows="rows"
    :columns="[
      {
        name: 'version',
        label: 'Distributor specific manufacturer name',
        align: 'left',
        field: 'manufacturer_name_text',
      },
      {
        name: 'date',
        label: 'Distributor specific order number',
        align: 'left',
        field: 'distributor_order_number_text',
      },
      {
        name: 'user',
        label: 'Manufacturer Order Number',
        align: 'left',
        field: 'manufacturer_order_number_text',
      },
      {
        name: 'stock',
        label: 'Assigned Manufacturer Order Number',
        align: 'left',
        field: 'manufacturer_order_number_mon',
      },
      { name: 'action', label: 'Action', align: 'left', field: 'id' },
    ]"
    :loading="loading"
    :filter="filter"
  >
    <template v-slot:top-right>
      <q-space />
      <q-input
        borderless
        dense
        debounce="300"
        v-model="filter"
        placeholder="Search"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>

    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <div>
          <q-btn
            padding="xs"
            color="primary"
            icon="edit"
            title="Edit"
            @click="show_don_edit_dialog(props.row)"
          />
          <q-btn
            padding="xs"
            color="red"
            icon="delete"
            title="Delete"
            @click="show_delete_confirmation_dialog(props.row)"
          />
        </div>
      </q-td>
    </template>
  </q-table>

  <DistributorOrderNumberConversionEditCreateDialog
    v-model="don_edit_dialog"
    :title="'Edit Distributor Order Number'"
    :edit_id="distributor_specific_order_number_id"
  >
  </DistributorOrderNumberConversionEditCreateDialog>

  <DeleteConfirmationDialog
    v-model="delete_confirmation_dialog"
    :title="'Delete manufacturer name conversion from Distributor'"
    :ondelete="onManufacturerNameConversionDelete"
  >
    <template v-slot:message>
      Are you sure you want to delete
      <strong>{{ distributor_specyfic_manufacturer_order_number }}</strong>
      manufacturer order number convesion from
      <strong>{{ distributor_name }}</strong
      >?
    </template>
  </DeleteConfirmationDialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog.vue";
import DistributorOrderNumberConversionEditCreateDialog from "./DistributorOrderNumberConversionEditCreateDialog.vue";

const filter = ref("a");

export default defineComponent({
  name: "DistributorOrderNumberTable",
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    rows: {
      type: Array,
    },
    distributor_name: {
      type: String,
    },
  },
  setup(props) {
    const delete_confirmation_dialog = ref();
    const don_edit_dialog = ref();
    const distributor_specyfic_manufacturer_order_number = ref();
    const distributor_specific_order_number_id = ref();

    function show_don_edit_dialog(row) {
      distributor_specific_order_number_id.value = row.id;
      don_edit_dialog.value = true;
    }

    function show_delete_confirmation_dialog(row) {
      distributor_specyfic_manufacturer_order_number.value =
        row.distributor_order_number_text;
      delete_confirmation_dialog.value = true;
    }

    return {
      filter,
      delete_confirmation_dialog,
      don_edit_dialog,
      distributor_specyfic_manufacturer_order_number,
      distributor_specific_order_number_id,
      show_don_edit_dialog,
      show_delete_confirmation_dialog,
    };
  },
  components: {
    DeleteConfirmationDialog,
    DistributorOrderNumberConversionEditCreateDialog,
  },
});
</script>
