import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

export interface AccountingStandard {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'Umum' | 'Entitas Privat' | 'Syariah' | 'Pemerintahan' | 'Kustom' | string;
  effectiveYear?: string;
  isActive: boolean;
  isSystemDefault: boolean;
  notes?: string;
  // Metadata Penyelarasan dengan Aplikasi PELITA Kemenkeu RI (Pusat Pembinaan Profesi Keuangan)
  pelitaRef?: string;
  pelitaCategory?: string;
  isPelitaCompliant?: boolean;
  pelitaNote?: string;
  updatedAt?: string;
}

export const DEFAULT_ACCOUNTING_STANDARDS: AccountingStandard[] = [
  {
    id: 'sak-ep',
    code: 'SAK_EP',
    name: 'SAK Entitas Privat (SAK EP)',
    description: 'Standar Akuntansi Keuangan untuk Entitas Privat, resmi wajib efektif per 1 Januari 2025 menggantikan SAK ETAP sebagai rujukan pelaporan entitas non-publik di Aplikasi PELITA PPPK Kemenkeu.',
    category: 'Entitas Privat',
    effectiveYear: '1 Jan 2025',
    isActive: true,
    isSystemDefault: true,
    notes: 'Standar Baru Wajib Efektif 1 Jan 2025 (Pengganti SAK ETAP pada pelaporan tahunan KAP ke PPPK Kemenkeu)',
    pelitaRef: 'PELITA-SAK-EP',
    pelitaCategory: 'Entitas Privat / Non Go-Public',
    isPelitaCompliant: true,
    pelitaNote: 'Rujukan resmi Aplikasi PELITA Kemenkeu untuk entitas privat / non-emiten tahun buku 2025 ke atas.'
  },
  {
    id: 'sak-umum',
    code: 'SAK_UMUM',
    name: 'SAK Indonesia (Konvergensi IFRS / PSAK)',
    description: 'Standar Akuntansi Keuangan untuk entitas dengan akuntabilitas publik signifikan atau emiten terdaftar di OJK/Bursa Efek Indonesia.',
    category: 'Umum',
    effectiveYear: 'Berlaku Efektif',
    isActive: true,
    isSystemDefault: true,
    notes: 'Standar berbasis IFRS lengkap untuk emiten & perusahaan terbuka (Wajib untuk pelaporan Go-Public di PELITA)',
    pelitaRef: 'PELITA-SAK-UMUM',
    pelitaCategory: 'Emiten / Perusahaan Terbuka (Go-Public)',
    isPelitaCompliant: true,
    pelitaNote: 'Kategori Pelita: Emiten / Perusahaan Publik / Lembaga Keuangan Signifikan.'
  },
  {
    id: 'sak-etap',
    code: 'SAK_ETAP',
    name: 'SAK ETAP (Masa Transisi / Periode s.d. 2024)',
    description: 'Standar Akuntansi Keuangan Entitas Tanpa Akuntabilitas Publik (berlaku s.d. buku 2024 atau audit perbandingan masa lalu).',
    category: 'Entitas Privat',
    effectiveYear: 's.d. Buku 2024',
    isActive: true,
    isSystemDefault: true,
    notes: 'Diakui di Aplikasi PELITA untuk perikatan audit tahun buku sebelum 2025 atau data komparatif',
    pelitaRef: 'PELITA-SAK-ETAP',
    pelitaCategory: 'Entitas Non Go-Public (Historis)',
    isPelitaCompliant: true,
    pelitaNote: 'Diakomodasi di Aplikasi PELITA untuk audit tahun buku historis sebelum konversi penuh SAK EP.'
  },
  {
    id: 'sak-emkm',
    code: 'SAK_EMKM',
    name: 'SAK EMKM (Entitas Mikro, Kecil & Menengah)',
    description: 'Standar akuntansi sederhana bagi entitas mikro, kecil, dan menengah sesuai kriteria perundang-undangan.',
    category: 'Entitas Privat',
    effectiveYear: '1 Jan 2018',
    isActive: true,
    isSystemDefault: true,
    notes: 'Standar Akuntansi Keuangan Sederhana untuk entitas mikro/kecil pada pelaporan PELITA Kemenkeu',
    pelitaRef: 'PELITA-SAK-EMKM',
    pelitaCategory: 'Usaha Mikro, Kecil & Menengah (UMKM)',
    isPelitaCompliant: true,
    pelitaNote: 'Format pelaporan sederhana: Posisi Keuangan, Laba Rugi, CALK.'
  },
  {
    id: 'psak-syariah',
    code: 'PSAK_SYARIAH',
    name: 'PSAK Syariah / Standar Akuntansi Syariah (SAS)',
    description: 'Kerangka standar akuntansi untuk entitas yang melakukan transaksi berbasis prinsip syariah.',
    category: 'Syariah',
    effectiveYear: 'Berlaku Efektif',
    isActive: true,
    isSystemDefault: true,
    notes: 'Diterbitkan DSAS IAI, wajib untuk klien perbankan & entitas transaksi syariah pada PELITA Kemenkeu',
    pelitaRef: 'PELITA-SAK-SYARIAH',
    pelitaCategory: 'Lembaga & Transaksi Berbasis Syariah',
    isPelitaCompliant: true,
    pelitaNote: 'Diterima resmi pada menu laporan audit lembaga dan transaksi syariah di Aplikasi PELITA Kemenkeu.'
  },
  {
    id: 'sak-internasional',
    code: 'SAK_INTERNASIONAL',
    name: 'SAK Internasional / Standar Asing (IFRS / US GAAP)',
    description: 'Kerangka standar akuntansi internasional (IFRS murni atau US GAAP) yang digunakan oleh perusahaan multinasional / PMA di Indonesia.',
    category: 'Umum',
    effectiveYear: 'Berlaku Efektif',
    isActive: true,
    isSystemDefault: true,
    notes: 'Diakui di Aplikasi PELITA untuk pelaporan entitas PMA atau klien dengan standar akuntansi luar negeri',
    pelitaRef: 'PELITA-SAK-LAIN',
    pelitaCategory: 'PMA / Multinasional / Non-Domestik',
    isPelitaCompliant: true,
    pelitaNote: 'Klasifikasi pelaporan PELITA untuk penugasan dengan kerangka akuntansi luar negeri / internasional.'
  },
  {
    id: 'sap-pemerintah',
    code: 'SAP',
    name: 'SAP (Standar Akuntansi Pemerintahan - PP 71/2010)',
    description: 'Standar akuntansi berbasis akrual untuk entitas pemerintahan pusat dan daerah (PP No. 71 Tahun 2010).',
    category: 'Pemerintahan',
    effectiveYear: 'PP 71/2010',
    isActive: true,
    isSystemDefault: true,
    notes: 'Sesuai FAQ resmi PPPK Kemenkeu, diakomodir di bawah pelaporan standar khusus/pemerintahan',
    pelitaRef: 'PELITA-SAP',
    pelitaCategory: 'Instansi Pemerintah / BLU / BUMD',
    isPelitaCompliant: true,
    pelitaNote: 'Berdasarkan pedoman FAQ PPPK Kemenkeu, audit entitas SAP diinput dengan keterangan khusus kerangka pelaporan publik.'
  }
];

