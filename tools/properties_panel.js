/**
 * properties_panel.js
 * Gestiona la visualización de las propiedades de un elemento en su panel dedicado.
 * Se encarga de renderizar el análisis generado por analysis_engine.js.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class PropertiesPanelManager {
        /**
         * Inicializa el gestor del panel de propiedades.
         * @param {object} options - Un objeto con las referencias a los elementos del DOM.
         */
        constructor(options) {
            this.panelCodigo = options.panelCodigo;
            this.contenidoCodigo = options.contenidoCodigo;
            this.analysisContainer = options.analysisContainer;
            this.codigoHtmlToggle = options.codigoHtmlToggle;
            this.elementAnalysisToggle = options.elementAnalysisToggle;
            this.codigoHtmlPre = document.getElementById('codigo-html-pre'); // Necesario para el toggle
        }

        /**
         * Configura los listeners para los botones del panel (colapsar/expandir).
         */
        init() {
            this.codigoHtmlToggle.addEventListener('click', (e) => {
                this.codigoHtmlPre.classList.toggle('hidden');
                e.currentTarget.querySelector('svg').classList.toggle('-rotate-90', this.codigoHtmlPre.classList.contains('hidden'));
            });

            this.elementAnalysisToggle.addEventListener('click', (e) => {
                this.analysisContainer.classList.toggle('hidden');
                e.currentTarget.querySelector('svg').classList.toggle('-rotate-90', this.analysisContainer.classList.contains('hidden'));
            });
        }

        /**
         * Analiza un elemento y muestra sus propiedades en el panel.
         * @param {HTMLElement} element - El elemento a analizar y mostrar.
         */
        show(element) {
            if (!element || !window.EditorTools?.analyzeElement) return;
            
            const escapedHtml = element.outerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            this.contenidoCodigo.innerHTML = escapedHtml;
            this.analysisContainer.innerHTML = '';
            
            const elementsToAnalyze = [element, ...Array.from(element.querySelectorAll('*'))];
            
            elementsToAnalyze.forEach((el, index) => {
                const analysis = window.EditorTools.analyzeElement(el);
                if (analysis.rawClasses.length === 0 && analysis.allAttributes.length === 0 && !analysis.textContent && Object.keys(analysis.positioning).length === 0 && analysis.backgrounds.length === 0) return;

                const elementBlock = document.createElement('div');
                const title = document.createElement('h6');
                title.className = `font-bold font-mono text-gray-800 bg-gray-100 p-1 rounded-md w-full ${index > 0 ? 'mt-3' : ''}`;
                title.textContent = `<${analysis.tagName}>`;
                elementBlock.appendChild(title);
                
                const createSection = (titleText, items, isTable = true) => {
                    if (!items || Object.keys(items).length === 0) return;
                    const subTitle = document.createElement('p');
                    subTitle.className = 'text-xs font-semibold text-gray-500 mt-2';
                    subTitle.textContent = titleText;
                    elementBlock.appendChild(subTitle);
                    if (isTable) {
                        const table = document.createElement('table');
                        table.className = 'w-full mt-1';
                        const tbody = table.createTBody();
                        items.forEach(item => {
                            const row = tbody.insertRow();
                            row.insertCell().textContent = item.name || item.property;
                            row.cells[0].className = 'w-1/2 text-gray-500 pr-2 align-top break-all';
                            row.insertCell().textContent = item.value;
                            row.cells[1].className = 'w-1/2 font-medium break-all';
                        });
                        elementBlock.appendChild(table);
                    } else {
                        const div = document.createElement('div');
                        div.className = 'flex flex-wrap gap-1 mt-1';
                        items.forEach(item => {
                            const span = document.createElement('span');
                            span.className = 'bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs';
                            span.textContent = item;
                            div.appendChild(span);
                        });
                        elementBlock.appendChild(div);
                    }
                };
                
                const boxModelItems = Object.entries(analysis.boxModel).map(([p, v]) => ({ property: p, value: v }));
                const positioningItems = Object.entries(analysis.positioning).map(([p, v]) => ({ property: p, value: v }));
                createSection('Texto', analysis.textContent ? [{name: 'Contenido', value: analysis.textContent}] : []);
                createSection('Clases', analysis.rawClasses, false);
                createSection('Atributos', analysis.allAttributes);
                createSection('Estilos Tailwind', analysis.tailwindStyles);
                createSection('Fondos y Degradados', analysis.backgrounds);
                createSection('Estilos Tipográficos', analysis.computedStyles);
                createSection('Modelo de Caja', boxModelItems);
                createSection('Posicionamiento', positioningItems);
                this.analysisContainer.appendChild(elementBlock);
            });

            if (this.analysisContainer.children.length === 0) {
                this.analysisContainer.innerHTML = '<p class="text-center text-gray-400 italic">No se encontraron detalles analizables.</p>';
            }
            
            this.panelCodigo.classList.remove('hidden', 'panel-compactado');
            this.panelCodigo.querySelector('.panel-toggle-btn').textContent = '-';
            document.getElementById('codigo-html-content').classList.remove('hidden');
            this.codigoHtmlToggle.querySelector('svg').classList.remove('-rotate-90');
            this.analysisContainer.classList.remove('hidden');
            this.elementAnalysisToggle.querySelector('svg').classList.remove('-rotate-90');
        }
    }

    window.EditorTools.PropertiesPanelManager = PropertiesPanelManager;
})();