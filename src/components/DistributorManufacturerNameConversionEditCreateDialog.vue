<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="distirbutor_specyfic_manufacturer_name"
          label="Manufacturer Name"
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
import { ref, onUpdated, onMounted, defineComponent } from "vue";
import {
  edit_manufacturer_name_conversion,
  manufacturer_name_conversion_detail,
} from "src/boot/distributor_set";
import { get_manufacturer_by_id } from "src/boot/manufacturer_api";
import ManufacturerSelect from "./widgets/ManufacturerSelect.vue";

export default defineComponent({
  components: { ManufacturerSelect },
  name: "DistributorManufacturerNameConversionEditCreateDialog",
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
    var distirbutor_specyfic_manufacturer_name = ref();
    const manufacturer = ref();

    function validate_and_submit() {
      console.log(manufacturer.value);
      const data = {
        manufacturer_name_text: distirbutor_specyfic_manufacturer_name.value,
        manufacturer: manufacturer.value.id,
      };
      edit_manufacturer_name_conversion(props.edit_id, data);
      props.onsave();
    }

    onUpdated(() => {
      if (props.edit_id) {
        manufacturer_name_conversion_detail(props.edit_id).then((response) => {
          distirbutor_specyfic_manufacturer_name.value =
            response.data.manufacturer_name_text;
          manufacturer.value = get_manufacturer_by_id(
            response.data.manufacturer
          );
        });
      }
    });

    return {
      distirbutor_specyfic_manufacturer_name,
      manufacturer,
      validate_and_submit,
    };
  },
});
</script>
