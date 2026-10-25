export function angkaKeTeks(n: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  if (n < 12) {
    return bilangan[n];
  } else if (n < 20) {
    return angkaKeTeks(n - 10) + ' Belas';
  } else if (n < 100) {
    return angkaKeTeks(Math.floor(n / 10)) + ' Puluh ' + angkaKeTeks(n % 10);
  } else if (n < 200) {
    return 'Seratus ' + angkaKeTeks(n - 100);
  } else if (n < 1000) {
    return angkaKeTeks(Math.floor(n / 100)) + ' Ratus ' + angkaKeTeks(n % 100);
  } else if (n < 2000) {
    return 'Seribu ' + angkaKeTeks(n - 1000);
  } else if (n < 1000000) {
    return angkaKeTeks(Math.floor(n / 1000)) + ' Ribu ' + angkaKeTeks(n % 1000);
  } else if (n < 1000000000) {
    return angkaKeTeks(Math.floor(n / 1000000)) + ' Juta ' + angkaKeTeks(n % 1000000);
  } else if (n < 1000000000000) {
    return angkaKeTeks(Math.floor(n / 1000000000)) + ' Miliar ' + angkaKeTeks(n % 1000000000);
  } else {
    return angkaKeTeks(Math.floor(n / 1000000000000)) + ' Triliun ' + angkaKeTeks(n % 1000000000000);
  }
}

export function terbilangRupiah(amount: number): string {
  if (!amount || amount <= 0) return 'Nol Rupiah';
  const clean = Math.floor(amount);
  const hasil = angkaKeTeks(clean).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}
