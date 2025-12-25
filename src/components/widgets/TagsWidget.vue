<template>
  <q-select
    ref="selectRef"
    v-model="selectedTags"
    :options="options"
    use-input
    fill-input
    input-debounce="0"
    stack-label
    @filter="filterFn"
    @new-value="createValue"
    option-value="id"
    option-label="name"
    multiple
    use-chips
  />
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";
import { api } from "boot/axios";

export default defineComponent({
  name: "TagsWidget",
  setup() {
    const selectRef = ref(null);

    const selectedTags = ref([]);
    const tags = ref([]);
    const options = ref([]);

    function filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        options.value = tags.value.filter(
          (v) => v.name.toLowerCase().indexOf(needle) > -1
        );
      });
    }

    function createValue(val, done) {
      if (val.length > 0) {
        var found = tags.value.find((v) => v.name == val);
        if (found) {
          done(found, "toggle");
        } else {
          let data = { name: val };
          api.post("/api/invoice/tag/", data).then((response) => {
            tags.value.push(response.data);
            console.log(tags.value);
            done(response.data, "toggle");
          });
        }
      }
    }

    function load_tags() {
      if (tags.value.length == 0) {
        api.get("/api/invoice/tag/").then((response) => {
          tags.value = response.data.results;
          options.value = response.data.results;
        });
      }
    }

    onMounted(() => {
      load_tags();
    });

    return {
      selectRef,

      selectedTags,
      options,

      filterFn,
      createValue,
    };
  },
  methods: {
    validate() {
      return this.$refs.selectRef.validate();
    },
  },
});
</script>
