import { $, byTestId, log } from "./utils.js";

const SUCCESS_MESSAGE = "Dziękujemy! Zapytanie zostało wysłane do KP_Code Digital Studio.";
const DELIVERY_ERROR_MESSAGE = "Nie udało się wysłać formularza. Sprawdź połączenie i spróbuj ponownie.";
const REQUIRED_FIELDS_MESSAGE = "Uzupełnij wymagane pola.";
const INVALID_FIELDS_MESSAGE = "Popraw zaznaczone pola.";

export function initContactForm() {
  const form = byTestId("booking-form") || $(".booking-form") || $("#booking-form");
  const formMsg = $("#form-msg") || form?.querySelector(".booking-form__message--status");
  if (!form || !formMsg) return;

  const submitBtn = form.querySelector(".site-button--form");
  const emailInput = form.querySelector("#email");
  const emailError = form.querySelector("#email-error");
  const phoneInput = form.querySelector("#phone");
  const phoneError = form.querySelector("#phone-error");

  if (!formMsg.hasAttribute("aria-live")) formMsg.setAttribute("aria-live", "polite");
  if (!formMsg.hasAttribute("role")) formMsg.setAttribute("role", "status");

  const setLoading = (loading) => {
    if (!submitBtn) return;
    if (loading) {
      if (!submitBtn.dataset.label) submitBtn.dataset.label = submitBtn.textContent.trim();
      submitBtn.textContent = "Wysyłanie…";
      submitBtn.classList.add("site-button--loading");
      submitBtn.setAttribute("aria-busy", "true");
      submitBtn.disabled = true;
      return;
    }

    submitBtn.textContent = submitBtn.dataset.label || "Wyślij zapytanie";
    submitBtn.classList.remove("site-button--loading");
    submitBtn.removeAttribute("aria-busy");
    submitBtn.disabled = false;
  };

  const setFieldError = (input, errorNode, problem) => {
    if (!input) return;
    input.setCustomValidity(problem.validity);
    input.setAttribute("aria-invalid", "true");
    if (errorNode) errorNode.textContent = problem.message;
  };

  const clearFieldError = (input, errorNode) => {
    if (!input) return;
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
    if (errorNode) errorNode.textContent = "";
  };

  const clearErrors = () => {
    clearFieldError(emailInput, emailError);
    clearFieldError(phoneInput, phoneError);
  };

  emailInput?.addEventListener("input", () => {
    clearFieldError(emailInput, emailError);
  });

  phoneInput?.addEventListener("input", () => {
    clearFieldError(phoneInput, phoneError);
  });

  form.addEventListener("submit", (event) => {
    if (submitBtn && submitBtn.classList.contains("site-button--loading")) {
      event.preventDefault();
      return;
    }

    if (form.company && form.company.value.trim() !== "") {
      event.preventDefault();
      formMsg.textContent = "Wykryto bota - zgłoszenie odrzucone.";
      return;
    }

    clearErrors();

    let valid = true;
    let invalidFormat = false;

    /* Telefon jest opcjonalny, a jego format opisuje natywny atrybut pattern: 7–15 cyfr,
       opcjonalny "+" na początku oraz spacje, kropki, nawiasy i myślniki jako separatory.
       Ta sama reguła działa bez JavaScriptu, a wpisana wartość jest wysyłana bez zmian. */
    if (phoneInput && phoneInput.validity.patternMismatch) {
      valid = false;
      invalidFormat = true;
      setFieldError(phoneInput, phoneError, {
        validity: "Podaj poprawny numer telefonu.",
        message: "Podaj poprawny numer telefonu (np. +48 123 456 789) lub pozostaw pole puste."
      });
    }

    if (emailInput && emailInput.validity.typeMismatch) {
      valid = false;
      invalidFormat = true;
      setFieldError(emailInput, emailError, {
        validity: "Podaj poprawny adres e-mail.",
        message: "Podaj poprawny adres e-mail (np. jan.kowalski@example.com)."
      });
    }

    if (!form.checkValidity()) valid = false;

    if (!valid) {
      event.preventDefault();
      form.reportValidity?.();
      formMsg.textContent = invalidFormat ? INVALID_FIELDS_MESSAGE : REQUIRED_FIELDS_MESSAGE;
      return;
    }

    if (window.fetch && window.FormData) {
      event.preventDefault();
      setLoading(true);
      formMsg.textContent = "";

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Contact form delivery rejected with status ${response.status}`);
          }

          formMsg.textContent = SUCCESS_MESSAGE;
          form.reset();
          if (phoneInput) phoneInput.value = "";
          clearErrors();
        })
        .catch(() => {
          formMsg.textContent = DELIVERY_ERROR_MESSAGE;
        })
        .finally(() => {
          setLoading(false);
        });
    }
  });

  log();
  form.noValidate = true;
}
