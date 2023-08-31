<template>
  <q-dialog>
    <q-card style="width: 900px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">Create new inventory position</div>
      </q-card-section>

      <q-input
        v-if="!this.isEdit"
        dense
        filled
        v-model="add_item_barcode"
        label="Barcode reader data"
        @keydown.enter="add_item_barcode_search"
      />
      <q-card-section style="max-height: 60vh" class="scroll">
        <div class="row">
          <q-select
            v-model="add_item_manufacturer"
            option-label="name"
            :options="add_item_manufacutrer_options"
            @filter="filter_manufacturer_select"
            use-input
            fill-input
            hide-selected
            clearable
            filled
            class="col-3"
            label="Manufacturer"
          />
          <br />
          <q-input
            class="col-9"
            filled
            v-model="add_item_name"
            label="Name / Manufacturer Order Number"
          /><br />
        </div>
        <br />
        <q-input
          label="Description"
          v-model="add_item_description"
          dense
          filled
        />
        <br />
        <q-table
          ref="table_ref"
          v-model:pagination="add_item_parts_pagination"
          v-model:selected="add_item_parts_selected"
          :rows="add_item_parts"
          :columns="[
            {
              name: 'manufacturer',
              label: 'Manufacturer',
              align: 'left',
              field: 'manufacturer',
            },
            {
              name: 'mon',
              label: 'Manufacturer Order Number',
              align: 'left',
              field: 'manufacturer_order_number',
            },
            {
              name: 'mpn',
              label: 'Manufacturer Part Number',
              align: 'left',
              field: 'manufacturer_part_number',
            },
            {
              name: 'description',
              label: 'Description',
              align: 'left',
              field: 'part_description',
            },
            {
              name: 'package',
              label: 'Package',
              align: 'left',
              field: 'part_package',
            },
            {
              name: 'packaging',
              label: 'Packaging',
              align: 'left',
              field: 'packaging_type',
            },
          ]"
          :loading="add_item_parts_loading"
          :filter="add_item_name"
          selection="single"
          row-key="id"
          @request="onPartRequest"
          autogrow
        ></q-table>
      </q-card-section>

      <q-card-section>
        <q-input label="Note" v-model="add_item_note" dense filled />
        <br />
        <div class="row">
          <div class="col-8">
            <q-input
              label="Stock"
              ref="add_item_quantity_ref"
              v-model="add_item_quantity"
              :rules="[
                (val) => val >= 0 || 'Initial stock quantity is required',
              ]"
              type="number"
              filled
              dense
            />
          </div>
          <div class="col-4">
            <q-select
              label="Unit"
              ref="add_item_quantity_unit_ref"
              v-model="add_item_quantity_unit"
              option-label="name"
              :options="add_item_quantity_unit_options"
              :rules="[(val) => !!val || 'Quantity unit is required']"
              dense
              filled
            />
          </div>
        </div>

        <div class="row">
          <q-checkbox
            v-model="empty_location_only_checkbox"
            label="Show Empty locations"
            class="col-3"
          >
          </q-checkbox>

          <q-select
            label="Storage Location"
            ref="add_item_storage_location_ref"
            v-model="add_item_storage_location"
            option-label="name"
            :options="add_storage_location_options"
            :rules="[(val) => !!val || 'Storage location is required']"
            @filter="filter_storage_location_select"
            use-input
            clearable
            fill-input
            hide-selected
            dense
            filled
            class="col-9"
          />
        </div>

        <div class="row">
          <div class="col-6">
            <q-select
              label="Condition"
              ref="add_item_condition_ref"
              v-model="add_item_condition"
              option-label="name"
              :options="add_item_condition_status_options"
              :rules="[(val) => !!val || 'Item condition is required']"
              dense
              filled
            />
          </div>
          <div class="col-6">
            <q-select
              ref="add_item_inventory_status_ref"
              label="Inventory Status"
              v-model="add_item_inventory_status"
              option-label="name"
              :options="add_item_inventory_status_options"
              :rules="[(val) => !!val || 'Inventory Status is required']"
              dense
              filled
            />
          </div>
        </div>

        <q-select
          label="Category"
          ref="add_item_category_ref"
          v-model="add_item_category"
          option-label="name"
          :options="add_item_inventory_category_options"
          :rules="[(val) => !!val || 'Item category is required']"
          @filter="filter_category_select"
          use-input
          fill-input
          hide-selected
          dense
          filled
        />
        <div class="row">
          <div class="col-4">
            <q-select
              label="Distributor"
              v-model="add_item_distributor"
              option-label="name"
              :options="add_item_distributor_options"
              @filter="filter_distributors_select"
              use-input
              fill-input
              hide-selected
              clearable
              dense
              filled
            />
          </div>
          <div class="col-8">
            <q-select
              label="Invoice"
              v-model="add_item_invoice"
              option-label="label"
              :options="add_item_invoice_options"
              @filter="filter_invoice_item_select"
              use-input
              fill-input
              hide-selected
              clearable
              dense
              filled
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
        <q-btn
          v-if="this.isEdit == false"
          flat
          label="Add"
          color="primary"
          @click="add_item"
        />
        <q-btn
          v-if="this.isEdit == true"
          flat
          label="Update"
          color="primary"
          @click="update_item"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted, onUpdated, defineComponent } from "vue";
