<template>
  <q-dialog @before-show="load_initial_data">
    <q-card style="width: 1000px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />
      <q-card-section>
        <q-tabs
          v-model="part_selection_tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="part" label="Part" />
          <q-tab name="generic_part" label="Generic Part" />
        </q-tabs>

        <q-tab-panels v-model="part_selection_tab" animated>
          <q-tab-panel name="part">
            <q-card
              ><q-card-section>Filters</q-card-section>
              <q-card-section>
                <ManufacturerSelect
                  v-model="filters.manufacturer"
                  :initial_manufacturer_name="initial_manufacturer_name"
                  filled
                  label="Manufacturer"
                  hint="Manufacturer Name"
                  dense
                ></ManufacturerSelect>
                <br />
                <q-input
                  v-model="filters.part_number"
                  filled
                  label="Part Number"
                  hint="Manufacturer Part Number"
                  dense
                /> </q-card-section
            ></q-card>
            <br />
            <PartSelectTable
              v-model="part_select_table"
              title="Edit BOM Part"
              v-model:selected="selected_part"
              :manufacturer="filters.manufacturer"
              :part_number="filters.part_number"
              :onSelectChange="() => {}"
            ></PartSelectTable>
          </q-tab-panel>
          <q-tab-panel name="generic_part">
            <q-table
              title="test"
              selection="single"
              :columns="[
                {
                  name: 'mpn',
                  label: 'Generic Part Number',
                  field: 'manufacturer_part_number',
                },
                {
                  name: 'description',
                  label: 'Description',
                  field: 'description',
                },
              ]"
              :rows="generic_rows"
              v-model:selected="generic_part_selected"
            ></q-table>
          </q-tab-panel>
        </q-tab-panels>

        <br />
        <q-select
          v-model="bom_group_select"
          option-label="display_name"
          :options="filtered_bom_group_set"
          @filter="filter_bom_group_select"
          use-input
          fill-input
          hide-selected
          clearable
          filled
          dense
          class="col-3"
          label="BOM Group"
        />

        <br />
        <q-select
          filled
          label="Designators"
          hint="Separate multiple values by [,;|]"
          v-model="designators"
          use-input
          use-chips
          multiple
          input-debounce="0"
          @new-value="createDesignator"
        />
        <br />
        <q-input
          v-model="note"
          type="textarea"
          label="Note"
          hint="Note"
          filled
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="validate_and_submit()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import PartSelectTable from "./widgets/PartSelectTable.vue";
import ManufacturerSelect from "./widgets/ManufacturerSelect.vue";

