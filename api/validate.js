export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { placeId, productId } = req.body;

    if (!placeId || !productId) {
        return res.status(400).json({ allowed: false });
    }

    const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
    const SUPABASE_KEY = "YOUR_ANON_KEY";

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/licenses?place_id=eq.${placeId}&product_id=eq.${productId}&active=eq.true`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
            }
        }
    );

    const data = await response.json();

    if (data.length > 0) {
        return res.status(200).json({ allowed: true });
    } else {
        return res.status(200).json({ allowed: false });
    }
}
