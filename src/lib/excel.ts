import * as XLSX from 'xlsx';

/**
 * Exports an array of song requests to an Excel file.
 * @param songs Array of song request objects from summary_data
 * @param filename Name of the file to be downloaded
 */
export function exportSongsToExcel(songs: any[], filename: string = 'music_report.xlsx') {
  if (!songs || songs.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }

  // Map data to a flat structure for Excel
  const data = songs.map((s, i) => ({
    '번호': i + 1,
    '곡 제목': s.title,
    '아티스트': s.artist,
    '신청자': s.requester || '익명',
    '승인 일시': new Date(s.approved_at).toLocaleString('ko-KR')
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const wscols = [
    { wch: 6 },  // 번호
    { wch: 40 }, // 곡 제목
    { wch: 30 }, // 아티스트
    { wch: 15 }, // 신청자
    { wch: 25 }, // 승인 일시
  ];
  worksheet['!cols'] = wscols;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '신청곡 목록');

  // Trigger download
  XLSX.writeFile(workbook, filename);
}
