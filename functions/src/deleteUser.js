const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = admin.auth();
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {

    console.log('data: ' + JSON.stringify(data));
    console.log('context.auth: ' + JSON.stringify(context.auth));
    if (context.auth) {
        console.log('context.auth.uid: ' + context.auth.uid);
    } else {
        throw new functions.https.HttpsError(
            'failed-precondition', 'The function must be called while authenticated.')
    }

    // TODO 各DBの掃除
    const uid = data.uid;
    return await auth.deleteUser(uid).then(() => {
        return  {}
    }).catch((error) => {
        return {error: error}
    });
});
