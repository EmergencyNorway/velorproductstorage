export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { placeId, productId } = req.body;

    const SUPABASE_URL = "https://rptocmhpdkeuditggzfq.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdG9jbWhwZGtldWRpdGdnemZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTcyODUsImV4cCI6MjA5MjI3MzI4NX0.N9x7Ad763FRnerJuPPc-mxm2bvyiWRh0uomAg5XMI4g";
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1495849474528907486/av4F4ENzxihox_2mXe4j3XElApvyKglYIuFbF8bIn4hY0N_e_7RrTHAkdRsgXv5Fdcco";

    const url = `${SUPABASE_URL}/rest/v1/licenses?select=*&place_id=eq.${placeId}&product_id=eq.${productId}&active=eq.true`;

    // ----------------------------
    // 🔥 Roblox metadata fetch
    // ----------------------------

    async function getUniverseId(placeId) {
        try {
            const res = await fetch(
                `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
            );
            const data = await res.json();
            return data.universeId;
        } catch {
            return null;
        }
    }

    async function getGameInfo(universeId) {
        try {
            const res = await fetch(
                `https://games.roblox.com/v1/games?universeIds=${universeId}`
            );
            const data = await res.json();
            return data.data?.[0] || null;
        } catch {
            return null;
        }
    }

    // ----------------------------
    // 🔥 Discord logger (ONLY unauthorized)
    // ----------------------------

    async function sendDiscordLog({ placeId, productId }) {
        let gameName = "Unknown";
        let owner = "Unknown";
        let gameLink = `https://www.roblox.com/games/${placeId}`;

        try {
            const universeId = await getUniverseId(placeId);

            if (universeId) {
                const gameInfo = await getGameInfo(universeId);

                if (gameInfo) {
                    gameName = gameInfo.name || "Unknown";

                    owner =
                        gameInfo.creatorType === "Group"
                            ? `Group (${gameInfo.creatorId})`
                            : `User (${gameInfo.creatorId})`;

                    gameLink = `https://www.roblox.com/games/${gameInfo.rootPlaceId}`;
                }
            }
        } catch {
            // silent fail (important)
        }

        const embed = {
            title: "🔴 Unauthorized System Use Detected",
            color: 15158332,
            fields: [
                { name: "Product", value: productId, inline: true },
                { name: "PlaceId", value: String(placeId), inline: true },
                { name: "Game Name", value: gameName, inline: false },
                { name: "Owner", value: owner, inline: false },
                { name: "Game Link", value: gameLink, inline: false }
            ],
            footer: { text: "Velor Security System" },
            timestamp: new Date().toISOString()
        };

        await fetch(DISCORD_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
    }

    // ----------------------------
    // 🔥 MAIN LOGIC
    // ----------------------------

    try {
        const response = await fetch(url, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            }
        });

        const data = await response.json();

        const allowed = data.length > 0;

        // ONLY LOG UNAUTHORIZED
        if (!allowed) {
            await sendDiscordLog({ placeId, productId });
        }

        return res.status(200).json({
            allowed
        });

    } catch (err) {
        console.error("Validation error:", err);

        return res.status(500).json({
            allowed: false,
            error: "Internal server error"
        });
    }
}
