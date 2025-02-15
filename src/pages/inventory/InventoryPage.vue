<template>
  <div class="q-pa-md">
    <q-table
      class="my-sticky-header-table"
      title="Inventory"
      dense
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
    >
      <template v-slot:top>
        <q-btn
          color="primary"
          :disable="loading"
          label="Add item"
          @click="add_item_dialog = true"
        />
        <q-btn
          color="secondary"
          :disable="loading"
          label="Flag all items"
          @click="flag_all_items"
        />
        <q-space />
        <q-checkbox
          label="Flaged"
          v-model="flagged"
          toggle-indeterminate
          @update:model-value="reload_items()"
        ></q-checkbox>
        <q-checkbox
          label="Archived"
          v-model="archived"
          toggle-indeterminate
          @update:model-value="reload_items()"
        ></q-checkbox>
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

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'remove' : 'add'"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <div v-if="col.name != 'img' && col.name != 'name'">
              {{ col.value }}
            </div>
            <div v-if="col.name == 'name'">
              {{ col.value }}
              <q-space />
              <q-badge
                v-if="!props.row.invoice"
                color="yellow-6"
                text-color="black"
                title="Invoice unassigned."
              >
                <q-icon name="warning" class="q-ml-xs" />
              </q-badge>
              <q-badge
                v-if="!props.row.mon"
                color="red"
                title="Part unassigned."
              >
                <q-icon name="warning" color="white" class="q-ml-xs" />
              </q-badge>
              <q-badge
                v-if="props.row.flagged"
                color="purple"
                title="Part is flagged"
              >
                <q-icon name="warning" color="white" class="q-ml-xs" />
              </q-badge>
            </div>
            <q-img
              v-if="
                col.name == 'img' && col.value && !col.value.endsWith('/None')
              "
              :src="col.value"
              spinner-color="white"
              :ratio="1"
              style="height: 35ph; width: 35px"
            />

            <StockUpdatePopup
              v-if="col.name == 'stock'"
              :stock="props.row.stock"
              :id="props.row.id"
              :onsuccess="
                (value) => {
                  props.row.stock = value;
                }
              "
            >
            </StockUpdatePopup>

            <div v-if="col.name == 'action'">
              <q-btn
                padding="xs"
                color="primary"
                icon="info"
                title="Show part detail information"
                :disabled="!props.row.part"
                @click="
                  {
                    part_detail_dialog_id = props.row.part;
                    part_detail_dialog = true;
                  }
                "
              />
              <q-btn
                padding="xs"
                color="primary"
                icon="edit"
                title="Edit"
                @click="show_edit_dialog(props.row)"
              />
              <q-btn
                padding="xs"
                color="primary"
                icon="history"
                title="Show history"
                @click="show_history(props.row.id)"
              />
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <InventoryTableDetailDiv
              :inventory_data="props.row"
              @onUpdated="reload_items()"
            >
            </InventoryTableDetailDiv>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <InventoryHistory v-model="fixed" :id="history_id"> </InventoryHistory>

    <InventoryItemEditCreateDialog
      v-model="add_item_dialog"
      :manufacturer_set="manufacturer_set"
      :inventory_flat_category_set="inventory_flat_category_set"
      :storage_location_set="storage_location_set"
    >
    </InventoryItemEditCreateDialog>

    <InventoryItemEditCreateDialog
      v-model="edit_item_dialog"
      :isEdit="true"
      :manufacturer_set="manufacturer_set"
      :inventory_flat_category_set="inventory_flat_category_set"
      :storage_location_set="storage_location_set"
      :item_initial_data="edit_item_initial_data"
      :onsave="on_item_edit"
    >
    </InventoryItemEditCreateDialog>

    <PartDetailDialog v-model="part_detail_dialog" :id="part_detail_dialog_id">
    </PartDetailDialog>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";

import InventoryHistory from "components/InventoryHistory.vue";
import StockUpdatePopup from "components/StockUpdatePopup.vue";
import PartDetailDialog from "components/PartDetailDialog.vue";
import InventoryItemEditCreateDialog from "components/InventoryItemEditCreateDialog.vue";
import InventoryTableDetailDiv from "components/InventoryTableDetailDiv.vue";
import {
  format_condition,
  format_quantity,
  format_currency,
} from "boot/formaters.js";

