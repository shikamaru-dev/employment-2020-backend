module.exports = async function createChangedFlag(admin, db, department = null) {
    const changedFlagsRef = db.collection('changedFlags');

    if (department) {
        console.log("department:" + JSON.stringify(department.id));

        return changedFlagsRef.doc(department.id).create({department: department})
            .then((doc) => {
                console.log(`changedFlags created: (${department.id})`);
                return true;
            })
            .catch((error) => {
                console.log(`changedFlags already exist: (${error})`);
            });
    } else {
        // 全部更新
        const departmentDocs = await db.collection('departments').get();
        return departmentDocs.forEach((department) => {
            changedFlagsRef.doc(department.id).create({department: department.ref})
                .then((doc) => {
                    console.log(`changedFlags created: (${department.id})`);
                    return true;
                })
                .catch((error) => {
                    console.log(`changedFlags already exist: (${error})`);
                });
        })
    }
};
