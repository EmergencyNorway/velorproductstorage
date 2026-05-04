import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ownerId, productId, newPlaceId, secret } = req.body;

  if (secret !== process.env.ROBLOX_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('licenses')
      .update({ place_id: newPlaceId })
      .match({ owner_id: ownerId, product_id: productId });

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message, success: false });
  }
}
