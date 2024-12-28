<template>
  <q-carousel
    v-if="props.symbol"
    v-model="symbol_slide"
    v-model:fullscreen="fullscreen"
    swipeable
    animated
    infinite
    vertical
  >
    <q-carousel-slide
      class="column no-wrap flex-center"
      v-for="(picture, i) in props.symbol.svg_files"
      :key="i"
      :name="i + 1"
      ><q-img
        fit="scale-down"
        :src="
          mediaURL +
          'symbols/svg/' +
          props.manufacturer_name.replace(/ /, '_').toLowerCase() +
          '_' +
          props.manufacturer_part_number.replace(/#/, '') +
          picture
        "
      ></q-img
    ></q-carousel-slide>

    <template v-slot:control>
      <q-carousel-control position="bottom-right" :offset="[18, 18]">
        <q-btn
          push
          round
          dense
          color="white"
          text-color="primary"
          :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="fullscreen = !fullscreen"
        />
      </q-carousel-control>
    </template>
  </q-carousel>
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";
import { mediaURL } from "boot/backend.js";

export default defineComponent({
  name: "SymbolFootprintCard",
  props: {
    symbol: {
      type: Object,
    },
    manufacturer_name: {
      type: String,
    },
    manufacturer_part_number: {
      type: String,
    },
  },
  setup(props) {
    const symbol_slide = ref(1);
    const fullscreen = ref(false);

    return { symbol_slide, props, mediaURL, fullscreen };
  },
});
</script>
