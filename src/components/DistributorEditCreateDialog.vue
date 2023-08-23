<template>
  <q-dialog @before-show="distributor_edit_load_data">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-separator />

      <q-form>
        <q-input
          v-model="distributor.name"
          filled
          label="Name"
          hint="Distributor name"
        />
        <q-input
          v-model="distributor.website_url"
          filled
          label="Website URL"
          hint="Distributor full name"
        />
        <q-input
          v-model="distributor.connector_data"
          filled
          label="Connector Data"
          hint="Distributor connector data"
        />
      </q-form>

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
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { load_distributor_detail } from "src/boot/distributor_set";

export default defineComponent({
  name: "DistributorEditCreateDialog",
  props: {
    title: {
      type: String,
      required: true,
    },
    distributor_initial_id: {
      type: Object,
    },
    onsave: {
      type: Function,
    },
  },
  setup(props) {
    const distributor = ref({
      name: "",
      website_url: "",
      connector_data: "",
    });

    function validate_and_submit() {
      const data = {
        name: distributor.value.name,
        website_url: distributor.value.website_url,
        // connector_data: distributor.value.connector_data,
      };
      if (props.distributor_initial_id) {
        api
          .put(`/api/distributor/${props.distributor_initial_id}/`, data)
          .finally(() => {
            props.onsave();
          });
      } else {
        api
          .post(`/api/distributor/`, data)
          .then((response) => {})
          .finally(() => {
            props.onsave();
          });
      }
    }

    function distributor_edit_load_data() {
      if (props.distributor_initial_id) {
        const data = load_distributor_detail(props.distributor_initial_id);
        data.then((response) => {
          // eslint-disable-next-line
          distributor.value.name = response.data.name;
          distributor.value.website_url = response.data.website_url;
          distributor.value.connector_data = response.data.connector_data;
        });
      }
    }

    return {
      distributor,
      validate_and_submit,
      distributor_edit_load_data,
    };
  },
});
</script>
