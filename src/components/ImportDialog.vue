<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw" :loading="loading">
      <q-card-section>
        <div class="text-h6">Import</div>
      </q-card-section>

      <q-separator />

      <q-form
        :action="backendURL + '/import'"
        method="post"
        enctype="multipart/form-data"
        class="q-gutter-md"
        @submit="onSubmit"
      >
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-file
            name="file"
            filled
            v-model="importer"
            label="Import data file"
          />
          <br />
          <q-linear-progress
            size="25px"
            :value="import_progress"
            color="accent"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                text-color="accent"
                :label="progressLabel"
              />
            </div>
          </q-linear-progress>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Import" color="primary" type="submit" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";
import { backendURL } from "src/boot/backend";
import { api } from "boot/axios";

export default defineComponent({
  name: "ImportDialog",
  props: {},
  setup(props) {
    const importer = ref();
    const import_progress = ref();
    const progressLabel = ref();

    function onSubmit(evt) {
      evt.target.submit();
      // api
      //   .post("/import")
      //   .then((res) => {
      //     //Perform Success Action
      //   })
      //   .catch((error) => {
      //     // error.response.status Check status code
      //   })
      //   .finally(() => {
      //     //Perform action in always
      //   });
    }

    return {
      importer,
      backendURL,

      import_progress,
      progressLabel,

      onSubmit,
    };
  },
});
</script>
