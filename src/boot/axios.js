import { boot } from "quasar/wrappers";
import axios from "axios";
import { backendURL } from "./backend";
import qs from "qs";

const api = axios.create({
  baseURL: backendURL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { axios, api };
