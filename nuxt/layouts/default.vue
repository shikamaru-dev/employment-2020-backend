<template lang="pug">
  v-app(dark)
    v-navigation-drawer(v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" fixed app)
      v-list
        v-list-item(v-for="(item, i) in items" :key="i" :to="item.to" router exact)
          v-list-item-action
            v-icon {{ item.icon }}
          v-list-item-content
            v-list-item-title(v-text="item.title")
    v-app-bar(:clipped-left="clipped" fixed app)
      v-app-bar-nav-icon(@click.stop="drawer = !drawer")
      v-toolbar-title(v-text="title")
      v-spacer
      div(v-if="this.$store.getters.isAuthenticated")
        v-btn(@click="doLogout") LOGOUT
    v-content
      v-container
        nuxt
    v-footer(:fixed="fixed" app)
      span &copy; 2019
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'TOP',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Users',
          to: '/users'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'departments',
          to: '/departments'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'businessDays',
          to: '/businessDays'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'currents',
          to: '/currents'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'nexts',
          to: '/nexts'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'currentRequests',
          to: '/currentRequests'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'nextRequests',
          to: '/nextRequests'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'histories',
          to: '/histories'
        }
      ],
      miniVariant: false,
      title: '部門当番アプリ管理ツール'
    }
  },

  methods: {
    ...mapActions([
      'logout'
    ]),

    doLogout () {
      this.logout()
        .then(() => {
          this.$router.push('/login')
        })
        .catch(err => alert(err))
    }
  }
}
</script>
