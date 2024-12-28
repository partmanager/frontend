<template>
  <q-card v-if="pack">
    <q-card-section>
      <div class="text-h6">Package details</div>
    </q-card-section>

    <q-card-section>
      <div class="row">
        <div class="col col-md-6">
          Name: <strong>{{ pack.name }}</strong
          ><br />
          Description:
          <strong>{{ pack.description }}</strong
          ><br />
          Type: <strong>{{ pack.type }}</strong>
        </div>
        <q-img
          v-if="files && files.dimensions_drawing"
          class="col col-md-6"
          :src="files.dimensions_drawing"
          spinner-color="white"
          :ratio="1"
          loading="lazy"
          :fit="scale - down"
        />
      </div>
    </q-card-section>
  </q-card>
  <br />
  <q-table
    v-if="pack"
    title="Package dimensions"
    :columns="columns"
    :rows="pack.dimensions"
  >
  </q-table>
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

const columns = [
  {
    name: "name",
    label: "Parameter Name",
    align: "left",
    field: "name",
  },
  {
    name: "symbol",
    label: "Symbol",
    align: "left",
    field: "symbol",
  },
  {
    name: "value_min",
    label: "Value min",
    align: "left",
    field: "min",
  },
  { name: "value", label: "Value", align: "left", field: "value" },
  {
    name: "value_max",
    label: "Value max",
    align: "left",
    field: "max",
  },
];

export default defineComponent({
  name: "PackageCard",
  props: {
    package_id: {
      type: Number,
    },
  },
  setup(props) {
    const loading = ref(false);
    const pack = ref();
    const files = ref();

    function load_package_details() {
      if (props.package_id) {
        loading.value = true;
        api
          .get(`/api/packages/${props.package_id}`)
          .then((response) => {
            pack.value = response.data;
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    onMounted(() => {
      load_package_details();
    });

    return { columns, pack, files };
  },
});
</script>
