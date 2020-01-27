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

    // TODO 認証
    const displayName = data.displayName;
    const email = data.email;
    const password = data.password;
    const isAdmin = data.isAdmin || false;
    const isActive = data.isActive || true;

    const usersRef = db.collection('users');

    const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName
    }).then((userRecord) => {
        return userRecord
    }).catch((error) => {
        return error
    });

    if (userRecord.uid) {
        await usersRef.doc(userRecord.uid).set({
            isAdmin: isAdmin,
            isActive: isActive,
            displayName: displayName
        });
        const user = {
            uid: userRecord.uid,
            displayName: userRecord.displayName,
            email: userRecord.email,
            isAdmin: isAdmin,
            isActive: isActive,
            disabled: userRecord.disabled
        };
        return {user: user};
    } else {
        return {error: userRecord};
    }
});
