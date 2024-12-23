<template>
  <q-card>
    <q-card-actions>
      <div class="text-h6">Filters</div>
      <q-space />

      <q-btn
        color="grey"
        round
        flat
        dense
        :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        @click="expanded = !expanded"
      />
    </q-card-actions>

    <q-slide-transition>
      <div v-show="expanded">
        <q-separator />

        <q-card-section>
          <div class="row">
            <q-select
              hint="Stock options"
              filled
              v-model="model"
              multiple
              :options="options"
              counter
              style="width: 250px"
            />
            <q-select
              hint="Production status"
              filled
              v-model="production_status_model"
              multiple
              :options="production_status_options"
              counter
              style="width: 250px"
            />
            <q-select
              hint="Package"
              filled
              v-model="package_model"
              multiple
              :options="package_options"
              counter
              style="width: 250px"
            />
            <q-select
              hint="Manufacturer"
              filled
              v-model="manufacturer_model"
              multiple
              :options="manufacturer_options"
              counter
              style="width: 250px"
            />
          </div>

          <br />

          <div class="row">
            <q-select
              hint="Dielectric type"
              filled
              v-model="dielectric_type_model"
              multiple
              :options="dielectric_type_options"
              counter
              style="width: 250px"
            />

            <q-select
              hint="Capacitor type"
              filled
              v-model="dielectric_type_model"
              multiple
              :options="dielectric_type_options"
              counter
              style="width: 250px"
            />

            <q-select
              hint="Capacitance"
              filled
              v-model="dielectric_type_model"
              multiple
              :options="dielectric_type_options"
              counter
              style="width: 250px"
            />

            <q-select
              hint="Capacitance tolerance"
              filled
              v-model="dielectric_type_model"
              multiple
              :options="dielectric_type_options"
              counter
              style="width: 250px"
            />

            <q-card>
              <q-card-section>
                <q-input hint="Minimal voltage" dense> </q-input>
                <q-input hint="Maximal voltage" dense> </q-input>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </div>
    </q-slide-transition>
    <q-card-actions> </q-card-actions>
  </q-card>
</template>

<script>
import { ref } from "vue";

const options = ["In local stock", "In distributor stock", "Has distributor"];
const production_status_options = ["Active", "Unknown"];

export default {
  name: "PartsFiltersCard",
  setup() {
    const expanded = ref();
    const model = ref();
    const production_status_model = ref();
    const package_model = ref();
    const package_options = ref();
    const dielectric_type_model = ref();
    const dielectric_type_options = ref();
    const manufacturer_model = ref();
    const manufacturer_options = ref();

    return {
      expanded,
      model,
      options,
      production_status_model,
      package_model,
      package_options,
      dielectric_type_model,
      dielectric_type_options,
      manufacturer_model,
      manufacturer_options,
      production_status_options,
    };
  },
};
</script>
