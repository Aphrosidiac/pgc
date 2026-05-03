import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/', component: () => import('./views/Queue.vue') },
  { path: '/feed', component: () => import('./views/Feed.vue') },
  { path: '/users', component: () => import('./views/Users.vue') },
  { path: '/filters', component: () => import('./views/Filters.vue') },
  { path: '/workflow', component: () => import('./views/Workflow.vue') },
  { path: '/stats', component: () => import('./views/Stats.vue') },
  { path: '/logs', component: () => import('./views/Logs.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
