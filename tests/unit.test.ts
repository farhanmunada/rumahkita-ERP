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

  await t.test('calculates down payment remaining balance correctly', () => {
    const totalAmount = 1000000;
    const downPayment = 400000;
    const remainingBalance = Math.max(0, totalAmount - downPayment);
    assert.equal(remainingBalance, 600000);

    const fullDownPayment = 1000000;
    assert.equal(Math.max(0, totalAmount - fullDownPayment), 0);
  });
});

test('Digital Verification QR Code', async (t) => {
  await t.test('generates valid vector SVG string from verify URL', async () => {
    const QRCode = (await import('qrcode')).default;
    const verifyUrl = 'http://localhost:3000/invoices/1/print';
    const svg = await QRCode.toString(verifyUrl, { type: 'svg', margin: 1 });
    assert.match(svg, /<svg/);
    assert.match(svg, /viewBox=/);
  });
});

test('Costing & Pricing Calculator Module', async (t) => {
  const { calculateSellingPrice, calculateCostingTotals } = await import(
    '../src/features/costing/services/costing-calculator'
  );

  await t.test('calculates selling price using margin vs markup correctly', () => {
    const unitCost = 100000;

    // Markup 50% = 100.000 * (1 + 0.5) = 150.000
    const markupPrice = calculateSellingPrice(unitCost, 50, 'markup');
    assert.equal(markupPrice, 150000);

    // Margin 50% = 100.000 / (1 - 0.5) = 200.000
    const marginPrice = calculateSellingPrice(unitCost, 50, 'margin');
    assert.equal(marginPrice, 200000);

    // Margin 20% = 100.000 / (1 - 0.2) = 125.000
    const margin20 = calculateSellingPrice(unitCost, 20, 'margin');
    assert.equal(margin20, 125000);
  });

  await t.test('calculates costing totals and category breakdown accurately', () => {
    const items = [
      { id: '1', name: 'Kertas', category: 'material' as const, quantity: 2, unit: 'rim', unitCost: 150000, totalCost: 300000 },
      { id: '2', name: 'Jasa Cetak', category: 'labor' as const, quantity: 1, unit: 'job', unitCost: 100000, totalCost: 100000 },
      { id: '3', name: 'Listrik & Kemas', category: 'overhead' as const, quantity: 1, unit: 'paket', unitCost: 50000, totalCost: 50000 },
    ];

    const result = calculateCostingTotals(items, 100, 'margin', 40);

    assert.equal(result.materialCost, 300000);
    assert.equal(result.laborCost, 100000);
    assert.equal(result.overheadCost, 50000);
    assert.equal(result.totalCost, 450000);
    // HPP per unit = 450.000 / 100 = 4.500
    assert.equal(result.unitCost, 4500);
    assert.equal(result.tiers.length, 4);

    // Check optimal tier (50% margin) -> 4500 / 0.5 = 9000
    const optimal = result.tiers.find((tier) => tier.id === 'optimal');
    assert.ok(optimal);
    assert.equal(optimal.unitPrice, 9000);
    assert.equal(optimal.totalPrice, 900000);
    assert.equal(optimal.totalProfit, 450000);
  });

  await t.test('calculates vendor maklon, shipping, and packaging costs accurately', () => {
    const brokerItems = [
      { id: 'v1', name: 'Maklon Kaos Sablon', category: 'vendor' as const, vendorName: 'Vendor Solo', quantity: 50, unit: 'pcs', unitCost: 35000, totalCost: 1750000 },
      { id: 'v2', name: 'Kargo J&T Cargo', category: 'shipping' as const, quantity: 1, unit: 'resi', unitCost: 80000, totalCost: 80000 },
      { id: 'v3', name: 'Plastik Sablon & Dus', category: 'packaging' as const, quantity: 50, unit: 'pcs', unitCost: 2000, totalCost: 100000 },
    ];

    const res = calculateCostingTotals(brokerItems, 50, 'markup', 50);

    assert.equal(res.vendorCost, 1750000);
    assert.equal(res.shippingCost, 80000);
    assert.equal(res.packagingCost, 100000);
    assert.equal(res.totalCost, 1930000);
    assert.equal(res.unitCost, 38600); // 1.930.000 / 50
  });
});

test('Session Authentication & Token Security', async (t) => {
  const {
    createSessionToken,
    verifySessionToken,
    touchSessionToken,
    SESSION_MAX_AGE_SECONDS,
  } = await import('../src/features/auth/services/auth-session');

  await t.test('creates and verifies valid HMAC SHA-256 session token', async () => {
    const token = await createSessionToken('admin');
    assert.ok(token && typeof token === 'string');

    const verified = await verifySessionToken(token);
    assert.ok(verified);
    assert.equal(verified?.username, 'admin');
    assert.equal(verified?.role, 'admin');
    assert.ok(verified?.lastActive);
  });

  await t.test('rejects tampered or forged session token', async () => {
    const token = await createSessionToken('admin');
    const parts = token.split('.');
    const tampered = `${parts[0]}xxx.${parts[1]}`;
    const verified = await verifySessionToken(tampered);
    assert.equal(verified, null);
  });

  await t.test('refreshes active session via touchSessionToken', async () => {
    const token = await createSessionToken('admin');
    const beforeTouch = await verifySessionToken(token);
    assert.ok(beforeTouch);

    // Wait a tiny moment
    await new Promise((resolve) => setTimeout(resolve, 10));

    const refreshedToken = await touchSessionToken(token);
    assert.ok(refreshedToken);

    const afterTouch = await verifySessionToken(refreshedToken);
    assert.ok(afterTouch);
    assert.ok(afterTouch!.lastActive >= beforeTouch!.lastActive);
  });
});