const columns = [
  {
    name: "name",
    label: "Name",
    align: "left",
    field: "name",
  },
  { name: "img", label: "Img", align: "left", field: "image" },
  { name: "action", label: "Action", align: "left" },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
    format: (val) => {
      if (val) {
        return val;
      } else {
        return "";
      }
    },
  },
  {
    name: "manufacturer",
    align: "center",
    label: "Manufacturer",
    field: "manufacturer",
    format: (val) => {
      if (val) {
        return val.name;
      }
    },
  },
  {
    name: "storage-location",
    label: "Storage Location",
    field: "storage_location",
    format: (val) => {
      if (val) {
        return val.location;
      }
    },
  },
  {
    name: "condition",
    label: "Condition",
    field: "condition",
    format: format_condition,
  },
  {
    name: "stock",
    label: "Stock",
    field: "stock",
    format: (val, row) => {
      return format_quantity(val, row.stock_unit);
    },
  },
  {
    name: "stock_available",
    label: "Available Stock",
    field: "stock",
    format: (val, row) => {
      if (row.reserved_quantity) {
        return format_quantity(val - row.reserved_quantity, row.stock_unit);
      } else {
        return format_quantity(val, row.stock_unit);
      }
    },
  },
  {
    name: "reserved",
    label: "Reserved",
    field: "reserved_quantity",
    format: (val, row) => {
      return format_quantity(val, row.stock_unit);
    },
  },
  {
    name: "stock_value",
    label: "Stock Value",
    field: "invoice",
    format: (val, row) => {
      if (val && val.unit_price) {
        return format_currency(
          val.unit_price.net * row.stock,
          val.unit_price.currency
        );
      } else {
        return "";
      }
    },
  },
  {
    name: "price",
    label: "Price",
    field: "invoice",
    format: (val) => {
      if (val && val.unit_price) {
        return format_currency(val.unit_price.net, val.unit_price.currency);
      } else {
        return "";
      }
    },
  },
];

export default {
  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const part_detail_dialog = ref(false);
    const part_detail_dialog_id = ref();
    const rows = ref([]);
    const filter = ref("");
    const loading = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    const history_id = ref(NaN);
    const manufacturer_set = ref([]);
    const storage_location_set = ref([]);
    const inventory_flat_category_set = ref([]);
    const edit_item_dialog = ref(false);
    const edit_item_initial_data = ref();
    const flagged = ref();
    const archived = ref(false);
    const inventory_categories = ref();

    function on_item_edit() {
      edit_item_dialog.value = false;
      reload_items();
    }

    function reload_items() {
      onRequest({
        pagination: pagination.value,
        filter: filter.value,
      });
    }

    function onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      const filter = props.filter;
      const id = route.params.id;

      var params = {
        // category: id,
        search: filter,
        pageSize: rowsPerPage,
        pageNumber: page,
        flagged: flagged.value,
        archived: archived.value,
      };
      if (id != 1) {
        var filter_set = get_category_filterset(id);
        if (filter_set) {
          params.category__in = filter_set.join(",");
        }
      }
      loading.value = true;
      api
        .get(`/api/inventory/`, {
          params: params,
        })
        .then((response) => {
          pagination.value.page = page;
          pagination.value.rowsPerPage = rowsPerPage;
          pagination.value.rowsNumber = response.data.count;
          rows.value = response.data.results;
        })
        .finally(() => {
          loading.value = false;
        });
    }

    function load_categories() {
      api.get("/api/inventory-category/").then((response) => {
        inventory_categories.value = response.data;
      });
    }

    function get_category_filterset(category_id) {
      if (inventory_categories.value) {
        return inventory_categories.value[category_id - 1].subcategories_id_set;
      }
    }
    function load_inventory_categories() {
      api.get("/inventory/api/category_flat_list").then((response) => {
        inventory_flat_category_set.value = response.data.categories;
      });
    }

    function flag_all_items() {
      api.get("/inventory/api/flag/all").then((response) => {
        if (response.data.status == "OK") {
          reload_items();
        }
      });
    }

    function show_edit_dialog(data) {
      edit_item_initial_data.value = data;
      edit_item_dialog.value = true;
    }

    onMounted(() => {
      load_categories();
      load_inventory_categories();
      // get initial data from server (1st page)
      onRequest({
        pagination: pagination.value,
        filter: undefined,
      });
    });

    return {
      part_detail_dialog,
      part_detail_dialog_id,
      manufacturer_set,
      storage_location_set,
      inventory_flat_category_set,
      filter,
      loading,
      pagination,
      columns,
      rows,
      fixed: ref(false),
      onRequest,
      history_id,

      add_item_dialog: ref(false),
      edit_item_dialog,
      edit_item_initial_data,
      on_item_edit,

      flagged,
      archived,

      reload_items,
      flag_all_items,
      show_edit_dialog,
    };
  },
  methods: {
    show_history(id) {
      this.history_id = id;
      this.fixed = true;
    },
  },
  components: {
    InventoryHistory,
    StockUpdatePopup,
    PartDetailDialog,
    InventoryItemEditCreateDialog,
    InventoryTableDetailDiv,
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        console.log(toParams.id);
        if (toParams.id) {
          this.pagination.page = 1;
          this.onRequest({
            pagination: this.pagination,
            filter: undefined,
          });
        }
      }
    );
  },
};
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 870px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
