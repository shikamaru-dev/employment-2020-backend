const functions = require('firebase-functions');
const admin = require('firebase-admin');
const db = admin.firestore();

module.exports = functions.auth.user().onDelete((user) => {

    const displayName = user.displayName; // The display name of the user.

    let batch = db.batch();
    const usersRef = db.collection('users');
    const listsRef = db.collection('lists');

    const userDoc = usersRef.doc(user.uid);
    // User削除前に名前を更新
    userDoc.set({
        displayName: displayName
    }, { merge: true });

    const listsQuery = listsRef.where('user', '==', userDoc);

    return listsQuery.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            batch.delete(doc.ref)
        });
        return batch.commit();
    });
});
