import { $, byTestId, log } from "./utils.js";

const normalizeDigits = (value) => value.replace(/\D/g, "");

const normalizePhone = (value) => {
  const digits = normalizeDigits(value);
  if (!digits) return "";

  let local = digits;
  if (local.startsWith("0048")) local = local.slice(4);
  if (local.startsWith("48") && local.length > 9) local = local.slice(2);
  return local.slice(0, 9);
};

const formatPhone = (value) => {
  const local = normalizePhone(value);
  if (!local) return "";

  const parts = [];
  for (let i = 0; i < local.length; i += 3) {
    parts.push(local.slice(i, i + 3));
  }

  return `+48 ${parts.join(" ")}`.trim();
};

const isValidPhone = (value) => normalizePhone(value).length === 9;

const DELIVERY_ERROR_MESSAGE = "Nie udało się wysłać formularza. Sprawdź połączenie i spróbuj ponownie.";
const REQUIRED_FIELDS_MESSAGE = "Uzupełnij wymagane pola.";
const RESERVATION_WINDOW_MESSAGE =
  "Popraw datę lub godzinę rezerwacji: wtorek–niedziela, od 17:00 do 22:00, do 90 dni naprzód.";

/* Zatwierdzone okno rezerwacji: wtorek-niedziela, 17:00-22:00 co 15 minut,
   od dziś do 90 dni naprzód (włącznie). Godziny otwarcia restauracji i rezerwacje
   telefoniczne pozostają bez zmian. */
const RESERVATION_WINDOW_DAYS = 90;
const RESERVATION_CLOSED_WEEKDAY = 1;
const RESERVATION_OPEN_MINUTES = 17 * 60;
const RESERVATION_CLOSE_MINUTES = 22 * 60;
const RESERVATION_STEP_MINUTES = 15;

const padTwo = (value) => String(value).padStart(2, "0");

/* Daty liczone są na lokalnych komponentach kalendarza (rok, miesiąc, dzień),
   bez konwersji przez UTC, więc strefa czasowa ani zmiana czasu nie przesuwają dnia.
   Południe jako godzina odniesienia utrzymuje poprawny dzień tygodnia także w dniach
   zmiany czasu, a przeniesienia miesiąca i roku obsługuje sam konstruktor Date. */
const localDate = (year, month, day) => new Date(year, month, day, 12, 0, 0, 0);

