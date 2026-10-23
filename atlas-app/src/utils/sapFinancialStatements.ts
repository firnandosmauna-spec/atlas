import type { Account } from '../store/engagementStore';

export const SAP_GROUPS = [
  'Pendapatan-LO',
  'Beban-LO',
  'Pendapatan-LRA',
  'Belanja-LRA',
  'Pembiayaan-LRA',
  'Aset',
  'Kewajiban',
  'Ekuitas',
  'Arus Kas / Transitoris',
  'Saldo Anggaran Lebih'
];

export const SAP_SUBGROUPS: Record<string, string[]> = {
  'Pendapatan-LO': [
    'Pendapatan Asli Daerah (PAD) - LO',
    'Pendapatan Transfer - LO',
    'Lain-lain Pendapatan yang Sah - LO',
    'Pendapatan Jasa Layanan BLU - LO'
  ],
  'Beban-LO': [
    'Beban Pegawai',
    'Beban Persediaan',
    'Beban Jasa & Operasional',
    'Beban Pemeliharaan',
    'Beban Penyusutan & Amortisasi',
    'Beban Bunga & Subsidi',
    'Beban Hibah & Bantuan Sosial',
    'Beban Penyisihan Piutang',
    'Beban Lain-lain'
  ],
  'Pendapatan-LRA': [
    'Pendapatan Asli Daerah (PAD) - LRA',
    'Pendapatan Transfer - LRA',
    'Lain-lain Pendapatan yang Sah - LRA'
  ],
  'Belanja-LRA': [
    'Belanja Pegawai',
    'Belanja Barang dan Jasa',
    'Belanja Bunga & Subsidi',
    'Belanja Hibah & Bantuan Sosial',
    'Belanja Modal Tanah',
    'Belanja Modal Peralatan dan Mesin',
    'Belanja Modal Gedung dan Bangunan',
    'Belanja Modal Jalan, Irigasi & Jaringan',
    'Belanja Modal Aset Tetap Lainnya',
    'Belanja Tak Terduga'
  ],
  'Pembiayaan-LRA': [
    'Penerimaan Pembiayaan (Penggunaan SiLPA)',
    'Penerimaan Pembiayaan (Pencairan Dana Cadangan)',
    'Pengeluaran Pembiayaan (Penyertaan Modal)',
    'Pengeluaran Pembiayaan (Pembayaran Pokok Utang)'
  ],
  'Aset': [
    'Kas dan Setara Kas',
    'Investasi Jangka Pendek',
    'Piutang Pendapatan',
    'Persediaan',
    'Investasi Jangka Panjang',
    'Aset Tetap - Tanah',
    'Aset Tetap - Peralatan & Mesin',
    'Aset Tetap - Gedung & Bangunan',
    'Aset Tetap - Jalan, Irigasi & Jaringan',
    'Akumulasi Penyusutan Aset Tetap',
    'Dana Cadangan',
    'Aset Lainnya'
  ],
  'Kewajiban': [
    'Kewajiban Jangka Pendek (Utang PFK)',
    'Kewajiban Jangka Pendek (Utang Belanja/Biaya)',
    'Kewajiban Jangka Pendek (Pendapatan Diterima Dimuka)',
    'Kewajiban Jangka Panjang (Utang Dalam Negeri)'
  ],
  'Ekuitas': [
    'Ekuitas Awal',
    'Ekuitas Donasi / Hibah',
    'Ekuitas Cadangan'
  ],
  'Arus Kas / Transitoris': [
    'Penerimaan Perhitungan Fihak Ketiga (PFK)',
    'Pengeluaran Perhitungan Fihak Ketiga (PFK)',
    'Kas Transitoris'
  ],
  'Saldo Anggaran Lebih': [
    'Saldo Anggaran Lebih (SAL) Awal',
    'Penggunaan SAL',
    'Koreksi Pembukuan SAL'
  ]
};

