import {
  parseHeading,
} from '../../main.mjs';

describe('parse-heading', () => {
  it('preserves Polish words without numbers completely intact', () => {
    expect(parseHeading('Obsługiwane typy danych')).toEqual({
      number: '',
      title: 'Obsługiwane typy danych',
    });
    expect(parseHeading('Wstęp i założenia architektoniczne')).toEqual({
      number: '',
      title: 'Wstęp i założenia architektoniczne',
    });
    expect(parseHeading('Zażółć gęślą jaźń')).toEqual({
      number: '',
      title: 'Zażółć gęślą jaźń',
    });
    expect(parseHeading('Łódź i Wisła')).toEqual({
      number: '',
      title: 'Łódź i Wisła',
    });
  });

  it('extracts standard dot-separated section numbers', () => {
    expect(parseHeading('1. Wstęp')).toEqual({
      number: '1.',
      title: 'Wstęp',
    });
    expect(parseHeading('6. Diagramy architektury Mermaid (mermaid)')).toEqual({
      number: '6.',
      title: 'Diagramy architektury Mermaid (mermaid)',
    });
    expect(parseHeading('3.2.1. Konfiguracja podsieci')).toEqual({
      number: '3.2.1.',
      title: 'Konfiguracja podsieci',
    });
    expect(parseHeading('2.4 Wnioski')).toEqual({
      number: '2.4',
      title: 'Wnioski',
    });
  });

  it('extracts alternative number prefixes such as parentheses and dashes', () => {
    expect(parseHeading('1) Pierwszy krok')).toEqual({
      number: '1)',
      title: 'Pierwszy krok',
    });
    expect(parseHeading('6 - Architektura')).toEqual({
      number: '6 -',
      title: 'Architektura',
    });
  });

  it('does not falsely extract words that contain percentage or non-delimiter characters', () => {
    expect(parseHeading('100% pokrycia testami')).toEqual({
      number: '',
      title: '100% pokrycia testami',
    });
  });

  it('handles empty or non-string inputs safely', () => {
    expect(parseHeading('')).toEqual({ number: '', title: '' });
    expect(parseHeading(null)).toEqual({ number: '', title: '' });
    expect(parseHeading(undefined)).toEqual({ number: '', title: '' });
    expect(parseHeading(123)).toEqual({ number: '', title: '' });
  });
});
