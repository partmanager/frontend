<template>
  <div class="q-pa-md">
    <q-card align="justify">
      <q-card-section>
        <div class="text-h6">Filters</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row">
          <q-select
            hint="Stock options"
            filled
            v-model="model"
            multiple
            :options="options"
            counter
            style="width: 250px"
          />
          <q-select
            hint="Production status"
            filled
            v-model="production_status_model"
            multiple
            :options="production_status_options"
            counter
            style="width: 250px"
          />
          <q-select
            hint="Package"
            filled
            v-model="package_model"
            multiple
            :options="package_options"
            counter
            style="width: 250px"
          />
          <q-select
            hint="Manufacturer"
            filled
            v-model="manufacturer_model"
            multiple
            :options="manufacturer_options"
            counter
            style="width: 250px"
          />
        </div>

        <br />

        <div class="row">
          <q-select
            hint="Dielectric type"
            filled
            v-model="dielectric_type_model"
            multiple
            :options="dielectric_type_options"
            counter
            style="width: 250px"
          />

          <q-select
            hint="Capacitor type"
            filled
            v-model="dielectric_type_model"
            multiple
            :options="dielectric_type_options"
            counter
            style="width: 250px"
          />

          <q-select
            hint="Capacitance"
            filled
            v-model="dielectric_type_model"
            multiple
            :options="dielectric_type_options"
            counter
            style="width: 250px"
          />

          <q-select
            hint="Capacitance tolerance"
            filled
            v-model="dielectric_type_model"
            multiple
            :options="dielectric_type_options"
            counter
            style="width: 250px"
          />

          <q-card>
            <q-card-section>
              <q-input hint="Minimal voltage" dense> </q-input>
              <q-input hint="Maximal voltage" dense> </q-input>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
      <q-card-actions> </q-card-actions>
    </q-card>

    <br />

    <q-table
      title="Parts"
      dense
      :rows="rows"
      :columns="columns"
      :wrap-cells="true"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      @request="onRequest"
    >
      <template v-slot:top-right>
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
            {{ col.value }}
            <div v-if="col.name == 'action'">
              <q-btn
                padding="xs"
                color="primary"
                icon="info"
                title="Show part detail information"
                @click="
                  {
                    part_detail_dialog_id = props.row.id;
                    part_detail_dialog = true;
                  }
                "
              />
              <q-btn
                padding="xs"
                color="primary"
                icon="edit"
                title="Edit"
                disabled
                @click="show_edit_dialog(props.row)"
              />
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <q-table
              :columns="[
                {
                  name: 'manufacturer_order_number',
                  label: 'Manufacturer Order Number (MON)',
                  align: 'left',
                  field: 'manufacturer_order_number',
                },
                {
                  name: 'production_status',
                  label: 'Production Status',
                  align: 'left',
                  field: 'production_status',
                },
                {
                  name: 'action',
                  label: 'Action',
                  align: 'left',
                  field: 'part',
                },
                // {
                //   name: 'inventory',
                //   label: 'Inventory',
                //   align: 'left',
                //   field: 'inventoryposition_set',
                // },
              ]"
              :rows="props.row.manufacturer_order_number_set"
            >
            </q-table>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <PartDetailDialog v-model="part_detail_dialog" :id="part_detail_dialog_id">
    </PartDetailDialog>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute } from "vue-router";
import PartDetailDialog from "src/components/PartDetailDialog.vue";