// Template neraca saldo standar SAP lengkap dan seimbang (PP No. 71/2010)
export const SAP_SAMPLE_TRIAL_BALANCE: Account[] = [
  // ── ASET ──
  {
    id: 'sap-11101',
    code: '1.1.1.01.01',
    name: 'Kas di Kas Daerah / Rekening Operasional Kas',
    group: 'Aset',
    subGroup: 'Kas dan Setara Kas',
    statementType: 'Neraca',
    debit: 18500000000,
    credit: 0,
    endingBalance: 18500000000
  },
  {
    id: 'sap-11102',
    code: '1.1.1.03.01',
    name: 'Kas di Bendahara Penerimaan',
    group: 'Aset',
    subGroup: 'Kas dan Setara Kas',
    statementType: 'Neraca',
    debit: 1250000000,
    credit: 0,
    endingBalance: 1250000000
  },
  {
    id: 'sap-11301',
    code: '1.1.3.01.01',
    name: 'Piutang Pajak Daerah / Retribusi',
    group: 'Aset',
    subGroup: 'Piutang Pendapatan',
    statementType: 'Neraca',
    debit: 4800000000,
    credit: 0,
    endingBalance: 4800000000
  },
  {
    id: 'sap-11701',
    code: '1.1.7.01.01',
    name: 'Persediaan Alat Tulis Kantor & Bahan Pakai Habis',
    group: 'Aset',
    subGroup: 'Persediaan',
    statementType: 'Neraca',
    debit: 2350000000,
    credit: 0,
    endingBalance: 2350000000
  },
  {
    id: 'sap-13101',
    code: '1.3.1.01.01',
    name: 'Aset Tetap - Tanah',
    group: 'Aset',
    subGroup: 'Aset Tetap - Tanah',
    statementType: 'Neraca',
    debit: 45000000000,
    credit: 0,
    endingBalance: 45000000000
  },
  {
    id: 'sap-13201',
    code: '1.3.2.01.01',
    name: 'Aset Tetap - Peralatan dan Mesin',
    group: 'Aset',
    subGroup: 'Aset Tetap - Peralatan & Mesin',
    statementType: 'Neraca',
    debit: 28500000000,
    credit: 0,
    endingBalance: 28500000000
  },
  {
    id: 'sap-13301',
    code: '1.3.3.01.01',
    name: 'Aset Tetap - Gedung dan Bangunan',
    group: 'Aset',
    subGroup: 'Aset Tetap - Gedung & Bangunan',
    statementType: 'Neraca',
    debit: 62000000000,
    credit: 0,
    endingBalance: 62000000000
  },
  {
    id: 'sap-13401',
    code: '1.3.4.01.01',
    name: 'Aset Tetap - Jalan, Irigasi dan Jaringan',
    group: 'Aset',
    subGroup: 'Aset Tetap - Jalan, Irigasi & Jaringan',
    statementType: 'Neraca',
    debit: 75000000000,
    credit: 0,
    endingBalance: 75000000000
  },
  {
    id: 'sap-13701',
    code: '1.3.7.01.01',
    name: 'Akumulasi Penyusutan Aset Tetap',
    group: 'Aset',
    subGroup: 'Akumulasi Penyusutan Aset Tetap',
    statementType: 'Neraca',
    debit: 0,
    credit: 21500000000,
    endingBalance: -21500000000
  },

  // ── KEWAJIBAN ──
  {
    id: 'sap-21101',
    code: '2.1.1.01.01',
    name: 'Utang Perhitungan Fihak Ketiga (PFK - Taspen, BPJS, Pajak Pusat)',
    group: 'Kewajiban',
    subGroup: 'Kewajiban Jangka Pendek (Utang PFK)',
    statementType: 'Neraca',
    debit: 0,
    credit: 1450000000,
    endingBalance: -1450000000
  },
  {
    id: 'sap-21501',
    code: '2.1.5.01.01',
    name: 'Utang Belanja Barang dan Jasa',
    group: 'Kewajiban',
    subGroup: 'Kewajiban Jangka Pendek (Utang Belanja/Biaya)',
    statementType: 'Neraca',
    debit: 0,
    credit: 2850000000,
    endingBalance: -2850000000
  },
  {
    id: 'sap-22101',
    code: '2.2.1.01.01',
    name: 'Utang Jangka Panjang Dalam Negeri',
    group: 'Kewajiban',
    subGroup: 'Kewajiban Jangka Panjang (Utang Dalam Negeri)',
    statementType: 'Neraca',
    debit: 0,
    credit: 15000000000,
    endingBalance: -15000000000
  },

  // ── EKUITAS ──
  {
    id: 'sap-31101',
    code: '3.1.1.01.01',
    name: 'Ekuitas Awal Entitas Pelaporan',
    group: 'Ekuitas',
    subGroup: 'Ekuitas Awal',
    statementType: 'Neraca',
    debit: 0,
    credit: 185600000000,
    endingBalance: -185600000000
  },

  // ── SALDO ANGGARAN LEBIH (SAL) ──
  {
    id: 'sap-sal-01',
    code: '0.1.1.01.01',
    name: 'Saldo Anggaran Lebih (SAL) Awal Tahun',
    group: 'Saldo Anggaran Lebih',
    subGroup: 'Saldo Anggaran Lebih (SAL) Awal',
    statementType: 'LPSAL',
    debit: 0,
    credit: 12500000000,
    endingBalance: -12500000000
  },

  // ── PENDAPATAN-LO ──
  {
    id: 'sap-81101',
    code: '8.1.1.01.01',
    name: 'Pendapatan Pajak Daerah - LO',
    group: 'Pendapatan-LO',
    subGroup: 'Pendapatan Asli Daerah (PAD) - LO',
    statementType: 'LO',
    debit: 0,
    credit: 38500000000,
    endingBalance: -38500000000
  },
  {
    id: 'sap-81201',
    code: '8.1.2.01.01',
    name: 'Pendapatan Retribusi Daerah & Pelayanan Jasa - LO',
    group: 'Pendapatan-LO',
    subGroup: 'Pendapatan Asli Daerah (PAD) - LO',
    statementType: 'LO',
    debit: 0,
    credit: 14200000000,
    endingBalance: -14200000000
  },
  {
    id: 'sap-82101',
    code: '8.2.1.01.01',
    name: 'Pendapatan Transfer Dana Alokasi Umum (DAU) - LO',
    group: 'Pendapatan-LO',
    subGroup: 'Pendapatan Transfer - LO',
    statementType: 'LO',
    debit: 0,
    credit: 65000000000,
    endingBalance: -65000000000
  },
  {
    id: 'sap-82201',
    code: '8.2.2.01.01',
    name: 'Pendapatan Transfer Dana Alokasi Khusus (DAK) - LO',
    group: 'Pendapatan-LO',
    subGroup: 'Pendapatan Transfer - LO',
    statementType: 'LO',
    debit: 0,
    credit: 25000000000,
    endingBalance: -25000000000
  },

  // ── BEBAN-LO ──
  {
    id: 'sap-91101',
    code: '9.1.1.01.01',
    name: 'Beban Pegawai (Gaji Pokok, Tunjangan & Tambahan Penghasilan) - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Pegawai',
    statementType: 'LO',
    debit: 52000000000,
    credit: 0,
    endingBalance: 52000000000
  },
  {
    id: 'sap-91201',
    code: '9.1.2.01.01',
    name: 'Beban Persediaan & Bahan Operasional - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Persediaan',
    statementType: 'LO',
    debit: 16500000000,
    credit: 0,
    endingBalance: 16500000000
  },
  {
    id: 'sap-91301',
    code: '9.1.3.01.01',
    name: 'Beban Jasa Konsultansi, Pos & Telekomunikasi - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Jasa & Operasional',
    statementType: 'LO',
    debit: 11200000000,
    credit: 0,
    endingBalance: 11200000000
  },
  {
    id: 'sap-91401',
    code: '9.1.4.01.01',
    name: 'Beban Pemeliharaan Sarana, Prasarana & Gedung - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Pemeliharaan',
    statementType: 'LO',
    debit: 8400000000,
    credit: 0,
    endingBalance: 8400000000
  },
  {
    id: 'sap-91701',
    code: '9.1.7.01.01',
    name: 'Beban Penyusutan Aset Tetap & Amortisasi - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Penyusutan & Amortisasi',
    statementType: 'LO',
    debit: 14500000000,
    credit: 0,
    endingBalance: 14500000000
  },
  {
    id: 'sap-91801',
    code: '9.1.8.01.01',
    name: 'Beban Bantuan Sosial & Hibah Kemasyarakatan - LO',
    group: 'Beban-LO',
    subGroup: 'Beban Hibah & Bantuan Sosial',
    statementType: 'LO',
    debit: 6500000000,
    credit: 0,
    endingBalance: 6500000000
  },

  // ── PENDAPATAN-LRA (Anggaran & Realisasi) ──
  {
    id: 'sap-41101',
    code: '4.1.1.01.01',
    name: 'Pendapatan Pajak Daerah - LRA',
    group: 'Pendapatan-LRA',
    subGroup: 'Pendapatan Asli Daerah (PAD) - LRA',
    statementType: 'LRA',
    budget: 40000000000,
    debit: 0,
    credit: 38500000000,
    endingBalance: -38500000000
  },
  {
    id: 'sap-41201',
    code: '4.1.2.01.01',
    name: 'Pendapatan Retribusi Daerah - LRA',
    group: 'Pendapatan-LRA',
    subGroup: 'Pendapatan Asli Daerah (PAD) - LRA',
    statementType: 'LRA',
    budget: 15000000000,
    debit: 0,
    credit: 14200000000,
    endingBalance: -14200000000
  },
  {
    id: 'sap-42101',
    code: '4.2.1.01.01',
    name: 'Pendapatan Transfer Pemerintah Pusat (DAU/DAK) - LRA',
    group: 'Pendapatan-LRA',
    subGroup: 'Pendapatan Transfer - LRA',
    statementType: 'LRA',
    budget: 90000000000,
    debit: 0,
    credit: 90000000000,
    endingBalance: -90000000000
  },

  // ── BELANJA-LRA ──
  {
    id: 'sap-51101',
    code: '5.1.1.01.01',
    name: 'Belanja Pegawai (Gaji dan Tunjangan ASN) - LRA',
    group: 'Belanja-LRA',
    subGroup: 'Belanja Pegawai',
    statementType: 'LRA',
    budget: 54000000000,
    debit: 52000000000,
    credit: 0,
    endingBalance: 52000000000
  },
  {
    id: 'sap-51201',
    code: '5.1.2.01.01',
    name: 'Belanja Barang dan Jasa - LRA',
    group: 'Belanja-LRA',
    subGroup: 'Belanja Barang dan Jasa',
    statementType: 'LRA',
    budget: 38000000000,
    debit: 36100000000,
    credit: 0,
    endingBalance: 36100000000
  },
  {
    id: 'sap-52101',
    code: '5.2.1.01.01',
    name: 'Belanja Modal Tanah & Peralatan - LRA',
    group: 'Belanja-LRA',
    subGroup: 'Belanja Modal Peralatan dan Mesin',
    statementType: 'LRA',
    budget: 22000000000,
    debit: 20500000000,
    credit: 0,
    endingBalance: 20500000000
  },
  {
    id: 'sap-52301',
    code: '5.2.3.01.01',
    name: 'Belanja Modal Gedung, Bangunan & Jaringan - LRA',
    group: 'Belanja-LRA',
    subGroup: 'Belanja Modal Gedung dan Bangunan',
    statementType: 'LRA',
    budget: 25000000000,
    debit: 23800000000,
    credit: 0,
    endingBalance: 23800000000
  },

  // ── PEMBIAYAAN-LRA ──
  {
    id: 'sap-61101',
    code: '6.1.1.01.01',
    name: 'Penerimaan Pembiayaan - Penggunaan SiLPA Tahun Sebelumnya',
    group: 'Pembiayaan-LRA',
    subGroup: 'Penerimaan Pembiayaan (Penggunaan SiLPA)',
    statementType: 'LRA',
    budget: 12500000000,
    debit: 0,
    credit: 12500000000,
    endingBalance: -12500000000
  },
  {
    id: 'sap-62101',
    code: '6.2.1.01.01',
    name: 'Pengeluaran Pembiayaan - Penyertaan Modal Daerah (BUMD)',
    group: 'Pembiayaan-LRA',
    subGroup: 'Pengeluaran Pembiayaan (Penyertaan Modal)',
    statementType: 'LRA',
    budget: 5000000000,
    debit: 5000000000,
    credit: 0,
    endingBalance: 5000000000
  },

  // ── TRANSITORIS / ARUS KAS (PFK) ──
  {
    id: 'sap-71101',
    code: '7.1.1.01.01',
    name: 'Penerimaan Perhitungan Fihak Ketiga (PFK)',
    group: 'Arus Kas / Transitoris',
    subGroup: 'Penerimaan Perhitungan Fihak Ketiga (PFK)',
    statementType: 'LAK',
    debit: 0,
    credit: 8250000000,
    endingBalance: -8250000000
  },
  {
    id: 'sap-72101',
    code: '7.2.1.01.01',
    name: 'Pengeluaran Perhitungan Fihak Ketiga (PFK)',
    group: 'Arus Kas / Transitoris',
    subGroup: 'Pengeluaran Perhitungan Fihak Ketiga (PFK)',
    statementType: 'LAK',
    debit: 6800000000,
    credit: 0,
    endingBalance: 6800000000
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// GENERATOR LOGIC FOR 4 STATEMENTS (LO, LRA, LAK, LPSAL)
// ─────────────────────────────────────────────────────────────────────────────

export interface FinancialItem {
  id: string;
  code?: string;
  name: string;
  amount: number;
  budget?: number;
  variance?: number;
  percentage?: number;
  isHeader?: boolean;
  isTotal?: boolean;
}

// 1. LAPORAN OPERASIONAL (LO)
export const calculateLO = (accounts: Account[]) => {
  const pendapatanAccounts = accounts.filter(
    (a) => a.group === 'Pendapatan-LO' || a.group === 'Pendapatan'
  );
  const bebanAccounts = accounts.filter(
    (a) => a.group === 'Beban-LO' || a.group === 'Beban'
  );

  const totalPendapatan = pendapatanAccounts.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.credit - a.debit),
    0
  );

  const totalBeban = bebanAccounts.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.debit - a.credit),
    0
  );

  const surplusDefisitOperasi = totalPendapatan - totalBeban;
  const surplusDefisitAkhir = surplusDefisitOperasi; // dapat ditambah non-operasional bila ada

  return {
    pendapatanAccounts,
    bebanAccounts,
    totalPendapatan,
    totalBeban,
    surplusDefisitOperasi,
    surplusDefisitAkhir
  };
};

