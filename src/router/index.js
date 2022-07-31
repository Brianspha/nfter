import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import NFTView from '../views/NFTView.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'market',
    component: () => import(/* webpackChunkName: "about" */ '../views/NFTView.vue')  },
  {
    path: '/market',
    name: 'market',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/NFTView.vue')
  },
  {
    path: '/liked',
    name: 'liked',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/LikedNFTs.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/ProfileView.vue')
  },
  {
    path: '/nftdetails',
    name: 'nftdetails',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/NFTDetailsView.vue')
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/LeaderBoardView.vue')
  }
]

const router = new VueRouter({
  mode: 'abstract',
  base: process.env.BASE_URL,
  routes
})

export default router
