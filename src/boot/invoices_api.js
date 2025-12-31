import { api } from "./axios";
import { ref } from "vue";
import { Notify } from "quasar";

function api_invoice_create(formData) {
  return api
    .post("/api/invoice/invoice/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice created successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to create Invoice",
        icon: "report_problem",
      });
    });
}

function api_invoice_update(id, formData) {
  return api
    .put(`/api/invoice/invoice/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice updated successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to update invoice",
        icon: "report_problem",
      });
    });
}

function api_invoice_delete(id, router = null) {
  return api
    .delete(`/api/invoice/invoice/${id}/`)
    .then((response) => {
      if (router) {
        router.replace({ path: "/invoices" });
      }
      Notify.create({
        color: "positive",
        message: "Invoice removed successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to delete invoice",
        icon: "report_problem",
      });
    });
}

function api_invoice_attachment_create(formData) {
  return api
    .post("/api/invoice/attachment/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice attachment created successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to create Invoice attachment",
        icon: "report_problem",
      });
    });
}

function api_invoice_attachment_update(id, formData) {
  return api
    .put(`/api/invoice/attachment/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice attachment updated successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to update invoice attachment",
        icon: "report_problem",
      });
    });
}

function api_invoice_attachment_delete(id) {
  return api
    .delete(`/api/invoice/attachment/${id}/`)
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice attachment removed successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to delete invoice attachment",
        icon: "report_problem",
      });
    });
}

function api_invoice_item_create(formData) {
  return api
    .post("/api/invoice/item/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice Item created successfully",
      });
    })
    .catch((error) => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to create Invoice Item",
        icon: "report_problem",
      });
      console.log("Problem submitting New Invoice Item", error);
    });
}

function api_invoice_item_delete(id) {
  return api
    .delete(`/api/invoice/item/${id}/`)
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Invoice Item removed successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to delete invoice item",
        icon: "report_problem",
      });
    });
}

function api_invoice_paymentConfirmation_create(formData) {
  return api
    .post("/api/invoice/paymentConfirmation/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Payment Confirmation added successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to create payment confirmation",
        icon: "report_problem",
      });
    });
}

function api_invoice_paymentConfirmation_update(id, formData) {
  return api
    .patch(`/api/invoice/paymentConfirmation/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Payment Confirmation updated successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to update payment confirmation",
        icon: "report_problem",
      });
    });
}

function api_invoice_paymentConfirmation_delete(id) {
  return api
    .delete(`/api/invoice/paymentConfirmation/${id}/`)
    .then((response) => {
      Notify.create({
        color: "positive",
        message: "Payment Confirmation removed successfully",
      });
    })
    .catch(() => {
      Notify.create({
        color: "negative",
        position: "top",
        message: "Unable to delete payment confirmation",
        icon: "report_problem",
      });
    });
}

export {
  api_invoice_create,
  api_invoice_update,
  api_invoice_delete,
  api_invoice_attachment_create,
  api_invoice_attachment_update,
  api_invoice_attachment_delete,
  api_invoice_item_create,
  api_invoice_item_delete,
  api_invoice_paymentConfirmation_create,
  api_invoice_paymentConfirmation_update,
  api_invoice_paymentConfirmation_delete,
};
