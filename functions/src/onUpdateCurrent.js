const functions = require('firebase-functions');
const admin = require('firebase-admin');
const updateDuty = require('./func/updateDuty');
const db = admin.firestore();

module.exports = functions.firestore
    .document('currents/{departmentId}')
    .onUpdate(async (change, context) => {
        // 当番割り当て通知

        // listsのCountを増減する
        return updateDuty(admin, db, change.before, change.after);
    });
