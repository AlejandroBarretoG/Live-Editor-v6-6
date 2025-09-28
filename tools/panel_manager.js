/**
 * panel_manager.js
 * * Este módulo se encarga de la funcionalidad de los paneles flotantes,
 * como arrastrarlos, compactarlos/expandirlos y cerrarlos.
 */
(function() {
    window.EditorTools = window.EditorTools || {};

    const makeDraggable = (panel, header) => {
        header.onmousedown = e => {
            // Ignorar clics en botones dentro del encabezado
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            e.preventDefault();
            let pos1 = 0, pos2 = 0, pos3 = e.clientX, pos4 = e.clientY;

            // Si es la primera vez que se arrastra, establecer posición explícitamente
            if (!panel.dataset.isDraggableInitialized) {
                const rect = panel.getBoundingClientRect();
                panel.style.left = `${rect.left}px`;
                panel.style.top = `${rect.top}px`;
                panel.style.right = 'auto';
                panel.style.bottom = 'auto';
                panel.dataset.isDraggableInitialized = 'true';
            }

            document.onmouseup = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };

            document.onmousemove = ev => {
                ev.preventDefault();
                pos1 = pos3 - ev.clientX;
                pos2 = pos4 - ev.clientY;
                pos3 = ev.clientX;
                pos4 = ev.clientY;
                panel.style.top = `${panel.offsetTop - pos2}px`;
                panel.style.left = `${panel.offsetLeft - pos1}px`;
            };
        };
    };

    const setupPanelToggles = () => {
        document.querySelectorAll('.panel-toggle-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const panel = e.currentTarget.closest('.floating-panel');
                if (panel) {
                    panel.classList.toggle('panel-compactado');
                    e.currentTarget.textContent = panel.classList.contains('panel-compactado') ? '+' : '-';
                }
            });
        });
    };

    const setupPanelCloseButtons = () => {
        document.querySelectorAll('.close-panel-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.currentTarget.closest('.floating-panel')?.classList.add('hidden');
            });
        });
    };

    /**
     * Inicializa toda la funcionalidad de los paneles en la página.
     */
    const initPanels = () => {
        const panels = [
            { panelId: 'panel-treeview', headerId: 'treeview-header' },
            { panelId: 'panel-codigo', headerId: 'codigo-header' },
            { panelId: 'panel-tabla', headerId: 'tabla-header' },
            { panelId: 'panel-grid', headerId: 'grid-header' },
            { panelId: 'panel-flex', headerId: 'flex-header' }, // ✅ AÑADIDO
            { panelId: 'panel-llm', headerId: 'llm-header' },
            { panelId: 'panel-widgets', headerId: 'widgets-header' },
            { panelId: 'panel-variables-globales', headerId: 'variables-globales-header' }
        ];

        panels.forEach(p => {
            const panelElement = document.getElementById(p.panelId);
            const headerElement = document.getElementById(p.headerId);
            if (panelElement && headerElement) {
                makeDraggable(panelElement, headerElement);
            }
        });

        setupPanelToggles();
        setupPanelCloseButtons();
    };

    // Exponer la función de inicialización
    window.EditorTools.initPanels = initPanels;

})();