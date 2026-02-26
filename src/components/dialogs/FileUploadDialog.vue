<template>
  <q-dialog>
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6">{{ props.title }}</div>
      </q-card-section>

      <q-separator />

      <q-form
        :action="props.uploadUrl"
        method="post"
        enctype="multipart/form-data"
        class="q-gutter-md"
        @submit="onSubmit"
      >
        <q-card-section style="max-height: 60vh" class="scroll">
          <q-file v-model="file" name="file" filled label="Upload file" />
          <br />
          <q-linear-progress size="25px" :value="progress" color="accent">
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
          <q-btn flat label="Upload" color="primary" type="submit" />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, defineComponent } from "vue";

export default defineComponent({
  name: "FileUploadDialog",
  props: {
    title: { default: "File Upload" },
    uploadUrl: { type: String, required: true },
  },
  setup(props) {
    const file = ref();
    const progress = ref();
    const progressLabel = ref();

    function onSubmit(evt) {
      evt.target.submit();
    }

    return {
      props,
      file,

      progress,
      progressLabel,

      onSubmit,
    };
  },
});
</script>
