import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Rocket } from 'lucide-react';

const MarkdownDemo: React.FC = () => {
  const demoContent = `# Markdown + LaTeX + Code Demo

## Características principales

### 1. **Markdown Básico**
- **Texto en negrita**
- *Texto en cursiva*
- ~~Texto tachado~~
- [Enlaces](https://example.com)

### 2. **Listas**
- Elemento 1
- Elemento 2
  - Subelemento 2.1
  - Subelemento 2.2
- Elemento 3

### 3. **Código**
Código en línea: \`console.log("Hello World")\`

Bloque de código JavaScript:
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

Bloque de código Python:
\`\`\`python
def factorial(n):
    if (n == 0):
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # 120
\`\`\`

### 4. **LaTeX Matemático**
Fórmula en línea: $E = mc^2$

Fórmula en bloque:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Ecuación cuadrática:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### 5. **Tablas**
| Lenguaje | Paradigma | Popularidad |
|-----------|-----------|-------------|
| JavaScript | Multiparadigma | 5/5 |
| Python | Multiparadigma | 5/5 |
| C++ | Orientado a objetos | 4/5 |
| Rust | Sistemas | 4/5 |

### 6. **Citas**
> "La programación es el arte de decirle a otra persona qué debe hacer una computadora."
> 
> — Donald Knuth

### 7. **Líneas horizontales**
---

### 8. **Imágenes**
![Logo de React](https://cdn.worldvectorlogo.com/logos/react-1.svg)

---

## Resumen
Este componente demuestra el soporte completo para:
- [x] Markdown estándar
- [x] GitHub Flavored Markdown (GFM)
- [x] LaTeX matemático
- [x] Resaltado de código con tema dark
- [x] Estilos personalizados con Tailwind CSS
`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-100 flex items-center justify-center gap-2">
        <Rocket size={28} aria-hidden="true" />
        <span>Demo: Markdown + LaTeX + Code Highlighting</span>
      </h1>
      <MarkdownRenderer content={demoContent} />
    </div>
  );
};

export default MarkdownDemo;


