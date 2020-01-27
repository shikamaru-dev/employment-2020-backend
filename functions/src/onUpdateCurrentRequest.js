const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const updateRequest = require('./func/updateRequest');
const notifyRequest = require('./func/notifyRequest');
const db = admin.firestore();

module.exports = functions.firestore
    .document('currentRequests/{departmentId}')
    .onUpdate(async (change, context) => {

        // 更新されたフラグで許可ならcurrentsに追加・拒否ならDelete
        const currentsRef = db.collection('currents')
        await notifyRequest(admin, db, change.after, 'current').catch()
        await updateRequest(change.after, currentsRef)

        // 候補更新
        return createChangedFlag(admin, db)
    });
