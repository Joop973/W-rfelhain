import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DE } from '../i18n/de.js';
import { EN } from '../i18n/en.js';
import { SPRACHEN, setzeSprache, aktiveSprache, uebersetze } from '../i18n/sprache.js';

test('Key-Parität DE ↔ EN: keine fehlenden, keine überzähligen Übersetzungen', () => {
  const deKeys = Object.keys(DE);
  const enKeys = new Set(Object.keys(EN));
  const fehltInEn = deKeys.filter((k) => !enKeys.has(k));
  const zuVielInEn = [...enKeys].filter((k) => !(k in DE));
  assert.deepEqual(fehltInEn, [], 'Keys ohne EN-Übersetzung');
  assert.deepEqual(zuVielInEn, [], 'EN-Keys ohne DE-Original');
});

test('Keine leeren oder identischen Übersetzungen bei Fließtexten', () => {
  // Namen dürfen übereinstimmen (z. B. Echo); Fließtexte (.text/.szene/.titel
  // von Events, Mentor, Wendung, Enden) müssen wirklich übersetzt sein.
  const fliesstext = /\.(text|szene\d|haken)$|^(mentor|wendung|hinweis)\./;
  const verdaechtig = Object.keys(DE).filter(
    (k) => fliesstext.test(k) && (!EN[k] || EN[k] === DE[k])
  );
  assert.deepEqual(verdaechtig, []);
});

test('Sprachwahl: Umschalten, Fallback auf DE, unbekannte Codes → de', () => {
  assert.equal(aktiveSprache(), 'de');
  assert.equal(uebersetze('klasse.eichwart.name'), 'Eichwart');
  setzeSprache('en');
  assert.equal(uebersetze('klasse.eichwart.name'), 'Oakwarden');
  assert.equal(uebersetze('unbekannter.key'), 'unbekannter.key'); // Key-Fallback
  assert.equal(setzeSprache('fr'), 'de'); // unbekannt → Ausgangssprache
  assert.equal(uebersetze('klasse.eichwart.name'), 'Eichwart');
  assert.ok(SPRACHEN.de && SPRACHEN.en);
});
