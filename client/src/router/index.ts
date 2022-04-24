import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Signin',
    component: () => import('../views/SignIn.vue'),
  },
  {
    path: '/auth',
    name: 'SignInOauth',
    component: () => import('../views/SignInOauth.vue'),
  },
  {
    path: '/:conference',
    name: 'Join',
    component: () => import('../views/Join.vue'),
    props: true,
  },
  {
    path: '/r/:conference',
    name: 'VideoConference',
    component: () => import('../views/VideoConference.vue'),
    props: true,
  },
  {
    path: '/',
    name: 'Left',
    component: () => import('../views/LeftMeeting.vue'),
    props: true,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
