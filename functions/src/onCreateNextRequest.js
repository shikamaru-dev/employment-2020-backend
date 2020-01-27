const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const updateRequest = require('./func/updateRequest');
const notifyRequest = require('./func/notifyRequest');
const db = admin.firestore();

module.exports = functions.firestore
    .document('nextRequests/{departmentId}')
    .onCreate(async (change, context) => {
        // 当番割り当てリクエスト
        const nextsRef = db.collection('nexts')

        await notifyRequest(admin, db, change, 'next').catch()
        await updateRequest(change, nextsRef)


        // 候補更新
        return createChangedFlag(admin, db)
    });
