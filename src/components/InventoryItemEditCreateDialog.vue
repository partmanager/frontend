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
          <ManufacturerSelect
            v-model="add_item_manufacturer"
            :disable="add_item_parts_selected.length == 1"
          >
          </ManufacturerSelect>
          <br />
          <q-input
            class="col-9"
            filled
            v-model="add_item_name"
            label="Name / Manufacturer Order Number"
            :disable="add_item_parts_selected.length == 1"
          /><br />
        </div>
        <br />
        <q-input
          label="Description"
          v-model="add_item_description"
          :disable="add_item_parts_selected.length == 1"
          dense
          filled
        />
        <br />
        <PartSelectTable
          v-model="table_model"
          title=""
          :manufacturer="add_item_manufacturer"
          :part_number="add_item_name"
          :onSelectChange="table_select_changed"
          :initial_part_id="initial_part_id"
        ></PartSelectTable>
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

          <StorageLocationSelect
            v-model="add_item_storage_location"
            ref="add_item_storage_location_ref"
            :rules="[(val) => !!val || 'Storage location is required']"
            clearable
            dense
            class="col-9"
          ></StorageLocationSelect>
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
            <DistributorSelect
              v-model="add_item_distributor"
              :initial_distributor="initial_distributor_id"
              dense
              clearable
            ></DistributorSelect>
          </div>
          <div class="col-8">
            <InvoiceItemSelectWidget
              v-model="add_item_invoice"
              :distributor="add_item_distributor"
              :initial_invoice_item_id="initial_invoice_id"
              :distributor_required="true"
              clearable
              dense
            ></InvoiceItemSelectWidget>
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
import ManufacturerSelect from "./widgets/ManufacturerSelect.vue";
import DistributorSelect from "./widgets/DistributorSelect.vue";
import InvoiceItemSelectWidget from "./widgets/InvoiceItemSelectWidget.vue";
import StorageLocationSelect from "./widgets/StorageLocationSelectWidget.vue";
import PartSelectTable from "./widgets/PartSelectTable.vue";

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
    inventory_flat_category_set: {
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
    const table_model = ref();
    const table_ref = ref();
    const initial_part_id = ref();
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
    const add_item_distributor = ref();
    const add_item_category = ref();
    const add_item_category_ref = ref();
    const add_item_storage_location = ref();
    const add_item_storage_location_ref = ref();
    const add_item_inventory_status = ref();
    const add_item_inventory_status_ref = ref();
    const add_item_inventory_category_options = ref(
      props.inventory_flat_category_set
    );
    const add_item_parts_selected = ref([]);
    const empty_location_only_checkbox = ref(false);
    const initial = ref({ manufacturer_id: null, invoice_id: null });
    const initial_invoice_id = ref();
    const initial_distributor_id = ref();

    function table_select_changed(v) {
      console.log("Selecting", v);
      add_item_parts_selected.value = v;
    }

    function add_item() {
      if (!validate_inputs()) {
        // form has error
      } else {
        const data = widgets_to_data();
        api
          .post(`/api/inventory/`, data)
          .then((response) => {
            if (response.data.id !== null) {
              clear_form();
              if (props.onsave) {
                props.onsave();
              }
            }
          })
          .finally(() => {});
      }
    }

    function update_item() {
      if (!validate_inputs()) {
        // form has error
      } else {
        const data = widgets_to_data();
        api
          .put(`/api/inventory/${props.item_initial_data.id}/`, data)
          .then((response) => {
            if (response.data.id !== null) {
              clear_form();
              if (props.onsave) {
                props.onsave();
              }
            }
          })
          .finally(() => {});
      }
    }

    function widgets_to_data() {
      var manufacturer_id = null;
      var part_name = null;
      var description = null;
      var mon = null;
      if (add_item_parts_selected.value.length === 1) {
        // part is selected, use data from part
        manufacturer_id = add_item_parts_selected.value[0].part.manufacturer.id;
        part_name = add_item_parts_selected.value[0].manufacturer_order_number;
        mon = add_item_parts_selected.value[0].id;
        description = add_item_parts_selected.value[0].part.description;
      } else {
        manufacturer_id = add_item_manufacturer.value.id;
        part_name = add_item_name.value;
        description = add_item_description.value;
      }
      var invoice_id = null;
      console.log("Invoice", add_item_invoice.value);
      if (add_item_invoice.value) {
        invoice_id = add_item_invoice.value.id;
      }

      const data = {
        name: part_name,
        description: description,
        note: add_item_note.value,
        manufacturer: manufacturer_id,
        part: mon,
        storage_location: add_item_storage_location.value.id,
        invoice: invoice_id,
        stock: add_item_quantity.value,
        stock_unit: add_item_quantity_unit.value.id,
        condition: add_item_condition.value.id,
        status: add_item_inventory_status.value.id,
        category: add_item_category.value.id,
        //LOT
        //ECCN
        //COO
        //TARIC
      };
      return data;
    }

    function validate_inputs() {
      add_item_quantity_ref.value.validate();
      add_item_quantity_unit_ref.value.validate();
      // add_item_storage_location_ref.value.validate();
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
      add_item_parts_selected.value = [];
      add_item_note.value = null;
      add_item_quantity.value = null;
      add_item_quantity_unit.value = null;
      add_item_storage_location.value = null;
      add_item_invoice.value = null;
      add_item_condition.value = null;
      add_item_inventory_status.value = null;
      add_item_category.value = null;
      add_item_distributor.value = null;
      //add_item_quantity_ref.value.resetValidation();
      // add_item_storage_location_ref.value.resetValidation();
      // add_item_condition_ref.value.resetValidation();
      //add_item_inventory_status_ref.value.resetValidation();
      //add_item_category_ref.value.resetValidation();
    }

    function set_initial_data(initial_data) {
      add_item_name.value = initial_data.name;
      add_item_description.value = initial_data.description;
      add_item_note.value = initial_data.note;
      add_item_quantity.value = initial_data.stock;
      add_item_quantity_unit.value = add_item_quantity_unit_options.filter(
        (value) => value.id == initial_data.stock_unit
      )[0];
      add_item_storage_location.value = initial_data.storage_location;
      add_item_manufacturer.value = initial_data.manufacturer;

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

      if (initial_data.invoice && initial_data.invoice.id) {
        initial_invoice_id.value = initial_data.invoice.id;
        add_item_distributor.value = initial_data.invoice.invoice.distributor;
      } else {
        initial_invoice_id.value = null;
      }
      initial_part_id.value = initial_data.part;
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

    function load_initial_data(id) {
      // load_invoice_items();
      clear_form();
      if (id) {
        api.get(`/api/inventory/${id}/`).then((response) => {
          set_initial_data(response.data);
        });
      }
    }

    return {
      table_model,
      table_select_changed,
      initial_part_id,
      initial,
      table_ref,
      add_item_quantity_unit_options,
      add_item_inventory_status_options,
      add_item_condition_status_options,
      add_item_quantity_unit,
      add_item_quantity_unit_ref,
      add_item_inventory_status,
      add_item_inventory_status_ref,
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
      add_item_manufacturer,
      add_item_distributor,
      add_item_name,
      add_item_barcode,
      add_item_inventory_category_options,
      empty_location_only_checkbox,
      add_item_barcode_search,
      add_item,
      update_item,
      set_initial_data,
      load_initial_data,
      initial_invoice_id,
      initial_distributor_id,

      filter_category_select(val, update, abort) {
        return filterFn(
          val,
          update,
          abort,
          add_item_inventory_category_options,
          props.inventory_flat_category_set
        );
      },
    };
  },
  components: {
    ManufacturerSelect,
    DistributorSelect,
    InvoiceItemSelectWidget,
    StorageLocationSelect,
    PartSelectTable,
  },
  created() {
    this.$watch(
      () => this.$props.item_initial_data,
      (toParams, previousParams) => {
        this.load_initial_data(toParams.id);
        // this.set_initial_data(toParams);
      }
    );
  },
});
</script>
