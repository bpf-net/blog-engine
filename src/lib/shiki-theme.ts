// Single dark Shiki theme matching the site palette (see src/styles/global.css).
const c = {
  bg: '#0B0E0D',
  fg: '#D3DBD6',
  comment: '#7C8A82',
  keyword: '#C9A7F5',
  string: '#A3D16B',
  number: '#F2B45A',
  func: '#8EC5FF',
  type: '#7FD1C7',
  punct: '#9AA69F',
};

export const bpfDark = {
  name: 'bpf-dark',
  type: 'dark',
  colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
  tokenColors: [
    { settings: { foreground: c.fg, background: c.bg } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment, fontStyle: 'italic' } },
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.control', 'meta.tag.preprocessor', 'punctuation.section.embedded'],
      settings: { foreground: c.keyword },
    },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'], settings: { foreground: c.string } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'variable.other.constant'], settings: { foreground: c.number } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: c.func } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class'], settings: { foreground: c.type } },
    { scope: ['entity.name.tag', 'support.type.property-name', 'entity.other.attribute-name'], settings: { foreground: c.func } },
    { scope: ['punctuation', 'keyword.operator', 'meta.brace'], settings: { foreground: c.punct } },
    { scope: ['variable', 'variable.parameter', 'meta.definition.variable'], settings: { foreground: c.fg } },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: c.fg, fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['markup.inserted'], settings: { foreground: c.string } },
    { scope: ['markup.deleted'], settings: { foreground: '#FF8A65' } },
  ],
};
