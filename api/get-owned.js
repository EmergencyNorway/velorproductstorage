import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    try {
        const { owner_id, secret } = req.query;

        if (secret !== "Velor_Secure_77!_Access") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // ENDRET: Bruker nå 'licenses' tabellen
        const { data, error } = await supabase
            .from('licenses') 
            .select('*')
            .eq('owner_id', owner_id);

        if (error) return res.status(500).json({ error: error.message });
        
        return res.status(200).json(data || []);
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
