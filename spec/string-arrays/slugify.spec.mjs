import {
  slugify,
} from '../../main.mjs';

describe('slugify', () => {
  it('generates clean URL-safe slugs preserving Unicode diacritics', () => {
    expect(slugify('Obsługiwane typy danych')).toBe('obsługiwane-typy-danych');
    expect(slugify('Zażółć gęślą jaźń!')).toBe('zażółć-gęślą-jaźń');
    expect(slugify('Światła wielkiego miasta')).toBe('światła-wielkiego-miasta');
  });

  it('strips HTML tags and markdown formatting', () => {
    expect(slugify('<b>Pogrubiony</b> & <i>Kursywa</i> @2026')).toBe('pogrubiony-kursywa-2026');
    expect(slugify('Użycie `const` i `let` w JS')).toBe('użycie-const-i-let-w-js');
  });

  it('collapses multiple whitespace and underscores into single separator', () => {
    expect(slugify('   hello    world___test   ')).toBe('hello-world-test');
  });

  it('handles collision deduplication when existing collection is provided', () => {
    const existing = new Set(['artykul', 'artykul-1']);
    expect(slugify('Artykuł', { existing })).toBe('artykuł');
    expect(slugify('artykul', { existing })).toBe('artykul-2');
    expect(existing.has('artykul-2')).toBe(true);

    const arr = ['wprowadzenie'];
    expect(slugify('Wprowadzenie', { existing: arr })).toBe('wprowadzenie-1');
    expect(arr.includes('wprowadzenie-1')).toBe(true);
  });

  it('supports custom separator and fallback', () => {
    expect(slugify('foo bar baz', { separator: '_' })).toBe('foo_bar_baz');
    expect(slugify('', { fallback: 'custom-slug' })).toBe('custom-slug');
    expect(slugify('!@#$%^&*()', { fallback: 'section' })).toBe('section');
  });

  it('supports lowercase=false option', () => {
    expect(slugify('Hello World', { lowercase: false })).toBe('Hello-World');
  });
});
