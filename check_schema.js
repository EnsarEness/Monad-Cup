const d = require('./schema.json');
const schemas = d.definitions || (d.components && d.components.schemas);
if (!schemas) { console.log('No schemas found!'); process.exit(1); }
const getKeys = (t) => schemas[t] ? Object.keys(schemas[t].properties).join(', ') : 'Not Found';
console.log('Matches:', getKeys('matches'));
console.log('Events:', getKeys('match_events'));
console.log('Transactions:', getKeys('transactions'));
