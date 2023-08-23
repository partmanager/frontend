<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
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
          v-model="distirbutor_specyfic_manufacturer_name"
          label="Manufacturer Name (distributor specyfic)"
          hint="Distributor specyfic manufacturer name"
          filled
        />

        <ManufacturerSelect v-model="manufacturer"> </ManufacturerSelect>
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
import ManufacturerSelect from "./widgets/ManufacturerSelect.vue";

export default defineComponent({
  components: { ManufacturerSelect },
  name: "DistributorOrderNumberConversionEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
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
    const manufacturer = ref();

    function validate_and_submit() {
      console.log(manufacturer.value);
      const data = {
        manufacturer_name_text: distirbutor_specyfic_manufacturer_name.value,
        manufacturer: manufacturer.value.id,
      };
      props.onsave();
    }

    onUpdated(() => {
      if (props.edit_id) {
        get_distributor_order_number(props.edit_id).then((response) => {
          distirbutor_specyfic_order_number.value =
            response.data.distributor_order_number_text;
          distirbutor_specyfic_manufacturer_name.value =
            response.data.manufacturer_name_text;
        });
      }
    });

    return {
      distirbutor_specyfic_order_number,
      distirbutor_specyfic_manufacturer_name,
      manufacturer,
      validate_and_submit,
    };
  },
});
</script>
