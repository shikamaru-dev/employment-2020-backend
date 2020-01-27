<template lang="pug">
  .container
    h1 ユーザー一覧
    v-simple-table
      tr
        th uid
        th ユーザー名
        th メールアドレス
        th 管理者
        th 割当可
        th アカウント無効
      tr(v-for="user in users"  :key="user.uid")
        td
          nuxt-link(:to="{ name : 'users-id', params : { id: user.uid }}") {{ user.uid }}
        td {{ user.displayName }}
        td {{ user.email }}
        td {{ user.isAdmin }}
        td {{ user.isActive }}
        td {{ user.disabled }}
        td
          v-btn(small @click.stop="openDialog(user)")
            v-icon mdi-pencil
        td
          v-btn(small @click.stop="clickDelete(user.uid)")
            v-icon mdi-delete
    br
    v-btn(href="https://console.firebase.google.com/project/employment-2020/authentication/users" target="_blank") Firebase Authentication
    v-btn(color="red" dark fixed bottom right fab @click.stop="openDialog()")
      v-icon mdi-plus
    v-dialog(v-model="dialog" max-width="720" persistent)
      v-card
        v-card-title
          .headline ユーザー登録/編集
        v-card-text(v-if="!loading")
          v-container
            v-text-field(v-model="displayName" label="displayName" hint="表示名" required)
            v-text-field(v-model="email" type="email" label="Email" hint="メールアドレス" required)
            v-text-field(v-model="password" type="password" label="Password" hint="パスワード" required)
            v-switch(v-model="isAdmin" label="管理者" dark)
            v-switch(v-model="isActive" label="割当可否" dark)
        v-card-text(v-if="loading") Please stand by
          v-progress-linear(indeterminate color="white" class="mb-0")
        v-card-actions(v-if="!loading")
          v-spacer
          v-btn(color="blue darken-1" @click="clickCancel()") キャンセル
          v-btn(color="blue darken-1" @click="clickRegist()") 登録
</template>

<script>
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      users: [],
      dialog: false,

      uid: '',
      displayName: '',
      email: '',
      password: '',
      isAdmin: false,
      isActive: true,

      loading: false
    }
  },
  async asyncData () {
    const usersFunction = await firebase.functions().httpsCallable('users')({ userIds: [] })
    const users = usersFunction.data.users
    return { users }
  },
  methods: {
    openDialog (data) {
      if (data) {
        this.uid = data.uid
        this.displayName = data.displayName
        this.email = data.email
        this.isAdmin = data.isAdmin
        this.isActive = data.isActive
      } else {
        this.clearData()
      }
      this.dialog = true
    },
    clickCancel () {
      this.clearData()
      this.dialog = false
    },
    async clickRegist () {
      this.loading = true
      let result
      if (!this.uid) {
        // 新規登録
        result = await firebase.functions().httpsCallable('createUser')({
          displayName: this.displayName,
          email: this.email,
          password: this.password,
          isAdmin: this.isAdmin,
          isActive: this.isActive
        }).then((result) => { return result })
          .catch((error) => { return error })
      } else {
        // 更新
        const updateData = {}
        updateData.uid = this.uid
        if (this.displayName) { updateData.displayName = this.displayName }
        if (this.email) { updateData.email = this.email }
        if (this.password) { updateData.password = this.password }
        updateData.isAdmin = this.isAdmin
        updateData.isActive = this.isActive

        result = await firebase.functions().httpsCallable('updateUser')(updateData)
          .then((result) => { return result })
          .catch((error) => { return error })
      }
      await this.resolveData(result.data)
      this.clearData()
      this.dialog = false
      this.loading = false
    },
    async clickDelete (uid) {
      this.loading = true
      this.dialog = true
      const result = await firebase.functions().httpsCallable('deleteUser')({
        uid
      }).then((result) => { return result })
        .catch((error) => { return error })
      await this.resolveData(result.data)
      this.dialog = false
      this.loading = false
    },
    async resolveData (data) {
      if (data) {
        if (!data.error) {
          const usersFunction = await firebase.functions().httpsCallable('users')({ userIds: [] })
          this.users = usersFunction.data.users
          alert('success!')
        } else {
          alert(data.error.errorInfo.message)
        }
      } else {
        alert('unknown error')
      }
    },
    clearData () {
      this.uid = ''
      this.displayName = ''
      this.email = ''
      this.password = ''
      this.isAdmin = false
      this.isActive = true
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
