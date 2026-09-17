(() => {
  const SB_URL = 'https://sgivjkhxgknaexlizkro.supabase.co';
  const SB_KEY = 'sb_publishable_BAzeMusqOEC6XiHa4BCFSw__iJkHYHB';
  const paymentSB = window.supabase.createClient(SB_URL, SB_KEY);

  function injectPaymentActions() {
    const title = document.querySelector('#pageTitle');
    const content = document.querySelector('#content');
    if (!title || !content || title.textContent.trim() !== 'Payments') return;

    const table = content.querySelector('table');
    if (!table) return;

    const headers = table.querySelectorAll('tr:first-child th');
    if (headers.length && headers[headers.length - 1].textContent.trim() !== 'Actions') {
      headers[headers.length - 1].textContent = 'Actions';
    }

    table.querySelectorAll('tr').forEach(row => {
      if (row.dataset.paymentActions === '1') return;
      const recordBtn = row.querySelector('button[onclick^="recordPayment("]');
      if (!recordBtn) return;

      const match = recordBtn.getAttribute('onclick').match(/recordPayment\('([^']+)'\)/);
      if (!match) return;
      const id = match[1];

      const editBtn = document.createElement('button');
      editBtn.className = 'btn alt small';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => window.editPayment(id);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn small danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => window.deletePayment(id);

      recordBtn.insertAdjacentText('afterend', ' ');
      recordBtn.insertAdjacentElement('afterend', editBtn);
      editBtn.insertAdjacentText('afterend', ' ');
      editBtn.insertAdjacentElement('afterend', deleteBtn);
      row.dataset.paymentActions = '1';
    });
  }

  window.editPayment = async id => {
    const { data: booking, error } = await paymentSB.from('bookings').select('*').eq('id', id).single();
    if (error || !booking) return alert(error?.message || 'Payment not found.');

    const currentMethod = booking.payment_method || 'Mobile Money';
    modal(`<h2>Edit payment</h2><p class="sub">${esc(booking.customer_name)} · Amount due ${money(booking.amount_due)}</p><form id="epf"><div class="field"><label>Total amount paid</label><input id="epp" type="number" min="0" max="${booking.amount_due}" step="0.01" value="${+booking.amount_paid || 0}" required></div><div class="field"><label>Method</label><select id="epm"><option ${currentMethod==='Mobile Money'?'selected':''}>Mobile Money</option><option ${currentMethod==='Cash'?'selected':''}>Cash</option><option ${currentMethod==='Bank Transfer'?'selected':''}>Bank Transfer</option><option ${currentMethod==='Card'?'selected':''}>Card</option></select></div><button class="btn">Save changes</button></form>`, () => {
      document.querySelector('#epf').onsubmit = async e => {
        e.preventDefault();
        const paid = +document.querySelector('#epp').value;
        const due = +booking.amount_due;
        const result = await paymentSB.from('bookings').update({
          amount_paid: paid,
          payment_method: document.querySelector('#epm').value,
          payment_status: paid <= 0 ? 'unpaid' : paid >= due ? 'paid' : 'part-paid'
        }).eq('id', id);
        if (result.error) return alert(result.error.message);
        closeM();
        await load();
      };
    });
  };

  window.deletePayment = async id => {
    const { data: booking, error } = await paymentSB.from('bookings').select('customer_name,amount_paid').eq('id', id).single();
    if (error || !booking) return alert(error?.message || 'Payment not found.');
    if (+booking.amount_paid <= 0) return alert('There is no recorded payment to delete.');
    if (!confirm(`Delete the recorded payment of ${money(booking.amount_paid)} for ${booking.customer_name}? This will reset the payment to unpaid.`)) return;

    const result = await paymentSB.from('bookings').update({
      amount_paid: 0,
      payment_method: null,
      payment_status: 'unpaid'
    }).eq('id', id);
    if (result.error) return alert(result.error.message);
    await load();
  };

  const observer = new MutationObserver(injectPaymentActions);
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(injectPaymentActions, 500);
})();
