import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {fresh,compatible,yaml,markdown,upgrade} from '../app/model.js';
const record=fresh();assert.ok(compatible(record));assert.equal(record.decisions.filter(x=>x.status==='open').length,7);
record.decisions[0].status='decided';assert.ok(!compatible(record));record.decisions[0].answer='Use the visible title';assert.ok(compatible(record));
assert.ok(markdown(record).includes('**open**'));record.decisions[1].id=record.decisions[0].id;assert.ok(!compatible(record));
writeFileSync('/tmp/afs-browser-export.yaml',yaml(fresh())+'\n');
console.log('Browser model checks passed');

const current=fresh();delete current.decisions[0].question;assert.ok(compatible(current));assert.ok(markdown(current).includes('## name'));
assert.ok(current.decisions.every(d=>d.references[0].standard==='W3C APG'));
const old=fresh();old.schemaVersion='0.1.0';old.guidance.version='0.1.0';old.decisions[0].answer='Existing choice';
const migrated=upgrade(old);assert.equal(migrated.schemaVersion,'0.1.1');assert.equal(migrated.guidance.version,'0.1.0');assert.equal(migrated.decisions[0].answer,'Existing choice');