import { api } from "boot/axios";

const add_item_quantity_unit_options = [
  { name: "unknown", id: null },
  { name: "pcs", id: 1 },
  { name: "kg", id: 2 },
  { name: "m", id: 3 },
];

const add_item_condition_status_options = [
  { name: "New", id: "n" },
  { name: "Used", id: "u" },
  { name: "Refurbished", id: "r" },
  { name: "Broken", id: "b" },
  { name: "Unknown", id: "k" },
];

const add_item_inventory_status_options = [
  { name: "Awaiting order", id: "r" },
  { name: "Ordered", id: "u" },
  { name: "Shipped", id: "s" },
  { name: "In stock", id: "b" },
];

export default defineComponent({
  name: "InventoryItemEditCreateDialog",
  props: {
    isEdit: {
      type: Boolean,
      default: false,
    },
    invoice_items_set: {
      type: Array,
      required: true,
    },
    manufacturer_set: {
      type: Array,
      required: true,
    },
    distributor_set: {
      type: Array,
      required: true,
    },
    inventory_flat_category_set: {
      type: Array,
      required: true,
    },
    storage_location_set: {
      type: Array,
      required: true,
    },
    item_initial_data: {
      type: Object,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const table_ref = ref();
    const add_item_parts = ref([]);
    const add_item_parts_loading = ref(false);
    const add_item_parts_pagination = ref({
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10,
    });
    const add_item_barcode = ref();
    const add_item_manufacturer = ref();
    const add_item_name = ref();
    const add_item_description = ref();
    const add_item_note = ref();
    const add_item_quantity = ref();
    const add_item_quantity_ref = ref();
    const add_item_quantity_unit = ref();
    const add_item_quantity_unit_ref = ref();
    const add_item_condition = ref();
    const add_item_condition_ref = ref();
    const add_item_invoice = ref();
    const add_item_invoice_options = ref(props.invoice_items_set.value);
    const add_item_distributor = ref();
    const add_item_category = ref();
    const add_item_category_ref = ref();
    const add_item_storage_location = ref();
    const add_item_storage_location_ref = ref();
    const add_item_inventory_status = ref();
    const add_item_inventory_status_ref = ref();
    const add_item_manufacutrer_options = ref(props.manufacturer_set);
    const add_item_distributor_options = ref(props.distributor_set);
    const add_item_inventory_category_options = ref(
      props.inventory_flat_category_set
    );
    const add_storage_location_options = ref(props.storage_location_set);
    const add_item_parts_selected = ref([]);
    const empty_location_only_checkbox = ref(false);

    function add_item() {
      if (!validate_inputs()) {
        // form has error
      } else {
        var mon = null;
        if (add_item_parts_selected.value.length === 1) {
          mon = add_item_parts_selected.value[0].id;
        }
        var invoice_id = null;
        if (add_item_invoice.value) {
          invoice_id = add_item_invoice.value.id;
        }
        const data = {
          mon: mon,
          name: add_item_name.value,
          description: add_item_description.value,
          note: add_item_note.value,
          manufacturer: add_item_manufacturer.value.id,
          storage_location: add_item_storage_location.value.id,
          invoice: invoice_id,
          quantity: {
            value: add_item_quantity.value,
            unit: add_item_quantity_unit.value.id,
          },
          condition: add_item_condition.value.id,
          status: add_item_inventory_status.value.id,
          category: add_item_category.value.id,
        };
        api
          .post(`/inventory/api/add_item`, data)
          .then((response) => {
            if (response.data.status == "OK") {
              clear_form();
              if (props.onsave) {
                props.onsave();
              }
            }
          })
          .finally(() => {
            // itemHistoryLoading.value = false
          });
      }
    }

    function update_item() {
      if (!validate_inputs()) {
        // form has error
      } else {
        var mon = null;
        if (add_item_parts_selected.value.length === 1) {
          mon = add_item_parts_selected.value[0].id;
        }
        var invoice_id = null;
        if (add_item_invoice.value) {
          invoice_id = add_item_invoice.value.id;
        }
        const data = {
          id: props.item_initial_data.id,
          mon: mon,
          name: add_item_name.value,
          description: add_item_description.value,
          note: add_item_note.value,
          manufacturer: add_item_manufacturer.value.id,
          storage_location: add_item_storage_location.value.id,
          invoice: invoice_id,
          quantity: {
            value: add_item_quantity.value,
            unit: add_item_quantity_unit.value.id,
          },
          condition: add_item_condition.value.id,
          status: add_item_inventory_status.value.id,
          category: add_item_category.value.id,
        };
        api
          .post(`/inventory/api/update_item`, data)
          .then((response) => {
            if (response.data.status == "OK") {
              clear_form();
              if (props.onsave) {
                props.onsave();
              }
            }
          })
          .finally(() => {
            // itemHistoryLoading.value = false
          });
      }
    }

    function validate_inputs() {
      add_item_quantity_ref.value.validate();
      add_item_quantity_unit_ref.value.validate();
      add_item_storage_location_ref.value.validate();
      add_item_condition_ref.value.validate();
      add_item_inventory_status_ref.value.validate();
      add_item_category_ref.value.validate();
      if (
        add_item_quantity_ref.value.hasError ||
        add_item_quantity_unit_ref.value.hasError ||
        add_item_storage_location_ref.value.hasError ||
        add_item_condition_ref.value.hasError ||
        add_item_inventory_status_ref.value.hasError ||
        add_item_category_ref.value.hasError
      ) {
        // form has error
        return false;
      }
      return true;
    }

    function clear_form() {
      add_item_barcode.value = null;
      add_item_manufacturer.value = null;
      add_item_name.value = null;
      add_item_description.value = null;
      add_item_note.value = null;
      add_item_quantity.value = null;
      add_item_quantity_unit.value = null;
      add_item_storage_location.value = null;
      add_item_invoice.value = null;
      add_item_condition.value = null;
      add_item_inventory_status.value = null;
      add_item_category.value = null;
      add_item_distributor.value = null;
      add_item_quantity_ref.value.resetValidation();
      add_item_storage_location_ref.value.resetValidation();
      add_item_condition_ref.value.resetValidation();
      add_item_inventory_status_ref.value.resetValidation();
      add_item_category_ref.value.resetValidation();
    }

    function set_initial_data(initial_data) {
      add_item_name.value = initial_data.part.name;
      add_item_description.value = initial_data.part.description;
      add_item_note.value = initial_data.note;
      add_item_quantity.value = initial_data.stock;
      add_item_quantity_unit.value = add_item_quantity_unit_options.filter(
        (value) => value.id == initial_data.stock_unit
      )[0];
      add_item_storage_location.value = props.storage_location_set.filter(
        (value) => value.id == initial_data.storage_location.id
      )[0];
      if (initial_data.manufacturer_id) {
        add_item_manufacturer.value = props.manufacturer_set.filter(
          (value) => value.id == initial_data.manufacturer_id
        )[0];
      } else {
        add_item_manufacturer.value = null;
      }
      add_item_condition.value = add_item_condition_status_options.filter(
        (value) => value.id == initial_data.condition
      )[0];
      add_item_inventory_status.value =
        add_item_inventory_status_options.filter(
          (value) => value.id == initial_data.status
        )[0];
      if (initial_data.category) {
        add_item_category.value = props.inventory_flat_category_set.filter(
          (value) => value.id == initial_data.category
        )[0];
      }
      if (initial_data.distributor_id) {
        add_item_distributor.value = props.distributor_set.filter(
          (value) => value.id == initial_data.distributor_id
        )[0];
      }
      if (initial_data.invoice_id) {
        add_item_invoice.value = props.invoice_items_set.filter(
          (value) => value.id == initial_data.invoice_id
        )[0];
      } else {
        add_item_invoice.value = null;
      }
      onPartRequest({
        pagination: add_item_parts_pagination.value,
        filter: initial_data.part.name,
      });
      add_item_parts_selected.value = add_item_parts.value.filter(
        (value) => value.id == initial_data.part.mon_id
      );
      //table_ref.value.scrollTo(part.mon_id)
    }

    function add_item_barcode_search() {
      const data = {
        barcode: add_item_barcode.value,
        //'manufacturer': add_item_manufacturer.value.pk,
        mon: add_item_parts_selected.value.id,
        quantity: add_item_quantity.value,
        condition: add_item_condition.value,
        //'invoice': add_item_invoice.value.id
      };
      api
        .post(`/inventory/api/add_item_barcode_search`, data)
        .then((response) => {
          set_initial_data(response.data);
        })
        .finally(() => {
          // itemHistoryLoading.value = false
        });
    }

    function filterFn(
      val,
      update,
      abort,
      filtered_options,
      all_available_options
    ) {
      update(() => {
        if (val === "") {
          filtered_options.value = all_available_options;
        } else {
          const needle = val.toLowerCase();
          filtered_options.value = all_available_options.filter(
            (v) => v.name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    function onPartRequest(props) {
      const { page, rowsPerPage } = props.pagination;
      const filter = props.filter;
      add_item_parts_loading.value = true;
      var params = {
        searchText: filter,
        pageSize: rowsPerPage,
        pageNumber: page,
      };

      if (add_item_manufacturer.value) {
        params["manufacturer"] = add_item_manufacturer.value.pk;
      }
      api
        .get(`/parts/api/get_part_list`, { params: params })
        .then((response) => {
          add_item_parts_pagination.value.page = page;
          add_item_parts_pagination.value.rowsPerPage = rowsPerPage;
          add_item_parts_pagination.value.rowsNumber = response.data.total;
          add_item_parts.value = response.data.rows;
        })
        .finally(() => {
          add_item_parts_loading.value = false;
        });
    }

    onUpdated(() => {
      if (props.item_initial_data) {
        set_initial_data(props.item_initial_data);
      }
    });

    return {
      table_ref,
      add_item_quantity_unit_options,
      add_item_inventory_status_options,
      add_item_condition_status_options,
      add_item_quantity_unit,
      add_item_quantity_unit_ref,
      add_item_inventory_status,
      add_item_inventory_status_ref,
      add_item_parts,
      add_item_parts_loading,
      add_item_parts_pagination,
      add_item_parts_selected,
      add_item_description,
      add_item_note,
      add_item_quantity,
      add_item_quantity_ref,
      add_item_condition,
      add_item_condition_ref,
      add_item_storage_location,
      add_item_storage_location_ref,
      add_item_category,
      add_item_category_ref,
      add_item_invoice,
      add_item_invoice_options,
      add_item_manufacturer,
      add_item_distributor,
      add_item_name,
      add_item_barcode,
      add_item_manufacutrer_options,
      add_item_distributor_options,
      add_item_inventory_category_options,
      add_storage_location_options,
      empty_location_only_checkbox,
      // _add_item,
      add_item_barcode_search,
      add_item,
      update_item,
      set_initial_data,
      onPartRequest,

      filter_distributors_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          add_item_distributor_options,
          props.distributor_set
        );
      },
      filter_manufacturer_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          add_item_manufacutrer_options,
          props.manufacturer_set
        );
      },
      filter_storage_location_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          add_storage_location_options,
          props.storage_location_set
        );
      },
      filter_category_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          add_item_inventory_category_options,
          props.inventory_flat_category_set
        );
      },
      filter_invoice_item_select(val, update, abort) {
        update(() => {
          if (val === "") {
            if (add_item_distributor.value) {
              add_item_invoice_options.value = props.invoice_items_set.filter(
                (v) => v.distributor_id == add_item_distributor.value.id
              );
            } else {
              add_item_invoice_options.value = props.invoice_items_set;
            }
          } else {
            const needle = val.toLowerCase();
            if (add_item_distributor.value) {
              add_item_invoice_options.value = props.invoice_items_set.filter(
                (v) =>
                  v.label.toLowerCase().indexOf(needle) > -1 &&
                  v.distributor_id == add_item_distributor.value.id
              );
            } else {
              add_item_invoice_options.value = props.invoice_items_set.filter(
                (v) => v.label.toLowerCase().indexOf(needle) > -1
              );
            }
          }
        });
      },
    };
  },
  created() {
    this.$watch(
      () => this.$props.item_initial_data,
      (toParams, previousParams) => {
        this.set_initial_data(toParams);
      }
    );
  },
});
</script>
