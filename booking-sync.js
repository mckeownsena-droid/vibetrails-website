(() => {
  const form = document.querySelector('#bookingForm');
  if (!form) return;
  const endpoint = 'https://sgivjkhxgknaexlizkro.supabase.co/rest/v1/booking_requests';
  const apiKey = 'sb_publishable_BAzeMusqOEC6XiHa4BCFSw__iJkHYHB';
  form.addEventListener('submit', async () => {
    const f = new FormData(form);
    const payload = {
      full_name: String(f.get('name') || '').trim(),
      phone: String(f.get('phone') || '').trim(),
      adventure: String(f.get('adventure') || '').trim(),
      people: Number(f.get('people') || 1),
      preferred_date: f.get('date') || null,
      pickup: String(f.get('pickup') || '').trim() || null,
      message: String(f.get('message') || '').trim() || null,
      status: 'new'
    };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
      if (!res.ok) throw new Error('Unable to save enquiry');
      const data = await res.json();
      const ref = data?.[0]?.reference;
      const box = document.querySelector('.success-box');
      if (box && ref) {
        box.innerHTML = `Your enquiry has been saved as <strong>${ref}</strong>. WhatsApp should also open so you can continue with the VibeTrails team.`;
        box.style.display = 'block';
      }
    } catch (err) {
      console.warn('VibeTrails enquiry sync unavailable:', err);
    }
  }, { capture: true });
})();
