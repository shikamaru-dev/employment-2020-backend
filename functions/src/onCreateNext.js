const functions = require('firebase-functions');
const admin = require('firebase-admin');
const updateDuty = require('./func/updateDuty');
const db = admin.firestore();


module.exports = functions.firestore
    .document('nexts/{departmentId}')
    .onCreate(async (change, context) => {
        // 当番割り当て通知

        // listsのCountを増やす
        return updateDuty(admin, db, null, change);
    });
