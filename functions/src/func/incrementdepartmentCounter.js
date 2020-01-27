module.exports = async function incrementdepartmentCounter(admin, db, user, department, num) {
    const listsQuery = await db.collection('lists')
        .where("user", "==", user)
        .where("department", '==', department)
        .get();

    console.log("user:" +  JSON.stringify(user));
    console.log("department:" +  JSON.stringify(department));

    listsQuery.forEach((doc) => {
        doc.ref.update({count: admin.firestore.FieldValue.increment(num)})
    });
};
