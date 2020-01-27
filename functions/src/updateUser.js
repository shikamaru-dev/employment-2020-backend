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

    const uid = data.uid;
    const displayName = data.displayName;
    const email = data.email;
    const password = data.password;
    const disabled = data.disabled;
    const isAdmin = data.isAdmin;
    const isActive = data.isActive;

    const usersRef = db.collection('users');

    const userProperties = {};
    const userDocProperties = {};

    if (displayName) userProperties.displayName = displayName;
    if (email) userProperties.email = email;
    if (password) userProperties.password = password;
    if (disabled) userProperties.disabled = disabled;

    if (displayName) userDocProperties.displayName = displayName;
    if (isAdmin) userDocProperties.isAdmin = isAdmin;
    if (isActive) userDocProperties.isActive = isActive;

    const userRecord = await auth.updateUser(uid, userProperties)
        .then((userRecord) => {
            return userRecord
        }).catch((error) => {
            return error
        });
    if (userRecord.uid) {
        await usersRef.doc(userRecord.uid).set(userDocProperties, {merge: true});
        const userDoc = await usersRef.doc(userRecord.uid).get();
        const user = {
            uid: userRecord.uid,
            displayName: userRecord.displayName,
            email: userRecord.email,
            isAdmin: userDoc.data().isAdmin,
            isActive: userDoc.data().isActive,
            disabled: userRecord.disabled
        };
        return {user: user};
    } else {
        return {error: userRecord};
    }
});
