declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    role?: string
    breadcrumbLabel?: string
  }
}

export {}
