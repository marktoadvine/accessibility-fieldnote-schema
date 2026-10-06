import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {fresh,compatible,yaml,markdown} from '../app/model.js';
const record=fresh();assert.ok(compatible(record));assert.equal(record.decisions.filter(x=>x.status==='open').length,7);
record.decisions[0].status='decided';assert.ok(!compatible(record));record.decisions[0].answer='Use the visible title';assert.ok(compatible(record));
assert.ok(markdown(record).includes('**open**'));record.decisions[1].id=record.decisions[0].id;assert.ok(!compatible(record));
writeFileSync('/tmp/afs-browser-export.yaml',yaml(fresh())+'\n');
console.log('Browser model checks passed');
