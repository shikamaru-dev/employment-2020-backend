const functions = require('firebase-functions');
const admin = require('firebase-admin');

const db = admin.firestore();

module.exports = functions.auth.user().onCreate((user) => {

    const email = user.email; // The email of the user.
    const displayName = user.displayName; // The display name of the user.

    const usersRef = db.collection('users');
    return usersRef.doc(user.uid).create({
        displayName: displayName,
        isAdmin: false,
        isActive: true
    })
});
