<template>
  <div class="q-pa-md">
    <div class="col">
      <InvoiceItemsFilterCard
        v-model="filters"
        class="row"
        @on_change="on_filters_update"
      ></InvoiceItemsFilterCard>

      <InvoiceItemsTable
        ref="tableRef"
        v-model="itemsTable"
        v-model:visibleColumns="
          users_store.$state.settings.invoices.invoiceItemsPage.visibleColumns
        "
        class="row"
        :filters="filters"
        wrap-cells
      ></InvoiceItemsTable>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import InvoiceItemsTable from "components/widgets/InvoiceItemsTable.vue";
import InvoiceItemsFilterCard from "components/widgets/InvoiceItemsFilterCard.vue";
import { useUsersStore } from "stores/users";

export default {
  components: { InvoiceItemsTable, InvoiceItemsFilterCard },
  setup() {
    const tableRef = ref();
    const itemsTable = ref();
    const filters = ref();
    const users_store = useUsersStore();

    function on_filters_update(new_filter) {
      filters.value = new_filter;
    }

    return {
      tableRef,

      itemsTable,
      filters,

      on_filters_update,

      users_store,
    };
  },
};
</script>
