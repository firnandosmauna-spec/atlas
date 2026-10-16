export type SystemRoleName = 
  | 'Admin'
  | 'Partner/Akuntan Publik'
  | 'Manager'
  | 'Supervisor'
  | 'Ketua Tim'
  | 'Anggota Tim 1'
  | 'Anggota Tim 2'
  | 'Anggota Tim dst'
  | 'Tenaga Pendukung';

export interface RoleDefinition {
  id: string;
  number: number;
  name: SystemRoleName;
  description: string;
  shortDesc: string;
  badgeClass: string;
  level: number;
}

export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    number: 1,
    name: 'Admin',
    description: 'Mengelola akses akun, master role, hak akses pengguna, dan konfigurasi master sistem.',
    shortDesc: 'Master administrasi sistem & akun pengguna',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    level: 1
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    number: 2,
    name: 'Partner/Akuntan Publik',
    description: 'Penanggung jawab perikatan (Signing Partner), memegang izin AP (PPPK), reviu akhir KKP, dan menandatangani Laporan Auditor Independen (LAI).',
    shortDesc: 'Penanggung jawab perikatan & penandatangan LAI',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    level: 2
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    number: 3,
    name: 'Manager',
    description: 'Mengelola manajemen engagement, perancangan strategi audit, pengawasan alokasi waktu dan tim, serta reviu menyeluruh KKP.',
    shortDesc: 'Manajemen perikatan & reviu strategi audit',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    level: 3
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    number: 4,
    name: 'Supervisor',
    description: 'Supervisi teknis lapangan, mengarahkan metodologi pengujian, memonitor kepatuhan prosedur SA/SPM, dan memvalidasi temuan audit.',
    shortDesc: 'Supervisi teknis metodologi & kendali mutu lapangan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    level: 4
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    number: 5,
    name: 'Ketua Tim',
    description: 'Memimpin pelaksanaan audit lapangan sehari-hari, mendistribusikan prosedur KKP kepada anggota tim, dan melakukan reviu awal.',
    shortDesc: 'Pemimpin tim audit lapangan & reviu awal KKP',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    level: 5
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    number: 6,
    name: 'Anggota Tim 1',
    description: 'Melaksanakan pengujian substantif akun-akun berisiko tinggi/signifikan, prosedur analitis, dan penyusunan kertas kerja utama.',
    shortDesc: 'Pengujian substantif akun berisiko signifikan',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    level: 6
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    number: 7,
    name: 'Anggota Tim 2',
    description: 'Melaksanakan pengujian pengendalian (Test of Controls/TOC), verifikasi transaksi rutin, dan dokumentasi kertas kerja pendukung.',
    shortDesc: 'Pengujian pengendalian & verifikasi transaksi',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    level: 7
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    number: 8,
    name: 'Anggota Tim dst',
    description: 'Melaksanakan pengujian rincian saldo (TOD), konfirmasi pihak ketiga, stock opname fisik, dan sampling bukti transaksi audit.',
    shortDesc: 'Pengujian rincian saldo & konfirmasi pihak ketiga',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    level: 8
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    number: 9,
    name: 'Tenaga Pendukung',
    description: 'Mendukung input data dasar klien, tabulasi voucher/dokumen fisik, rekonsiliasi data mentah, dan administrasi kearsipan audit.',
    shortDesc: 'Entri data pendukung & administrasi kearsipan',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    level: 9
  }
];
