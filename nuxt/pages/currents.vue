<template lang="pug">
  .container
    h1 本日の該当部門
    v-simple-table
      tr
        th 担当箇所名
        th ユーザー名
      tr(v-for="current in currents"  :key="current.id")
        td {{ current.departmentName }}
        td {{ current.displayName }}
        td
          v-btn(small @click.stop="openDialog(current)")
            v-icon mdi-pencil
        td
          v-btn(small @click.stop="clickDelete(current.id)")
            v-icon mdi-delete
    v-btn(color="red" dark fixed bottom right fab @click.stop="openDialog()")
      v-icon mdi-plus
    v-dialog(v-model="dialog" max-width="720" persistent)
      v-card
        v-card-title
          .headline 登録/編集
        v-card-text(v-if="!loading")
          v-container
            v-select(v-model="department" :items="departments" label="掃除区域" item-text="name" item-value="id" return-object)
            v-select(v-model="user" :items="users" label="担当者" item-text="displayName" item-value="uid" return-object)
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
      currents: [],
      usersMap: {},
      departmentsMap: {},
      departments: [],
      users: [],

      department: null,
      user: null,
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

    const currents = []
    const currentDocs = await firebase.firestore().collection('currents').get()

    currentDocs.forEach((doc) => {
      const current = doc.data()
      current.id = doc.id
      current.departmentName = departmentsMap[current.department.id].name
      current.displayName = usersMap[current.user.id].displayName
      currents.push(current)
    })
    return { currents, usersMap, departmentsMap, departments, users }
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
      const currentsRef = firebase.firestore().collection('currents')

      const department = firebase.firestore().collection('departments').doc(this.department.id)
      const user = firebase.firestore().collection('users').doc(this.user.uid)
      if (this.department && this.user) {
        await currentsRef.doc(this.department.id).set({
          department,
          user
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
      await firebase.firestore().collection('currents').doc(id).delete()
      await this.resolveData()
      this.dialog = false
      this.loading = false
    },
    async resolveData () {
      const currents = []
      const currentDocs = await firebase.firestore().collection('currents').get()

      currentDocs.forEach((doc) => {
        const current = doc.data()
        current.id = doc.id
        current.departmentName = this.departmentsMap[current.department.id].name
        current.displayName = this.usersMap[current.user.id].displayName
        currents.push(current)
      })
      this.currents = currents
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
