export const LANGUAGE_CONFIG = {
  typescript: { label: 'TypeScript', color: '#3178C6' },
  javascript: { label: 'JavaScript', color: '#F7DF1E' },
  python: { label: 'Python', color: '#3572A5' },
  go: { label: 'Go', color: '#00ADD8' },
  rust: { label: 'Rust', color: '#DEA584' },
  java: { label: 'Java', color: '#B07219' },
  cpp: { label: 'C++', color: '#F34B7D' },
  c: { label: 'C', color: '#555555' },
  csharp: { label: 'C#', color: '#178600' },
  ruby: { label: 'Ruby', color: '#701516' },
  php: { label: 'PHP', color: '#4F5D95' },
  sql: { label: 'SQL', color: '#E38C00' },
  html: { label: 'HTML', color: '#E34C26' },
  css: { label: 'CSS', color: '#563D7C' },
  shell: { label: 'Shell', color: '#89E051' },
  markdown: { label: 'Markdown', color: '#083FA1' },
  json: { label: 'JSON', color: '#292929' },
  yaml: { label: 'YAML', color: '#CB171E' }
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG);

export function getLanguageInfo(lang) {
  const key = (lang || '').toLowerCase().trim();
  return (
    LANGUAGE_CONFIG[key] || {
      label: key.charAt(0).toUpperCase() + key.slice(1) || 'Plain Text',
      color: '#8B8B94'
    }
  );
}
