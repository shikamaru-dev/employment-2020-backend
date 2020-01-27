const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const db = admin.firestore();

module.exports = functions.firestore
    .document('users/{userId}')
    .onCreate(async (change, context) => {

        let batch = db.batch();
        const listsRef = db.collection('lists');
        const departmentsRefs = await db.collection('departments').get();

        await Promise.all(departmentsRefs.docs.map( async (departmentDoc) => {
            const countDocs = listsRef
                .where("department", "==", departmentDoc.ref)
                .orderBy("count")
                .limit(1)
                .get();
            await countDocs.then((docs) => {
                let count = 0;
                docs.forEach((listDoc) => {
                    count = listDoc.data().count
                });

                batch.set(listsRef.doc(), {
                    user: change.ref,
                    department: departmentDoc.ref,
                    priority: Math.random(),
                    count: count
                })

              return true;
            })
        }));

        await batch.commit();

        return Promise.all(departmentsRefs.docs.map( (departmentDoc) => {
            createChangedFlag(admin, db, departmentDoc.ref);
        }));
    });
