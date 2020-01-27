const incrementdepartmentCounter = require('./incrementdepartmentCounter');
const createChangedFlag = require('./createChangedFlag');

module.exports = async function updateDuty(admin, db, before, after) {

    let counterFunc = [];
    let changedFlagFUnc = [];
    if (before) {
        counterFunc.push(incrementdepartmentCounter(admin, db, before.data().user, before.data().department, -1));
        changedFlagFUnc.push(createChangedFlag(admin, db, before.data().department))
    }
    if (after) {
        counterFunc.push(incrementdepartmentCounter(admin, db, after.data().user, after.data().department, 1));
        changedFlagFUnc.push(createChangedFlag(admin, db, after.data().department))
    }

    // listsのカウンター更新
    await Promise.all(counterFunc);

    // 候補を更新
    return Promise.all(changedFlagFUnc);
};
