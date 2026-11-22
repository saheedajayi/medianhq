import assert from "node:assert/strict";
import { test } from "node:test";
import { convertBetween, formatAmount, payCurrencyForLocation, payCurrencyForTimeZone } from "./currency.ts";

test("mentees pay in their own country's currency where Flutterwave covers it", () => {
  assert.equal(payCurrencyForLocation("Lagos, Nigeria"), "NGN");
  assert.equal(payCurrencyForLocation("Accra, Ghana"), "GHS");
  assert.equal(payCurrencyForLocation("Nairobi, Kenya"), "KES");
  assert.equal(payCurrencyForLocation("Berlin, Germany"), "EUR");
  assert.equal(payCurrencyForLocation("London, United Kingdom"), "GBP");
  // Not covered by Flutterwave, so dollars
  assert.equal(payCurrencyForLocation("Toronto, Canada"), "USD");
  assert.equal(payCurrencyForTimeZone("Africa/Accra"), "GHS");
  assert.equal(payCurrencyForTimeZone("America/Toronto"), "USD");
});

test("converts the same way as the API charges", () => {
  const rates = { NGN: 1500, GHS: 15 };
  assert.equal(convertBetween(30000, "NGN", "GHS", rates), 300);
  assert.equal(convertBetween(20, "USD", "GHS", rates), 300);
  assert.equal(convertBetween(20, "USD", "XOF", rates), null);
});

test("shows each currency's own symbol", () => {
  assert.equal(formatAmount(300, "GHS"), "GH₵300");
  assert.equal(formatAmount(2600, "KES"), "KSh2,600");
  assert.equal(formatAmount(0, "GHS"), "Free");
});
