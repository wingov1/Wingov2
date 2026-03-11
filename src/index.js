const sdk = require('node-appwrite');
const axios = require('axios');

module.exports = async function (context) {
    const CONFIG = {
        endpoint: 'https://sgp.cloud.appwrite.io/v1',
        projectId: '69a1b2b00003cb4311d0',
        databaseId: '69a1b4790006d6ec0eae',
        collectionId: 'user_images',
        apiKey: 'standard_9643aea142f35333044c3099eee4b5b1dd000f8e705d919e523be404127ac1de0762c28ad47eef3ab61979b97943229b1c72d0989cec477b4f5379bb973daa14b5cf01a6f61a29f434b16ccc9772a9cceb94aec7632eaed6a520830f13ce5dfe715cada59f82d17fb1b4688b83a7469b1f9b5b1b4b0e968bf2a08a59d2eed319',
    };

    const client = new sdk.Client().setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId).setKey(CONFIG.apiKey);
    const databases = new sdk.Databases(client);

    try {
        context.log("📡 Connecting to BigWin API...");

        // သင့်ဆီကရတဲ့ Payload အတိုင်း တိတိကျကျ လှမ်းခေါ်ခြင်း
        // Note: အကယ်၍ Signature က အမြဲပြောင်းနေရမယ်ဆိုရင် Login မရနိုင်ပါ။ 
        // ဒါက လက်ရှိရထားတဲ့ Token နဲ့ တိုက်ရိုက် Data ဆွဲကြည့်တဲ့ နည်းလမ်းပါ
        
        const targetUrl = "https://api.bigwinqaz.com/api/webapi/GetNoaverageEmerdList";
        const headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzczMjAyNTExIiwibmJmIjoiMTc3MzIwMjUxMSIsImV4cCI6IjE3NzMyMDQzMTEiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiIzLzExLzIwMjYgMTE6MTU6MTEgQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiI1MzQ4MDMiLCJVc2VyTmFtZSI6Ijk1OTY5OTcxNjMzNSIsIlVzZXJQaG90byI6IjUiLCJOaWNrTmFtZSI6Ik1lbWJlck5OR0JXQUNQIiwiQW1vdW50IjoiMS40MiIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiMy8xMS8yMDI2IDEwOjQ1OjExIEFNIiwiTG9naW5JUEFkZHJlc3MiOiI2OS4xNjAuMjguMjE5IiwiRGJOdW1iZXIiOiIwIiwiSXN2YWxpZGF0b3IiOiIwIiwiS2V5Q29kZSI6IjI5NyIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjEiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.eBpS5HR-Lzw-CnCGJ5fA5F9v-3BpYeL2WrE43K4sFbk",
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Linux; Android 7.1.2; Pixel 4 Build/RQ3A.211001.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/81.0.4044.117 Mobile Safari/537.36",
            "X-Requested-With": "com.sevenbigwingame.app"
        };

        const body = {
            "pageSize": 10,
            "pageNo": 1,
            "typeId": 30, // Win Go 30s ဖြစ်နိုင်ပါတယ်
            "language": 7,
            "random": "475983426d29479eacb0b286eeee7578",
            "signature": "BA04343249334526E7A96C8E632E3E01",
            "timestamp": 1773202620
        };

        const response = await axios.post(targetUrl, body, { headers });

        if (response.data && response.data.data && response.data.data.list) {
            const latest = response.data.data.list[0];
            const period = String(latest.issueNumber);
            const result = (latest.result === "Big" || latest.result === "B") ? "B" : "S";

            // Database သိမ်းဆည်းခြင်း
            const existing = await databases.listDocuments(CONFIG.databaseId, CONFIG.collectionId, [
                sdk.Query.equal('period', period)
            ]);

            if (existing.total === 0) {
                await databases.createDocument(CONFIG.databaseId, CONFIG.collectionId, sdk.ID.unique(), {
                    period: period,
                    result: result
                });
                context.log(`✅ Success: ${period} -> ${result}`);
            } else {
                context.log(`ℹ️ Already exists: ${period}`);
            }
            return context.res.json({ success: true, period });
        } else {
            context.error("❌ Data structure mismatch: " + JSON.stringify(response.data));
            return context.res.json({ error: "Invalid Data" }, 500);
        }

    } catch (err) {
        context.error("❌ API Error: " + err.message);
        return context.res.json({ error: err.message }, 500);
    }
};
