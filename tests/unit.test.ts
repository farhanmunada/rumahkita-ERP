import test from 'node:test';
import assert from 'node:assert/strict';

import { formatRupiah, parseRupiahInput } from '../src/shared/lib/currency';
import { formatTanggalIndo, getTodayDateString, getDefaultDueDateString } from '../src/shared/lib/date';
import { terbilangRupiah, angkaKeTeks } from '../src/shared/lib/terbilang';
import { calculateInvoiceTotals } from '../src/features/invoices/services/invoice.service';

test('Currency Formatting & Parsing', async (t) => {
  await t.test('formatRupiah formats IDR currency properly', () => {
    assert.match(formatRupiah(0), /Rp\s*0/);
    assert.match(formatRupiah(50000), /Rp\s*50\.000/);
    assert.match(formatRupiah(1500000), /Rp\s*1\.500\.000/);
  });

  await t.test('parseRupiahInput extracts clean integers', () => {
    assert.equal(parseRupiahInput('Rp 50.000'), 50000);
    assert.equal(parseRupiahInput('1.500.000'), 1500000);
    assert.equal(parseRupiahInput('abc'), 0);
    assert.equal(parseRupiahInput(''), 0);
  });
});

test('Indonesian Date Utilities', async (t) => {
  await t.test('formatTanggalIndo produces Indonesian formatted date string', () => {
    const formatted = formatTanggalIndo('2026-05-17');
    assert.match(formatted, /17 Mei 2026/);
  });

  await t.test('getTodayDateString returns YYYY-MM-DD format', () => {
    const today = getTodayDateString();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  await t.test('getDefaultDueDateString returns date 14 days in future', () => {
    const due = getDefaultDueDateString(14);
    assert.match(due, /^\d{4}-\d{2}-\d{2}$/);
  });
});

test('Terbilang Bahasa Indonesia', async (t) => {
  await t.test('terbilangRupiah converts nominals accurately to words', () => {
    assert.equal(terbilangRupiah(0), 'Nol Rupiah');
    assert.equal(terbilangRupiah(150000), 'Seratus Lima Puluh Ribu Rupiah');
    assert.equal(terbilangRupiah(1250000), 'Satu Juta Dua Ratus Lima Puluh Ribu Rupiah');
    assert.equal(terbilangRupiah(15000000), 'Lima Belas Juta Rupiah');
  });

  await t.test('angkaKeTeks handles edge cases and large numbers', () => {
    assert.equal(angkaKeTeks(1), 'Satu');
    assert.equal(angkaKeTeks(11), 'Sebelas');
    assert.equal(angkaKeTeks(100).trim(), 'Seratus');
    assert.equal(angkaKeTeks(1000).trim(), 'Seribu');
  });
});

test('Invoice Financial Calculations', async (t) => {
  await t.test('calculateInvoiceTotals calculates standard subtotal without discount or tax', () => {
    const items = [
      { quantity: 2, unitPrice: 50000 },
      { quantity: 1, unitPrice: 150000 },
    ];
    const result = calculateInvoiceTotals(items, 0, 'fixed', 0);

    assert.equal(result.subtotal, 250000);
    assert.equal(result.discountAmount, 0);
    assert.equal(result.taxAmount, 0);
    assert.equal(result.totalAmount, 250000);
  });

  await t.test('calculateInvoiceTotals calculates percentage discount and PPN 11%', () => {
    const items = [{ quantity: 10, unitPrice: 100000 }]; // 1.000.000
    // 10% discount = 100.000 -> taxable base = 900.000
    // 11% PPN of 900.000 = 99.000
    // Grand Total = 999.000
    const result = calculateInvoiceTotals(items, 11, 'percent', 10);

    assert.equal(result.subtotal, 1000000);
    assert.equal(result.discountAmount, 100000);
    assert.equal(result.taxAmount, 99000);
    assert.equal(result.totalAmount, 999000);
  });

  await t.test('calculateInvoiceTotals handles fixed discount', () => {
    const items = [{ quantity: 1, unitPrice: 500000 }];
    const result = calculateInvoiceTotals(items, 0, 'fixed', 50000);

    assert.equal(result.subtotal, 500000);
    assert.equal(result.discountAmount, 50000);
    assert.equal(result.totalAmount, 450000);
  });
});