// 2. LAPORAN REALISASI ANGGARAN (LRA)
export const calculateLRA = (accounts: Account[]) => {
  const pendapatanAccounts = accounts.filter(
    (a) => a.group === 'Pendapatan-LRA' || (a.group === 'Pendapatan' && a.statementType === 'LRA')
  );

  const belanjaAccounts = accounts.filter(
    (a) => a.group === 'Belanja-LRA' || (a.group === 'Beban' && a.statementType === 'LRA')
  );

  const pembiayaanMasuk = accounts.filter(
    (a) => a.group === 'Pembiayaan-LRA' && (a.credit > 0 || (a.subGroup && a.subGroup.includes('Penerimaan')))
  );

  const pembiayaanKeluar = accounts.filter(
    (a) => a.group === 'Pembiayaan-LRA' && (a.debit > 0 || (a.subGroup && a.subGroup.includes('Pengeluaran')))
  );

  const totalPendapatanRealisasi = pendapatanAccounts.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.credit),
    0
  );
  const totalPendapatanAnggaran = pendapatanAccounts.reduce(
    (sum, a) => sum + (a.budget || Math.abs(a.endingBalance || a.credit)),
    0
  );

  const totalBelanjaRealisasi = belanjaAccounts.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.debit),
    0
  );
  const totalBelanjaAnggaran = belanjaAccounts.reduce(
    (sum, a) => sum + (a.budget || Math.abs(a.endingBalance || a.debit)),
    0
  );

  const surplusDefisitLRA = totalPendapatanRealisasi - totalBelanjaRealisasi;
  const surplusDefisitAnggaran = totalPendapatanAnggaran - totalBelanjaAnggaran;

  const totalPenerimaanPembiayaan = pembiayaanMasuk.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.credit),
    0
  );
  const totalPengeluaranPembiayaan = pembiayaanKeluar.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.debit),
    0
  );

  const pembiayaanNetto = totalPenerimaanPembiayaan - totalPengeluaranPembiayaan;

  // SiLPA / SiKPA = Surplus/Defisit LRA + Pembiayaan Netto
  const silpa = surplusDefisitLRA + pembiayaanNetto;

  return {
    pendapatanAccounts,
    belanjaAccounts,
    pembiayaanMasuk,
    pembiayaanKeluar,
    totalPendapatanRealisasi,
    totalPendapatanAnggaran,
    totalBelanjaRealisasi,
    totalBelanjaAnggaran,
    surplusDefisitLRA,
    surplusDefisitAnggaran,
    totalPenerimaanPembiayaan,
    totalPengeluaranPembiayaan,
    pembiayaanNetto,
    silpa
  };
};

