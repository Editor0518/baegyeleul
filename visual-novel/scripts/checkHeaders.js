import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const xlsxPath = path.join(__dirname, '../../작연시 (2).xlsx');

try {
  const wb = XLSX.readFile(xlsxPath);
  
  console.log('=== Characters Sheet Headers ===');
  const charSheet = wb.Sheets['characters'];
  if (charSheet) {
    const charJson = XLSX.utils.sheet_to_json(charSheet, {defval: '', header: 1});
    if (charJson.length > 0) {
      console.log('Headers:', charJson[0]);
      console.log('\nFirst data row:', charJson[1]);
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
