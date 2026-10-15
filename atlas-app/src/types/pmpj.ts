export interface PmpjClientRegister {
  id: string; // Internal UUID
  clientId: string; // ID Klien (e.g. KLN-001)
  engagementId: string; // ID Perikatan (e.g. ENG-2026-001)
  startDate: string; // Tanggal Mulai
  clientName: string; // Nama Pengguna Jasa
  userType: 'Perorangan' | 'Korporasi' | 'Badan Hukum Lain'; // Jenis Pengguna
  serviceType: string; // Jenis Jasa (e.g. Audit Umum, Reviu, AUP, dll.)
  isForUserInterest: boolean; // Untuk/Kepentingan Pengguna Jasa?
  
  // Kolom Biru (Dihitung Otomatis)
  pmkScope: 'Dalam Ruang Lingkup' | 'Luar Ruang Lingkup'; // Ruang Lingkup PMK Pasal 2
  
  // Pemicu
  triggerBusinessRelation: boolean; // Pemicu Hubungan Usaha
  triggerLargeTx: boolean; // Pemicu Transaksi >= Rp100 Juta
  triggerSuspiciousTx: boolean; // Pemicu Transaksi Mencurigakan
  triggerDoubtfulInfo: boolean; // Pemicu Ragu Informasi
  
  // Kolom Biru (Dihitung Otomatis)
  isPmpjActive: boolean; // PMPJ Aktif
  cddStatus: 'Lengkap' | 'Belum Lengkap' | 'Sederhana' | 'Ditingkatkan (EDD)'; // Status CDD
  
  // Data Legal & Identitas
  legalIdentity: string; // Identitas / Data Legal (NIK/NPWP/NIB/Akta)
  birthOrEstablishment: string; // Tempat-Tanggal Lahir / Tanggal Pendirian
  addressContact: string; // Alamat dan Kontak
  businessSector: string; // Pekerjaan / Bidang Usaha
  fundSource: string; // Sumber Dana
  txPurpose: string; // Tujuan Transaksi
  representativeDoc: string; // Wakil dan Dokumen Wewenang
  boInfo: string; // Informasi BO dan Dasar Kendali
  
  // Verifikasi & Risiko
  docStatus: 'Lengkap' | 'Kurang' | 'Dalam Proses'; // Status Dokumen Identitas/Pendukung
  isDirectMeeting: boolean; // Pertemuan Langsung Awal (Tatap Muka vs Non-Tatap Muka)
  verificationStatus: 'Terverifikasi' | 'Belum Terverifikasi' | 'Verifikasi Ditingkatkan'; // Status Verifikasi
  internalRisk: 'Rendah' | 'Sedang' | 'Tinggi'; // Risiko Internal
  
  // Keputusan & Retensi
  acceptanceDecision: 'Diterima' | 'Ditolak' | 'Diterima dengan Syarat' | 'Hubungan Diakhiri'; // Keputusan Penerimaan
  followUpMitigation: string; // Tindak Lanjut / Mitigasi
  relationEndDate: string; // Tanggal Akhir Hubungan
  retentionUntil: string; // Simpan Dokumen Sampai (Otomatis: Tanggal Akhir + 5 tahun)
  reviewer: string; // Reviewer (e.g. Fridolinus Peno)
  reviewDate: string; // Tanggal Review
  notes: string; // Catatan
}

export interface PmpjTransactionMonitoring {
  id: string; // ID Internal
  monitoringId: string; // ID Pemantauan (e.g. PMT-001)
  clientId: string; // ID Klien
  clientName: string; // Nama Klien
  date: string; // Tanggal
  amount: number; // Nilai (Rp Ekuivalen)
  paymentMethod: 'Tunai' | 'Transfer Bank' | 'Kliring' | 'Cek / Bilyet Giro' | 'Aset Kripto / Lainnya'; // Cara Pembayaran
  counterparty: string; // Pihak Pembayar / Penerima
  purpose: string; // Tujuan / Keterangan
  matchesCddProfile: boolean; // Sesuai Profil/CDD
  isSuspicious: boolean; // Mencurigakan? (TKM)
  inPmpjScope: boolean; // Dalam Ruang Lingkup PMPJ?
  
  // Kolom Biru (Otomatis)
  alertMenular: 'ALERT TKM' | 'PERIKSA EDD' | 'NORMAL'; // Alert Menular
  
  followUpStatus: 'Normal' | 'Klarifikasi Klien' | 'Diteruskan ke Partner' | 'Disiapkan LTKM' | 'Selesai'; // Status Tindak Lanjut
  reviewer: string; // Reviewer
  reviewerDecision: 'Diterima' | 'Minta Bukti Tambahan' | 'Tolak Transaksi' | 'Rekomendasi Lapor PPATK'; // Keputusan Reviewer
  isRelationTerminated: boolean; // Hubungan Diakhiri?
  ppatkReportStatus: 'Tidak Perlu' | 'Draft GRIPS' | 'Dilaporkan (LTKM)' | 'Selesai'; // Status Pelaporan PPATK
  ppatkRefNumber: string; // Referensi Pelaporan Terkait
  reviewDate: string; // Tanggal Review
  notes: string; // Catatan
}

export interface PmpjSummaryMetrics {
  totalRegisteredUsers: number;
  activePmpjCount: number;
  incompleteCddCount: number;
  highRiskCount: number;
  openAlertsCount: number;
}
