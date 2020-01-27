import createPersistedState from 'vuex-persistedstate'
import firebase from '~/plugins/firebase'

export const strict = false

export const state = () => ({
  user: null
})

export const mutations = {
  setUser (state, user) {
    state.user = user
  }
}

export const actions = {
  // eslint-disable-next-line require-await
  async nuxtServerInit ({ commit }, { app, error, route, redirect, req }) {
    try {
      // firestoreに用事があるならここでやる
    } catch (e) {
    }
  },
  nuxtClientInit ({ commit, state, dispatch }, { req }) {
    createPersistedState()(this)
  },
  loginWithEmailAndPassword ({ commit }, { email, password }) {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          commit('setUser', user)
          resolve(user)
        })
        .catch(err => reject(err))
    })
  },

  loginWithCustomToken ({ commit }, { token }) {
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithCustomToken(token)
        .then((user) => {
          commit('setUser', user)
          resolve(user)
        })
        .catch(err => reject(err))
    })
  },

  logout ({ commit }) {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
        .then(() => {
          commit('setUser', null)
          resolve()
        })
    })
  },

  setUser ({ commit }, user) {
    commit('setUser', user)
  }
}

export const getters = {
  isAuthenticated (state) {
    return !!state.user
  },
  getUserId (state) {
    return state.user.user.uid
  }
}
