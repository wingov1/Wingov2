const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async function (context) {
    const CONFIG = {
        endpoint: 'https://sgp.cloud.appwrite.io/v1',
        projectId: '69a1b2b00003cb4311d0',
        databaseId: '69a1b4790006d6ec0eae',
        collectionId: 'user_images',
        apiKey: 'standard_9643aea142f35333044c3099eee4b5b1dd000f8e705d919e523be404127ac1de0762c28ad47eef3ab61979b97943229b1c72d0989cec477b4f5379bb973daa14b5cf01a6f61a29f434b16ccc9772a9cceb94aec7632eaed6a520830f13ce5dfe715cada59f82d17fb1b4688b83a7469b1f9b5b1b4b0e968bf2a08a59d2eed319', 
        username: "959699716335",
        pwd: "aung2025",
        deviceId: "b40c086522809d13"
    };

    const client = new sdk.Client()
        .setEndpoint(CONFIG.endpoint)
        .setProject(CONFIG.projectId)
        .setKey(CONFIG.apiKey);

    const databases = new sdk.Databases(client);

    try {
        context.log("🚀 Starting API Scan...");

        // ၁။ Login ဝင်ခြင်း
        const loginRes = await axios.post("https://api.bigwinqaz.com/api/webapi/Login", {
            "username": CONFIG.username, "pwd": CONFIG.pwd, "phonetype": 1,
            "logintype": "mobile", "packId": "com.sevenbigwingame.app",
            "deviceId": CONFIG.deviceId, "language": 7
        });

        const newToken = loginRes.data.data.token;
        context.log("🔑 Token obtained successfully");

        // ၂။ Data ဆွဲခြင်း
        const response = await axios.post("https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList", 
            { "typeid": 1, "customid": 20, "pageno": 1 },
            { headers: { "Authorization": "Bearer " + newToken } }
        );

        const latest = response.data.data.list[0];
        const period = String(latest.issueNumber);
        const result = (latest.result === "Big" || latest.result === "B") ? "B" : "S";

        context.log(`📊 Game Data: Period ${period}, Result ${result}`);

        // ၃။ Database စစ်ဆေးခြင်း (Duplicate ရှိမရှိ)
        const existing = await databases.listDocuments(CONFIG.databaseId, CONFIG.collectionId, [
            sdk.Query.equal('period', period)
        ]);

        if (existing.total === 0) {
            // ၄။ အသစ်သိမ်းဆည်းခြင်း
            const doc = await databases.createDocument(
                CONFIG.databaseId, 
                CONFIG.collectionId, 
                sdk.ID.unique(), 
                { "period": period, "result": result }
            );
            context.log(`✅ SUCCESS: Document Created ID: ${doc.$id}`);
        } else {
            context.log(`ℹ️ SKIP: Period ${period} already in Database.`);
        }

        return context.res.json({ success: true });

    } catch (err) {
        // Error ဘာတက်လဲဆိုတာ အသေအချာပြပေးမှာပါ
        context.error("❌ CRITICAL ERROR: " + err.message);
        if (err.response) {
            context.error("📡 API Response Error: " + JSON.stringify(err.response.data));
        }
        return context.res.json({ error: err.message }, 500);
    }
};
