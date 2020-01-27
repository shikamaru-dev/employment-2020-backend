<template lang="pug">
  .container
    h1 掃除種別詳細：{{ department.name }}
    br
    v-simple-table
      tr
        th 本日
        td {{ current }}
      tr
        th 翌営業日
        td {{ next }}
    br
    h2 画像のアップロード
    v-file-input(chips multiple label="月曜日" @change="onFilePickedMon" accept="image/*")
    v-file-input(chips multiple label="火曜日" @change="onFilePickedTue" accept="image/*")
    v-file-input(chips multiple label="水曜日" @change="onFilePickedWed" accept="image/*")
    v-file-input(chips multiple label="木曜日" @change="onFilePickedThu" accept="image/*")
    v-file-input(chips multiple label="金曜日" @change="onFilePickedFri" accept="image/*")
    br
    h2 リスト
    template
      v-data-table.elevation-1(
        v-bind:headers="headers"
        :items="userList"
        ref="sortableTable"
        )
        template(v-slot:body="{ items }")
          tbody
            tr.sortableRow(v-for="item in items" :key="item.docId")
              td.px-1(style="width: 0.1%")
                v-btn.sortHandle(style="cursor: move" icon)
                  v-icon mdi-menu
              td {{item.docId}}
              td {{item.displayName}}
              td {{item.priority}}
              td {{item.count}}
              td
                v-btn(small @click.stop="openDialog(item)")
                  v-icon mdi-pencil
              td
                v-btn(small @click.stop="clickDelete(item.docId)")
                  v-icon mdi-delete
    br
    h2 今日の掃除候補
      v-simple-table
        tr(v-for="(user, index) in currentCandidates"  :key="user.uid")
          td {{ index }}
          td
            nuxt-link(:to="{ name : 'users-id', params : { id: user.uid }}") {{ user.uid }}
          td {{ user.displayName }}
    br
    h2 明日の掃除候補
      v-simple-table
        tr(v-for="(user, index) in nextCandidates"  :key="user.uid")
          td {{ index }}
          td
            nuxt-link(:to="{ name : 'users-id', params : { id: user.uid }}") {{ user.uid }}
          td {{ user.displayName }}
    v-dialog(v-model="dialog" max-width="720" persistent)
      v-card
        v-card-title
          .headline 編集
        v-card-text(v-if="!loading")
          v-container
            v-text-field(v-model="priority" type="number" label="priority" hint="優先度" required)
            v-text-field(v-model="count" type="number" label="count" hint="掃除回数" required)
        v-card-text(v-if="loading") Please stand by
          v-progress-linear(indeterminate color="white" class="mb-0")
        v-card-actions(v-if="!loading")
          v-spacer
          v-btn(color="blue darken-1" @click="clickCancel()") キャンセル
          v-btn(color="blue darken-1" @click="clickRegist()") 登録
</template>

<script>
import Sortable from 'sortablejs'
import firebase from '~/plugins/firebase'

