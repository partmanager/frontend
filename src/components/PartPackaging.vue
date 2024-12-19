<template>
  <q-table
    :columns="[
      {
        name: 'manufacturer_order_number',
        label: 'Manufacturer Order Number',
        align: 'left',
        field: 'manufacturer_order_number',
      },
      {
        name: 'packaging_code',
        label: 'Packaging code',
        align: 'left',
        field: 'packaging_code',
      },
      {
        name: 'packaging_type',
        label: 'Packaging type',
        align: 'left',
        field: 'packaging_type',
      },
      {
        name: 'value',
        label: 'Description',
        align: 'left',
        field: 'series',
      },
      {
        name: 'value_max',
        label: 'Note',
        align: 'left',
        field: 'series',
      },
      {
        name: 'quantity',
        label: 'Quantity',
        align: 'left',
        field: 'packaging_quantity',
      },
    ]"
    :rows="packaging_data"
  >
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
          <div>
            {{ col.value }}
          </div>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <q-img
            v-if="props.row.packaging_type === 'Embossed Tape / Reel'"
            :src="backendURL + '/static/tape_reel.svg'"
          ></q-img>
          <q-img
            v-if="props.row.packaging_type === 'Paper Tape / Reel'"
            :src="backendURL + '/static/tape_embossed_dual_reel.svg'"
          >
          </q-img>
          <q-table
            v-if="props.row.packaging_packaging_data === 'Embossed Tape / Reel'"
            hide-bottom
            :rows="props.row.packaging_packaging_data.reel"
          >
          </q-table>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script>
import { defineComponent } from "vue";
import { backendURL } from "src/boot/backend";

export default defineComponent({
  name: "PartPackaging",
  props: {
    packaging_data: {
      type: Array,
      required: true,
    },
  },
  setup() {
    return { backendURL };
  },
});
</script>
