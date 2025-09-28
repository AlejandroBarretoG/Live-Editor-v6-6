/**
 * analysis_engine.js
 * * Este módulo se encarga de analizar un elemento del DOM y extraer
 * información detallada sobre sus propiedades, estilos y atributos.
 */
(function() {
    // Para evitar contaminar el scope global, adjuntamos nuestras herramientas a un único objeto.
    window.EditorTools = window.EditorTools || {};

    /**
     * Analiza un elemento del DOM y devuelve un objeto con su información estructurada.
     * @param {HTMLElement} element - El elemento del DOM a analizar.
     * @returns {object} Un objeto con los detalles del análisis.
     */
    const analyzeElement = (element) => {
        const analysis = {
            tagName: element.tagName.toLowerCase(),
            allAttributes: [],
            rawClasses: [],
            textContent: '',
            tailwindStyles: [],
            computedStyles: [],
            backgrounds: [],
            boxModel: {},
            positioning: {}
        };

        const computed = window.getComputedStyle(element);

        // 1. All Attributes
        for (const attr of element.attributes) {
            if (!['class', 'style', 'data-inspector-id'].includes(attr.name)) {
                analysis.allAttributes.push({ name: attr.name, value: attr.value });
            }
        }
        
        // 2. Raw Classes
        if (element.className && typeof element.className === 'string') {
            analysis.rawClasses = element.className.split(' ').filter(c => c && !c.startsWith('elemento-'));
        }
        
        // 3. Direct Text Content
        const directText = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
        if (directText) {
            analysis.textContent = directText.nodeValue.trim();
        }

        // 4. Parse Tailwind Classes
        const parseTailwindClasses = () => {
            const properties = [];
            const classes = analysis.rawClasses;
            const classMap = {
                'bg-': 'Color de Fondo', 'font-': 'Fuente', 'p-': 'Relleno (Padding)',
                'px-': 'Padding (X)', 'py-': 'Padding (Y)', 'pt-': 'Padding (Top)', 'pr-': 'Padding (Right)',
                'pb-': 'Padding (Bottom)', 'pl-': 'Padding (Left)', 'm-': 'Margen', 'mx-': 'Margen (X)',
                'my-': 'Margen (Y)', 'mt-': 'Margen (Top)', 'mr-': 'Margen (Right)', 'mb-': 'Margen (Bottom)',
                'ml-': 'Margen (Left)', 'w-': 'Ancho', 'h-': 'Alto', 'gap-': 'Espaciado (Gap)',
                'rounded': 'Bordes Redondeados', 'shadow': 'Sombra', 'border': 'Borde', 'items-': 'Alinear Items',
                'justify-': 'Justificar Contenido'
            };
            const standaloneClasses = {
                'flex': { property: 'Display', value: 'flex' }, 'grid': { property: 'Display', value: 'grid' },
                'hidden': { property: 'Display', value: 'hidden' }, 'block': { property: 'Display', value: 'block' },
                'inline-block': { property: 'Display', value: 'inline-block' }, 'absolute': { property: 'Posición', value: 'absolute' },
                'relative': { property: 'Posición', value: 'relative' }, 'fixed': { property: 'Posición', value: 'fixed' },
                'uppercase': { property: 'Transformación Texto', value: 'uppercase' },
                'whitespace-nowrap': { property: 'Espacio en Blanco', value: 'nowrap' },
                'table-fixed': { property: 'Layout de Tabla', value: 'fixed' }, 'list-disc': { property: 'Estilo de Lista', value: 'disc' },
                'list-inside': { property: 'Posición de Lista', value: 'inside' },
            };

            for (const cls of classes) {
                if (standaloneClasses[cls]) {
                    properties.push(standaloneClasses[cls]);
                    continue;
                }
                if (cls.startsWith('hover:')) {
                    const baseClass = cls.substring(6);
                    if (baseClass === 'underline') properties.push({ property: 'Hover', value: 'Subrayado' });
                    else if (baseClass.startsWith('bg-')) properties.push({ property: 'Hover Color Fondo', value: baseClass.substring(3) });
                    continue;
                }
                if (cls.startsWith('text-')) {
                    const value = cls.substring(5);
                    if (value.includes('-') && !isNaN(parseInt(value.split('-')[1], 10))) properties.push({ property: 'Color de Texto', value });
                    else if (['left', 'center', 'right', 'justify'].includes(value)) properties.push({ property: 'Alineación de Texto', value });
                    else properties.push({ property: 'Tamaño de Texto', value });
                    continue;
                }
                for (const prefix in classMap) {
                    if (cls.startsWith(prefix)) {
                        let value = cls.substring(prefix.length);
                        if (value === '' && ['rounded', 'shadow', 'border'].includes(prefix)) value = 'default';
                        if (value) properties.push({ property: classMap[prefix], value });
                        break;
                    }
                }
            }
            return properties;
        };
        analysis.tailwindStyles = parseTailwindClasses();
        
        // 5. Key Computed Styles & Backgrounds
        const importantStyles = ['color', 'font-size', 'font-weight', 'font-family', 'background-color', 'background-image', 'background-blend-mode'];
        importantStyles.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== '0px' && value !== 'auto' && value !== 'normal' && !value.startsWith('rgba(0, 0, 0, 0)') && value !== 'none') {
                if (prop.startsWith('background')) {
                    analysis.backgrounds.push({ property: prop, value });
                } else {
                    analysis.computedStyles.push({ property: prop, value });
                }
            }
        });

        // 6. Box Model
        const boxModelProps = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'width', 'height'];
        boxModelProps.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== '0px') {
                analysis.boxModel[prop] = value;
            }
        });

        // 7. Positioning
        if (computed.getPropertyValue('position') !== 'static') {
            const posProps = ['position', 'top', 'right', 'bottom', 'left', 'z-index'];
            posProps.forEach(prop => {
                const value = computed.getPropertyValue(prop);
                if (value && value !== 'auto') {
                     analysis.positioning[prop] = value;
                }
            });
        }

        return analysis;
    };

    // Exponemos la función al objeto global EditorTools.
    window.EditorTools.analyzeElement = analyzeElement;

})();