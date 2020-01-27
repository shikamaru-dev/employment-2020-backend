module.exports = async function updateRequest(after, ref) {
    const data = after.data()
    if (!data || data.approval === null) return;
    switch (data.approval) {
        case 0:
            // 通知のみ行う
            break;
        case 1:
            // 許可
            console.log(data)
            await ref.doc(data.department.id).set({
                department: data.department,
                user: data.user
            })
            await after.ref.delete()
            break;
        case 2:
            // 拒否
            await after.ref.delete()
            break;
    }
};
