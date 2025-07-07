import Editor from '@monaco-editor/react';
import './KursDetalj.css'
// U JSX-u zamenite react-simple-code-editor sa:
<Editor
    height="300px"
    language={language}
    theme={document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs'}
    value={code}
    onChange={(newValue) => setCode(newValue)}
    options={{
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true
    }}
/>