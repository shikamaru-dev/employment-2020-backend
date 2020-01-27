
class RequestPayload {

    constructor(user, requestUser, department, current, next, dateFlg) {
        this.user = user;
        this.requestUser = requestUser;
        this.department = department;
        let today = new Date();
        if ( current < today ){
            if (dateFlg === "current"){
                this.date = "本日"
            } else {
                this.date = "翌営業日"
            }
        } else {
            if (dateFlg === "current"){
                this.date = "翌営業日"
            } else {
                this.date = "翌々営業日"
            }
        }
        this.updatePayload()
    }

    updatePayload(){
        this.payload = {
            request: {
                notification: {
                    title: `${this.requestUser}からの当番リクエスト`,
                    body: `${this.date}の当番リクエストが届きました。`,
                }
            },
            allow: {
                notification: {
                    title: "当番リクエスト承認",
                    body: `${this.date}の当番リクエストが承認されました。`,
                }
            },
            deny: {
                notification: {
                    title: "当番リクエスト拒否",
                    body: `${this.date}の当番リクエストが拒否されました。`,
                }
            }
        };
    }

    getPayload(type){
        console.log(this.payload[type]);
        return this.payload[type];
    }

}

module.exports = async function notifyRequest(admin, db, after, dateFlg) {
    const data = after.data()

    if (!data || data.approval === null) return;

    const usersRef = db.collection("users");
    const departmentsRef = db.collection("departments");
    const businessDaysRef = db.collection("businessDays");

    const result = await Promise.all([
        usersRef.doc(data.user.id).get(),
        usersRef.doc(data.requestUser.id).get(),
        departmentsRef.doc(data.department.id).get(),
        businessDaysRef.doc("current").get(),
        businessDaysRef.doc("next").get(),
        admin.auth().getUser(data.user.id),
        admin.auth().getUser(data.requestUser.id)
    ]);

    const [user, requestUser, department, current, next, userData, requestUserData] = result;

    const payload = new RequestPayload(
        userData.displayName,
        requestUserData.displayName,
        department.data().name,
        current.data().timestamp.toDate(),
        next.data().timestamp.toDate(),
        dateFlg
    );
    const token = user.data().token;
    const requestUserToken = requestUser.data().token;
    console.log(token);
    console.log(requestUserToken);

    switch (data.approval) {
        case 0:
            // 通知のみ行う
            if(token === null) return;
            admin.messaging().sendToDevice(token, payload.getPayload('request'));
            break;
        case 1:
            // 許可
            if(requestUserToken === null) return;
            admin.messaging().sendToDevice(requestUserToken, payload.getPayload('allow'));
            break;
        case 2:
            // 拒否
            if(requestUserToken === null) return;
            admin.messaging().sendToDevice(requestUserToken, payload.getPayload('deny'));
            break;
    }
};
