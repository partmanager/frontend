<template>
  <q-table
    title="Distributor Order Numbers"
    :rows="distributor_order_numbers"
    :columns="[
      {
        name: 'distributor_spec_manufacturer_name',
        label: 'Distributor specific manufacturer name',
        align: 'left',
        field: 'manufacturer_name',
      },
      {
        name: 'don',
        label: 'Distributor specific order number',
        align: 'left',
        field: 'don',
      },
      {
        name: 'mon',
        label: 'Manufacturer Order Number',
        align: 'left',
        field: 'mon',
      },
      {
        name: 'mon_map',
        label: 'Assigned Manufacturer Order Number',
        align: 'left',
        field: 'manufacturer_order_number_mon',
      },
      { name: 'action', label: 'Action', align: 'left', field: 'id' },
    ]"
    v-model:pagination="don_pagination"
    :filter="don_filter"
    :loading="don_loading"
    @request="request_distributor_order_numbers_list"
  >
    <template v-slot:top>
      <div class="q-pa-md q-gutter-sm">
        <div class="q-table__title">Distributor Order Numbers</div>
        <q-btn
          color="primary"
          label="Add"
          title="Add distributor order number"
          @click="don_create_dialog = true"
        />
        <q-btn color="primary" label="Import" disabled />
        <q-btn color="primary" label="Export" disabled />
      </div>
      <q-space />
      <q-input
        borderless
        dense
        debounce="300"
        v-model="don_filter"
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
    v-model="don_create_dialog"
    :title="'Create Distributor Order Number'"
    :distributor_id="distributor_id"
    :onsave="on_DON_create_dialog"
  >
  </DistributorOrderNumberConversionEditCreateDialog>

  <DistributorOrderNumberConversionEditCreateDialog
    v-model="don_edit_dialog"
    :title="'Edit Distributor Order Number'"
    :edit_id="distributor_specific_order_number_id"
  >
  </DistributorOrderNumberConversionEditCreateDialog>

  <DeleteConfirmationDialog
    v-model="delete_confirmation_dialog"
    :title="'Delete distributor order number from Distributor'"
    :ondelete="onDistributorOrderNumberDelete"
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
import { ref, defineComponent, onMounted } from "vue";
import { api } from "boot/axios";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog.vue";
import DistributorOrderNumberConversionEditCreateDialog from "./DistributorOrderNumberConversionEditCreateDialog.vue";

export default defineComponent({
  name: "DistributorOrderNumberTable",
  props: {
    distributor_id: {
      type: Number,
      required: true,
    },
    distributor_name: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const don_table = ref();
    const don_loading = ref(false);
    const distributor_order_numbers = ref([]);
    const don_filter = ref();
    const don_pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 20,
    });

    const don_create_dialog = ref();
    const delete_confirmation_dialog = ref();
    const don_edit_dialog = ref();
    const distributor_specyfic_manufacturer_order_number = ref();
    const distributor_specific_order_number_id = ref();
    const active_id = ref();

    function request_distributor_order_numbers_list(table_props) {
      const { page, rowsPerPage } = table_props.pagination;
      const filter = table_props.filter;
      don_loading.value = true;
      api
        .get("api/distributor-order-number/", {
          params: {
            distributor: props.distributor_id,
            unassigned: true,
            search: filter,
            pageSize: rowsPerPage,
            pageNumber: page,
          },
        })
        .then((response) => {
          don_pagination.value.page = page;
          don_pagination.value.rowsPerPage = rowsPerPage;
          don_pagination.value.rowsNumber = response.data.count;
          distributor_order_numbers.value = response.data.results;
        })
        .finally(() => {
          don_loading.value = false;
        });
    }

    function show_don_edit_dialog(row) {
      distributor_specific_order_number_id.value = row.id;
      don_edit_dialog.value = true;
    }

    function show_delete_confirmation_dialog(row) {
      active_id.value = row.id;
      distributor_specyfic_manufacturer_order_number.value = row.don;
      delete_confirmation_dialog.value = true;
    }

    function on_DON_create_dialog() {
      let props = { pagination: { rowsPerPage: 10, page: 1 }, filter: null };
      request_distributor_order_numbers_list(props);
      don_create_dialog.value = false;
    }

    function onDistributorOrderNumberDelete() {
      api
        .delete(`api/distributor-order-number/${active_id.value}`)
        .then((response) => {
          delete_confirmation_dialog.value = false;
          let props = {
            pagination: { rowsPerPage: 10, page: 1 },
            filter: null,
          };
          request_distributor_order_numbers_list(props);
        });
    }

    onMounted(() => {
      let props = { pagination: { rowsPerPage: 10, page: 1 }, filter: null };
      request_distributor_order_numbers_list(props);
    });

    return {
      don_table,
      distributor_order_numbers,
      don_loading,
      don_filter,
      don_pagination,
      request_distributor_order_numbers_list,

      delete_confirmation_dialog,
      onDistributorOrderNumberDelete,

      don_create_dialog,
      on_DON_create_dialog,

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
