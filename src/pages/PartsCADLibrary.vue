<template>
  <div class="q-pa-md">
    <q-table :title="name" dense :rows="parts" :columns="columns"></q-table>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

const columns = [
  {
    name: "manufacturer",
    label: "Manufacturer",
    align: "left",
    field: "manufacturer",
  },
  {
    name: "manufacturer_part_number",
    label: "MPN",
    align: "left",
    field: "mpn",
  },
  {
    name: "description",
    label: "Description",
    align: "left",
    field: "description",
  },
  {
    name: "schlib",
    label: "Schematic lib",
    align: "left",
    field: "schlib",
  },
  {
    name: "pcblib",
    label: "Footprint lib",
    align: "left",
    field: "pcblib",
  },
  {
    name: "product_url",
    label: "Product URL",
    align: "left",
    field: "productURL",
  },
  {
    name: "datasheet_url",
    label: "Datasheet URL",
    align: "left",
    field: "datasheetURL",
  },
  {
    name: "datasheet_cached_url",
    label: "Datasheet Cached URL",
    align: "left",
    field: "datasheetCachedURL",
  },
  {
    name: "tolerance",
    label: "Operating temperature range",
    align: "left",
    field: "tempRange",
  },
  {
    name: "tolerance",
    label: "Mount type",
    align: "left",
    field: "mount",
  },
  {
    name: "resistance",
    label: "Resistance",
    align: "left",
    field: "resistance",
  },
  {
    name: "tolerance",
    label: "Tolerance",
    align: "left",
    field: "tolerance",
  },
  {
    name: "power",
    label: "Power",
    align: "left",
    field: "power",
  },
  {
    name: "tolerance",
    label: "Operating Voltage",
    align: "left",
    field: "operatingVoltage",
  },
];

export default {
  setup() {
    const name = "resistors";

    const parts = [
      {
        manufacturer: "TestManufacturer",
        mpn: "TESTPart",
        description: "description",
        schlib: "resistor",
        pcblib: "R_0603",
        productURL: "https://local",
        datasheetURL: "https://datasheet",
        datasheetCachedURL: "https://cached",
        mount: "SMD",
        resistance: "10k",
        tolerance: "5%",
        power: "max. 10mW",
        operatingVoltage: "max. 100V",
      },
    ];
    return { name, columns, parts };
  },
};
</script>