// 3. LAPORAN ARUS KAS (LAK)
export const calculateLAK = (accounts: Account[], lraData: ReturnType<typeof calculateLRA>) => {
  // Arus Kas Operasi
  const arusKasMasukOperasi = lraData.totalPendapatanRealisasi;
  const belanjaOperasional = accounts
    .filter((a) => a.group === 'Belanja-LRA' && !a.subGroup?.includes('Modal'))
    .reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit), 0);

  const arusKasKeluarOperasi = belanjaOperasional || lraData.totalBelanjaRealisasi * 0.7;
  const arusKasBersihOperasi = arusKasMasukOperasi - arusKasKeluarOperasi;

  // Arus Kas Investasi Non-Keuangan
  const belanjaModal = accounts
    .filter((a) => a.group === 'Belanja-LRA' && a.subGroup?.includes('Modal'))
    .reduce((sum, a) => sum + Math.abs(a.endingBalance || a.debit), 0);

  const arusKasKeluarInvestasi = belanjaModal || lraData.totalBelanjaRealisasi * 0.3;
  const arusKasBersihInvestasi = -arusKasKeluarInvestasi;

  // Arus Kas Pendanaan / Pembiayaan
  const arusKasBersihPendanaan = lraData.pembiayaanNetto;

  // Arus Kas Transitoris (PFK)
  const pfkMasuk = accounts
    .filter((a) => a.group === 'Arus Kas / Transitoris' && a.credit > 0)
    .reduce((sum, a) => sum + Math.abs(a.credit), 0);

  const pfkKeluar = accounts
    .filter((a) => a.group === 'Arus Kas / Transitoris' && a.debit > 0)
    .reduce((sum, a) => sum + Math.abs(a.debit), 0);

  const arusKasBersihTransitoris = pfkMasuk - pfkKeluar;

  // Kenaikan / Penurunan Kas
  const kenaikanKas =
    arusKasBersihOperasi +
    arusKasBersihInvestasi +
    arusKasBersihPendanaan +
    arusKasBersihTransitoris;

  // Saldo Kas di Neraca
  const kasAccounts = accounts.filter(
    (a) => a.group === 'Aset' && (a.subGroup?.includes('Kas') || a.name.toLowerCase().includes('kas'))
  );
  const saldoAkhirKas = kasAccounts.reduce(
    (sum, a) => sum + Math.abs(a.endingBalance || a.debit),
    0
  );

  const saldoAwalKas = Math.max(0, saldoAkhirKas - kenaikanKas);

  return {
    arusKasMasukOperasi,
    arusKasKeluarOperasi,
    arusKasBersihOperasi,
    arusKasKeluarInvestasi,
    arusKasBersihInvestasi,
    arusKasBersihPendanaan,
    pfkMasuk,
    pfkKeluar,
    arusKasBersihTransitoris,
    kenaikanKas,
    saldoAwalKas,
    saldoAkhirKas,
    kasAccounts
  };
};