export default defineComponent({
  components: { ManufacturerSelect, PartSelectTable },
  name: "InvoiceItemEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    bom_item_id: {
      type: Number,
    },
    bom_id: {
      type: Number,
    },
  },
  emits: ["onCreated", "onUpdated"],
  setup(props, ctx) {
    const $q = useQuasar();
    const filters = ref({ manufacturer: null, part_number: "" });
    const part_select_table = ref();
    const bom_group_select = ref();
    const selected_part = ref([]);
    const quantity = ref();
    const group = ref();
    const designators = ref();
    const note = ref();
    const initial_manufacturer_name = ref();
    const filtered_bom_group_set = ref([]);
    const bom_group_set = ref([]);
    const stringOptions = ref([]);
    const part_selection_tab = ref("part");
    const generic_rows = ref([]);
    const generic_part_selected = ref();

    function createDesignator(val, done) {
      if (val.length > 0) {
        const modelValue = (designators.value || []).slice();

        val
          .split(/[,;|]+/)
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .forEach((v) => {
            if (stringOptions.value.includes(v) === false) {
              stringOptions.value.push(v);
            }
            if (modelValue.includes(v) === false) {
              modelValue.push(v);
            }
          });

        done(null);
        designators.value = modelValue;
      }
    }

    function validate_and_submit() {
      if (props.bom_item_id) {
        validate_and_update(props.bom_item_id);
      } else {
        validate_and_create();
      }
    }

    function validate_fields() {
      return (
        selected_part.value.length == 1 ||
        generic_part_selected.value.length == 1
      );
    }

    function fields_to_api_data() {
      if (part_selection_tab.value == "part") {
        return {
          part: selected_part.value[0].part.id,
          quantity: quantity.value,
          group: bom_group_select.value.value,
          designators: designators.value,
        };
      } else {
        console.log(generic_part_selected.value[0]);
        return {
          part: generic_part_selected.value[0].id,
          quantity: quantity.value,
          group: bom_group_select.value.value,
          designators: designators.value,
        };
      }
    }

    function validate_and_create() {
      if (validate_fields()) {
        var data = fields_to_api_data();
        data.bom = props.bom_id;
        api
          .post("/api/bom-item/", data)
          .then((response) => {
            $q.notify({
              color: "positive",
              message: `Created BOM Item ${response.data.designators}`,
            });
            ctx.emit("onCreated");
          })
          .catch(() => {
            $q.notify({
              color: "negative",
              position: "top",
              message: "Unable to create BOM Item",
              icon: "report_problem",
            });
          });
      }
    }

    function validate_and_update(bom_item_id) {
      if (validate_fields()) {
        const data = fields_to_api_data();
        api.put(`/api/bom-item/${bom_item_id}/`, data).then((response) => {
          ctx.emit("onUpdated");
        });
      }
    }

    function load_generic_part() {
      api.get(`/api/part-generic/`).then((response) => {
        generic_rows.value = response.data.results;
        console.log(generic_rows.value);
      });
    }

    function load_initial_data() {
      load_generic_part();
      if (props.bom_item_id) {
        api.get(`/api/bom-item/${props.bom_item_id}/`).then((response) => {
          quantity.value = response.data.quantity;
          designators.value = response.data.designators;
          note.value = response.data.note;
          group.value = response.data.group;
          if (response.data.part) {
            initial_manufacturer_name.value = response.data.part.manufacturer;
            //filters.value.manufacturer = response.data.part.manufacturer;
            filters.value.part_number =
              response.data.part.manufacturer_part_number;
          } else if (response.data.part_not_found_fallback) {
            //filters.value.manufacturer =
            initial_manufacturer_name.value =
              response.data.part_not_found_fallback.manufacturer;
            filters.value.part_number =
              response.data.part_not_found_fallback.mpn;
          }

          api
            .options(`/api/bom-item/${props.bom_item_id}/`)
            .then((response) => {
              bom_group_set.value = response.data.actions.PUT.group.choices;
              const needle = group.value.toLowerCase();
              var found = bom_group_set.value.filter(
                (v) => v.display_name.toLowerCase().indexOf(needle) > -1
              );
              bom_group_select.value = found[0];
            });
        });
      } else {
        api.options(`/api/bom-item/`).then((response) => {
          bom_group_set.value = response.data.actions.POST.group.choices;
          const needle = "unknown";
          var found = bom_group_set.value.filter(
            (v) => v.display_name.toLowerCase().indexOf(needle) > -1
          );
          bom_group_select.value = found[0];
        });
      }
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
            (v) => v.display_name.toLowerCase().indexOf(needle) > -1
          );
        }
      });
    }

    function filter_bom_group_select(val, update, abort) {
      return filterFn(
        val,
        update,
        abort,
        filtered_bom_group_set,
        bom_group_set.value
      );
    }

    return {
      filters,
      part_select_table,
      bom_group_select,
      selected_part,
      quantity,
      designators,
      note,
      initial_manufacturer_name,
      filtered_bom_group_set,
      part_selection_tab,
      generic_rows,
      generic_part_selected,

      load_initial_data,
      validate_and_submit,
      filter_bom_group_select,

      createDesignator,
    };
  },
});
</script>