const toIsoDate = (date) => `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;

const formatDatePl = (isoDate) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
};

const parseIsoDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = localDate(year, month - 1, day);
  const isRealDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isRealDate ? date : null;
};

const getReservationDateWindow = () => {
  const now = new Date();
  const first = localDate(now.getFullYear(), now.getMonth(), now.getDate());
  const last = localDate(now.getFullYear(), now.getMonth(), now.getDate() + RESERVATION_WINDOW_DAYS);
  return { min: toIsoDate(first), max: toIsoDate(last) };
};

/* Wartości ISO (RRRR-MM-DD) porównują się leksykograficznie zgodnie z chronologią,
   więc granice sprawdzane są bez arytmetyki na znacznikach czasu. */
const describeDateProblem = (value) => {
  const entered = value.trim();
  if (!entered) {
    return { validity: "Wybierz datę rezerwacji.", message: "Wybierz datę rezerwacji.", missing: true };
  }

  const parsed = parseIsoDate(entered);
  if (!parsed) {
    return { validity: "Podaj poprawną datę.", message: "Podaj poprawną datę w formacie RRRR-MM-DD." };
  }

  const { min, max } = getReservationDateWindow();
  if (entered < min) {
    return {
      validity: "Wybierz datę od dziś.",
      message: `Rezerwacje przyjmujemy od dziś (najwcześniej ${formatDatePl(min)}).`
    };
  }

  if (entered > max) {
    return {
      validity: "Wybierz datę w ciągu 90 dni.",
      message: `Rezerwacje przyjmujemy do 90 dni naprzód (najpóźniej ${formatDatePl(max)}).`
    };
  }

  if (parsed.getDay() === RESERVATION_CLOSED_WEEKDAY) {
    return {
      validity: "W poniedziałki nie przyjmujemy rezerwacji.",
      message: "W poniedziałki nie przyjmujemy rezerwacji. Wybierz dzień od wtorku do niedzieli."
    };
  }

  return null;
};

const parseTimeMinutes = (value) => {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || "0");
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return hours * 60 + minutes + seconds / 60;
};

const describeTimeProblem = (value) => {
  const entered = value.trim();
  if (!entered) {
    return { validity: "Wybierz godzinę rezerwacji.", message: "Wybierz godzinę rezerwacji.", missing: true };
  }

  const minutes = parseTimeMinutes(entered);
  if (minutes === null) {
    return { validity: "Podaj poprawną godzinę.", message: "Podaj poprawną godzinę w formacie GG:MM." };
  }

  if (minutes < RESERVATION_OPEN_MINUTES || minutes > RESERVATION_CLOSE_MINUTES) {
    return {
      validity: "Rezerwacje od 17:00 do 22:00.",
      message: "Rezerwacje przyjmujemy od 17:00 do 22:00."
    };
  }

  if ((minutes - RESERVATION_OPEN_MINUTES) % RESERVATION_STEP_MINUTES !== 0) {
    return {
      validity: "Wybierz godzinę co 15 minut.",
      message: "Wybierz godzinę w odstępach 15 minut (np. 18:00, 18:15)."
    };
  }

  return null;
};

export function initReservationForm() {
  const form = byTestId("booking-form") || $(".booking-form") || $("#booking-form");
  const formMsg = $("#form-msg") || form?.querySelector(".booking-form__message--status");
  if (!form || !formMsg) return;

  const submitBtn = form.querySelector(".site-button--form");
  const phoneInput = form.querySelector("#phone");
  const phoneError = form.querySelector("#phone-error");
  const dateInput = form.querySelector("#date");
  const dateError = form.querySelector("#date-error");
  const timeInput = form.querySelector("#time");
  const timeError = form.querySelector("#time-error");
  const consentInput = form.querySelector("#consent");
  const consentError = form.querySelector("#consent-error");

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

    submitBtn.textContent = submitBtn.dataset.label || "Wyślij rezerwację";
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
    clearFieldError(phoneInput, phoneError);
    clearFieldError(dateInput, dateError);
    clearFieldError(timeInput, timeError);
    clearFieldError(consentInput, consentError);
  };

  /* Natywne atrybuty min/max w HTML są statyczną granicą dla wersji bez JavaScriptu;
     tutaj odświeżamy je według lokalnej daty odwiedzającego. */
  const applyDateWindow = () => {
    if (!dateInput) return;
    const { min, max } = getReservationDateWindow();
    dateInput.min = min;
    dateInput.max = max;
  };

  /* Błąd pola aktualizuje się tylko wtedy, gdy pole było już oznaczone jako błędne,
     więc nietknięte pole nie otwiera się z błędem, a nieaktualny komunikat nie zostaje. */
  const refreshFieldError = (input, errorNode, describeProblem) => {
    if (!input || input.getAttribute("aria-invalid") !== "true") return;
    const problem = describeProblem(input.value);
    if (problem) setFieldError(input, errorNode, problem);
    else clearFieldError(input, errorNode);
  };

  applyDateWindow();

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatPhone(phoneInput.value);
      clearFieldError(phoneInput, phoneError);
    });
  }

  dateInput?.addEventListener("input", () => {
    refreshFieldError(dateInput, dateError, describeDateProblem);
  });

  timeInput?.addEventListener("input", () => {
    refreshFieldError(timeInput, timeError, describeTimeProblem);
  });

  consentInput?.addEventListener("change", () => {
    if (consentInput.checked) clearFieldError(consentInput, consentError);
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
    applyDateWindow();

    let valid = true;
    let outsideWindow = false;

    if (consentInput && !consentInput.checked) {
      valid = false;
      setFieldError(consentInput, consentError, {
        validity: "Wyraź zgodę na przetwarzanie danych.",
        message: "Aby wysłać formularz, zaznacz zgodę."
      });
    }

    if (phoneInput && !isValidPhone(phoneInput.value)) {
      valid = false;
      setFieldError(phoneInput, phoneError, {
        validity: "Podaj poprawny numer telefonu.",
        message: "Podaj poprawny numer telefonu (np. +48 123 456 789)."
      });
    }

    if (dateInput) {
      const dateProblem = describeDateProblem(dateInput.value);
      if (dateProblem) {
        valid = false;
        if (!dateProblem.missing) outsideWindow = true;
        setFieldError(dateInput, dateError, dateProblem);
      }
    }

    if (timeInput) {
      const timeProblem = describeTimeProblem(timeInput.value);
      if (timeProblem) {
        valid = false;
        if (!timeProblem.missing) outsideWindow = true;
        setFieldError(timeInput, timeError, timeProblem);
      }
    }

    if (!form.checkValidity()) valid = false;

    if (!valid) {
      event.preventDefault();
      form.reportValidity?.();
      formMsg.textContent = outsideWindow ? RESERVATION_WINDOW_MESSAGE : REQUIRED_FIELDS_MESSAGE;
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
            throw new Error(`Reservation delivery rejected with status ${response.status}`);
          }

          formMsg.textContent = "Dziękujemy! Oddzwonimy, aby potwierdzić rezerwację.";
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
