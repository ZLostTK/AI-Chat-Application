import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { FlaskConical } from 'lucide-react';

const SimpleMarkdownTest: React.FC = () => {
  const testContent = `# Test Simple

## Código JavaScript
\`\`\`javascript
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Fórmula Matemática
$E = mc^2$

## Lista
- Item 1
- Item 2
- Item 3
`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-100 text-center flex items-center justify-center gap-2">
        <FlaskConical size={24} aria-hidden="true" />
        <span>Test de Markdown</span>
      </h2>
      <MarkdownRenderer content={testContent} />
    </div>
  );
};

export default SimpleMarkdownTest;



