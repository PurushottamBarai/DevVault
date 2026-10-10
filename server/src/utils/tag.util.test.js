import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTag, normalizeTags } from './tag.util.js';

describe('Tag Utility', () => {
  test('normalizeTag removes leading hashtags and trims', () => {
    assert.equal(normalizeTag('##JavaScript '), 'javascript');
    assert.equal(normalizeTag('#React'), 'react');
    assert.equal(normalizeTag('  Algorithm  '), 'algorithm');
    assert.equal(normalizeTag(null), '');
    assert.equal(normalizeTag(123), '');
  });

  test('normalizeTags deduplicates and filters empty values', () => {
    const input = ['#JS', 'js', '  react ', '#react', '', 'python'];
    const result = normalizeTags(input);
    assert.deepEqual(result, ['js', 'react', 'python']);
  });

  test('normalizeTags caps at 10 items max', () => {
    const input = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const result = normalizeTags(input);
    assert.equal(result.length, 10);
  });
});
