/* =========================================================
   SQUARESPACE EMAIL VALIDATION
   - Placeholder inside the field: nombre@empresa.com.ec
   - Validates general email syntax and domain structure
   - Supports common public domains and business domains
   - Prioritizes Ecuador and Latin American country domains
   - Detects common domain typos
   - Rejects common disposable email providers
   - Does not block or rewrite input while typing
   ========================================================= */
(function () {
  'use strict';

  const EMAIL_SELECTOR =
    'input[type="email"],' +
    'input[name*="email" i],' +
    'input[name*="correo" i]';

  const EMAIL_PLACEHOLDER = 'nombre@empresa.com.ec';

  const COMMON_PUBLIC_DOMAINS = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'yahoo.com',
    'icloud.com',
    'proton.me',
    'protonmail.com',
    'zoho.com'
  ]);

  const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    'yopmail.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'trashmail.com'
  ]);

  const COMMON_DOMAIN_TYPOS = new Map([
    ['gmal.com', 'gmail.com'],
    ['gmial.com', 'gmail.com'],
    ['gmai.com', 'gmail.com'],
    ['gmail.con', 'gmail.com'],
    ['hotmal.com', 'hotmail.com'],
    ['hotmial.com', 'hotmail.com'],
    ['hotmail.con', 'hotmail.com'],
    ['outlok.com', 'outlook.com'],
    ['outllok.com', 'outlook.com'],
    ['outlook.con', 'outlook.com'],
    ['yaho.com', 'yahoo.com'],
    ['yahoo.con', 'yahoo.com'],
    ['iclud.com', 'icloud.com']
  ]);

  const LATAM_COUNTRY_SUFFIXES = [
    '.ec', '.co', '.pe', '.cl', '.ar', '.br', '.mx', '.uy', '.py',
    '.bo', '.ve', '.pa', '.cr', '.gt', '.sv', '.hn', '.ni', '.do', '.pr'
  ];

  const ECUADOR_SUFFIXES = [
    '.ec',
    '.com.ec',
    '.edu.ec',
    '.org.ec',
    '.net.ec',
    '.fin.ec',
    '.gob.ec',
    '.mil.ec'
  ];

  function getWrapper(input) {
    return (
      input.closest('.form-item') ||
      input.closest('.field-list') ||
      input.parentElement
    );
  }

  function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
  }

  function splitEmail(value) {
    const email = normalizeEmail(value);
    const at = email.lastIndexOf('@');

    if (at <= 0 || at === email.length - 1) {
      return null;
    }

    return {
      email,
      local: email.slice(0, at),
      domain: email.slice(at + 1)
    };
  }

  function isValidLocalPart(local) {
    if (!local || local.length > 64) return false;
    if (local.startsWith('.') || local.endsWith('.')) return false;
    if (local.includes('..')) return false;

    return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local);
  }

  function isValidDomainStructure(domain) {
    if (!domain || domain.length > 253) return false;
    if (!domain.includes('.')) return false;
    if (domain.includes('..')) return false;

    const labels = domain.split('.');

    if (labels.some(label => !label || label.length > 63)) {
      return false;
    }

    if (
      labels.some(label =>
        label.startsWith('-') ||
        label.endsWith('-') ||
        !/^[a-z0-9-]+$/i.test(label)
      )
    ) {
      return false;
    }

    const tld = labels[labels.length - 1];
    return /^[a-z]{2,24}$/i.test(tld);
  }

  function isRegionalOrBusinessDomain(domain) {
    if (COMMON_PUBLIC_DOMAINS.has(domain)) return true;

    if (ECUADOR_SUFFIXES.some(suffix => domain.endsWith(suffix))) {
      return true;
    }

    if (LATAM_COUNTRY_SUFFIXES.some(suffix => domain.endsWith(suffix))) {
      return true;
    }

    // Do not restrict legitimate international corporate domains.
    // Any structurally valid public domain is accepted.
    return isValidDomainStructure(domain);
  }

  function validateEmail(value) {
    const parts = splitEmail(value);

    if (!parts) {
      return {
        valid: false,
        message: 'Ingresa un correo electrónico válido.'
      };
    }

    if (!isValidLocalPart(parts.local) || !isValidDomainStructure(parts.domain)) {
      return {
        valid: false,
        message: 'Ingresa un correo electrónico válido.'
      };
    }

    if (DISPOSABLE_DOMAINS.has(parts.domain)) {
      return {
        valid: false,
        message: 'Utiliza un correo personal, institucional o empresarial válido.'
      };
    }

    if (COMMON_DOMAIN_TYPOS.has(parts.domain)) {
      return {
        valid: false,
        message: 'Revisa el dominio del correo. ¿Quisiste escribir @' +
          COMMON_DOMAIN_TYPOS.get(parts.domain) + '?'
      };
    }

    if (!isRegionalOrBusinessDomain(parts.domain)) {
      return {
        valid: false,
        message: 'El dominio del correo no parece válido.'
      };
    }

    return {
      valid: true,
      message: ''
    };
  }

  function setEmailError(input, result) {
    const wrapper = getWrapper(input);
    if (!wrapper) return;

    let error = wrapper.querySelector('.cy-email-error');

    if (!result.valid) {
      input.setAttribute('aria-invalid', 'true');

      if (!error) {
        error = document.createElement('div');
        error.className = 'cy-email-error';
        error.style.fontSize = '12px';
        error.style.color = '#c62828';
        error.style.marginTop = '6px';
        error.style.fontWeight = '600';
        error.style.lineHeight = '1.4';
        wrapper.appendChild(error);
      }

      error.textContent = result.message;
      return;
    }

    input.removeAttribute('aria-invalid');
    if (error) error.remove();
  }

  function configureEmailInput(input) {
    if (!input || input.dataset.cyEmailValidation === '1') return;

    input.dataset.cyEmailValidation = '1';
    input.setAttribute('type', 'email');
    input.setAttribute('autocomplete', 'email');
    input.setAttribute('inputmode', 'email');
    input.setAttribute('placeholder', EMAIL_PLACEHOLDER);

    input.addEventListener('input', function () {
      if (!String(input.value || '').trim()) {
        setEmailError(input, { valid: true, message: '' });
        return;
      }

      const result = validateEmail(input.value);
      if (result.valid) {
        setEmailError(input, result);
      }
    });

    input.addEventListener('blur', function () {
      const value = String(input.value || '').trim();

      if (!value && !input.required) {
        setEmailError(input, { valid: true, message: '' });
        return;
      }

      setEmailError(input, validateEmail(value));
    });
  }

  document.addEventListener(
    'submit',
    function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const emails = form.querySelectorAll(EMAIL_SELECTOR);
      if (!emails.length) return;

      let firstInvalid = null;

      emails.forEach(input => {
        const value = String(input.value || '').trim();

        if (!value && !input.required) return;

        const result = validateEmail(value);
        setEmailError(input, result);

        if (!result.valid && !firstInvalid) {
          firstInvalid = input;
        }
      });

      if (firstInvalid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    },
    true
  );

  function init(root) {
    const context = root || document;
    context.querySelectorAll(EMAIL_SELECTOR).forEach(configureEmailInput);
  }

  function start() {
    init(document);

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node;

          if (element.matches && element.matches(EMAIL_SELECTOR)) {
            configureEmailInput(element);
          }

          if (element.querySelectorAll) {
            init(element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
