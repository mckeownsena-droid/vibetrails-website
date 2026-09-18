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

  function dashboardBookingTable(list) {
    const rows = list.map(booking => {
      const trip = trips.find(item => item.id === booking.trip_id);
      return `<tr>
        <td><b>${esc(booking.customer_name)}</b></td>
        <td>${esc(trip?.name || '—')}</td>
        <td>${money(booking.amount_paid)} / ${money(booking.amount_due)}</td>
        <td><span class="pill ${booking.payment_status === 'paid' ? '' : 'yellow'}">${esc(booking.payment_status)}</span></td>
        <td>${esc(booking.pickup_point || '—')}</td>
      </tr>`;
    }).join('');

    return `<div class="tablewrap dashboard-table"><table><tr><th>Passenger</th><th>Trip</th><th>Paid / Due</th><th>Status</th><th>Pickup</th></tr>${rows || '<tr><td colspan="5" class="empty">No bookings yet.</td></tr>'}</table></div>`;
  }

  function bookingPageTable(list) {
    const rows = list.map(booking => {
      const trip = trips.find(item => item.id === booking.trip_id);
      return `<tr>
        <td><b>${esc(booking.customer_name)}</b><div class="muted">${esc(booking.booking_reference || '')} · ${esc(booking.phone || '')}</div></td>
        <td>${esc(trip?.name || '—')}</td>
        <td class="money">${money(booking.amount_paid)} / ${money(booking.amount_due)}</td>
        <td><span class="pill ${booking.payment_status === 'paid' ? '' : 'yellow'}">${esc(booking.payment_status)}</span></td>
        <td>${esc(booking.pickup_point || '—')}</td>
        <td class="actions">
          <button class="btn alt small" onclick="editBooking('${booking.id}')">Edit</button>
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
    const projectedProfit = metrics.due - metrics.cost;
    const totalBookings = B().length;
    const collectionRate = metrics.due ? Math.min(100, (metrics.paid / metrics.due) * 100) : 0;
    const financialInsight = profile.role === 'owner' ? `<div class="dashboard-insight">
      <div class="progress-copy"><span>Revenue progress</span><b>${collectionRate.toFixed(0)}% collected</b><small>${money(metrics.paid)} of ${money(metrics.due)}</small></div>
      <div class="progress-track" aria-label="${collectionRate.toFixed(0)}% of expected revenue collected"><span style="width:${collectionRate}%"></span></div>
      <div class="insight-stat"><span>Outstanding</span><b>${money(metrics.out)}</b></div>
      <div class="insight-stat"><span>Net Profit</span><b>${money(metrics.profit)}</b></div>
    </div>` : '';

    $('#content').innerHTML = `<div class="kpis old-dashboard-kpis">
      <div class="kpi"><span>Trips</span><b>${trips.length}</b></div>
      <div class="kpi"><span>Bookings</span><b>${totalBookings}</b></div>
      <div class="kpi"><span>Cash Collected</span><b>${money(metrics.paid)}</b></div>
      <div class="kpi"><span>${profile.role === 'owner' ? 'Actual Expenses' : 'New Enquiries'}</span><b>${profile.role === 'owner' ? money(metrics.cost) : enquiries.filter(item => item.status === 'new').length}</b></div>
      <div class="kpi"><span>${profile.role === 'owner' ? 'Projected Profit' : 'Checked In'}</span><b>${profile.role === 'owner' ? money(projectedProfit) : B().filter(booking => booking.checked_in).length}</b></div>
    </div>
    ${financialInsight}
    <div class="rowhead dashboard-rowhead"><b>Recent bookings</b><button class="btn small" onclick="addBooking()">Add booking</button></div>
    ${dashboardBookingTable(B().slice(0, 5))}`;
  };

  bookingView = function () {
    $('#content').innerHTML = `<div class="rowhead"><b>${esc(T()?.name || 'Bookings')}</b>${T() ? '<button class="btn small" onclick="addBooking()">Add booking</button>' : ''}</div>${bookingPageTable(B())}`;
  };

  window.editBooking = id => {
    const booking = bookings.find(item => item.id === id);
    if (!booking) return;
    modal(`<h2>Edit booking</h2><p class="sub">Update the passenger's booking details.</p><form id="editBookingForm">
      <div class="field"><label>Customer name</label><input id="editBookingName" required value="${esc(booking.customer_name)}"></div>
      <div class="form2"><div class="field"><label>Phone</label><input id="editBookingPhone" value="${esc(booking.phone || '')}"></div><div class="field"><label>Seats</label><input id="editBookingSeats" type="number" min="1" value="${+booking.seats || 1}"></div></div>
      <div class="field"><label>Pickup point</label><input id="editBookingPickup" value="${esc(booking.pickup_point || '')}"></div>
      <div class="field"><label>Amount due</label><input id="editBookingDue" type="number" min="0" step="0.01" value="${+booking.amount_due || 0}"></div>
      <button class="btn">Save changes</button>
    </form>`, () => {
      $('#editBookingForm').onsubmit = async event => {
        event.preventDefault();
        const due = +$('#editBookingDue').value;
        const paid = +booking.amount_paid || 0;
        const result = await sb.from('bookings').update({
          customer_name: $('#editBookingName').value,
          phone: $('#editBookingPhone').value,
          seats: +$('#editBookingSeats').value,
          pickup_point: $('#editBookingPickup').value,
          amount_due: due,
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

  const modalStyle = document.createElement('style');
  modalStyle.textContent = `.modal{position:relative}.modal h2{padding-right:46px}.modal-close{position:absolute;top:14px;right:14px;width:38px;height:38px;display:grid;place-items:center;border:1px solid var(--line);border-radius:50%;background:#f4f7f9;color:#31465a;font-size:25px;line-height:1;cursor:pointer;transition:background .15s,color .15s,transform .15s}.modal-close:hover{background:#e8eff4;color:var(--ink);transform:scale(1.04)}.modal-close:focus-visible{outline:3px solid #1477ff55;outline-offset:2px}`;
  document.head.appendChild(modalStyle);

  const originalModal = modal;
  modal = function (content, callback) {
    originalModal(`<button type="button" class="modal-close" aria-label="Close dialog" title="Close" onclick="closeM()">&times;</button>${content}`, callback);
  };

  const originalRender = render;
  render = function () {
    originalRender();
    if (view === 'dashboard') $('#pageSub').textContent = 'Manage trips, bookings and finances.';
  };
})();
