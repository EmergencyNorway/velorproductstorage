export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { placeId, productId } = req.body;

    if (!placeId || !productId) {
        return res.status(400).json({ allowed: false });
    }

    const SUPABASE_URL = "https://rptocmhpdkeuditggzfq.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdG9jbWhwZGtldWRpdGdnemZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2OTcyODUsImV4cCI6MjA5MjI3MzI4NX0.N9x7Ad763FRnerJuPPc-mxm2bvyiWRh0uomAg5XMI4g";

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
