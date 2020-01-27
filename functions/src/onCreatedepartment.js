const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const auth = admin.auth();
const db = admin.firestore();

module.exports = functions.firestore
    .document('departments/{departmentId}')
    .onCreate(async (change, context) => {

        let batch = db.batch();
        const listsRef = db.collection('lists');
        const userRefs = await auth.listUsers();
        await Promise.all(userRefs.users.map(async (user) => {
            await batch.set(listsRef.doc(), {
                user: db.collection('user').doc(user.uid),
                department: change.ref,
                priority: Math.random(),
                count: 0
            })
        }));

        await batch.commit();
        return createChangedFlag(admin, db, change.data().department);
    });
