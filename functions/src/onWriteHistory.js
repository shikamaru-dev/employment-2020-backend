const functions = require('firebase-functions');
const admin = require('firebase-admin');
const updateDuty = require('./func/updateDuty');
const db = admin.firestore();

module.exports = functions.firestore
    .document('histories/{departmentId}')
    .onWrite(async (change, context) => {
        // listsのCountを増減する
        const before = change.before.exists ? change.before : null;
        const after = change.after.exists ? change.after : null;
        return updateDuty(admin, db, before, after);
    });
