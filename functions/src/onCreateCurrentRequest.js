const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createChangedFlag = require('./func/createChangedFlag');
const updateRequest = require('./func/updateRequest');
const notifyRequest = require('./func/notifyRequest');
const db = admin.firestore();

module.exports = functions.firestore
    .document('currentRequests/{departmentId}')
    .onCreate(async (change, context) => {
        // 当番割り当てリクエスト
        const currentsRef = db.collection('currents')
        await notifyRequest(admin, db, change, 'current').catch()
        await updateRequest(change, currentsRef)

        // 候補更新
        return createChangedFlag(admin, db)
    });
