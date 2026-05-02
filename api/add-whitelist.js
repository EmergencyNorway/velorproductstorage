import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  
  const { placeId, productId, ownerId, secret } = req.body;

  if (secret !== process.env.ROBLOX_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('licenses')
    .insert([{ 
        place_id: placeId, 
        product_id: productId, 
        owner_id: ownerId, 
        active: true 
    }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
