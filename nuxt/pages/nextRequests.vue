<template lang="pug">
  .container
    h1 翌営業日のリクエスト
    v-simple-table
      tr
        th 部門名
        th ユーザー名
        th リクエストユーザー名
        th Approval
      tr(v-for="next in nexts"  :key="next.id")
        td {{ next.departmentName }}
        td {{ next.displayName }}
        td {{ next.requestUserName }}
        td {{ next.approval }}
        td
          v-btn(small @click.stop="openDialog(next)")
            v-icon mdi-pencil
        td
          v-btn(small @click.stop="clickDelete(next.id)")
            v-icon mdi-delete
    v-btn(color="red" dark fixed bottom right fab @click.stop="openDialog()")
      v-icon mdi-plus
    v-dialog(v-model="dialog" max-width="720" persistent)
      v-card
        v-card-title
          .headline 登録/編集
        v-card-text(v-if="!loading")
          v-container
            v-select(v-model="department" :items="departments" label="担当部門" item-text="name" item-value="id" return-object)
            v-select(v-model="user" :items="users" label="担当者" item-text="displayName" item-value="uid" return-object)
            v-text-field(v-model="approval" type="number" label="承認フラグ" hint="0=未チェック,1=承認,2=拒否" required)
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
      nexts: [],
      usersMap: {},
      departmentsMap: {},
      departments: [],
      users: [],

      department: null,
      user: null,
      approval: 0,
      loading: false,
      dialog: false
    }
  },
  async asyncData () {
    const usersFunction = await firebase.functions().httpsCallable('users')({ userIds: [] })
    const users = usersFunction.data.users
    const usersMap = {}
    const departmentsMap = {}
    const departments = []
    users.map((user) => {
      usersMap[user.uid] = user
    })
    const departmentDocs = await firebase.firestore().collection('departments').get()
    departmentDocs.forEach((doc) => {
      const department = doc.data()
      department.id = doc.id
      departments.push(department)
      departmentsMap[doc.id] = department
    })

    const nexts = []
    const nextDocs = await firebase.firestore().collection('nextRequests').get()

    nextDocs.forEach((doc) => {
      const next = doc.data()
      next.id = doc.id
      next.departmentName = departmentsMap[next.department.id].name
      next.displayName = usersMap[next.user.id].displayName
      next.requestUserName = usersMap[next.requestUser.id].displayName
      nexts.push(next)
    })
    return { nexts, usersMap, departmentsMap, departments, users }
  },
  methods: {
    openDialog (data) {
      if (data) {
        this.user = { uid: data.user.id, displayName: data.displayName }
        this.department = { name: data.departmentName, id: data.id }
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
      const nextsRef = firebase.firestore().collection('nextRequests')

      const department = firebase.firestore().collection('departments').doc(this.department.id)
      const user = firebase.firestore().collection('users').doc(this.user.uid)
      const requestUser = firebase.firestore().collection('users').doc(this.$store.getters.getUserId)
      if (this.department && this.user) {
        await nextsRef.doc(this.department.id).set({
          department,
          user,
          requestUser,
          approval: Number(this.approval)
        }).then((result) => {
          this.resolveData()
        })
          .catch((error) => { alert(error) })
      }

      this.clearData()
      this.dialog = false
      this.loading = false
    },
    async clickDelete (id) {
      this.loading = true
      this.dialog = true
      await firebase.firestore().collection('nextRequests').doc(id).delete()
      await this.resolveData()
      this.dialog = false
      this.loading = false
    },
    async resolveData () {
      const nexts = []
      const nextDocs = await firebase.firestore().collection('nextRequests').get()

      nextDocs.forEach((doc) => {
        const next = doc.data()
        next.id = doc.id
        next.departmentName = this.departmentsMap[next.department.id].name
        next.displayName = this.usersMap[next.user.id].displayName
        next.requestUserName = this.usersMap[next.requestUser.id].displayName
        nexts.push(next)
      })
      this.nexts = nexts
    },
    clearData () {
      this.department = null
      this.user = null
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
