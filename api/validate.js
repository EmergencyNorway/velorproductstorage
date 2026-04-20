export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { placeId, productId, source } = req.body;

    const SUPABASE_URL = "https://rptocmhpdkeuditggzfq.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdG9jbWhwZGtldWRpdGdnemZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTcyODUsImV4cCI6MjA5MjI3MzI4NX0.N9x7Ad763FRnerJuPPc-mxm2bvyiWRh0uomAg5XMI4g";
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1495849474528907486/av4F4ENzxihox_2mXe4j3XElApvyKglYIuFbF8bIn4hY0N_e_7RrTHAkdRsgXv5Fdcco";

    const url = `${SUPABASE_URL}/rest/v1/licenses?select=*&place_id=eq.${placeId}&product_id=eq.${productId}&active=eq.true`;

    async function sendDiscordLog() {
        await fetch(DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [{
                    title: "🔴 Unauthorized Runtime Execution",
                    color: 15158332,
                    fields: [
                        { name: "PlaceId", value: String(placeId), inline: true },
                        { name: "Product", value: productId, inline: true },
                        { name: "Source", value: source }
                    ],
                    timestamp: new Date().toISOString()
                }]
            })
        });
    }

    try {
        const response = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            }
        });

        const data = await response.json();
        const allowed = data.length > 0;

        // 🔥 ONLY LOG REAL ABUSE
        if (!allowed && source === "runtime") {
            await sendDiscordLog();
        }

        return res.status(200).json({ allowed });

    } catch (err) {
        return res.status(500).json({ allowed: false });
    }
}
