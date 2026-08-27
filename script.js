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

/* =========================================================
   SQUARESPACE PHONE VALIDATION
   - Ecuador selected by default
   - Lets Squarespace control +593 and the composite phone field
   - Does not mask, truncate or block input while typing
   - Validates Ecuador mobile numbers on blur and submit
   ========================================================= */
(function () {
  'use strict';

  const COUNTRY_SELECTOR =
    '.form-item.phone select,' +
    'select[name*="country" i],' +
    'select[name*="pais" i],' +
    'select[name*="país" i]';

  const PHONE_SELECTOR =
    '.form-item.phone input[type="tel"],' +
    '.form-item.phone input:not([type="hidden"]),' +
    'input[type="tel"]';

  const ECUADOR_MOBILE_REGEX = /^9\d{8}$/;

  function isEcuadorSelected(select) {
    if (!select) return true;

    const option = select.options[select.selectedIndex];
    if (!option) return false;

    const value = String(option.value || '').trim().toUpperCase();
    const text = String(option.text || '').trim().toUpperCase();

    return (
      value === 'EC' ||
      value === 'ECUADOR' ||
      value === '593' ||
      value === '+593' ||
      text.includes('ECUADOR') ||
      text.includes('+593')
    );
  }

  function setEcuadorDefault(select) {
    if (!select || select.dataset.cyEcuadorConfigured === '1') return;

    select.dataset.cyEcuadorConfigured = '1';

    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      const value = String(option.value || '').trim().toUpperCase();
      const text = String(option.text || '').trim().toUpperCase();

      if (
        value === 'EC' ||
        value === 'ECUADOR' ||
        value === '593' ||
        value === '+593' ||
        text.includes('ECUADOR') ||
        text.includes('+593')
      ) {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  }

  function findCountrySelect(input) {
    const phoneItem = input.closest('.form-item.phone');
    if (phoneItem) {
      const select = phoneItem.querySelector('select');
      if (select) return select;
    }

    const form = input.closest('form');
    if (!form) return null;

    const selects = form.querySelectorAll(COUNTRY_SELECTOR);
    if (selects.length === 1) return selects[0];

    for (let i = 0; i < selects.length; i++) {
      const select = selects[i];
      for (let j = 0; j < select.options.length; j++) {
        const text = String(select.options[j].text || '').toUpperCase();
        if (text.includes('ECUADOR')) return select;
      }
    }

    return null;
  }

  function getNationalDigits(value) {
    let digits = String(value || '').replace(/\D/g, '');

    if (digits.startsWith('593') && digits.length >= 12) {
      digits = digits.substring(3);
    }

    if (digits.startsWith('0') && digits.length === 10) {
      digits = digits.substring(1);
    }

    return digits;
  }

  function isValidEcuadorPhone(value) {
    return ECUADOR_MOBILE_REGEX.test(getNationalDigits(value));
  }

  function setPhoneError(input, show) {
    const wrapper =
      input.closest('.form-item.phone') ||
      input.closest('.form-item') ||
      input.parentElement;

    if (!wrapper) return;

    let error = wrapper.querySelector('.cy-phone-error');

    if (show) {
      input.setAttribute('aria-invalid', 'true');

      if (!error) {
        error = document.createElement('div');
        error.className = 'cy-phone-error';
        error.style.fontSize = '12px';
        error.style.color = '#c62828';
        error.style.marginTop = '6px';
        error.style.fontWeight = '600';
        error.style.lineHeight = '1.4';
        error.textContent = 'Ingresa un celular ecuatoriano válido. Ejemplo: 982101189';
        wrapper.appendChild(error);
      }
    } else {
      input.removeAttribute('aria-invalid');
      if (error) error.remove();
    }
  }

  function addHint(input) {
    const wrapper =
      input.closest('.form-item.phone') ||
      input.closest('.form-item') ||
      input.parentElement;

    if (!wrapper || wrapper.querySelector('.cy-phone-hint')) return;

    const hint = document.createElement('div');
    hint.className = 'cy-phone-hint';
    hint.style.fontSize = '12px';
    hint.style.color = '#64748b';
    hint.style.marginTop = '6px';
    hint.style.fontWeight = '500';
    hint.style.lineHeight = '1.4';
    hint.textContent = 'Ejemplo: 982101189 · 9 dígitos sin el 0 inicial';
    wrapper.appendChild(hint);
  }

  function configurePhoneInput(input) {
    if (!input || input.dataset.cyPhoneValidation === '1') return;

    input.dataset.cyPhoneValidation = '1';

    // Do not set maxlength, pattern, masks or key handlers here.
    // Squarespace owns the composite +593 phone control.
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'tel-national');

    addHint(input);

    input.addEventListener('input', function () {
      const country = findCountrySelect(input);

      if (!isEcuadorSelected(country)) {
        setPhoneError(input, false);
        return;
      }

      if (isValidEcuadorPhone(input.value)) {
        setPhoneError(input, false);
      }
    });

    input.addEventListener('blur', function () {
      const country = findCountrySelect(input);

      if (!isEcuadorSelected(country)) {
        setPhoneError(input, false);
        return;
      }

      if (!input.required && !String(input.value || '').trim()) {
        setPhoneError(input, false);
        return;
      }

      setPhoneError(input, !isValidEcuadorPhone(input.value));
    });
  }

  document.addEventListener('change', function (event) {
    if (!event.target.matches || !event.target.matches(COUNTRY_SELECTOR)) return;

    const select = event.target;
    if (isEcuadorSelected(select)) return;

    const phoneItem = select.closest('.form-item.phone');
    if (!phoneItem) return;

    phoneItem.querySelectorAll('input').forEach(input => {
      setPhoneError(input, false);
    });
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    const phones = form.querySelectorAll(PHONE_SELECTOR);
    if (!phones.length) return;

    let firstInvalid = null;

    phones.forEach(input => {
      const country = findCountrySelect(input);

      if (!isEcuadorSelected(country)) return;
      if (!input.required && !String(input.value || '').trim()) return;

      const valid = isValidEcuadorPhone(input.value);
      setPhoneError(input, !valid);

      if (!valid && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      event.preventDefault();
      event.stopImmediatePropagation();
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
  }, true);

  function init(root) {
    const context = root || document;

    context.querySelectorAll(COUNTRY_SELECTOR).forEach(setEcuadorDefault);
    context.querySelectorAll(PHONE_SELECTOR).forEach(configurePhoneInput);
  }

  function start() {
    init(document);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node;

          if (element.matches && element.matches(COUNTRY_SELECTOR)) {
            setEcuadorDefault(element);
          }

          if (element.matches && element.matches(PHONE_SELECTOR)) {
            configurePhoneInput(element);
          }

          if (element.querySelectorAll) init(element);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
