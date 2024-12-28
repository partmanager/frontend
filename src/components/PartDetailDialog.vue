<template>
  <q-dialog>
    <q-card style="width: 900px; max-width: 80vw">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="parameters" label="Parameters" />
        <q-tab name="packaging" label="Packaging" />
        <q-tab name="distributors" label="Distributors" />
        <q-tab name="package" label="Package" />
        <q-tab name="3dmodel" label="3D Model" />
        <q-tab name="symbol_footprint" label="Symbol & Footprint" />
        <q-tab name="files" label="Files" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="parameters">
          <q-card>
            <q-card-section>
              <div class="row">
                <div class="col col-6">
                  <div v-if="part_details.product_url">
                    <strong>Manufacturer Part Number:</strong>
                    <a :href="part_details.product_url">{{
                      part_details.manufacturer_part_number
                    }}</a
                    ><br />
                  </div>
                  <div v-if="!part_details.product_url">
                    <strong>Manufacturer Part Number:</strong>
                    {{ part_details.manufacturer_part_number }}<br />
                  </div>
                  <strong>Description:</strong>
                  {{ part_details.description }}<br />
                  <strong>Manufacturer:</strong>
                  {{ part_details.manufacturer.name }}<br />
                  <strong>Production Status:</strong>
                  {{ part_details.production_status }}<br />
                  <strong>Notes:</strong>
                  {{ part_details.notes }}<br />
                  <strong>Comment:</strong>
                  {{ part_details.comment }}<br />
                  <strong>Storage Conditions:</strong> <br />
                  - temperature:
                  {{ part_details.storage_conditions.temperature_min || "" }}
                  ~
                  {{ part_details.storage_conditions.temperature_max || ""
                  }}<br />
                  - humidity:
                  {{ part_details.storage_conditions.humidity_min || "" }}
                  ~
                  {{ part_details.storage_conditions.humidity_max || "" }}<br />
                  - MSL:
                  {{ part_details.storage_conditions.msl || "" }}<br />
                  <strong>Operating Conditions:</strong><br />
                </div>
                <div class="col col-6">
                  <q-img
                    v-if="
                      part_details.package !== null &&
                      part_details.package.files &&
                      part_details.package.files.rendered_image !== null &&
                      !part_details.package.files.rendered_image.endsWith(
                        'None'
                      )
                    "
                    class="col col-md-6"
                    :src="part_details.package.files.rendered_image"
                    spinner-color="white"
                    :ratio="1"
                    loading="lazy"
                    :fit="scale - down"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel name="packaging">
          <PartPackaging
            :packaging_data="part_details.manufacturer_order_number_set"
          >
          </PartPackaging>
        </q-tab-panel>

        <q-tab-panel name="distributors">
          <PartDistributorsStockData :id="part_details.distributors">
          </PartDistributorsStockData>
        </q-tab-panel>

        <q-tab-panel name="package">
          <PackageCard :package_id="part_details.package"></PackageCard>
        </q-tab-panel>

        <q-tab-panel name="3dmodel">
          <div
            class="row"
            v-if="part_details.package && part_details.package.files"
          >
            <iframe
              class="col-12"
              style="height: 35vw"
              loading="lazy"
              :src="part_details.package.files.xhtml_file"
            ></iframe>
          </div>
        </q-tab-panel>

        <q-tab-panel name="symbol_footprint">
          <SymbolFootprintCard
            :symbol="part_details.symbol"
            :manufacturer_name="part_details.manufacturer.name"
            :manufacturer_part_number="part_details.manufacturer_part_number"
          ></SymbolFootprintCard>
        </q-tab-panel>

        <q-tab-panel name="files">
          <FilesVersionTable :rows="part_details.files"></FilesVersionTable>
        </q-tab-panel>
      </q-tab-panels>

      <q-separator />

      <q-card-actions align="right" class="bg-white text-teal">
        <q-btn flat label="Close" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { api } from "boot/axios";
import { backendURL } from "src/boot/backend";
import PartDistributorsStockData from "./PartDistributorsStockData.vue";
import PartPackaging from "./PartPackaging.vue";
import FilesVersionTable from "components/widgets/FilesVersionTable.vue";
import PackageCard from "components/PackageCard.vue";
import SymbolFootprintCard from "components/SymbolFootprintCard.vue";

export default defineComponent({
  name: "PartDetailDialog",
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const tab = ref("parameters");
    const part_details = ref({
      manufacturer: { name: null },
      storage_conditions: {
        temperature_min: null,
        temperature_max: null,
        humidity_min: null,
        humidity_max: null,
      },
      package: {
        files: {
          rendered_image: null,
        },
      },
      distributors: [],
      manufacturer_order_numbers: [],
      files: [],
    });
    const loading = ref(false);
    const media_url = backendURL + "/media/symbols/svg/";
    const symbol_slide = ref(1);

    function onDetailDataRequest() {
      if (props.id >= 0) {
        loading.value = true;
        api
          //.post(`/parts/api/part/detail`, { id: props.id })
          .get(`/api/part-poli/${props.id}`)
          .then((response) => {
            part_details.value = response.data;
          })
          .finally(() => {
            loading.value = false;
          });
      }
    }

    return {
      tab,
      part_details,
      onDetailDataRequest,
      media_url,
    };
  },
  components: {
    PartDistributorsStockData,
    PartPackaging,
    FilesVersionTable,
    PackageCard,
    SymbolFootprintCard,
  },
  created() {
    this.$watch(
      () => this.$props.id,
      (toParams, previousParams) => {
        this.onDetailDataRequest();
      }
    );
  },
});
</script>
