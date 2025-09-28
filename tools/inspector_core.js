/**
 * inspector_core.js
 * Gestiona el estado y la lógica principal del inspector de elementos.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class InspectorCore {
        constructor(options) {
            this.panelCodigo = options.panelCodigo;
            this.treeViewManager = options.treeViewManager;
            this.mostrarCodigoEnPanel = options.mostrarCodigoEnPanelFn;
            this.tableEditor = options.tableEditor;
            this.gridEditor = options.gridEditor;
            this.flexEditor = options.flexEditor;
            
            this.elementoInspeccionado = null;
            this.inspectorActivo = false;
            
            this.inspectorClickHandler = this.inspectorClickHandler.bind(this);
        }
        
        init() {
            this._setupInspectorToggle();
        }

        reiniciarInspeccionSimple() {
            if (this.elementoInspeccionado) this.elementoInspeccionado.classList.remove('elemento-inspeccion-seleccionado');
            this.elementoInspeccionado = null;
            if (this.treeViewManager) this.treeViewManager.highlightNodeForElement(null);
            if (this.tableEditor) this.tableEditor.deselectTable();
            if (this.gridEditor) this.gridEditor.deselectGrid();
            if (this.flexEditor) this.flexEditor.deselectFlexContainer();
            this.panelCodigo.classList.add('hidden');
        }

        inspectorClickHandler(e) {
            if (e.target.closest('.floating-panel')) return;
            // Ignora clics en todos los manejadores
            if (e.target.className.includes('-resize-handler')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            this.reiniciarInspeccionSimple();
            this.elementoInspeccionado = e.target;
            this.elementoInspeccionado.classList.add('elemento-inspeccion-seleccionado');
            
            const closestTable = e.target.closest('table');
            if (this.tableEditor) closestTable ? this.tableEditor.selectTable(closestTable) : this.tableEditor.deselectTable();
            
            const closestGrid = e.target.closest('[style*="display: grid"], .grid');
            if (this.gridEditor) closestGrid ? this.gridEditor.selectGrid(closestGrid) : this.gridEditor.deselectGrid();

            const closestFlex = e.target.closest('.flex');
            if (this.flexEditor) closestFlex ? this.flexEditor.selectFlexContainer(e.target) : this.flexEditor.deselectFlexContainer();
            
            if (this.treeViewManager) this.treeViewManager.highlightNodeForElement(this.elementoInspeccionado);
            this.mostrarCodigoEnPanel(this.elementoInspeccionado);
        }

        _setupInspectorToggle() {
            const inspectorBtn = document.getElementById('toggle-inspector-btn');
            const toggleInspector = (activar) => {
                this.inspectorActivo = activar;
                inspectorBtn.classList.toggle('active', activar);
                document.body.classList.toggle('inspector-activo', activar);
                
                if (activar) {
                    document.body.addEventListener('click', this.inspectorClickHandler, true);
                } else {
                    document.body.removeEventListener('click', this.inspectorClickHandler, true);
                    this.reiniciarInspeccionSimple();
                }
            };
            inspectorBtn.onclick = () => toggleInspector(!this.inspectorActivo);
            toggleInspector(true);
        }

        isInspectorActive() {
            return this.inspectorActivo;
        }
        
        getSelectedElement() {
            return this.elementoInspeccionado;
        }
    }

    window.EditorTools.InspectorCore = InspectorCore;
})();