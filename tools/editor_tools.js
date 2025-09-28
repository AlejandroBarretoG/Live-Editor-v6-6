/**
 * editor_tools.js
 * Este módulo gestiona las herramientas de edición directa, como la edición
 * de texto en vivo y los atajos de teclado para deshacer/rehacer.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class EditorToolsManager {
        /**
         * Inicializa el gestor de herramientas de edición.
         * @param {object} options - Un objeto con las dependencias necesarias.
         * @param {HTMLElement} options.mainContentWrapper - El contenedor principal del contenido.
         * @param {object} options.historyManager - La instancia del gestor de historial.
         * @param {function} options.getInspectorState - Una función que devuelve el estado actual del inspector (activo/inactivo).
         * @param {function} options.resetInspector - Una función para reiniciar la selección del inspector.
         */
        constructor(options) {
            this.mainContentWrapper = options.mainContentWrapper;
            this.historyManager = options.historyManager;
            this.getInspectorState = options.getInspectorState;
            this.resetInspector = options.resetInspector;
        }

        /**
         * Activa todas las herramientas de edición configurando sus listeners.
         */
        init() {
            this._setupLiveTextEditor();
            this._setupShortcuts();
        }

        /**
         * Configura el listener para la edición de texto con doble clic.
         * @private
         */
        _setupLiveTextEditor() {
            this.mainContentWrapper.addEventListener('dblclick', e => {
                if (!this.getInspectorState()) return; // Usa el callback para obtener el estado

                const target = e.target;
                const isTextElement = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'SPAN', 'STRONG', 'EM', 'BUTTON', 'TD', 'TH'].includes(target.tagName);
                
                if (isTextElement && !target.closest('pre')) {
                    this.resetInspector(); // Usa el callback para reiniciar
                    target.contentEditable = true;
                    target.focus();
                    document.execCommand('selectAll', false, null);

                    const stopEditing = (saveChanges) => {
                        target.contentEditable = false;
                        target.removeEventListener('blur', onBlur);
                        target.removeEventListener('keydown', onKeydown);
                        if (saveChanges && this.historyManager) {
                            this.historyManager.saveState();
                        }
                    };
                    const onBlur = () => stopEditing(true);
                    const onKeydown = (ev) => {
                        if (ev.key === 'Enter' && !ev.shiftKey) { 
                            ev.preventDefault(); 
                            stopEditing(true); 
                        } else if (ev.key === 'Escape') {
                            stopEditing(false);
                        }
                    };
                    target.addEventListener('blur', onBlur);
                    target.addEventListener('keydown', onKeydown);
                }
            });
        }

        /**
         * Configura los atajos de teclado para deshacer (Ctrl+Z) y rehacer (Ctrl+Y).
         * @private
         */
        _setupShortcuts() {
             window.addEventListener('keydown', e => {
                const isTyping = e.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
                if (isTyping || !this.historyManager) return;

                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { 
                    e.preventDefault(); 
                    this.historyManager.undo(); 
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { 
                    e.preventDefault(); 
                    this.historyManager.redo(); 
                }
            });
        }
    }

    window.EditorTools.EditorToolsManager = EditorToolsManager;
})();
