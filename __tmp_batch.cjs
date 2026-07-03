const api = require('./.claude/skills/msw-search/scripts/msw_resource_api.cjs');
const ids = [
  '9140b1ed30ea410ba43213eec3c54062',
  '14036f51f87847a8ada1f67d0962d49f',
  '91e6cfdcfa554edc9a3091aa0583df66',
  'b13d90d714634190abfd99699af2c472',
  '5d2b959b353d44b99f92b0bbfd9eb4ae',
  '75ee077987304e3aaea53bdab6b8748b',
  '3ed270d832c54a26be99eed93f20aab5'
];
Promise.all(ids.map(id => api.getResource(id))).then(results => {
  results.forEach(r => {
    if (r && r.payload) {
      console.log(r.id + ' ' + r.payload.width + 'x' + r.payload.height + ' ' + r.payload.thumbnail);
    }
  });
}).catch(e => console.error(e.message));
