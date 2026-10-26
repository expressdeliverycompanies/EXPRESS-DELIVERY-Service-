
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const trackingNumber = String(
    req.query.trackingNumber || ""
  ).trim();

  if (!trackingNumber || trackingNumber.length > 100) {
    return res.status(400).json({
      error: "Please enter a valid tracking number."
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Tracking service is not configured yet."
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=tracking_number,status,origin,destination,updated_at`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      }
    );

    
if (!response.ok) {
      return res.status(502).json({
        error: "Tracking service temporarily unavailable."
      });
    }
    const shipments = await response.json();

    if (!shipments.length) {
      return res.status(404).json({
        error: "Tracking number not found."
      });
    }

    return res.status(200).json({
      shipment: shipments[0]
    });
  } catch {
    return res.status(500).json({
      error: "Unable to check tracking right now."
    });
  }
}
