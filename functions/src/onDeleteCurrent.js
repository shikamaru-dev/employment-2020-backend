const functions = require('firebase-functions');
const admin = require('firebase-admin');
const updateDuty = require('./func/updateDuty');
const db = admin.firestore();

module.exports = functions.firestore
    .document('currents/{departmentId}')
    .onDelete(async (change, context) => {
        // 当番終了通知

        // 候補を更新
        return updateDuty(admin, db, change, null);
    });
