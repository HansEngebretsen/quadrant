document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const matrix = document.getElementById('matrix-container');
    const matrixTitle = document.getElementById('matrix-title');
    const pickerModal = document.getElementById('picker-modal');
    const pickerIcons = document.getElementById('picker-icons');
    const pickerColors = document.getElementById('picker-colors');
    const pickerSizes = document.getElementById('picker-sizes');
    const pickerEditSection = document.getElementById('picker-edit-section');
    const toggleAxesBtn = document.getElementById('toggle-axes-btn');
    const saveBtn = document.getElementById('save-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const feedbackTooltip = document.getElementById('feedback-tooltip');
    const xAxisContainer = document.getElementById('x-axis-container');
    const historyBtn = document.getElementById('history-btn');
    const historyContainer = document.getElementById('history-container');
    const historyDropdown = document.getElementById('history-dropdown');
    const historyList = document.getElementById('history-list');
    const toggleKeyBtn = document.getElementById('toggle-key-btn');
    const keyContainer = document.getElementById('key-container');
    const keyHeader = document.getElementById('key-header');
    const keyList = document.getElementById('key-list');
    const addKeyItemBtn = document.getElementById('add-key-item-btn');
    const hideKeyBtn = document.getElementById('hide-key-btn');
    const configModal = document.getElementById('config-modal');
    const configTextarea = document.getElementById('config-textarea');
    const copyConfigIconBtn = document.getElementById('copy-config-icon-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const closeConfigBtn = document.getElementById('close-config-btn');
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAboutBtn = document.getElementById('close-about-btn');

    // --- State ---
    let activeDrag = null;
    let dragOffsetX = 0, dragOffsetY = 0;
    let isDraggingKey = false;
    let keyOffsetX = 0, keyOffsetY = 0;
    let pickerTarget = { mode: null, item: null, iconEl: null };
    let randomItemCounter = 1;
    const DEFAULT_ICON_COLOR = '#38bdf8';
    let saveHistory = []; // Session-only history
    let activeHistoryUrl = '';
    let isDirty = false;

    // --- Data ---
    const materialIcons = ['star', 'favorite', 'bolt', 'key', 'token', 'flag', 'insights', 'rocket_launch', 'lightbulb', 'thumb_up', 'paid', 'psychology', 'build', 'groups', 'public', 'school', 'science', 'menu_book', 'military_tech', 'work', 'cloud', 'sunny', 'bedtime', 'filter_drama', 'landscape', 'palette', 'music_note', 'camera_alt', 'movie', 'brush', 'videogame_asset', 'local_fire_department', 'eco', 'pets', 'fitness_center', 'shield', 'verified', 'lock', 'report', 'warning', 'push_pin', 'location_on', 'explore', 'map', 'home', 'apartment', 'store', 'restaurant', 'local_cafe', 'spa', 'luggage', 'flight', 'directions_car', 'train', 'local_shipping', 'savings', 'bar_chart', 'pie_chart', 'show_chart', 'timeline', 'hub', 'computer', 'smartphone', 'gamepad', 'emoji_objects', 'emoji_events', 'emoji_people', 'emoji_nature', 'emoji_food_beverage', 'emoji_symbols', 'task_alt', 'highlight', 'bug_report', 'code', 'storage', 'memory', 'dns', 'router', 'widgets', 'extension', 'bubble_chart', 'donut_small', 'legend_toggle', 'translate', 'edit', 'cut', 'share', 'link', 'mail', 'person', 'settings', 'database', 'award_star', 'verified_user', 'analytics', 'api', 'backup', 'biotech', 'cloud_done', 'widgets', 'compress', 'data_object', 'code_blocks', 'developer_mode', 'devices', 'engineering', 'folder', 'functions', 'monitoring', 'network_check', 'query_stats', 'article', 'security', 'sprint'];
    const iconColors = ['#2dd4bf', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#4ade80', '#f87171', '#fb923c', '#34d399', '#818cf8', '#c084fc'];
    const sizes = [{ id: 'sm', text: 'S' }, { id: 'md', text: 'M' }, { id: 'lg', text: 'L' }, { id: 'xl', icon: 'star' }];

    function initialize() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else if (savedTheme === 'outline') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('outline-mode');
        } else {
            document.documentElement.classList.add('dark');
        }
        updateThemeIcon();
        updateKeyToggleIcon();
        renderHistoryDropdown(); // Render initial empty state
        populateIconPicker();
        addEventListeners();
        loadStateFromUrl();
        adjustCentering();
    }

    function setDirty() {
        if (!isDirty) {
            isDirty = true;
            activeHistoryUrl = '';
            renderHistoryDropdown(); // Re-render to remove selection highlight
        }
    }
    
    function adjustCentering() {
        const width = xAxisContainer.offsetWidth;
        document.documentElement.style.setProperty('--x-axis-width', `${width}px`);
    }

    function populateIconPicker() {
        pickerIcons.innerHTML = '';
        materialIcons.forEach(iconName => {
            const iconEl = document.createElement('button');
            iconEl.className = 'icon-btn';
            iconEl.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
            iconEl.addEventListener('click', () => handleIconSelection(iconName));
            pickerIcons.appendChild(iconEl);
        });
    }

    function addEventListeners() {
        saveBtn.addEventListener('click', handleSave);
        downloadBtn.addEventListener('click', downloadMatrix);
        shareBtn.addEventListener('click', shareMatrix);
        themeToggleBtn.addEventListener('click', toggleTheme);
        toggleKeyBtn.addEventListener('click', () => {
            keyContainer.classList.toggle('hidden');
            updateKeyToggleIcon();
        });
        addKeyItemBtn.addEventListener('click', () => addKeyItem());
        hideKeyBtn.addEventListener('click', () => {
            keyContainer.classList.add('hidden');
            updateKeyToggleIcon();
        });
        keyContainer.addEventListener('mouseover', (e) => {
            e.stopPropagation();
            keyContainer.classList.add('key-edit-mode');
        });
        keyHeader.addEventListener('mousedown', handleKeyDragStart);

        historyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            historyDropdown.classList.toggle('hidden');
            historyBtn.classList.toggle('active');
        });
        toggleAxesBtn.addEventListener('click', () => {
            const isTimeline = document.body.classList.toggle('timeline-mode');
            toggleAxesBtn.querySelector('span').textContent = isTimeline ? 'grid_view' : 'linear_scale';
            updateAllConnectors();
        });
        document.addEventListener('click', (e) => {
            if (!pickerModal.contains(e.target) && !e.target.closest('.icon')) {
                hidePopups();
            }
            if (!historyContainer.contains(e.target)) {
                historyDropdown.classList.add('hidden');
                historyBtn.classList.remove('active');
            }
            if (!keyContainer.contains(e.target)) {
                keyContainer.classList.remove('key-edit-mode');
            }
            if (e.target === configModal) {
                hideConfigModal();
            }
            if (e.target === aboutModal) {
                aboutModal.classList.add('hidden');
            }
        });
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('keydown', handleKeyboardShortcuts);
        new ResizeObserver(adjustCentering).observe(xAxisContainer);
        window.addEventListener('beforeunload', (e) => {
            if (isDirty && saveHistory.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        document.querySelectorAll('.axis-label[contenteditable="true"]').forEach(label => {
            label.addEventListener('blur', setDirty);
        });
        matrixTitle.addEventListener('blur', () => {
            if (document.title !== matrixTitle.textContent) {
                document.title = matrixTitle.textContent;
                setDirty();
            }
        });
        
        // Config Modal Listeners
        copyConfigIconBtn.addEventListener('click', () => {
            configTextarea.select();
            navigator.clipboard.writeText(configTextarea.value).then(() => {
                showFeedback('Configuration copied!');
            });
        });
        saveConfigBtn.addEventListener('click', () => {
            try {
                const state = JSON.parse(configTextarea.value);
                applyState(state);
                hideConfigModal();
                showFeedback('Configuration loaded!');
            } catch (e) {
                console.error('Error loading config:', e);
                showFeedback('Invalid configuration data.');
            }
        });
        closeConfigBtn.addEventListener('click', hideConfigModal);

        // About Modal Listeners
        aboutBtn.addEventListener('click', () => {
            aboutModal.classList.remove('hidden');
        });
        closeAboutBtn.addEventListener('click', () => {
            aboutModal.classList.add('hidden');
        });
    }
    
    function handleIconSelection(iconName) {
        if (pickerTarget.iconEl) {
            pickerTarget.iconEl.textContent = iconName;
            setDirty();
            hidePopups();
        }
    }

    function handleColorSelection(color) {
        if (pickerTarget.mode === 'edit' && pickerTarget.iconEl) {
            pickerTarget.iconEl.style.color = color;
            if (pickerTarget.item.classList.contains('size-xl')) {
                applyHighlightStyle(pickerTarget.item);
            }
            setDirty();
        } else if (pickerTarget.mode === 'edit-key' && pickerTarget.iconEl) {
            pickerTarget.iconEl.style.color = color;
            setDirty();
        }
    }

    function handleSizeSelection(size) {
        const item = pickerTarget.item;
        if (item) {
            item.style.width = '';
            item.style.height = '';
            const wasXL = item.classList.contains('size-xl');
            item.classList.remove('size-sm', 'size-md', 'size-lg', 'size-xl');
            item.classList.add(`size-${size}`);
            if (size === 'xl') applyHighlightStyle(item);
            else if (wasXL) item.style.boxShadow = '';
            
            const sizeBtns = pickerSizes.querySelectorAll('.size-btn');
            sizeBtns.forEach(btn => {
                btn.classList.remove('active-size');
                const btnSize = btn.dataset.size;
                if (btnSize === size) {
                    btn.classList.add('active-size');
                }
            });

            setDirty();
        }
    }
    
    function createItem({ text, icon, color, size, position }) {
        const item = document.createElement('div');
        item.className = `draggable-item size-${size}`;
        const iconSpan = document.createElement('span');
        iconSpan.className = 'material-symbols-outlined icon';
        iconSpan.textContent = icon;
        iconSpan.style.color = color;
        iconSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showPicker({ anchorEl: e.currentTarget, mode: 'edit', item, iconEl: iconSpan });
        });
        const textSpan = document.createElement('span');
        textSpan.className = "text-content";
        textSpan.textContent = text;
        textSpan.contentEditable = "false";
        item.appendChild(iconSpan);
        item.appendChild(textSpan);
        item.addEventListener('mousedown', handleDragStart);
        item.addEventListener('dblclick', () => {
            if (activeDrag) return;
            textSpan.contentEditable = "true"; textSpan.focus(); document.execCommand('selectAll', false, null); item.style.cursor = 'text';
        });
        textSpan.addEventListener('blur', () => { textSpan.contentEditable = "false"; item.style.cursor = 'grab'; setDirty(); });
        textSpan.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); textSpan.blur(); } });
        
        if (size === 'xl') applyHighlightStyle(item);
        item.classList.add('item-entering');
        item.addEventListener('animationend', () => { item.classList.remove('item-entering'); }, { once: true });
        
        const matrixRect = matrix.getBoundingClientRect();
        if (position) {
            item.style.left = position.left;
            item.style.top = position.top;
        } else {
            item.style.left = `${Math.random() * (matrixRect.width - 150)}px`;
            item.style.top = `${Math.random() * (matrixRect.height - 50)}px`;
        }
        matrix.appendChild(item);
        
        const connector = document.createElement('div');
        connector.className = 'timeline-connector';
        item.appendChild(connector);
        
        updateAllConnectors();
        return item;
    }
    
    function applyHighlightStyle(item) {
        const icon = item.querySelector('.icon');
        item.style.boxShadow = `0 0 0 2.5px ${icon.style.color}, 0 10px 15px -3px rgb(0 0 0 / 0.25)`;
    }

    function updateAllConnectors() {
        const isTimeline = document.body.classList.contains('timeline-mode');
        const matrixRect = matrix.getBoundingClientRect();
        const xAxisY = matrixRect.height / 2;

        document.querySelectorAll('.draggable-item').forEach(item => {
            const connector = item.querySelector('.timeline-connector');
            if (isTimeline) {
                const itemTop = item.offsetTop;
                const itemHeight = item.offsetHeight;
                const itemBottom = itemTop + itemHeight;

                if (itemBottom < xAxisY) { // Item is entirely above the x-axis
                    connector.style.height = `${xAxisY - itemBottom}px`;
                    connector.style.top = `${itemHeight}px`;
                    connector.style.bottom = 'auto';
                } else { // Item is below or crossing the x-axis
                    connector.style.height = `${itemTop - xAxisY}px`;
                    connector.style.bottom = `${itemHeight}px`;
                    connector.style.top = 'auto';
                }
                connector.style.display = 'block';
            } else if (connector) {
                connector.style.display = 'none';
            }
        });
    }

    function showPicker({ anchorEl, mode, item = null, iconEl = null }) {
        hidePopups();
        pickerTarget = { mode, item, iconEl };

        pickerEditSection.style.display = 'block';
        pickerColors.innerHTML = '';
        iconColors.forEach(color => {
            const swatch = document.createElement('button');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.addEventListener('click', () => handleColorSelection(color));
            pickerColors.appendChild(swatch);
        });

        if (mode === 'edit') {
            const currentSize = Array.from(item.classList).find(c => c.startsWith('size-')).replace('size-', '');
            pickerSizes.style.display = 'flex';
            pickerSizes.innerHTML = '';
            sizes.forEach(size => {
                const btn = document.createElement('button');
                btn.className = 'size-btn';
                btn.dataset.size = size.id;
                if (size.id === currentSize) {
                    btn.classList.add('active-size');
                }
                btn.innerHTML = size.icon ? `<span class="material-symbols-outlined">${size.icon}</span>` : size.text;
                btn.addEventListener('click', () => handleSizeSelection(size.id));
                pickerSizes.appendChild(btn);
            });
        } else if (mode === 'edit-key') {
            pickerSizes.style.display = 'none';
        }

        const rect = anchorEl.getBoundingClientRect();
        let topPos = rect.bottom + 8;
        pickerModal.style.left = `${rect.left}px`;
        pickerModal.style.top = `${topPos}px`;
        pickerModal.classList.remove('hidden');
        if (pickerModal.getBoundingClientRect().bottom > window.innerHeight) {
            pickerModal.style.top = `${rect.top - pickerModal.offsetHeight - 8}px`;
        }
    }

    function hidePopups() { pickerModal.classList.add('hidden'); }

    function handleKeyDragStart(e) {
        if (e.target.closest('.control-btn')) return;
        isDraggingKey = true;
        const rect = keyContainer.getBoundingClientRect();
        keyContainer.style.left = `${rect.left}px`;
        keyContainer.style.top = `${rect.top}px`;
        keyContainer.style.right = 'auto';
        keyContainer.style.bottom = 'auto';
        keyOffsetX = e.clientX - rect.left;
        keyOffsetY = e.clientY - rect.top;
        keyContainer.classList.add('dragging-key');
    }

    function handleDragStart(e) {
        if (e.target.isContentEditable || e.target.classList.contains('icon')) return;
        hidePopups();
        
        let originalItem = e.currentTarget;

        if (e.altKey) {
            const sizeClass = Array.from(originalItem.classList).find(c => c.startsWith('size-'));
            const iconEl = originalItem.querySelector('.icon');
            const newPos = originalItem.getBoundingClientRect();
            const matrixRect = matrix.getBoundingClientRect();

            const newItemData = {
                text: originalItem.querySelector('.text-content').textContent,
                icon: iconEl.textContent,
                color: iconEl.style.color,
                size: sizeClass ? sizeClass.replace('size-', '') : 'md',
                position: { 
                    left: `${newPos.left - matrixRect.left}px`,
                    top: `${newPos.top - matrixRect.top}px`
                }
            };
            activeDrag = createItem(newItemData);
        } else {
            activeDrag = originalItem;
        }

        const connector = activeDrag.querySelector('.timeline-connector');
        if (connector) {
            connector.style.display = 'none';
        }

        const rect = activeDrag.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        activeDrag.classList.add('dragging');
        activeDrag.style.width = `${rect.width}px`;
        activeDrag.style.height = `${rect.height}px`;
        activeDrag.style.left = `${e.clientX - dragOffsetX}px`;
        activeDrag.style.top = `${e.clientY - dragOffsetY}px`;
        e.stopPropagation();
    }

    function handleDragMove(e) {
        if (activeDrag) {
            e.preventDefault();
            activeDrag.style.left = `${e.clientX - dragOffsetX}px`;
            activeDrag.style.top = `${e.clientY - dragOffsetY}px`;
            const matrixRect = matrix.getBoundingClientRect();
            const itemRect = activeDrag.getBoundingClientRect();
            activeDrag.classList.toggle('deleting', itemRect.right < matrixRect.left || itemRect.left > matrixRect.right || itemRect.bottom < matrixRect.top || itemRect.top > matrixRect.bottom);
        } else if (isDraggingKey) {
            e.preventDefault();
            keyContainer.style.left = `${e.clientX - keyOffsetX}px`;
            keyContainer.style.top = `${e.clientY - keyOffsetY}px`;
        }
    }

    function handleDragEnd() {
        if (activeDrag) {
            const wasDeleting = activeDrag.classList.contains('deleting');
            
            if (wasDeleting) {
                activeDrag.remove();
            } else {
                const matrixRect = matrix.getBoundingClientRect();
                const itemRect = activeDrag.getBoundingClientRect();
                const finalLeft = itemRect.left - matrixRect.left;
                const finalTop = itemRect.top - matrixRect.top;
                
                activeDrag.style.left = `${Math.max(0, Math.min(finalLeft, matrixRect.width - itemRect.width))}px`;
                activeDrag.style.top = `${Math.max(0, Math.min(finalTop, matrixRect.height - itemRect.height))}px`;
                
                activeDrag.classList.remove('dragging');
                activeDrag.style.width = '';
                activeDrag.style.height = '';
            }
            activeDrag = null;
            setDirty();
            updateAllConnectors();
        }
        if (isDraggingKey) {
            isDraggingKey = false;
            keyContainer.classList.remove('dragging-key');
        }
    }

    function addRandomItem() {
        const randomIcon = materialIcons[Math.floor(Math.random() * materialIcons.length)];
        createItem({ text: `Random Item ${randomItemCounter++}`, icon: randomIcon, color: DEFAULT_ICON_COLOR, size: 'md' });
        setDirty();
    }

    function handleKeyboardShortcuts(e) {
        const isEditing = document.activeElement.isContentEditable || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
        if (isEditing) return;

        const key = e.key.toLowerCase();
        if (key === 'f') {
            const isNormal = !document.body.classList.contains('presentation-mode');
            const isPresentation = document.body.classList.contains('presentation-mode') && !document.body.classList.contains('presentation-mode-full');

            if (isNormal) {
                document.body.classList.add('presentation-mode');
            } else if (isPresentation) {
                document.body.classList.add('presentation-mode-full');
            } else {
                document.body.classList.remove('presentation-mode', 'presentation-mode-full');
            }
        } else if (key === 'a') {
            addRandomItem();
        } else if (key === 's') {
            e.preventDefault();
            handleSave();
        } else if (key === 'd') {
            e.preventDefault();
            showConfigModal();
        } else if (key === 'c') {
            if (saveHistory.length > 0) {
                navigator.clipboard.writeText(saveHistory[0].url).then(() => {
                    showFeedback('Latest version URL copied!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    showFeedback('Could not copy link.');
                });
            } else {
                showFeedback('No saved version to copy.');
            }
        }
    }
    
    function showFeedback(message) {
        feedbackTooltip.textContent = message;
        feedbackTooltip.style.opacity = '1';
        feedbackTooltip.style.transform = 'translateY(0)';
        setTimeout(() => {
            feedbackTooltip.style.opacity = '0';
            feedbackTooltip.style.transform = 'translateY(-10px)';
        }, 2000);
    }

    function showCopiedState(button) {
        const originalContent = button.innerHTML;
        const originalTooltip = button.getAttribute('data-tooltip');

        button.disabled = true;
        if (originalTooltip) {
            button.removeAttribute('data-tooltip');
        }
        button.innerHTML = `<span class="material-symbols-outlined">check</span>Copied`;
        button.classList.add('copied');

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
            if (originalTooltip) {
                button.setAttribute('data-tooltip', originalTooltip);
            }
            button.disabled = false;
        }, 2000);
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const isLight = !isDark && !document.documentElement.classList.contains('outline-mode');

        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else if (isLight) {
            document.documentElement.classList.add('outline-mode');
            localStorage.setItem('theme', 'outline');
        } else {
            document.documentElement.classList.remove('outline-mode');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        updateThemeIcon();
    }

    function updateThemeIcon() {
        const themeIcon = themeToggleBtn.querySelector('span');
        const isDark = document.documentElement.classList.contains('dark');
        const isOutline = document.documentElement.classList.contains('outline-mode');

        if (isDark) {
            themeIcon.textContent = 'light_mode';
        } else if (isOutline) {
            themeIcon.textContent = 'contrast';
        } else {
            themeIcon.textContent = 'dark_mode';
        }
    }

    function updateKeyToggleIcon() {
        const keyIcon = toggleKeyBtn.querySelector('span');
        const isHidden = keyContainer.classList.contains('hidden');
        keyIcon.textContent = isHidden ? 'key_off' : 'key';
    }

    async function downloadMatrix() {
        showFeedback('Downloading...');
        try {
            const canvas = await html2canvas(document.querySelector('#matrix-container'), { 
                backgroundColor: '#1e2b3a',
                logging: false,
                onclone: (clonedDoc) => {
                    clonedDoc.querySelectorAll('.draggable-item, .writing-vertical').forEach(el => {
                       el.style.display = 'flex';
                       el.style.alignItems = 'center';
                       el.style.justifyContent = 'center';
                    });
                }
             });
            const link = document.createElement('a');
            link.download = 'matrix.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) { console.error('Error downloading image:', e); showFeedback('Download failed!'); }
    }

    function serializeState() {
        const items = Array.from(document.querySelectorAll('.draggable-item')).map(item => {
            const sizeClass = Array.from(item.classList).find(c => c.startsWith('size-'));
            const iconEl = item.querySelector('.icon');
            return {
                text: item.querySelector('.text-content').textContent,
                icon: iconEl.textContent,
                color: iconEl.style.color,
                size: sizeClass ? sizeClass.replace('size-', '') : 'md',
                position: { left: item.style.left, top: item.style.top }
            };
        });
        const labels = {};
        document.querySelectorAll('.axis-label').forEach(label => { labels[label.dataset.id] = label.textContent; });
        
        const keyItems = Array.from(document.querySelectorAll('.key-item')).map(item => ({
            icon: item.querySelector('.icon').textContent,
            color: item.querySelector('.icon').style.color,
            text: item.querySelector('.key-text').textContent,
        }));

        return {
            title: matrixTitle.textContent,
            items,
            labels,
            keyItems
        };
    }

    function shareMatrix() {
        try {
            const state = serializeState();
            const jsonString = JSON.stringify(state);
            const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
            const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
            navigator.clipboard.writeText(url).then(() => {
                showCopiedState(shareBtn);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showFeedback('Could not copy link.');
            });
        } catch (e) { console.error('Error sharing:', e); showFeedback('Could not generate link.'); }
    }

    function loadStateFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const data = params.get('data');
        if (data) {
            try {
                const jsonString = decodeURIComponent(escape(atob(data)));
                const state = JSON.parse(jsonString);
                applyState(state);
                activeHistoryUrl = window.location.href;
                isDirty = false;
                renderHistoryDropdown();
            } catch (e) { console.error('Error loading shared state:', e); loadDefaultItems(); }
        } else {
            loadDefaultItems();
        }
    }

    function applyState(state) {
        document.querySelectorAll('.draggable-item').forEach(el => el.remove());
        keyList.innerHTML = '';

        if (state.title) {
            matrixTitle.textContent = state.title;
            document.title = state.title;
        }

        if(state.items) { state.items.forEach(itemData => createItem(itemData)); }
        if(state.labels) {
            Object.keys(state.labels).forEach(id => {
                const el = document.querySelector(`[data-id="${id}"]`);
                if (el) el.textContent = state.labels[id];
            });
        }
        if(state.keyItems && state.keyItems.length > 0) {
            state.keyItems.forEach(itemData => addKeyItem(itemData));
            keyContainer.classList.remove('hidden');
        } else if (state.items && state.items.length > 0) {
            generateKeyFromMatrix();
            keyContainer.classList.remove('hidden');
        }
    }

    function handleSave() {
        try {
            const state = serializeState();
            const jsonString = JSON.stringify(state);
            const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
            const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
            
            const now = new Date();
            const timestamp = now.toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            saveHistory.unshift({ timestamp, url });
            if (saveHistory.length > 20) {
                saveHistory.pop();
            }
            
            activeHistoryUrl = url;
            isDirty = false;
            historyContainer.classList.add('visible');
            renderHistoryDropdown(true);
            
            setTimeout(() => {
                historyDropdown.classList.remove('hidden');
                historyBtn.classList.add('active');
            }, 10);

            setTimeout(() => {
                historyDropdown.classList.add('hidden');
                historyBtn.classList.remove('active');
            }, 2500);

        } catch (e) {
            console.error('Error saving state:', e);
            showFeedback('Could not save version.');
        }
    }

    function renderHistoryDropdown(isNewSave = false) {
        historyList.innerHTML = '';
        if (saveHistory.length === 0) {
            historyList.innerHTML = `<li style="padding: 0.75rem; color: #94a3b8; font-size: 0.875rem;">No saved versions.</li>`;
            historyContainer.classList.remove('visible');
            return;
        }
        
        saveHistory.forEach((item, index) => {
            const li = document.createElement('li');
            if (item.url === activeHistoryUrl) {
                li.classList.add('history-item-selected');
            }
            if (isNewSave && index === 0) {
                li.classList.add('history-item-new');
            }

            const a = document.createElement('a');
            a.textContent = item.timestamp;
            a.href = item.url;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState({}, '', item.url);
                loadStateFromUrl();
                renderHistoryDropdown();
                historyDropdown.classList.add('hidden');
                historyBtn.classList.remove('active');
            });

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('data-tooltip', 'Copy Share URL');
            copyBtn.innerHTML = `<span class="material-symbols-outlined">share</span>`;
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item.url).then(() => {
                    showCopiedState(copyBtn);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    showFeedback('Could not copy link.');
                });
            });

            li.appendChild(a);
            li.appendChild(copyBtn);
            historyList.appendChild(li);
        });
    }

    function addKeyItem(data = { icon: 'star', text: 'New Item', color: '#9ca3af' }) {
        const li = document.createElement('li');
        li.className = 'key-item';

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined icon';
        icon.textContent = data.icon;
        icon.style.color = data.color;
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            showPicker({ anchorEl: e.currentTarget, mode: 'edit-key', iconEl: icon });
        });

        const text = document.createElement('span');
        text.className = 'key-text';
        text.textContent = data.text;
        text.contentEditable = true;
        text.addEventListener('blur', setDirty);
        text.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                text.blur();
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-key-item-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', () => {
            li.remove();
            setDirty();
        });

        li.appendChild(icon);
        li.appendChild(text);
        li.appendChild(deleteBtn);
        keyList.appendChild(li);
        setDirty();
    }

    function generateKeyFromMatrix() {
        const uniqueItems = new Map();
        document.querySelectorAll('.draggable-item').forEach(item => {
            const iconEl = item.querySelector('.icon');
            const icon = iconEl.textContent;
            const color = iconEl.style.color;
            const text = item.querySelector('.text-content').textContent;
            const key = `${icon}|${color}`;
            if (!uniqueItems.has(key)) {
                uniqueItems.set(key, { icon, color, text });
            }
        });
        
        keyList.innerHTML = '';
        if (uniqueItems.size > 0) {
            uniqueItems.forEach(itemData => addKeyItem(itemData));
            keyContainer.classList.remove('hidden');
        } else {
            keyContainer.classList.add('hidden');
        }
    }

    function loadDefaultItems() {
        createItem({ text: "Project A", icon: "work", color: iconColors[1], size: 'md' });
        createItem({ text: "Project B", icon: "work", color: iconColors[1], size: 'md' });
        createItem({ text: "Project C", icon: "work", color: iconColors[1], size: 'md' });
        createItem({ text: "North Star", icon: "star", color: iconColors[4], size: 'lg' });
        generateKeyFromMatrix();
    }

    function showConfigModal() {
        const state = serializeState();
        configTextarea.value = JSON.stringify(state, null, 2);
        configModal.classList.remove('hidden');
        configTextarea.focus();
    }

    function hideConfigModal() {
        configModal.classList.add('hidden');
    }

    initialize();
});