<template>
  <q-dialog @before-show="manufacturer_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-form>
        <q-input
          v-model="manufacturer.name"
          filled
          label="Name"
          hint="Manufacturer short name"
        />
        <q-input
          v-model="manufacturer.full_name"
          filled
          label="Full Name"
          hint="Manufacturer full name"
        />
        <q-input filled label="Address" hint="Manufacturer address" />
        <q-input filled label="Website URL" hint="Manufacturer website URL" />
        <q-input filled label="e-mail" hint="Manufacturer e-mail address" />
        <q-input filled label="Phone" hint="Manufacturer phone" />
        <q-input filled label="Comment" />
      </q-form>

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          type="submit"
          @click="onsave(manufacturer)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "ManufacturerEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    manufacturer_initial_data: {
      type: Object,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const manufacturer = ref({
      name: "",
      full_name: "",
      address: "",
      website_url: "",
    });

    function manufacturer_edit_load_data() {
      if (props.manufacturer_initial_data) {
        // eslint-disable-next-line
        manufacturer.value.name = props.manufacturer_initial_data.name;
        manufacturer.value.full_name =
          props.manufacturer_initial_data.full_name;
      }
    }

    return {
      manufacturer,
      manufacturer_edit_load_data,
    };
  },
});
</script>
