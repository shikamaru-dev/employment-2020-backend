const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = admin.auth();
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {

    console.log('data: ' + JSON.stringify(data))
    console.log('context.auth: ' + JSON.stringify(context.auth))
    if (context.auth) {
        console.log('context.auth.uid: ' + context.auth.uid)
    } else {
        throw new functions.https.HttpsError(
            'failed-precondition', 'The function must be called while authenticated.')
    }

    const userIds = data.userIds;
    let users = [];

    const querySnapshot = await db.collection('users').get()
    const dbUsers = [];
    querySnapshot.forEach((doc) => {
        dbUsers[doc.id] = doc.data()
    });

    // TODO 処理をまとめる
    if (userIds === null || userIds.length < 1) {
        const allUsers = await auth.listUsers()
        for (let user of allUsers.users) {
            if(!dbUsers[user.uid]) continue;
            users.push({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                isAdmin: dbUsers[user.uid].isAdmin,
                isActive: dbUsers[user.uid].isActive,
                token: dbUsers[user.uid].token,
                disabled: user.disabled
            })
        }
    } else {
        for (let userId of userIds) {
            if(!dbUsers[userId]) continue;
            const user = auth.getUser(userId);
            users.push({
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                isAdmin: dbUsers[user.uid].isAdmin,
                isActive: dbUsers[user.uid].isActive,
                token: dbUsers[user.uid].token,
                disabled: user.disabled
            })
        }
    }

    console.log('userId: ' + JSON.stringify(users))
    return {users: users};

});
