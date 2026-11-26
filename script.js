// =====================================================
// 1. PRICES  (change these numbers to suit any business)
// =====================================================
const PRICES = {
  service: {
    standard: { label: "Standard clean", price: 300 },
    deep: { label: "Deep clean", price: 550 },
    moveout: { label: "Move-out clean", price: 700 },
  },
  bedroom: 80,
  bathroom: 60,
  extras: {
    oven: { label: "Inside oven", price: 150 },
    fridge: { label: "Inside fridge", price: 120 },
    windows: { label: "Inside windows", price: 200 },
    laundry: { label: "Laundry and ironing", price: 100 },
  },
  frequency: {
    once: { label: "Once-off", discount: 0 },
    monthly: { label: "Monthly", discount: 0.05 },
    biweekly: { label: "Every 2 weeks", discount: 0.1 },
    weekly: { label: "Weekly", discount: 0.15 },
  },
};

const WHATSAPP_NUMBER = "27820000000"; // sample number: replace with a real one

// =====================================================
// 2. THE MATHS  (only numbers in, numbers out)
// =====================================================
function calculateQuote({ service, bedrooms, bathrooms, extras, frequency }) {
  const lines = [];

  const chosenService = PRICES.service[service];
  lines.push({ label: chosenService.label, amount: chosenService.price });
  lines.push({ label: `Bedrooms x ${bedrooms}`, amount: bedrooms * PRICES.bedroom });
  lines.push({ label: `Bathrooms x ${bathrooms}`, amount: bathrooms * PRICES.bathroom });

  extras.forEach((key) => {
    lines.push({ label: PRICES.extras[key].label, amount: PRICES.extras[key].price });
  });

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const discountPercent = PRICES.frequency[frequency].discount;
  const discountAmount = Math.round(subtotal * discountPercent);
  const total = subtotal - discountAmount;

  return { lines, subtotal, discountPercent, discountAmount, total };
}

function formatRand(amount) {
  return "R" + amount.toLocaleString("en-ZA");
}

// --- DOM ---
// =====================================================
// 3. THE PAGE  (read the form, show the quote)
// =====================================================
const form = document.getElementById("quote-form");
const linesList = document.getElementById("quote-lines");
const discountRow = document.getElementById("discount-row");
const discountLabel = document.getElementById("discount-label");
const discountAmountEl = document.getElementById("discount-amount");
const totalEl = document.getElementById("total");
const frequencyNote = document.getElementById("frequency-note");
const whatsappBtn = document.getElementById("whatsapp-btn");
const resetBtn = document.getElementById("reset-btn");

function readForm() {
  const data = new FormData(form);
  return {
    service: data.get("service"),
    bedrooms: Number(data.get("bedrooms")),
    bathrooms: Number(data.get("bathrooms")),
    extras: data.getAll("extras"),
    frequency: data.get("frequency"),
    customer: (data.get("customer") || "").trim(),
  };
}

function render() {
  const choices = readForm();
  const quote = calculateQuote(choices);

  // list of lines
  linesList.innerHTML = "";
  quote.lines.forEach((line) => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    const price = document.createElement("span");
    name.textContent = line.label;
    price.textContent = formatRand(line.amount);
    li.append(name, price);
    linesList.appendChild(li);
  });

  // discount
  const frequency = PRICES.frequency[choices.frequency];
  if (quote.discountAmount > 0) {
    discountRow.hidden = false;
    discountLabel.textContent = `${frequency.label} discount (${Math.round(frequency.discount * 100)}%)`;
    discountAmountEl.textContent = "-" + formatRand(quote.discountAmount);
  } else {
    discountRow.hidden = true;
  }

  totalEl.textContent = formatRand(quote.total);
  frequencyNote.textContent =
    choices.frequency === "once" ? "Price for one visit." : `Price per visit, ${frequency.label.toLowerCase()}.`;

  whatsappBtn.href = buildWhatsAppLink(choices, quote);
}

function buildWhatsAppLink(choices, quote) {
  const greeting = choices.customer ? `Hi, my name is ${choices.customer}.` : "Hi,";
  const details = quote.lines.map((line) => `- ${line.label}: ${formatRand(line.amount)}`).join("\n");
  const message =
    `${greeting} I would like to book a clean.\n\n` +
    `${details}\n` +
    `Frequency: ${PRICES.frequency[choices.frequency].label}\n` +
    `Total: ${formatRand(quote.total)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

form.addEventListener("input", render);
form.addEventListener("change", render);
resetBtn.addEventListener("click", () => {
  form.reset();
  render();
});

render();
