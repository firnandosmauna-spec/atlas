// Indonesian National Holidays & Joint Leave (SKB 3 Menteri)
// Standar Hari Libur Nasional & Cuti Bersama untuk Patokan Perencanaan Tim Audit KAP

export type HolidayType = 'national' | 'joint_leave' | 'kap_custom';

export interface HolidayItem {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
  description?: string;
  isCustom?: boolean;
}

export const OFFICIAL_HOLIDAYS: HolidayItem[] = [
  // ─── TAHUN 2024 ──────────────────────────────────────────────
  { id: '2024-01-01', date: '2024-01-01', name: 'Tahun Baru 2024 Masehi', type: 'national', description: 'Libur Nasional Tahun Baru Masehi' },
  { id: '2024-02-08', date: '2024-02-08', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'national' },
  { id: '2024-02-09', date: '2024-02-09', name: 'Cuti Bersama Tahun Baru Imlek 2575', type: 'joint_leave' },
  { id: '2024-02-10', date: '2024-02-10', name: 'Tahun Baru Imlek 2575 Kongzili', type: 'national' },
  { id: '2024-03-11', date: '2024-03-11', name: 'Hari Suci Nyepi Tahun Baru Saka 1946', type: 'national' },
  { id: '2024-03-12', date: '2024-03-12', name: 'Cuti Bersama Hari Suci Nyepi', type: 'joint_leave' },
  { id: '2024-03-29', date: '2024-03-29', name: 'Wafat Yesus Kristus', type: 'national' },
  { id: '2024-03-31', date: '2024-03-31', name: 'Hari Paskah', type: 'national' },
  { id: '2024-04-08', date: '2024-04-08', name: 'Cuti Bersama Hari Raya Idul Fitri 1445 H', type: 'joint_leave' },
  { id: '2024-04-09', date: '2024-04-09', name: 'Cuti Bersama Hari Raya Idul Fitri 1445 H', type: 'joint_leave' },
  { id: '2024-04-10', date: '2024-04-10', name: 'Hari Raya Idul Fitri 1445 H (Hari ke-1)', type: 'national' },
  { id: '2024-04-11', date: '2024-04-11', name: 'Hari Raya Idul Fitri 1445 H (Hari ke-2)', type: 'national' },
  { id: '2024-04-12', date: '2024-04-12', name: 'Cuti Bersama Hari Raya Idul Fitri 1445 H', type: 'joint_leave' },
  { id: '2024-04-15', date: '2024-04-15', name: 'Cuti Bersama Hari Raya Idul Fitri 1445 H', type: 'joint_leave' },
  { id: '2024-05-01', date: '2024-05-01', name: 'Hari Buruh Internasional', type: 'national' },
  { id: '2024-05-09', date: '2024-05-09', name: 'Kenaikan Yesus Kristus', type: 'national' },
  { id: '2024-05-10', date: '2024-05-10', name: 'Cuti Bersama Kenaikan Yesus Kristus', type: 'joint_leave' },
  { id: '2024-05-23', date: '2024-05-23', name: 'Hari Raya Waisak 2568 BE', type: 'national' },
  { id: '2024-05-24', date: '2024-05-24', name: 'Cuti Bersama Hari Raya Waisak', type: 'joint_leave' },
  { id: '2024-06-01', date: '2024-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
  { id: '2024-06-17', date: '2024-06-17', name: 'Hari Raya Idul Adha 1445 H', type: 'national' },
  { id: '2024-06-18', date: '2024-06-18', name: 'Cuti Bersama Hari Raya Idul Adha 1445 H', type: 'joint_leave' },
  { id: '2024-07-07', date: '2024-07-07', name: 'Tahun Baru Islam 1446 H', type: 'national' },
  { id: '2024-08-17', date: '2024-08-17', name: 'Proklamasi Kemerdekaan RI ke-79', type: 'national' },
  { id: '2024-09-16', date: '2024-09-16', name: 'Maulid Nabi Muhammad SAW', type: 'national' },
  { id: '2024-12-25', date: '2024-12-25', name: 'Kelahiran Yesus Kristus (Hari Raya Natal)', type: 'national' },
  { id: '2024-12-26', date: '2024-12-26', name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },

  // ─── TAHUN 2025 (SKB 3 MENTERI RESMI) ────────────────────────
  { id: '2025-01-01', date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', type: 'national' },
  { id: '2025-01-27', date: '2025-01-27', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'national' },
  { id: '2025-01-28', date: '2025-01-28', name: 'Cuti Bersama Tahun Baru Imlek 2576 Kongzili', type: 'joint_leave' },
  { id: '2025-01-29', date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', type: 'national' },
  { id: '2025-03-28', date: '2025-03-28', name: 'Cuti Bersama Hari Suci Nyepi Saka 1947', type: 'joint_leave' },
  { id: '2025-03-29', date: '2025-03-29', name: 'Hari Suci Nyepi Tahun Baru Saka 1947', type: 'national' },
  { id: '2025-03-31', date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H (Hari ke-1)', type: 'national' },
  { id: '2025-04-01', date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H (Hari ke-2)', type: 'national' },
  { id: '2025-04-02', date: '2025-04-02', name: 'Cuti Bersama Idul Fitri 1446 H', type: 'joint_leave' },
  { id: '2025-04-03', date: '2025-04-03', name: 'Cuti Bersama Idul Fitri 1446 H', type: 'joint_leave' },
  { id: '2025-04-04', date: '2025-04-04', name: 'Cuti Bersama Idul Fitri 1446 H', type: 'joint_leave' },
  { id: '2025-04-07', date: '2025-04-07', name: 'Cuti Bersama Idul Fitri 1446 H', type: 'joint_leave' },
  { id: '2025-04-18', date: '2025-04-18', name: 'Wafat Yesus Kristus (Jumat Agung)', type: 'national' },
  { id: '2025-04-20', date: '2025-04-20', name: 'Hari Paskah (Kebangkitan Yesus Kristus)', type: 'national' },
  { id: '2025-05-01', date: '2025-05-01', name: 'Hari Buruh Internasional', type: 'national' },
  { id: '2025-05-12', date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', type: 'national' },
  { id: '2025-05-13', date: '2025-05-13', name: 'Cuti Bersama Hari Raya Waisak', type: 'joint_leave' },
  { id: '2025-05-29', date: '2025-05-29', name: 'Kenaikan Yesus Kristus', type: 'national' },
  { id: '2025-05-30', date: '2025-05-30', name: 'Cuti Bersama Kenaikan Yesus Kristus', type: 'joint_leave' },
  { id: '2025-06-01', date: '2025-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
  { id: '2025-06-06', date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H', type: 'national' },
  { id: '2025-06-09', date: '2025-06-09', name: 'Cuti Bersama Hari Raya Idul Adha 1446 H', type: 'joint_leave' },
  { id: '2025-06-27', date: '2025-06-27', name: '1 Muharam Tahun Baru Islam 1447 H', type: 'national' },
  { id: '2025-08-17', date: '2025-08-17', name: 'Proklamasi Kemerdekaan RI ke-80', type: 'national' },
  { id: '2025-09-05', date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', type: 'national' },
  { id: '2025-12-25', date: '2025-12-25', name: 'Kelahiran Yesus Kristus (Hari Raya Natal)', type: 'national' },
  { id: '2025-12-26', date: '2025-12-26', name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },

  // ─── TAHUN 2026 ──────────────────────────────────────────────
  { id: '2026-01-01', date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', type: 'national' },
  { id: '2026-01-16', date: '2026-01-16', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'national' },
  { id: '2026-02-16', date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek 2577', type: 'joint_leave' },
  { id: '2026-02-17', date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', type: 'national' },
  { id: '2026-03-19', date: '2026-03-19', name: 'Hari Suci Nyepi Tahun Baru Saka 1948', type: 'national' },
  { id: '2026-03-20', date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H (Hari ke-1)', type: 'national' },
  { id: '2026-03-21', date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H (Hari ke-2)', type: 'national' },
  { id: '2026-03-23', date: '2026-03-23', name: 'Cuti Bersama Idul Fitri 1447 H', type: 'joint_leave' },
  { id: '2026-03-24', date: '2026-03-24', name: 'Cuti Bersama Idul Fitri 1447 H', type: 'joint_leave' },
  { id: '2026-03-25', date: '2026-03-25', name: 'Cuti Bersama Idul Fitri 1447 H', type: 'joint_leave' },
  { id: '2026-04-03', date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)', type: 'national' },
  { id: '2026-04-05', date: '2026-04-05', name: 'Hari Paskah (Kebangkitan Yesus Kristus)', type: 'national' },
  { id: '2026-05-01', date: '2026-05-01', name: 'Hari Buruh Internasional', type: 'national' },
  { id: '2026-05-14', date: '2026-05-14', name: 'Kenaikan Yesus Kristus', type: 'national' },
  { id: '2026-05-15', date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus', type: 'joint_leave' },
  { id: '2026-05-27', date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H', type: 'national' },
  { id: '2026-05-28', date: '2026-05-28', name: 'Cuti Bersama Hari Raya Idul Adha 1447 H', type: 'joint_leave' },
  { id: '2026-05-31', date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', type: 'national' },
  { id: '2026-06-01', date: '2026-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
  { id: '2026-06-16', date: '2026-06-16', name: '1 Muharam Tahun Baru Islam 1448 H', type: 'national' },
  { id: '2026-08-17', date: '2026-08-17', name: 'Proklamasi Kemerdekaan RI ke-81', type: 'national' },
  { id: '2026-08-25', date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW', type: 'national' },
  { id: '2026-12-25', date: '2026-12-25', name: 'Kelahiran Yesus Kristus (Hari Raya Natal)', type: 'national' },
  { id: '2026-12-28', date: '2026-12-28', name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },

  // ─── TAHUN 2027 ──────────────────────────────────────────────
  { id: '2027-01-01', date: '2027-01-01', name: 'Tahun Baru 2027 Masehi', type: 'national' },
  { id: '2027-01-05', date: '2027-01-05', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'national' },
  { id: '2027-02-06', date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili', type: 'national' },
  { id: '2027-03-08', date: '2027-03-08', name: 'Hari Suci Nyepi Tahun Baru Saka 1949', type: 'national' },
  { id: '2027-03-10', date: '2027-03-10', name: 'Hari Raya Idul Fitri 1448 H (Hari ke-1)', type: 'national' },
  { id: '2027-03-11', date: '2027-03-11', name: 'Hari Raya Idul Fitri 1448 H (Hari ke-2)', type: 'national' },
  { id: '2027-03-12', date: '2027-03-12', name: 'Cuti Bersama Idul Fitri 1448 H', type: 'joint_leave' },
  { id: '2027-03-15', date: '2027-03-15', name: 'Cuti Bersama Idul Fitri 1448 H', type: 'joint_leave' },
  { id: '2027-03-26', date: '2027-03-26', name: 'Wafat Yesus Kristus', type: 'national' },
  { id: '2027-03-28', date: '2027-03-28', name: 'Hari Paskah', type: 'national' },
  { id: '2027-05-01', date: '2027-05-01', name: 'Hari Buruh Internasional', type: 'national' },
  { id: '2027-05-06', date: '2027-05-06', name: 'Kenaikan Yesus Kristus', type: 'national' },
  { id: '2027-05-16', date: '2027-05-16', name: 'Hari Raya Idul Adha 1448 H', type: 'national' },
  { id: '2027-05-20', date: '2027-05-20', name: 'Hari Raya Waisak 2571 BE', type: 'national' },
  { id: '2027-06-01', date: '2027-06-01', name: 'Hari Lahir Pancasila', type: 'national' },
  { id: '2027-06-06', date: '2027-06-06', name: 'Tahun Baru Islam 1449 H', type: 'national' },
  { id: '2027-08-15', date: '2027-08-15', name: 'Maulid Nabi Muhammad SAW', type: 'national' },
  { id: '2027-08-17', date: '2027-08-17', name: 'Proklamasi Kemerdekaan RI ke-82', type: 'national' },
  { id: '2027-12-25', date: '2027-12-25', name: 'Kelahiran Yesus Kristus (Hari Raya Natal)', type: 'national' },
  { id: '2027-12-27', date: '2027-12-27', name: 'Cuti Bersama Hari Raya Natal', type: 'joint_leave' },
];

export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DAY_NAMES_ID = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
];

// Helper to get all holidays (official + custom stored)
export const getAllHolidays = (customHolidays: HolidayItem[] = []): HolidayItem[] => {
  const combined = [...OFFICIAL_HOLIDAYS, ...customHolidays];
  return combined.sort((a, b) => a.date.localeCompare(b.date));
};

// Get holiday on specific date
export const getHolidayOnDate = (dateStr: string, allHolidays: HolidayItem[]): HolidayItem | undefined => {
  return allHolidays.find(h => h.date === dateStr);
};

// Calculate effective audit working days & hours
export interface WorkingDaysCalculationResult {
  startDate: string;
  endDate: string;
  workDaysPerWeek: 5 | 6;
  hoursPerDay: number;
  totalCalendarDays: number;
  weekendDays: number;
  nationalHolidaysCount: number;
  jointLeaveCount: number;
  kapCustomCount: number;
  effectiveWorkingDays: number;
  effectiveWorkingHours: number;
  holidayDetails: {
    date: string;
    dayName: string;
    name: string;
    type: HolidayType;
    isWeekend: boolean;
  }[];
}

export const calculateAuditWorkingDays = (
  startDateStr: string,
  endDateStr: string,
  workDaysPerWeek: 5 | 6 = 5,
  hoursPerDay: number = 8,
  allHolidays: HolidayItem[] = OFFICIAL_HOLIDAYS
): WorkingDaysCalculationResult => {
  if (!startDateStr || !endDateStr) {
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      workDaysPerWeek,
      hoursPerDay,
      totalCalendarDays: 0,
      weekendDays: 0,
      nationalHolidaysCount: 0,
      jointLeaveCount: 0,
      kapCustomCount: 0,
      effectiveWorkingDays: 0,
      effectiveWorkingHours: 0,
      holidayDetails: []
    };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) {
    return {
      startDate: startDateStr,
      endDate: endDateStr,
      workDaysPerWeek,
      hoursPerDay,
      totalCalendarDays: 0,
      weekendDays: 0,
      nationalHolidaysCount: 0,
      jointLeaveCount: 0,
      kapCustomCount: 0,
      effectiveWorkingDays: 0,
      effectiveWorkingHours: 0,
      holidayDetails: []
    };
  }

  let totalCalendarDays = 0;
  let weekendDays = 0;
  let nationalHolidaysCount = 0;
  let jointLeaveCount = 0;
  let kapCustomCount = 0;
  let effectiveWorkingDays = 0;
  const holidayDetails: WorkingDaysCalculationResult['holidayDetails'] = [];

  const curr = new Date(start);

  while (curr <= end) {
    totalCalendarDays++;
    const dayOfWeek = curr.getDay(); // 0 is Sunday, 6 is Saturday
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isWeekend = workDaysPerWeek === 5 ? (isSaturday || isSunday) : isSunday;

    // Format YYYY-MM-DD
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const holiday = getHolidayOnDate(dateStr, allHolidays);

    if (isWeekend) {
      weekendDays++;
      if (holiday) {
        holidayDetails.push({
          date: dateStr,
          dayName: DAY_NAMES_ID[dayOfWeek === 0 ? 6 : dayOfWeek - 1],
          name: `${holiday.name} (Jatuh pada akhir pekan)`,
          type: holiday.type,
          isWeekend: true
        });
      }
    } else if (holiday) {
      if (holiday.type === 'national') nationalHolidaysCount++;
      else if (holiday.type === 'joint_leave') jointLeaveCount++;
      else if (holiday.type === 'kap_custom') kapCustomCount++;

      holidayDetails.push({
        date: dateStr,
        dayName: DAY_NAMES_ID[dayOfWeek === 0 ? 6 : dayOfWeek - 1],
        name: holiday.name,
        type: holiday.type,
        isWeekend: false
      });
    } else {
      effectiveWorkingDays++;
    }

    curr.setDate(curr.getDate() + 1);
  }

  return {
    startDate: startDateStr,
    endDate: endDateStr,
    workDaysPerWeek,
    hoursPerDay,
    totalCalendarDays,
    weekendDays,
    nationalHolidaysCount,
    jointLeaveCount,
    kapCustomCount,
    effectiveWorkingDays,
    effectiveWorkingHours: effectiveWorkingDays * hoursPerDay,
    holidayDetails
  };
};
