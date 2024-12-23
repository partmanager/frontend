const routes = [
  {
    path: "/",
    component: () => import("layouts/LoginLayout.vue"),
    children: [{ path: "", component: () => import("pages/Login.vue") }],
  },
  {
    path: "/invoices",
    component: () => import("layouts/DefaultLayout.vue"),
    children: [
      { path: "", component: () => import("pages/InvoicesPage.vue") },
      {
        path: ":id(\\d+)",
        component: () => import("pages/InvoiceDetailPage.vue"),
      },
      { path: "items", component: () => import("pages/InvoiceItemsPage.vue") },
    ],
  },
  {
    path: "/inventory",
    props: {
      api_url: "/inventory/api/category_list",
      router_url: "/inventory/",
    },
    component: () => import("layouts/MainLayout.vue"),
  },
  {
    path: "/inventory/:id",
    props: {
      api_url: "/inventory/api/category_list",
      router_url: "/inventory/",
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/InventoryPage.vue") },
    ],
  },
  {
    path: "/manufacturers",
    props: {
      api_url: "/api/manufacturer",
      router_url: "/manufacturers/",
    },
    component: () => import("layouts/MainListLayout.vue"),
  },
  {
    path: "/manufacturers/:id",
    props: {
      api_url: "/api/manufacturer",
      router_url: "/manufacturers/",
    },
    component: () => import("layouts/MainListLayout.vue"),
    children: [
      { path: "", component: () => import("pages/ManufacturersPage.vue") },
    ],
  },
  {
    path: "/storage_location",
    props: {
      api_url: "/inventory/api/storage_location_list",
      router_url: "/storage_location/",
    },
    component: () => import("layouts/StorageLocationLayout.vue"),
  },
  {
    path: "/storage_location/:id",
    props: {
      api_url: "/inventory/api/storage_location_list",
      router_url: "/storage_location/",
    },
    component: () => import("layouts/StorageLocationLayout.vue"),
    children: [
      { path: "", component: () => import("pages/StorageLocationsPage.vue") },
    ],
  },
  {
    path: "/distributors",
    props: {
      api_url: "/api/distributor",
      router_url: "/distributors/",
    },
    component: () => import("layouts/DistributorsLayout.vue"),
  },
  {
    path: "/distributors/:id",
    props: {
      api_url: "/api/distributor",
      router_url: "/distributors/",
    },
    component: () => import("layouts/DistributorsLayout.vue"),
    children: [
      { path: "", component: () => import("pages/DistributorsPage.vue") },
    ],
  },
  {
    path: "/projects",
    component: () => import("layouts/DefaultLayout.vue"),
    children: [
      { path: "", component: () => import("pages/projects/ProjectsPage.vue") },
    ],
  },
  {
    path: "/project/:id",
    component: () => import("layouts/DefaultLayout.vue"),
    children: [
      { path: "", component: () => import("pages/projects/ProjectPage.vue") },
    ],
  },
  {
    path: "/project-version/:id",
    props: {
      api_url: "/projects/api/get_projects_menu",
      router_url: "/project-version/",
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/projects/ProjectVersionPage.vue"),
      },
    ],
  },
  {
    path: "/bom/:id",
    props: {
      api_url: "/projects/api/get_projects_menu",
      router_url: "/project/",
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/projects/BOMPage.vue") },
    ],
  },
  {
    path: "/assembly-job/:id",
    props: {
      api_url: "/projects/api/get_projects_menu",
      router_url: "/project/",
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/projects/AssemblyJobPage.vue"),
      },
    ],
  },
  {
    path: "/parts",
    props: { api_url: "/parts/api/get_part_menu", router_url: "/parts/" },
    component: () => import("layouts/MainLayout.vue"),
  },
  {
    path: "/parts/:id",
    props: { api_url: "/parts/api/get_part_menu", router_url: "/parts/" },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/parts/PartsPage.vue") },
    ],
  },
  {
    path: "/partscadlib",
    props: {
      api_url: "/partscadlib/api/get_part_menu",
      router_url: "/partscadlib/",
    },
    component: () => import("layouts/MainLayout.vue"),
  },
  {
    path: "/partscadlib/:id",
    props: {
      api_url: "/partscadlib/api/get_part_menu",
      router_url: "/partscadlib/",
    },
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/PartsCADLibrary.vue") },
    ],
  },
  {
    path: "/assembly/:id",
    component: () => import("layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/projects/AssemblyDetailPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
