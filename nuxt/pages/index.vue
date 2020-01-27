<template lang="pug">
  .container
    h1 部門当番表
    v-simple-table
      tr
        th 部門名
        th 今の当番
        th 次の当番
      tr(v-for="department in departments"  :key="department.name")
       td {{ department.name }}
       td {{ department.currentCleaner.displayName }}
       td {{ department.nextCleaner.displayName }}
</template>

<script>
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      departments: []
    }
  },
  async asyncData () {
    const getdepartments = firebase.firestore().collection('departments').orderBy('priority', 'asc').get()
    const getCurrents = firebase.firestore().collection('currents').get()
    const getNexts = firebase.firestore().collection('nexts').get()
    const getUsers = firebase.functions().httpsCallable('users')({ userIds: [] })

    const result = await Promise.all([getdepartments, getCurrents, getNexts, getUsers])
    const querySnapshot = result[0]
    const currentQuerySnapshot = result[1]
    const nextQuerySnapshot = result[2]
    const usersFunction = result[3]

    const users = usersFunction.data.users
    const usersMap = {}
    const departments = []
    const currents = {}
    const nexts = {}
    users.map((user) => {
      usersMap[user.uid] = user
    })
    currentQuerySnapshot.forEach((doc) => {
      currents[doc.id] = doc.data()
    })
    nextQuerySnapshot.forEach((doc) => {
      nexts[doc.id] = doc.data()
    })
    querySnapshot.forEach((doc) => {
      const department = doc.data()
      if (currents[doc.id]) {
        department.currentCleaner = usersMap[currents[doc.id].user.id]
      } else {
        department.currentCleaner = { displayName: '未定' }
      }

      if (nexts[doc.id]) {
        department.nextCleaner = usersMap[nexts[doc.id].user.id]
      } else {
        department.nextCleaner = { displayName: '未定' }
      }
      departments.push(department)
    })
    return { departments }
  }
}
</script>

<style lang="scss" scoped>
</style>
