<template lang="pug">
  .container
    v-tabs
      v-tab(v-for="value in tabNames"  :key="value") {{ value }}
      v-tab-item(v-for="history in histories" :key="history")
        v-simple-table
          tr(v-for="user in history" :key="user.docId")
            td {{ user.timestamp }}
            td {{ user.displayName }}
</template>

<script>
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      histories: {},
      tabNames: {}
    }
  },
  async asyncData () {
    const historyDocs = await firebase.firestore().collection('histories').orderBy('timestamp', 'desc').get()
    const departmentDocs = await firebase.firestore().collection('departments').orderBy('priority', 'asc').get()

    const users = await firebase.functions().httpsCallable('users')({ userIds: [] })
    const usersMap = {}
    users.data.users.map((user) => {
      usersMap[user.uid] = user
    })

    const histories = {}
    const tabNames = {}
    departmentDocs.forEach((doc) => {
      histories[doc.id] = []
      tabNames[doc.id] = doc.data().name
    })
    historyDocs.forEach((doc) => {
      const u = Object.create(usersMap[doc.data().user.id])
      u.docId = doc.id
      u.timestamp = doc.data().timestamp.toDate().toLocaleDateString()
      u.count = doc.data().count
      histories[doc.data().department.id].push(u)
    })
    return { histories, tabNames }
  }
}
</script>

<style lang="scss" scoped>
</style>
