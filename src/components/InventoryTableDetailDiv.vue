<template>
  <div>
    <br />
    <div class="text-h4">
      {{
        props.inventory_data.manufacturer
          ? props.inventory_data.manufacturer.name
          : ""
      }}
      {{ props.inventory_data.name || "" }}
    </div>
    <br />
    <q-separator />
    <br />
    <div class="row">
      <div class="col">
        Description:<br />
        <div class="text-h5">
          {{ props.inventory_data.description }}
        </div>
        <br />
        Location:
        <strong>{{
          props.inventory_data.storage_location
            ? props.inventory_data.storage_location.location
            : "Error, location unknown"
        }}</strong>
        -> {{ props.inventory_data.stock }}
        {{ props.inventory_data.stock_unit_display }}<br />
        Condition: {{ props.inventory_data.condition_display }}<br />
        Status: {{ props.inventory_data.status_display }}<br />
        <br />
        <InventoryItemQuantityUpdateForm
          class="row"
          :invoice_item_id="props.inventory_data.id"
          :quantity="props.inventory_data.stock"
          @onQuantityUpdated="reload_items()"
        ></InventoryItemQuantityUpdateForm>
        <br />
        <InventoryItemFlagArchiveButtons
          class="row"
          :invoice_item_id="props.inventory_data.id"
          :flagged="props.inventory_data.flagged"
          :quantity="props.inventory_data.stock"
          :archived="props.inventory_data.archived"
          @onUpdated="reload_items()"
        ></InventoryItemFlagArchiveButtons>
      </div>

      <q-img
        v-if="
          props.inventory_data.image &&
          !props.inventory_data.image.endsWith('None')
        "
        class="col"
        :src="props.inventory_data.image"
        style="max-height: 150px; max-width: 150px"
      />
      <div class="col"></div>
    </div>
    <br />

    <q-input
      v-model="props.inventory_data.note"
      filled
      readonly
      type="textarea"
    />

    <div v-if="props.inventory_data.invoice != Null">
      <br />
      <q-separator />
      <br />
      <InvoiceInformationTable
        :rows="[props.inventory_data.invoice]"
      ></InvoiceInformationTable>
    </div>

    <div
      v-if="
        props.inventory_data.mon &&
        props.inventory_data.alternative_locations != Null &&
        props.inventory_data.alternative_locations.length > 0
      "
    >
      <br />
      <q-separator />
      <br />
      <AlternativeLocationTable
        :mon_id="props.inventory_data.mon"
      ></AlternativeLocationTable>
    </div>

    <InventoryReservationTable
      v-if="
        props.inventory_data.id && props.inventory_data.reserved_quantity > 0
      "
      class="q-mt-md"
      :inventory_item_id="props.inventory_data.id"
    ></InventoryReservationTable>

    <div
      v-if="
        Array.isArray(props.inventory_data.distributors) &&
        props.inventory_data.distributors.length
      "
    >
      <br />
      <q-separator />
      <br />

      <PartDistributorsStockData :id="props.inventory_data.distributors">
      </PartDistributorsStockData>
    </div>

    <br />
    <q-separator />
    <div class="text-left">
      Inventory ID: {{ props.inventory_data.id }}, Part ID:
      {{ props.inventory_data.part }}
    </div>
  </div>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";

import PartDistributorsStockData from "components/PartDistributorsStockData.vue";
import InvoiceInformationTable from "components/InvoiceInformationTable.vue";
import AlternativeLocationTable from "components/AlternativeLocationTable.vue";
import InventoryItemQuantityUpdateForm from "components/InventoryItemQuantityUpdateForm.vue";
import InventoryItemFlagArchiveButtons from "components/InventoryItemFlagArchiveButtons.vue";
import InventoryReservationTable from "components/InventoryReservationTable.vue";

export default defineComponent({
  name: "InventoryTableDetailDiv",
  props: {
    inventory_data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return { props };
  },
  components: {
    PartDistributorsStockData,
    InvoiceInformationTable,
    AlternativeLocationTable,
    InventoryItemQuantityUpdateForm,
    InventoryItemFlagArchiveButtons,
    InventoryReservationTable,
  },
});
</script>