export default {
  data () {
    return {
      department: null,
      current: null,
      next: null,
      userList: [],
      currentCandidates: [],
      nextCandidates: [],
      imageName: '',
      imageUrl: '',

      dialog: false,
      loading: false,
      priority: 0,
      count: 0,
      docId: '',

      headers: [
        { sortable: false },
        { text: 'DocumentId', value: 'docId', sortable: false },
        { text: 'displayName', value: 'displayName', sortable: false },
        { text: 'priority', value: 'priority', sortable: false },
        { text: 'count', value: 'count', sortable: false },
        { sortable: false }
      ]
    }
  },
  async asyncData (router) {
    const departmentDoc = await firebase.firestore().collection('departments').doc(router.params.id).get()
    const candidateDoc = await firebase.firestore().collection('candidates').doc(router.params.id).get()
    const currentDoc = await firebase.firestore().collection('currents').doc(router.params.id).get()
    const nextDoc = await firebase.firestore().collection('nexts').doc(router.params.id).get()
    const listDocs = await firebase.firestore().collection('lists').where('department', '==', departmentDoc.ref).orderBy('priority', 'asc').get()

    const users = await firebase.functions().httpsCallable('users')({ userIds: [] })
    const usersMap = {}
    users.data.users.map((user) => {
      usersMap[user.uid] = user
    })

    const userList = []
    listDocs.forEach((doc) => {
      const u = Object.create(usersMap[doc.data().user.id])
      u.docId = doc.id
      u.priority = doc.data().priority
      u.count = doc.data().count
      userList.push(u)
    })
    let current = '未定'
    let next = '未定'
    if (currentDoc.exists) {
      current = usersMap[currentDoc.data().user.id].displayName
    }
    if (nextDoc.exists) {
      next = usersMap[nextDoc.data().user.id].displayName
    }
    const currentCandidates = candidateDoc.data().currents.map(userRef => Object.create(usersMap[userRef.id]))
    const nextCandidates = candidateDoc.data().nexts.map(userRef => Object.create(usersMap[userRef.id]))
    const department = departmentDoc.data()
    return { department, currentCandidates, nextCandidates, userList, usersMap, current, next }
  },
  mounted () {
    /* eslint-disable no-new */
    this.$nextTick(function () {
      new Sortable(
        this.$refs.sortableTable.$el.getElementsByTagName('tbody')[0],
        {
          draggable: '.sortableRow',
          handle: '.sortHandle',
          onEnd: this.dragReorder
        }
      )
    })
  },
  methods: {
    dragReorder ({ oldIndex, newIndex }) {
      const movedItem = this.userList.splice(oldIndex, 1)[0]
      const listDoc = firebase.firestore().collection('lists').doc(movedItem.docId)
      let min = 0
      let max = 1
      if (newIndex > 0) {
        min = this.userList[newIndex - 1].priority
      }
      if (newIndex < this.userList.length) {
        max = this.userList[newIndex].priority
      }
      const priority = (min + max) / 2
      movedItem.priority = priority
      listDoc.set({
        priority
      }, { merge: true })
      this.userList.splice(newIndex, 0, movedItem)
    },
    openDialog (data) {
      this.priority = data.priority
      this.count = data.count
      this.docId = data.docId
      this.dialog = true
    },
    clickCancel () {
      this.dialog = false
    },
    async clickRegist () {
      this.loading = true
      const listRef = firebase.firestore().collection('lists')
      await listRef.doc(this.docId).set({
        priority: this.priority,
        count: this.count
      }, { merge: true })
      await firebase.firestore().collection('changedFlags').doc(this.$route.params.id).set({
        department: firebase.firestore().collection('departments').doc(this.$route.params.id)
      })
      await this.resolveData()
      this.dialog = false
      this.loading = false
    },
    async clickDelete (id) {
      this.loading = true
      this.dialog = true
      const listRef = firebase.firestore().collection('lists')
      await listRef.doc(id).delete()
      await firebase.firestore().collection('changedFlags').doc(this.$route.params.id).set({
        department: firebase.firestore().collection('departments').doc(this.$route.params.id)
      })
      // データ更新
      await this.resolveData()
      this.dialog = false
      this.loading = false
    },
    async resolveData () {
      const departmentDoc = await firebase.firestore().collection('departments').doc(this.$route.params.id).get()
      const candidateDoc = await firebase.firestore().collection('candidates').doc(this.$route.params.id).get()
      const listDocs = await firebase.firestore().collection('lists').where('department', '==', departmentDoc.ref).orderBy('priority', 'asc').get()
      const userList = []
      listDocs.forEach((doc) => {
        const u = Object.create(this.usersMap[doc.data().user.id])
        u.docId = doc.id
        u.priority = doc.data().priority
        u.count = doc.data().count
        userList.push(u)
      })

      const currentCandidates = candidateDoc.data().currents.map(userRef => Object.create(this.usersMap[userRef.id]))
      const nextCandidates = candidateDoc.data().nexts.map(userRef => Object.create(this.usersMap[userRef.id]))
      this.currentCandidates = currentCandidates
      this.nextCandidates = nextCandidates
      this.userList = userList
    },
    onFilePickedMon (e) {
      this.onFilePicked(e, 'Mon')
    },
    onFilePickedTue (e) {
      this.onFilePicked(e, 'Tue')
    },
    onFilePickedWed (e) {
      this.onFilePicked(e, 'Wed')
    },
    onFilePickedThu (e) {
      this.onFilePicked(e, 'Thu')
    },
    onFilePickedFri (e) {
      this.onFilePicked(e, 'Fri')
    },
    onFilePicked (e, dow) {
      const file = e[0]
      if (file !== undefined) {
        this.imageName = file.name
        if (this.imageName.lastIndexOf('.') <= 0) {
          return
        }
        const ext = this.imageName.split('.').pop()
        const storageRef = firebase.storage().ref()
        // ファイルのパスを設定
        const mountainsRef = storageRef.child(`images/${this.$route.params.id}/${dow}.${ext}`)
        // ファイルを適用してファイルアップロード開始
        mountainsRef.put(file).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.imageUrl = downloadURL
          })
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
