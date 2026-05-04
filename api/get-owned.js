import { createClient } from '@supabase/supabase-js';

// ENDRET: Bruker nå SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    try {
        const { owner_id, secret } = req.query;

        // Sjekk mot ROBLOX_SECRET som du har i Vercel
        if (secret !== process.env.ROBLOX_SECRET) {
            return res.status(401).json({ error: "Uautorisert tilgang" });
        }

        if (!owner_id) {
            return res.status(400).json({ error: "Mangler owner_id" });
        }

        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('owner_id', owner_id);

        if (error) return res.status(500).json({ error: error.message });
        
        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: "Server krasj: " + err.message });
    }
}
