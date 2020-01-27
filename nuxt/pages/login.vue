<template lang="pug">
  .container
    div(v-if="loading")
      v-progress-circular
    div(v-else)
      h1 login
      div
        br
        v-text-field(label="E-mail" type="email" v-model="email")
        br
        v-text-field(label="Password" type="password" v-model="password")
        v-btn(@click='doLoginWithEmailAndPassword') ログイン
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    ...mapActions([
      'loginWithEmailAndPassword',
      'setUser'
    ]),
    doLoginWithEmailAndPassword () {
      this.loading = true
      this.loginWithEmailAndPassword({ email: this.email, password: this.password })
        .then((user) => {
        // ログインしたら飛ぶページを指定
          this.setUser(user)
          this.$router.push('/')
        }).catch((error) => {
          this.loading = false
          alert(error)
        })
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
