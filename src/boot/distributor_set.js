import { api } from "./axios";
import { ref } from "vue";

const distributor_set = ref();

function load_distributors() {
  api.get("/api/distributor/").then((response) => {
    distributor_set.value = response.data;
  });
}

function get_distributor_set() {
  if (!distributor_set.value) {
    load_distributors();
    return distributor_set;
  }
  return distributor_set;
}

function get_distributor_by_id(id) {
  const distributor_set = get_distributor_set();
  if (distributor_set.value[0]) {
    const found = distributor_set.value.filter((v) => v.id == id);
    if (found) {
      return found[0];
    }
  }
  return null;
}

function distributor_id_to_name(id) {
  const distributor = get_distributor_by_id(id);
  if (distributor) {
    return distributor.name;
  }
  return `Error. Try to reload page. Unable to get name of distributor id: ${id}`;
}

function load_distributor_detail(id) {
  let response = api.get(`/api/distributor/${id}/`);
  return response;
}

function delete_distributor(id) {
  let response = api.delete(`/api/distributor/${id}/`);
  return response;
}

function manufacturer_name_conversion_detail(id) {
  let response = api.get(`/api/distributor-manufacturer/${id}/`);
  return response;
}

function edit_manufacturer_name_conversion(id, data) {
  let response = api.patch(`/api/distributor-manufacturer/${id}/`, data);
  return response;
}

function delete_manufacturer_name_conversion(id) {
  let response = api.delete(`/api/distributor-manufacturer/${id}/`);
  return response;
}

function get_distributor_order_number(id) {
  let response = api.get(`/api/distributor-order-number/${id}/`);
  return response;
}

export {
  get_distributor_set,
  get_distributor_by_id,
  distributor_id_to_name,
  load_distributor_detail,
  delete_distributor,
  manufacturer_name_conversion_detail,
  edit_manufacturer_name_conversion,
  delete_manufacturer_name_conversion,
  get_distributor_order_number,
};
