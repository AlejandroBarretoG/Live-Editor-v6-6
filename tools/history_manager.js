/**
 * history_manager.js
 * * Este módulo proporciona una funcionalidad de historial (deshacer/rehacer)
 * para el estado de un contenedor de contenido principal.
 */
(function() {
    // Aseguramos que el objeto global EditorTools exista.
    window.EditorTools = window.EditorTools || {};

    /**
     * Crea una nueva instancia del gestor de historial.
     * @param {HTMLElement} mainContentWrapper - El elemento cuyo innerHTML será rastreado.
     * @param {function} restartCallback - Una función a llamar después de deshacer/rehacer para reinicializar listeners.
     */
    function HistoryManager(mainContentWrapper, restartCallback) {
        this.historyStack = [];
        this.redoStack = [];
        this.limit = 50;
        this.mainContentWrapper = mainContentWrapper;
        this.restartCallback = restartCallback;
    }

    /**
     * Guarda el estado actual del contenido en el historial.
     */
    HistoryManager.prototype.saveState = function() {
        this.redoStack = []; // Cualquier nueva acción borra el historial de "rehacer".
        const currentState = this.mainContentWrapper.innerHTML;
        // No guardar estados idénticos consecutivos.
        if (this.historyStack.length > 0 && this.historyStack[this.historyStack.length - 1] === currentState) {
            return;
        }
        this.historyStack.push(currentState);
        // Mantener el historial dentro del límite.
        if (this.historyStack.length > this.limit) {
            this.historyStack.shift();
        }
    };

    /**
     * Revierte al estado anterior en el historial.
     */
    HistoryManager.prototype.undo = function() {
        if (this.historyStack.length <= 1) return; // No se puede deshacer el estado inicial.
        this.redoStack.push(this.historyStack.pop());
        this.mainContentWrapper.innerHTML = this.historyStack[this.historyStack.length - 1];
        // Llama al callback para reinicializar la aplicación.
        if (this.restartCallback) {
            this.restartCallback();
        }
    };

    /**
     * Rehace un estado que fue deshecho.
     */
    HistoryManager.prototype.redo = function() {
        if (this.redoStack.length === 0) return;
        const stateToRestore = this.redoStack.pop();
        this.historyStack.push(stateToRestore);
        this.mainContentWrapper.innerHTML = stateToRestore;
        // Llama al callback para reinicializar la aplicación.
        if (this.restartCallback) {
            this.restartCallback();
        }
    };

    // Exponemos el constructor al objeto global EditorTools.
    window.EditorTools.HistoryManager = HistoryManager;

})();
