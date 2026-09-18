(() => {
  const removeNavItem = items => {
    const index = items.findIndex(item => item[0] === 'passengers');
    if (index >= 0) items.splice(index, 1);
  };
  removeNavItem(ownerNav);
  removeNavItem(staffNav);

  const sideRole = document.querySelector('#sideRole');
  if (sideRole) {
    new MutationObserver(() => {
      if (/^●\s*/.test(sideRole.textContent)) sideRole.textContent = sideRole.textContent.replace(/^●\s*/, '');
    }).observe(sideRole, { childList: true });
  }

  const budgetedExpenses = () => E().reduce((total, expense) => total + (+expense.budgeted_amount || 0), 0);

  function dashboardBookingTable(list) {
    const rows = list.map(booking => {
      const trip = trips.find(item => item.id === booking.trip_id);
      return `<tr>
        <td><b>${esc(booking.customer_name)}</b></td>
        <td>${esc(trip?.name || '—')}</td>
        <td>${money(booking.amount_paid)} / ${money(booking.amount_due)}</td>
        <td><span class="pill ${booking.payment_status === 'paid' ? '' : 'yellow'}">${esc(booking.payment_status)}</span></td>
        <td>${esc(booking.pickup_point || '—')}</td>
        <td class="actions">
          <button class="btn alt small" onclick="editBooking('${booking.id}')">Edit</button>
          <button class="btn alt small" onclick="recordPayment('${booking.id}')">Payment</button>
          <button class="btn small danger" onclick="deleteBooking('${booking.id}')">Delete</button>
        </td>
      </tr>`;
    }).join('');

    return `<div class="tablewrap dashboard-table"><table><tr><th>Passenger</th><th>Trip</th><th>Paid / Due</th><th>Status</th><th>Pickup</th><th>Actions</th></tr>${rows || '<tr><td colspan="6" class="empty">No bookings yet.</td></tr>'}</table></div>`;
  }

  dash = function () {
    if (!T()) {
      $('#content').innerHTML = `<div class="card empty">No trip yet.${profile.role === 'owner' ? ' Create the first trip from Trips.' : ''}</div>`;
      return;
    }

    const metrics = M();
    const budget = budgetedExpenses();
    const projectedProfit = metrics.due - budget;
    const totalBookings = B().reduce((total, booking) => total + (+booking.seats || 0), 0);

    $('#content').innerHTML = `<div class="kpis old-dashboard-kpis">
      <div class="kpi"><span>Trips</span><b>${trips.length}</b></div>
      <div class="kpi"><span>Bookings</span><b>${totalBookings}</b></div>
      <div class="kpi"><span>Cash Collected</span><b>${money(metrics.paid)}</b></div>
      <div class="kpi"><span>${profile.role === 'owner' ? 'Budgeted Expenses' : 'New Enquiries'}</span><b>${profile.role === 'owner' ? money(budget) : enquiries.filter(item => item.status === 'new').length}</b></div>
      <div class="kpi"><span>${profile.role === 'owner' ? 'Projected Profit' : 'Checked In'}</span><b>${profile.role === 'owner' ? money(projectedProfit) : B().filter(booking => booking.checked_in).length}</b></div>
    </div>
    <div class="rowhead dashboard-rowhead"><b>Recent bookings</b><button class="btn small" onclick="addBooking()">Add booking</button></div>
    ${dashboardBookingTable(B().slice(0, 8))}`;
  };

  window.editBooking = id => {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    modal(`<h2>Edit booking</h2><p class="sub">Update the passenger's booking details.</p><form id="editBookingForm">
      <div class="field"><label>Customer name</label><input id="editBookingName" required value="${esc(booking.customer_name)}"></div>
      <div class="form2"><div class="field"><label>Phone</label><input id="editBookingPhone" value="${esc(booking.phone || '')}"></div><div class="field"><label>Seats</label><input id="editBookingSeats" type="number" min="1" value="${+booking.seats || 1}"></div></div>
      <div class="field"><label>Pickup point</label><input id="editBookingPickup" value="${esc(booking.pickup_point || '')}"></div>
      <div class="form2"><div class="field"><label>Amount due</label><input id="editBookingDue" type="number" min="0" step="0.01" value="${+booking.amount_due || 0}"></div><div class="field"><label>Amount paid</label><input id="editBookingPaid" type="number" min="0" step="0.01" value="${+booking.amount_paid || 0}"></div></div>
      <button class="btn">Save changes</button>
    </form>`, () => {
      $('#editBookingForm').onsubmit = async event => {
        event.preventDefault();
        const due = +$('#editBookingDue').value;
        const paid = +$('#editBookingPaid').value;
        const result = await sb.from('bookings').update({
          customer_name: $('#editBookingName').value,
          phone: $('#editBookingPhone').value,
          seats: +$('#editBookingSeats').value,
          pickup_point: $('#editBookingPickup').value,
          amount_due: due,
          amount_paid: paid,
          payment_status: paid <= 0 ? 'unpaid' : paid >= due ? 'paid' : 'part-paid'
        }).eq('id', id);
        if (result.error) return alert(result.error.message);
        closeM();
        await load();
      };
    });
  };

  window.deleteBooking = async id => {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    if (!confirm(`Delete ${booking.customer_name}'s booking? This cannot be undone.`)) return;
    const result = await sb.from('bookings').delete().eq('id', id);
    if (result.error) return alert(result.error.message);
    await load();
  };

  const originalRender = render;
  render = function () {
    originalRender();
    if (view === 'dashboard') $('#pageSub').textContent = 'Manage trips, bookings and finances.';
  };
})();
