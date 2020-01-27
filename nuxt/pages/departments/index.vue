<template lang="pug">
  .container
    h1 部門一覧
    v-simple-table
      tr
        th ID
        th 部門名
        th アイコン
        th 優先度
        th 概要
      tr(v-for="department in departments"  :key="department.id")
        td
          nuxt-link(:to="{ name : 'departments-id', params : { id: department.id }}") {{ department.id }}
        td {{ department.name }}
        td {{ department.icon }}
        td {{ department.priority }}
        td {{ department.description }}
        td
          v-btn(small @click.stop="openDialog(department)")
            v-icon mdi-pencil
        td
          v-btn(small @click.stop="clickDelete(department.id)")
            v-icon mdi-delete
    br
    v-btn(color="red" dark fixed bottom right fab @click.stop="openDialog()")
      v-icon mdi-plus
    v-dialog(v-model="dialog" max-width="720" persistent)
      v-card
        v-card-title
          .headline 部門登録/編集
        v-card-text(v-if="!loading")
          v-container
            v-text-field(v-model="name" label="name" hint="部門名" required)
            v-textarea(v-model="description" label="description" hint="説明" required)
            v-text-field(v-model="priority" type="number" label="priority" hint="プライオリティ" required)
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

      id: '',
      name: '',
      priority: 0,
      description: '',

      loading: false
    }
  },
  async asyncData () {
    const departmentsDocs = await firebase.firestore().collection('departments').orderBy('priority', 'asc').get()
    const departments = []
    departmentsDocs.forEach((doc) => {
      const department = doc.data()
      department.id = doc.id
      departments.push(department)
    })
    return { departments }
  },
  methods: {
    openDialog (data) {
      if (data) {
        this.id = data.id
        this.name = data.name
        this.priority = data.priority
        this.description = data.description
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
      const departmentsRef = firebase.firestore().collection('departments')
      if (!this.id) {
        // 新規登録
        await departmentsRef.doc().set({
          name: this.name,
          priority: this.priority,
          description: this.description
        })
      } else {
        // 更新
        await departmentsRef.doc(this.id).set({
          name: this.name,
          priority: this.priority,
          description: this.description
        }, { merge: true })
      }

      this.clearData()
      this.dialog = false
      this.loading = false
      this.departments = await this.fetchData()
    },
    async clickDelete (id) {
      this.loading = true
      this.dialog = true
      const departmentsRef = firebase.firestore().collection('departments')

      await departmentsRef.doc(id).delete()

      this.dialog = false
      this.loading = false
      this.departments = await this.fetchData()
    },
    clearData () {
      this.id = ''
      this.name = ''
      this.priority = 0
      this.description = ''
    },
    async fetchData () {
      const departmentsDocs = await firebase.firestore().collection('departments').orderBy('priority', 'asc').get()
      const departments = []
      departmentsDocs.forEach((doc) => {
        const department = doc.data()
        department.id = doc.id
        departments.push(department)
      })
      return departments
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
