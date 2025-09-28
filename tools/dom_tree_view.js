/**
 * dom_tree_view.js
 * Este módulo gestiona la creación, interacción y actualización de la vista de árbol del DOM.
 * Implementado como una clase para ser instanciada.
 */
(function() {
    'use strict';
    
    // ✅ Ensure EditorTools exists before defining the class
    window.EditorTools = window.EditorTools || {};

    class DomTreeViewManager {
        /**
         * Inicializa el gestor con los elementos necesarios del DOM.
         * @param {HTMLElement} treeViewRootEl - El elemento <ul> raíz donde se renderizará el árbol.
         * @param {HTMLElement} mainContentWrapperEl - El contenedor del contenido a inspeccionar.
         */
        constructor(treeViewRootEl, mainContentWrapperEl) {
            this.treeViewRoot = treeViewRootEl;
            this.mainContentWrapper = mainContentWrapperEl;
            this.elementIdCounter = 0;
            this.ignoredNodes = ['SCRIPT', 'STYLE', '#comment', 'LINK', 'META', 'TITLE'];
        }

        /**
         * Inicializa los listeners y construye el árbol inicial.
         */
        init() {
            this.rebuildTree();
            this.setupEventListeners();
        }

        /**
         * Construye recursivamente el árbol del DOM.
         * @param {HTMLElement} element - El elemento actual a procesar.
         * @param {HTMLElement} parentTreeNode - El nodo del árbol (<ul> o <li>) al que añadir el nuevo nodo.
         */
        buildDomTree(element, parentTreeNode) {
            if (this.ignoredNodes.includes(element.nodeName) || element.closest('.floating-panel')) return;

            const li = document.createElement('li');
            if (!element.dataset.inspectorId) {
                element.dataset.inspectorId = `inspector-id-${this.elementIdCounter++}`;
            }
            li.dataset.inspectorId = element.dataset.inspectorId;

            const nodeContent = document.createElement('div');
            nodeContent.className = 'tree-node';

            const hasChildren = Array.from(element.children).some(child =>
                !this.ignoredNodes.includes(child.nodeName) && !child.closest('.floating-panel')
            );

            if (hasChildren) {
                const toggle = document.createElement('span');
                toggle.className = 'toggle expanded';
                nodeContent.appendChild(toggle);
            }

            const nodeName = document.createElement('span');
            nodeName.textContent = `<${element.tagName.toLowerCase()}>`;
            nodeContent.appendChild(nodeName);
            li.appendChild(nodeContent);
            parentTreeNode.appendChild(li);

            if (hasChildren) {
                const ul = document.createElement('ul');
                li.appendChild(ul);
                for (const child of element.children) {
                    this.buildDomTree(child, ul);
                }
            }
        }

        /**
         * Limpia y reconstruye completamente la vista de árbol.
         */
        rebuildTree() {
            if (!this.treeViewRoot || !this.mainContentWrapper) return;
            this.treeViewRoot.innerHTML = '';
            this.elementIdCounter = 0;
            if (this.mainContentWrapper.firstElementChild) {
                this.buildDomTree(this.mainContentWrapper.firstElementChild, this.treeViewRoot);
            }
        }

        /**
         * Resalta un nodo en el árbol que corresponde a un elemento del DOM.
         * @param {HTMLElement|null} targetElement - El elemento a resaltar en el árbol.
         */
        highlightNodeForElement(targetElement) {
            if (!this.treeViewRoot) return;
            this.treeViewRoot.querySelector('.tree-node.seleccionado')?.classList.remove('seleccionado');
            if (!targetElement?.dataset.inspectorId) return;

            const nodeToSelect = this.treeViewRoot.querySelector(`li[data-inspector-id="${targetElement.dataset.inspectorId}"] > .tree-node`);
            if (nodeToSelect) {
                nodeToSelect.classList.add('seleccionado');
                let current = nodeToSelect.parentElement;
                while (current && current !== this.treeViewRoot) {
                    if (current.tagName === 'UL' && current.classList.contains('collapsed')) {
                        current.classList.remove('collapsed');
                        const toggle = current.previousElementSibling?.querySelector('.toggle');
                        if (toggle) {
                            toggle.classList.replace('collapsed', 'expanded');
                        }
                    }
                    current = current.parentElement;
                }
                nodeToSelect.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        /**
         * Configura los listeners de eventos para la interacción con el árbol.
         */
        setupEventListeners() {
            if (!this.treeViewRoot) return;
            this.treeViewRoot.addEventListener('click', e => {
                const target = e.target;
                const nodeDiv = target.closest('.tree-node');

                if (target.classList.contains('toggle')) {
                    e.stopPropagation();
                    const sublist = target.closest('li')?.querySelector('ul');
                    if (sublist) {
                        sublist.classList.toggle('collapsed');
                        target.classList.toggle('expanded');
                        target.classList.toggle('collapsed');
                    }
                    return;
                }

                if (nodeDiv) {
                    const li = nodeDiv.parentElement;
                    const inspectorId = li.dataset.inspectorId;
                    if (inspectorId) {
                        document.dispatchEvent(new CustomEvent('treeNodeClicked', {
                            detail: { inspectorId }
                        }));
                    }
                }
            });
        }
    }

    // ✅ Expose the class to the global namespace with debug logging
    window.EditorTools.DomTreeViewManager = DomTreeViewManager;
    console.log('DomTreeViewManager class defined and exposed to window.EditorTools');
})();