import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/homeView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/loginView.vue')
    }
  ],
})

export default router
