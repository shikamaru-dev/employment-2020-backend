const functions = require('firebase-functions');
const admin = require('firebase-admin');
const updateDuty = require('./func/updateDuty');
const db = admin.firestore();

module.exports = functions.firestore
    .document('nexts/{departmentId}')
    .onDelete(async (change, context) => {
        // 当番拒否通知

        // listsのCountを減らす
        return updateDuty(admin, db, change, null);
    });
