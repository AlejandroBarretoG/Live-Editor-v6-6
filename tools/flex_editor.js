/**
 * flex_editor.js
 * Este módulo contiene la lógica para las herramientas de edición contextual de layouts con CSS Flexbox.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class FlexEditor {
        constructor(options) {
            this.selectedFlexContainer = null;
            this.historyManager = options.historyManager;
            this.flexControlsPanel = document.getElementById('panel-flex');
            this.getSelectedElement = options.getSelectedElement;
            this.elementToReselect = null;

            // Binds
            this.doColDrag = this.doColDrag.bind(this);
            this.stopColDrag = this.stopColDrag.bind(this);
            this.doRowDrag = this.doRowDrag.bind(this);
            this.stopRowDrag = this.stopRowDrag.bind(this);
        }

        selectFlexContainer(element) {
            const flexContainer = element.closest('.flex');
            if (this.selectedFlexContainer === flexContainer) return;

            this.deselectFlexContainer();
            this.selectedFlexContainer = flexContainer;
            this.activateResizeHandlers();
            this.flexControlsPanel?.classList.remove('hidden');
        }

        deselectFlexContainer() {
            if (!this.selectedFlexContainer) return;
            this.deactivateResizeHandlers();
            this.selectedFlexContainer = null;
            this.flexControlsPanel?.classList.add('hidden');
        }

        activateResizeHandlers() {
            if (!this.selectedFlexContainer) return;

            // Contenedor para los manejadores
            const parent = this.selectedFlexContainer.parentElement;
            this.handlersContainer = document.createElement('div');
            this.handlersContainer.className = 'resize-handlers-container';
            parent.style.position = parent.style.position || 'relative';
            parent.appendChild(this.handlersContainer);
            
            this.createHandlers(this.selectedFlexContainer);
        }
        
        createHandlers(container) {
            // Manejadores de columnas (verticales)
            const children = Array.from(container.children);
            children.forEach((child, index) => {
                if (index < children.length - 1) {
                    const handler = document.createElement('div');
                    handler.className = 'flex-resize-handler-col';
                    child.style.position = 'relative';
                    child.appendChild(handler);
                    handler.addEventListener('mousedown', (e) => this.initColDrag(e, child, children[index + 1]));
                }
            });

            // Manejadores de filas (horizontales) si el contenedor principal es flex-col
            if(container.parentElement?.classList.contains('flex-col')) {
                const rows = Array.from(container.parentElement.children);
                 rows.forEach((row, index) => {
                    if (index < rows.length - 1) {
                        const handler = document.createElement('div');
                        handler.className = 'flex-resize-handler-row';
                        row.style.position = 'relative';
                        row.appendChild(handler);
                        handler.addEventListener('mousedown', (e) => this.initRowDrag(e, row, rows[index+1]));
                    }
                });
            }
        }

        deactivateResizeHandlers() {
            const handlers = document.querySelectorAll('.flex-resize-handler-col, .flex-resize-handler-row');
            handlers.forEach(h => h.remove());
        }
        
        initColDrag(e, leftEl, rightEl) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            
            this.isDraggingCols = true;
            this.leftEl = leftEl;
            this.rightEl = rightEl;
            this.startX = e.clientX;
            this.startWidthLeft = leftEl.offsetWidth;
            this.startWidthRight = rightEl.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', this.doColDrag);
            document.addEventListener('mouseup', this.stopColDrag, { once: true });
        }

        doColDrag(e) {
            if (!this.isDraggingCols) return;
            const deltaX = e.clientX - this.startX;
            const newWidthLeft = this.startWidthLeft + deltaX;
            const newWidthRight = this.startWidthRight - deltaX;
            
            if (newWidthLeft > 50 && newWidthRight > 50) {
                const parentWidth = this.leftEl.parentElement.offsetWidth;
                this.leftEl.style.width = `${(newWidthLeft / parentWidth) * 100}%`;
                this.rightEl.style.width = `${(newWidthRight / parentWidth) * 100}%`;
            }
        }

        stopColDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.isDraggingCols = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doColDrag);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            }
        }

        initRowDrag(e, topEl, bottomEl) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            
            this.isDraggingRows = true;
            this.topEl = topEl;
            this.bottomEl = bottomEl;
            this.startY = e.clientY;
            this.startHeightTop = topEl.offsetHeight;
            this.startHeightBottom = bottomEl.offsetHeight;

            document.body.style.cursor = 'row-resize';
            document.addEventListener('mousemove', this.doRowDrag);
            document.addEventListener('mouseup', this.stopRowDrag, { once: true });
        }

        doRowDrag(e) {
            if (!this.isDraggingRows) return;
            const deltaY = e.clientY - this.startY;
            const newHeightTop = this.startHeightTop + deltaY;
            const newHeightBottom = this.startHeightBottom - deltaY;

            if (newHeightTop > 40 && newHeightBottom > 40) {
                 const parentHeight = this.topEl.parentElement.offsetHeight;
                 this.topEl.style.height = `${newHeightTop}px`;
                 this.bottomEl.style.height = `${newHeightBottom}px`;
            }
        }

        stopRowDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.isDraggingRows = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doRowDrag);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            }
        }
    }

    window.EditorTools.FlexEditor = FlexEditor;
})();