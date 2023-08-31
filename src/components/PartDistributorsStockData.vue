<template>
  <q-table
    title="Distributors data"
    dense
    :columns="distributor_data_columns"
    :rows="distributors_data_rows"
    row-key="id"
  >
    <template v-slot:top-right>
      <q-btn
        color="secondary"
        :disable="loading"
        label="Refresh Distributor Data"
        @click="onDistributorDataRequest(id, true)"
      />
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
            color="secondary"
            round
            dense
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'remove' : 'add'"
          />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <div
            v-if="
              col.name != 'distributor' &&
              col.name != 'distributor_order_number'
            "
          >
            {{ col.value }}
          </div>
          <a v-if="col.name == 'distributor'" :href="col.value.url">{{
            col.value.name
          }}</a>
          <a
            v-if="col.name == 'distributor_order_number'"
            :href="col.value.url"
            >{{ col.value.don }}</a
          >
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <q-table
            v-if="props.row.prices"
            hide-bottom
            :columns="[
              {
                name: 'amount',
                label: 'Order Quantity',
                align: 'left',
                field: 'amount',
              },
              {
                name: 'unitPrice',
                label: 'Price per unit',
                align: 'left',
                format: (val, row) => `${val} ${row.currency}`,
                field: 'price',
              },
              {
                name: 'vatRate',
                label: 'VAT',
                align: 'left',
                format: (val) => `${val}%`,
                field: 'vatRate',
              },
              {
                name: 'priceType',
                label: 'Price Type',
                align: 'left',
                field: 'priceType',
              },
            ]"
            :rows="props.row.prices"
          >
          </q-table>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { ref, onUpdated, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

const distributor_data_columns = [
  {
    name: "distributor",
    label: "Distributor",
    align: "left",
    field: "distributor",
  },
  {
    name: "distributor_order_number",
    label: "Distributor Order Number",
    align: "left",
    field: "distributorOrderNumber",
  },
  {
    name: "manufacturer_order_number",
    label: "Manufacturer Order Number",
    align: "left",
    field: "manufacturerOrderNumber",
  },
  {
    name: "last_update_time",
    label: "Last update time",
    align: "left",
    field: "updateTime",
  },
  { name: "status", label: "Status", align: "left", field: "status" },
  {
    name: "stock",
    label: "Stock",
    align: "left",
    format: (val) => `${val.quantity} ${val.unit}`,
    field: "stockCount",
  },
];

export default defineComponent({
  name: "PartDistributorsStockData",
  props: {
    id: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    // const distributors_data_rows = ref([
    //     {
    //         distributor: {name: null, url: null},
    //         distributorOrderNumber: {don: null, url: null},
    //         stockCount: {quantity: null, unit:null}
    //     }
    // ]);
    const distributors_data_rows = ref([]);
    const loading = ref(false);
    const loaded_id = ref();

    function onDistributorDataRequest(id, refresh) {
      if (id.length) {
        loading.value = true;
        api
          .get(`/api/distributor/stock_and_price/`, {
            params: {
              pk: id,
              refresh: refresh,
            },
            paramsSerializer: (params) => {
              if (params.refresh) {
                return (
                  "pk=" +
                  params.pk.reduce((f, s) => `${f}&pk=${s}`) +
                  "&refresh=True"
                );
              } else {
                return "pk=" + params.pk.reduce((f, s) => `${f}&pk=${s}`);
              }
            },
          })
          .then((response) => {
            distributors_data_rows.value = response.data.rows;
            loaded_id.value = id;
          })
          .finally(() => {
            loading.value = false;
          });
      } else {
        distributors_data_rows.value = [];
      }
    }

    onMounted(() => {
      if (props.id != loaded_id.value) {
        onDistributorDataRequest(props.id, false);
      }
    });

    return {
      distributor_data_columns,
      distributors_data_rows,
      loading,

      onDistributorDataRequest,
    };
  },
});
</script>
