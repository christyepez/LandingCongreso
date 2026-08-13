const menuBtn = document.getElementById('menuBtn');
const nav = document.querySelector('.nav');
menuBtn?.addEventListener('click', () => {
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  if (nav.style.display === 'flex') {
    Object.assign(nav.style, {position:'absolute', top: window.innerWidth <= 650 ? '70px' : '76px', left:'0', right:'0', padding:'24px', background:'#3C235F', flexDirection:'column', gap:'18px'});
  }
});

const regTabs = document.querySelectorAll('.reg-tab');
const regForms = document.querySelectorAll('.registration-form');
regTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    regTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    regForms.forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(tab.dataset.target)?.classList.add('active');
  });
});

function formPayload(form) {
  const payload = Object.fromEntries(new FormData(form).entries());
  form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (cb.name) payload[cb.name] = cb.checked;
  });
  return payload;
}

regForms.forEach(form => {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    const button = form.querySelector('.form-submit');

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = 'Completa los campos obligatorios y acepta los consentimientos para continuar.';
      status.className = 'form-status error';
      return;
    }

    const endpoint = form.id === 'startupForm'
      ? '/api/inscripciones/startup'
      : '/api/inscripciones/general';

    button.disabled = true;
    status.textContent = 'Guardando inscripción...';
    status.className = 'form-status';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formPayload(form))
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'No fue posible guardar la inscripción.');

      status.textContent = result.message;
      status.className = 'form-status success';
      form.reset();
    } catch (error) {
      status.textContent = error.message || 'Ocurrió un error al guardar. Intenta nuevamente.';
      status.className = 'form-status error';
    } finally {
      button.disabled = false;
    }
  });
});
