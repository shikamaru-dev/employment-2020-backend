import firebase from 'firebase'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyB3WTqCO3dVCTpkVQJCUENhPfLmqBOyjYk',
    authDomain: 'employment-2020.firebaseapp.com',
    databaseURL: 'https://employment-2020.firebaseio.com',
    projectId: 'employment-2020',
    storageBucket: 'employment-2020.appspot.com',
    messagingSenderId: '84641608117',
    appId: '1:84641608117:web:44d740f85cc00777c069fc',
    measurementId: 'G-2VQZZ3KK2W'
  })
}

export default firebase
