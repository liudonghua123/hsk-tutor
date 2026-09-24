import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from './stores/user'

// Views
import Home from './views/Home.vue'
import ReadList from './views/ReadList.vue'
import WriteList from './views/WriteList.vue'
import GrammarList from './views/GrammarList.vue'
import GrammarDetail from './views/GrammarDetail.vue'
import WordDetail from './views/WordDetail.vue'
import Favorites from './views/Favorites.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/read',
    name: 'Read',
    component: ReadList
  },
  {
    path: '/read/:level',
    name: 'ReadLevel',
    component: ReadList
  },
  {
    path: '/write',
    name: 'Write',
    component: WriteList
  },
  {
    path: '/write/:level',
    name: 'WriteLevel',
    component: WriteList
  },
  {
    path: '/grammar',
    name: 'Grammar',
    component: GrammarList
  },
  {
    path: '/grammar/:level',
    name: 'GrammarLevel',
    component: GrammarList
  },
  {
    path: '/grammar/:level/:id',
    name: 'GrammarDetail',
    component: GrammarDetail
  },
  {
    path: '/word/:word',
    name: 'WordDetail',
    component: WordDetail
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard - re-initialize user from URL on each navigation
// (handles case where URL has user param from external link)
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const urlUser = to.query.user

  // Sync user from URL to store if different
  if (urlUser && urlUser !== userStore.userId) {
    userStore.setUser(urlUser)
  }

  next()
})

export default router