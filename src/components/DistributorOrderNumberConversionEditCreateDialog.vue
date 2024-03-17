<template>
  <q-dialog>
    <q-card style="width: 1000px; max-width: 90vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="distirbutor_specyfic_order_number"
          label="Order Number (distributor specyfic)"
          hint="Distributor specyfic order number"
          filled
        />

        <q-input
          v-model="distirbutor_part_url"
          label="Part URL"
          hint="Distributor part URL"
          filled
        />

        <q-input
          v-model="distirbutor_specyfic_manufacturer_name"
          label="Manufacturer Name (distributor specyfic)"
          hint="Distributor specyfic manufacturer name"
          filled
        />

        <q-input
          v-model="distirbutor_specyfic_mon"
          label="Manufacturer Order Number (distributor specyfic)"
          hint="Distributor specyfic manufacturer order number"
          filled
        />

        <ManufacturerSelect v-model="manufacturer"> </ManufacturerSelect>

        <q-input debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <PartSelectTable
          v-model="part_select_table"
          :manufacturer="manufacturer"
          :part_number="filter"
          :onSelectChange="on_select_change"
        >
        </PartSelectTable>
      </q-card-section>

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
import { ref, onUpdated, defineComponent } from "vue";
import { get_distributor_order_number } from "src/boot/distributor_set";
import { api } from "boot/axios";
import ManufacturerSelect from "./widgets/ManufacturerSelect.vue";
import PartSelectTable from "./widgets/PartSelectTable.vue";

export default defineComponent({
  components: { ManufacturerSelect, PartSelectTable },
  name: "DistributorOrderNumberConversionEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    distributor_id: {
      type: Number,
    },
    edit_id: {
      type: Number,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const distirbutor_specyfic_order_number = ref();
    const distirbutor_specyfic_manufacturer_name = ref();
    const distirbutor_specyfic_mon = ref();
    const manufacturer = ref();
    const distirbutor_part_url = ref();
    const part_select_table = ref();
    const filter = ref();
    const selected_mon = ref(null);

    function validate_and_submit() {
      console.log(manufacturer.value);
      const data = {
        don: distirbutor_specyfic_order_number.value,
        mon: distirbutor_specyfic_mon.value,
        part_url: distirbutor_part_url.value,
        manufacturer_name: distirbutor_specyfic_manufacturer_name.value,
        manufacturer: manufacturer.value.id,
        manufacturer_order_number: selected_mon.value,
      };
      if (props.edit_id) {
        api
          .put(`/api/distributor-order-number/${props.edit_id}/`, data)
          .then((response) => {})
          .finally(() => {
            props.onsave();
          });
      } else {
        data.distributor = props.distributor_id;
        api
          .post("/api/distributor-order-number/", data)
          .then((response) => {})
          .finally(() => {
            props.onsave();
          });
      }
    }

    function on_select_change(value) {
      if (value && value.lenth == 1) {
        selected_mon.value = value[0].id;
      } else {
        selected_mon.value = null;
      }
    }

    onUpdated(() => {
      if (props.edit_id) {
        get_distributor_order_number(props.edit_id).then((response) => {
          distirbutor_specyfic_order_number.value = response.data.don;
          distirbutor_specyfic_manufacturer_name.value =
            response.data.manufacturer_name;
          distirbutor_specyfic_mon.value = response.data.mon;
        });
      }
    });

    return {
      distirbutor_specyfic_order_number,
      distirbutor_part_url,
      distirbutor_specyfic_manufacturer_name,
      distirbutor_specyfic_mon,
      manufacturer,
      validate_and_submit,
      part_select_table,
      filter,
      selected_mon,

      on_select_change,
    };
  },
});
</script>
