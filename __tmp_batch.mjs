const api = require('./.claude/skills/msw-search/scripts/msw_resource_api.cjs');
const ids = [
  '37c1f65780014a35a6160fbfc2732b0b',
  'a1cd43c74b974a11823452abb071427c',
  '7a9f4c6a88154257b19e0763c39a0377',
  '6086f139384d46058806bba2003c990e',
  '13d7ff3d538b492d9165d4610c438769'
];
Promise.all(ids.map(id => api.getResource(id))).then(results => {
  results.forEach(r => {
    if (r && r.payload) {
      console.log(r.id + ' ' + r.payload.width + 'x' + r.payload.height + ' ' + r.payload.thumbnail);
    }
  });
}).catch(e => console.error(e.message));
