<template lang="pug">
  .container
    h1 営業日の変更
      v-row(justify="space-around")
        v-col
          label 本日
          v-date-picker(style="height:480px;" v-model="current" color="green lighten-1" landscape="landscape" locale="ja" @change="onChangeCurrent")
        v-col
          label 翌営業日
          v-date-picker(style="height:480px;" v-model="next" color="green lighten-1" landscape="landscape" locale="ja" @change="onChangeNext")
</template>

<script>
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      current: new Date().toISOString().substr(0, 10),
      next: new Date().toISOString().substr(0, 10)
    }
  },
  async asyncData () {
    let current = new Date().toISOString().substr(0, 10)
    let next = new Date().toISOString().substr(0, 10)
    const currentDoc = await firebase.firestore().collection('businessDays').doc('current').get()
    const nextDoc = await firebase.firestore().collection('businessDays').doc('next').get()
    if (currentDoc.exists) {
      current = currentDoc.data().timestamp.toDate()
      current.setHours(current.getHours() + 9)
      current = current.toISOString().substr(0, 10)
    }
    if (nextDoc.exists) {
      next = nextDoc.data().timestamp.toDate()
      next.setHours(next.getHours() + 9)
      next = next.toISOString().substr(0, 10)
    }
    return { current, next }
  },
  methods: {
    onChangeCurrent (s) {
      const current = new Date(s)
      current.setHours(current.getUTCHours())
      const currentTimestamp = firebase.firestore.Timestamp.fromDate(current)
      const currentDoc = firebase.firestore().collection('businessDays').doc('current')
      currentDoc.set({
        timestamp: currentTimestamp
      })
    },
    onChangeNext (s) {
      const next = new Date(s)
      next.setHours(next.getUTCHours())
      const nextTimestamp = firebase.firestore.Timestamp.fromDate(next)
      const nextDoc = firebase.firestore().collection('businessDays').doc('next')
      nextDoc.set({
        timestamp: nextTimestamp
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