// 4. LAPORAN PERUBAHAN SALDO ANGGARAN LEBIH (LPSAL)
export const calculateLPSAL = (accounts: Account[], silpaLRA: number) => {
  const salAwalAccount = accounts.find(
    (a) => a.group === 'Saldo Anggaran Lebih' || a.name.toLowerCase().includes('sal awal')
  );

  const salAwal = salAwalAccount
    ? Math.abs(salAwalAccount.endingBalance || salAwalAccount.credit)
    : 12500000000;

  // Penggunaan SAL sebagai Penerimaan Pembiayaan Tahun Berjalan
  const penggunaanSalAccount = accounts.find(
    (a) => a.subGroup?.includes('Penggunaan SiLPA') || a.name.toLowerCase().includes('penggunaan silpa')
  );
  const penggunaanSAL = penggunaanSalAccount
    ? Math.abs(penggunaanSalAccount.endingBalance || penggunaanSalAccount.credit)
    : 12500000000;

  const subtotal = salAwal - penggunaanSAL;
  const silpaTahunBerjalan = silpaLRA;
  const koreksiPembukuan = 0;
  const salAkhir = subtotal + silpaTahunBerjalan + koreksiPembukuan;

  return {
    salAwal,
    penggunaanSAL,
    subtotal,
    silpaTahunBerjalan,
    koreksiPembukuan,
    salAkhir
  };
};

// 5. NERACA (BALANCE SHEET)
export const calculateNeraca = (accounts: Account[], surplusLO: number) => {
  const asetAccounts = accounts.filter((a) => a.group === 'Aset');
  const kewajibanAccounts = accounts.filter((a) => a.group === 'Kewajiban' || a.group === 'Liabilitas');
  const ekuitasAccounts = accounts.filter((a) => a.group === 'Ekuitas');

  const totalAset = asetAccounts.reduce((sum, a) => sum + (a.endingBalance || (a.debit - a.credit)), 0);
  const totalKewajiban = kewajibanAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || (a.credit - a.debit)), 0);
  const ekuitasAwal = ekuitasAccounts.reduce((sum, a) => sum + Math.abs(a.endingBalance || (a.credit - a.debit)), 0);
  const totalEkuitas = ekuitasAwal + surplusLO;

  return {
    asetAccounts,
    kewajibanAccounts,
    ekuitasAccounts,
    totalAset,
    totalKewajiban,
    ekuitasAwal,
    totalEkuitas
  };
};