export interface AccountingStandardState {
  standards: AccountingStandard[];
  addStandard: (item: Omit<AccountingStandard, 'id' | 'isSystemDefault' | 'updatedAt'>) => { success: boolean; message: string };
  updateStandard: (id: string, updates: Partial<AccountingStandard>) => { success: boolean; message: string };
  toggleStandardActive: (id: string) => void;
  deleteStandard: (id: string) => { success: boolean; message: string };
  resetToDefault: () => void;
  getActiveStandards: () => AccountingStandard[];
  getStandardName: (code: string) => string;
  getPelitaInfo: (code: string) => { ref: string; category: string; note: string } | null;
  syncWithCloud: () => Promise<void>;
}

export const useAccountingStandardStore = create<AccountingStandardState>()(
  persist(
    (set, get) => ({
      standards: DEFAULT_ACCOUNTING_STANDARDS,

      addStandard: (item) => {
        const current = get().standards;
        const normalizedCode = item.code.trim().toUpperCase().replace(/[\s-]+/g, '_');

        if (!normalizedCode) {
          return { success: false, message: 'Kode standar akuntansi wajib diisi!' };
        }

        if (!item.name.trim()) {
          return { success: false, message: 'Nama standar akuntansi wajib diisi!' };
        }

        const isDuplicate = current.some(
          (s) => s.code.toUpperCase() === normalizedCode
        );

        if (isDuplicate) {
          return { success: false, message: `Kode standar '${normalizedCode}' sudah ada!` };
        }

        const newStandard: AccountingStandard = {
          id: `custom-std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          code: normalizedCode,
          name: item.name.trim(),
          description: item.description?.trim() || '',
          category: item.category || 'Kustom',
          effectiveYear: item.effectiveYear?.trim() || 'Berlaku Efektif',
          isActive: item.isActive ?? true,
          isSystemDefault: false,
          notes: item.notes?.trim() || 'Standar Akuntansi Kustom KAP',
          pelitaRef: item.pelitaRef || 'PELITA-KUSTOM',
          pelitaCategory: item.pelitaCategory || 'Standar Khusus / Lainnya',
          isPelitaCompliant: item.isPelitaCompliant ?? true,
          pelitaNote: item.pelitaNote || 'Disesuaikan dengan pelaporan Aplikasi PELITA PPPK Kemenkeu.',
          updatedAt: new Date().toISOString()
        };

        set({ standards: [newStandard, ...current] });
        get().syncWithCloud().catch(() => {});

        return { success: true, message: `Standar ${newStandard.name} berhasil ditambahkan!` };
      },

      updateStandard: (id, updates) => {
        const current = get().standards;
        const target = current.find((s) => s.id === id);

        if (!target) {
          return { success: false, message: 'Standar akuntansi tidak ditemukan!' };
        }

        if (updates.code) {
          const normalizedCode = updates.code.trim().toUpperCase().replace(/[\s-]+/g, '_');
          const isConflict = current.some(
            (s) => s.id !== id && s.code.toUpperCase() === normalizedCode
          );
          if (isConflict) {
            return { success: false, message: `Kode standar '${normalizedCode}' sudah digunakan!` };
          }
          updates.code = normalizedCode;
        }

        const updatedList = current.map((std) => {
          if (std.id === id) {
            return {
              ...std,
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          return std;
        });

        set({ standards: updatedList });
        get().syncWithCloud().catch(() => {});

        return { success: true, message: 'Standar akuntansi berhasil diperbarui!' };
      },

      toggleStandardActive: (id) => {
        const current = get().standards;
        const updatedList = current.map((std) => {
          if (std.id === id) {
            return {
              ...std,
              isActive: !std.isActive,
              updatedAt: new Date().toISOString()
            };
          }
          return std;
        });

        set({ standards: updatedList });
        get().syncWithCloud().catch(() => {});
      },

      deleteStandard: (id) => {
        const current = get().standards;
        const target = current.find((s) => s.id === id);

        if (!target) {
          return { success: false, message: 'Standar tidak ditemukan!' };
        }

        if (target.isSystemDefault) {
          return {
            success: false,
            message: 'Standar bawaan SPAP / Aplikasi PELITA Kemenkeu tidak dapat dihapus. Anda dapat menonaktifkannya jika tidak digunakan.'
          };
        }

        const filtered = current.filter((s) => s.id !== id);
        set({ standards: filtered });
        get().syncWithCloud().catch(() => {});

        return { success: true, message: `Standar ${target.name} berhasil dihapus.` };
      },

      resetToDefault: () => {
        set({ standards: DEFAULT_ACCOUNTING_STANDARDS });
        get().syncWithCloud().catch(() => {});
      },

      getActiveStandards: () => {
        return get().standards.filter((s) => s.isActive);
      },

      getStandardName: (code: string) => {
        if (!code) return '-';
        const found = get().standards.find(
          (s) => s.code.toUpperCase() === code.toUpperCase()
        );
        return found ? found.name : code;
      },

      getPelitaInfo: (code: string) => {
        if (!code) return null;
        const found = get().standards.find(
          (s) => s.code.toUpperCase() === code.toUpperCase()
        );
        if (!found) return null;
        return {
          ref: found.pelitaRef || 'PELITA-SAK',
          category: found.pelitaCategory || 'Standar Pelaporan PELITA',
          note: found.pelitaNote || found.notes || '-'
        };
      },

      syncWithCloud: async () => {
        try {
          const payload = get().standards;
          await supabase.from('system_settings').upsert({
            id: 'accounting_standards_master',
            data: payload,
            updated_at: new Date().toISOString()
          });
        } catch {
          // Fallback gracefully if Supabase table doesn't have custom table
        }
      }
    }),
    {
      name: 'atlas_master_accounting_standards',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState || !Array.isArray(persistedState.standards)) {
          return { standards: DEFAULT_ACCOUNTING_STANDARDS };
        }

        const defaultMap = new Map(
          DEFAULT_ACCOUNTING_STANDARDS.map((d) => [d.code.toUpperCase(), d])
        );

        const merged = persistedState.standards.map((s: any) => {
          const def = defaultMap.get(s.code.toUpperCase());
          if (def) {
            return {
              ...def,
              ...s,
              pelitaRef: def.pelitaRef,
              pelitaCategory: def.pelitaCategory,
              isPelitaCompliant: def.isPelitaCompliant,
              pelitaNote: def.pelitaNote,
              name: s.isSystemDefault ? def.name : s.name,
              effectiveYear: s.isSystemDefault ? def.effectiveYear : s.effectiveYear,
              description: s.isSystemDefault ? def.description : s.description
            };
          }
          return s;
        });

        const existingCodes = new Set(merged.map((s: any) => s.code.toUpperCase()));
        for (const def of DEFAULT_ACCOUNTING_STANDARDS) {
          if (!existingCodes.has(def.code.toUpperCase())) {
            merged.push(def);
          }
        }

        return {
          ...persistedState,
          standards: merged
        };
      }
    }
  )
);
