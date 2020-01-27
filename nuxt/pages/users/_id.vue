<template lang="pug">
  .container
    h1 ユーザー詳細：{{ $route.params.id }}
    v-simple-table
      tr
        th ユーザー名
        th メールアドレス
      tr(v-for="user in users"  :key="user.id")
        td {{ user.displayName }}
        td {{ user.email }}
</template>

<script>
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      users: []
    }
  },
  async asyncData (router) {
    const usersFunction = await firebase.functions().httpsCallable('users')({ userIds: [router.params.id] })
    const users = usersFunction.data.users
    return { users }
  }
}
</script>

<style lang="scss" scoped>
</style>
