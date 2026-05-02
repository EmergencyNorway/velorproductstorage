import { createClient } from '@supabase/supabase-js'

// Initialiserer Supabase-klienten med miljøvariablene dine-
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Tillater kun POST-forespørsler
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { placeId, productId, ownerId, secret } = req.body;

  // 1. Sjekk at alle nødvendige data er sendt fra Roblox
  if (!placeId || !productId || !ownerId || !secret) {
    console.error("Mangler data i forespørselen:", { placeId, productId, ownerId, hasSecret: !!secret });
    return res.status(400).json({ error: 'Missing required data' });
  }

  // 2. Sikkerhetssjekk mot passordet du har satt i Vercel
  if (secret !== process.env.ROBLOX_SECRET) {
    console.error("Uautorisert forsøk - Feil SECRET");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log(`Forsøker å legge til lisens: Place ${placeId}, Product ${productId}, Owner ${ownerId}`);

    // 3. Sett inn data i 'licenses' tabellen
    // VIKTIG: Sjekk at tabellen heter 'licenses' med liten 'l' i Supabase
    const { data, error } = await supabase
      .from('licenses')
      .insert([
        { 
          place_id: placeId, 
          product_id: productId, 
          owner_id: ownerId, 
          active: true 
        }
      ]);

    // 4. Håndter feil fra Supabase (f.eks. feil kolonnenavn eller utilgjengelig database)
    if (error) {
      console.error("Supabase Databasefeil:", error.message);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.hint || "Sjekk kolonnenavn og datatyper (int8) i Supabase"
      });
    }

    console.log("Lisens lagt til i databasen!");
    return res.status(200).json({ success: true });

  } catch (err) {
    // 5. Fang opp uforutsette krasj i koden
    console.error("Kritisk serverfeil:", err.message);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
