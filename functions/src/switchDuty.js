const functions = require('firebase-functions');
const admin = require('firebase-admin');
const auth = admin.auth();
const db = admin.firestore();

module.exports = functions.https.onCall(async (data, context) => {

    console.log('data: ' + JSON.stringify(data))
    console.log('context.auth: ' + JSON.stringify(context.auth))
    if (context.auth) {
        console.log('context.auth.uid: ' + context.auth.uid)
    }
    // Next->Current->Historyの定時更新
    const nextsRef = db.collection('nexts');
    const currentsRef = db.collection('currents');
    const nextRequestsRef = db.collection('nextRequests');
    const currentRequestsRef = db.collection('currentRequests');
    const historiesRef = db.collection('histories');
    const businessDaysRef = db.collection('businessDays')

    const nextsDocs = await nextsRef.get();
    const currentsDocs = await currentsRef.get();
    const nextRequestsDocs = await nextRequestsRef.get();
    const currentRequestsDocs = await currentRequestsRef.get();

    const currentBusinessDayDoc = await businessDaysRef.doc('current').get();
    const nextBusinessDayDoc = await businessDaysRef.doc('next').get();

    const currentTimestamp = currentBusinessDayDoc.data().timestamp;
    const nextTimestamp = nextBusinessDayDoc.data().timestamp;
    const nextDate = nextTimestamp.toDate()
    const now = new Date()
    if (currentTimestamp.toDate() > now) {
        console.log("currentが未来の日付の為、更新しませんでした。");
        return {"message": "currentが未来の日付の為、更新しませんでした。"};
    }

    let batch = db.batch();

    currentsDocs.forEach((doc) => {
        const current = doc.data()
        current.timestamp = currentTimestamp
        batch.set(historiesRef.doc(), current)

        // 次の当番を指名していない場合もう一回当番のため、削除しない
        // batch.delete(doc.ref)
    });

    nextsDocs.forEach((doc) => {
        batch.set(currentsRef.doc(doc.id), doc.data())
        batch.delete(doc.ref)
    });

    currentRequestsDocs.forEach((doc) => {
        batch.delete(doc.ref)
    });

    nextRequestsDocs.forEach((doc) => {
        batch.set(currentRequestsRef.doc(doc.id), doc.data())
        batch.delete(doc.ref)
    });

    batch.set(businessDaysRef.doc('current'), {timestamp: nextTimestamp})
    nextDate.setDate(nextDate.getDate() + 1)
    batch.set(businessDaysRef.doc('next'), {timestamp: admin.firestore.Timestamp.fromDate(nextDate)})

    await batch.commit();

    console.log("更新しました。");
    return {"message": "更新しました。"};

});
