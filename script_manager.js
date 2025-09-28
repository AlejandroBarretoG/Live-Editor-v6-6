// script_manager.js
(function() {
    'use strict';
    const scripts = [
        'ui_manager.js', // ✅ AÑADIDO (Y PUESTO AL PRINCIPIO)
        'analysis_engine.js',
        'history_manager.js',
        'panel_manager.js',
        'dom_tree_view.js',
        'editor_tools.js',
        'properties_panel.js',
        'table_editor.js',
        'grid_editor.js',
        'flex_editor.js',
        'inspector_core.js'
    ];

    const base_path = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf("/") + 1) + 'tools/';
    let scriptsLoaded = 0;

    const onScriptLoad = () => {
        scriptsLoaded++;
        if (scriptsLoaded === scripts.length) {
            document.dispatchEvent(new CustomEvent('modulesLoaded'));
        }
    };

    scripts.forEach(script_name => {
        const script = document.createElement('script');
        script.src = base_path + script_name;
        script.onload = onScriptLoad;
        script.onerror = () => console.error(`Error loading script: ${script_name}`);
        document.head.appendChild(script);
    });
})();