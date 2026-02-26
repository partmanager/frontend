import { api } from "./axios";
import { ref } from "vue";

const manufacturer_set = ref();

function api_manufacturer_create(formData) {
  return api
    .post("/api/manufacturer/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Manufacturer created successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to create Manufacturer",
        icon: "report_problem",
      });
    });
}

function load_manufacturers() {
  api.get("api/manufacturer").then((response) => {
    manufacturer_set.value = response.data;
  });
}

function get_manufacturer_set() {
  if (!manufacturer_set.value) {
    load_manufacturers();
  }
  return manufacturer_set;
}

function get_manufacturer_by_id(id) {
  const manufacturer_set = get_manufacturer_set();
  const found = manufacturer_set.value.filter((v) => v.id == id);
  if (found) {
    return found[0];
  }
  return null;
}

export {
  api_manufacturer_create,
  get_manufacturer_set,
  get_manufacturer_by_id,
};
