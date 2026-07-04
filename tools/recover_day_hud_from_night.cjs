const fs = require('fs');

const source = 'ui/MafiaNightHUD.ui';
const target = 'ui/MafiaDayHUD.ui';

const data = JSON.parse(fs.readFileSync(source, 'utf8'));

function replaceDeep(value) {
  if (typeof value === 'string') {
    return value.replaceAll('/ui/MafiaNightHUD', '/ui/MafiaDayHUD').replaceAll('MafiaNightHUD', 'MafiaDayHUD');
  }
  if (Array.isArray(value)) {
    return value.map(replaceDeep);
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = replaceDeep(value[key]);
    }
  }
  return value;
}

replaceDeep(data);
fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
console.log(`[recover_day_hud_from_night] restored ${target} from ${source}`);