const columns_begin = [
  {
    name: "manufacturer_part_number",
    label: "MPN",
    align: "left",
    field: "manufacturer_part_number",
  },
  { name: "part", label: "OPNs", align: "left", field: "part" },
  { name: "action", label: "Action", align: "left", field: "part" },
  {
    name: "production_status",
    label: "Production Status",
    align: "left",
    field: "production_status",
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
];

const columns_end = [
  { name: "package", label: "Package", align: "left", field: "package" },
  { name: "part", label: "Marking Code", align: "left", field: "part" },
  {
    name: "working_temperature_range",
    label: "Operating temperature range",
    align: "left",
    field: "working_temperature_range",
  },
  {
    name: "storage_conditions",
    label: "Storage temperature range",
    align: "left",
    field: "storage_conditions",
    format: (val, row) => {
      if (val) {
        if (val.temperature_min && val.temperature_max && val.msl) {
          return `${val.temperature_min}\u2103..${val.temperature_max}\u2103, MSL ${val.msl}`;
        } else if (val.temperature_min && val.temperature_max) {
          return `${val.temperature_min}\u2103..${val.temperature_max}\u2103`;
        } else if (val.temperature_max) {
          return `max. ${val.temperature_max}\u2103`;
        }
      }
    },
  },
  {
    name: "manufacturer",
    label: "Manufacturer",
    align: "left",
    field: "manufacturer",
    format: (value, row) => value.name,
  },
];

const balun_columns = [
  {
    name: "unbalanced_port_impedance",
    label: "Unbalanced port impedance",
    align: "left",
    field: "unbalanced_port_impedance",
  },
  {
    name: "balanced_port_impedance",
    label: "Balanced port impedance",
    align: "left",
    field: "balanced_port_impedance",
  },
  {
    name: "operating_frequency_range",
    label: "Frequency range",
    align: "left",
    field: "operating_frequency_range",
  },
  {
    name: "power_rating",
    label: "Power rating",
    align: "left",
    field: "power_rating",
  },
];

const capacitor_columns = [
  {
    name: "capacitance",
    label: "Capacitance",
    align: "left",
    field: "capacitance",
  },
  { name: "voltage", label: "Voltage", align: "left", field: "voltage" },
  { name: "tolerance", label: "Tolerance", align: "left", field: "tolerance" },
  {
    name: "dielectric_type",
    label: "Dielectric Type",
    align: "left",
    field: "dielectric_type",
  },
  {
    name: "capacitor_type",
    label: "Capacitor Type",
    align: "left",
    field: "capacitor_type",
  },
];

const resistor_columns = [
  {
    name: "resistance",
    label: "Resistance",
    align: "left",
    field: "resistance",
  },
  { name: "tolerance", label: "Tolerance", align: "left", field: "tolerance" },
  { name: "power", label: "Power", align: "left", field: "power" },
];

const id_to_api_url = {
  0: {
    part_types: "GR,R,RA,RCF,RTK,RTN,RMF",
    columns: columns_begin.concat(resistor_columns).concat(columns_end),
  },
  1: {
    part_types: "C,CC,MCC,CE,CP,CT",
    columns: columns_begin.concat(capacitor_columns).concat(columns_end),
  },
  2: {
    part_types: "I",
    columns: columns_begin.concat(columns_end),
  },
  3: {
    url: "diode",
    part_types: "D,DS,DZ",
    columns: columns_begin.concat(columns_end),
  },
  4: {
    url: "led",
    part_types: "DLE",
    columns: columns_begin.concat(columns_end),
  },
  5: {
    url: "tvs",
    part_types: "TVS",
    columns: columns_begin.concat(columns_end),
  },
  6: {
    url: "transistor-bipolar",
    part_types: "TBP,TBN",
    columns: columns_begin.concat(columns_end),
  },
  7: {
    url: "ic",
    part_types: "IC,ICV,ICR,IRF,IRS",
    columns: columns_begin.concat(columns_end),
  },
  8: {
    url: "ferrite-bead",
    part_types: "FB",
    columns: columns_begin.concat(columns_end),
  },
  9: {
    url: "crystal",
    part_types: "COS",
    columns: columns_begin.concat(columns_end),
  },
  10: {
    url: "connector",
    part_types: "CON,COB,COT,COF,CO5,COI,COA",
    columns: columns_begin.concat(columns_end),
  },
  11: {
    url: "module",
    part_types: "MSW,MSP",
    columns: columns_begin.concat(columns_end),
  },
  12: {
    url: "enclosure",
    part_types: "E,EA",
    columns: columns_begin.concat(columns_end),
  },
  13: {
    url: "battery-holder",
    part_types: "BH",
    columns: columns_begin.concat(columns_end),
  },
  14: {
    url: "switch",
    part_types: "S",
    columns: columns_begin.concat(columns_end),
  },
  15: {
    url: "balun",
    part_types: "BAL",
    columns: columns_begin.concat(balun_columns).concat(columns_end),
  },
  16: {
    url: "battery",
    part_types: "B",
    columns: columns_begin.concat(columns_end),
  },
  17: {
    url: "bridge-rectifier",
    part_types: "BRG",
    columns: columns_begin.concat(columns_end),
  },
  18: {
    url: "transistor-mosfet",
    part_types: "MON,MOP",
    columns: columns_begin.concat(columns_end),
  },
};

const options = ["In local stock", "In distributor stock", "Has distributor"];
const production_status_options = ["Active", "Unknown"];

export default {
  setup() {
    const route = useRoute();
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    const rows = ref([]);
    const loading = ref(false);
    const filter = ref();
    const production_status_model = ref();
    const package_model = ref();
    const package_options = ref();
    const dielectric_type_model = ref();
    const dielectric_type_options = ref();
    const manufacturer_model = ref();
    const manufacturer_options = ref();
    const part_detail_dialog = ref(false);
    const part_detail_dialog_id = ref();
    const columns = ref();

    function onRequest(props) {
      const { page, rowsPerPage, rowsNumber } = props.pagination;
      const filter = props.filter;
      loading.value = true;
      const id = route.params.id;
      const part_types = id_to_api_url[id] || { part_types: "" };
      api
        //.get(`/parts/api/get_part_list2/${id}`, {
        .get(`/api/part-poli/`, {
          params: {
            part_type__in: part_types.part_types,
            search: filter,
            pageSize: rowsPerPage,
            pageNumber: page,
          },
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
    function load_parts() {
      rows.value = [];
      const id = route.params.id;
      const url = id_to_api_url[id];
      columns.value = url.columns;
      onRequest({ pagination: pagination.value, filter: filter.value });
    }
    onMounted(() => {
      // get initial data from server (1st page)
      const id = route.params.id;
      const url = id_to_api_url[id];
      columns.value = url.columns;
      onRequest({
        pagination: pagination.value,
        filter: undefined,
      });
    });
    return {
      pagination,
      loading,
      columns,
      rows,
      filter,
      options,
      production_status_model,
      production_status_options,
      package_model,
      package_options,
      dielectric_type_model,
      dielectric_type_options,
      manufacturer_model,
      manufacturer_options,

      part_detail_dialog,
      part_detail_dialog_id,

      onRequest,
      load_parts,
    };
  },
  created() {
    this.$watch(
      () => this.$route.params,
      (toParams, previousParams) => {
        // react to route changes...
        this.load_parts();
      }
    );
  },
  components: { PartDetailDialog },
};
</script>
