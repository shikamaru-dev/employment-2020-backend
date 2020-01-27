const functions = require('firebase-functions');
const admin = require('firebase-admin');
const incrementdepartmentCounter = require('./func/incrementdepartmentCounter');
const db = admin.firestore();
const auth = admin.auth();

const sleep = async (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    })
};


module.exports = functions.firestore
    .document('changedFlags/{departmentId}')
    .onCreate(async (change, context) => {
        // ちょっと待つ 呼び出し回数削減のため
        await sleep(5000);

        // フラグを消す
        const department = change.data().department;
        await change.ref.delete();

        // ユーザー取得
        const usersRef = await db.collection('users').get();
        const authUsers = await auth.listUsers();

        // currentsとnextsのユーザーを取得
        const currentsRef = await db.collection('currents').get();
        const currentRequestsRef = await db.collection('currentRequests').get();
        const nextsRef = await db.collection('nexts').get();
        const nextRequestsRef = await db.collection('nextRequests').get();

        const currentUserIds = [];
        const nextUserIds = [];

        currentsRef.forEach((doc) => {
            currentUserIds.push(doc.data().user.id)
        });
        currentRequestsRef.forEach((doc) => {
            currentUserIds.push(doc.data().user.id)
        });

        nextsRef.forEach((doc) => {
            nextUserIds.push(doc.data().user.id)
        });
        nextRequestsRef.forEach((doc) => {
            nextUserIds.push(doc.data().user.id)
        });

        // メンテリスト取得
        const listsRef = await db.collection('lists')
            .where("department", "==", department)
            .orderBy("count", "asc")
            .orderBy("priority", "asc")
            .get();

        const users = {};
        usersRef.forEach((doc) => {
            users[doc.id] = {
                isActive: doc.data().isActive,
                disabled: true
            }
        });

        authUsers.users.forEach((user) => {
            if(users[user.uid]){
                users[user.uid].disabled = user.disabled
            }
        });

        console.log("users: " + JSON.stringify(users));

        // 候補を更新
        const currentCandidateUsers = [];
        const nextCandidateUsers = [];
        listsRef.forEach((doc) => {
            const user = doc.data().user;

            if (!users[user.id].isActive || users[user.id].disabled) {
                incrementdepartmentCounter(admin, db, user, department, 1)
            } else {
                if (!currentUserIds.includes(user.id)) {
                    currentCandidateUsers.push(user)
                }
                if (!nextUserIds.includes(user.id)) {
                    nextCandidateUsers.push(user)
                }
            }
        });

        // currentsとnextsのユーザーを取得
        const candidatesRef = db.collection('candidates');
        candidatesRef.doc(department.id).set({
            department: department,
            currents: currentCandidateUsers,
            nexts: nextCandidateUsers
        })
    });
