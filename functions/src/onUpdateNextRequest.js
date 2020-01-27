const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const updateRequest = require('./func/updateRequest');
const notifyRequest = require('./func/notifyRequest');
const db = admin.firestore();

module.exports = functions.firestore
    .document('nextRequests/{departmentId}')
    .onUpdate(async (change, context) => {
        // 更新されたフラグで許可ならnextsに追加・拒否ならDelete
        const nextsRef = db.collection('nexts')
        await notifyRequest(admin, db, change.after, 'next').catch()
        await updateRequest(change.after, nextsRef)

        // 候補更新
        return createChangedFlag(admin, db)
    });
