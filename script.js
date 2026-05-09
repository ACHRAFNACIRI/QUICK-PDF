/* =========================================================
   QuickPDF — script.js
   Tools: Extractor | Image→PDF | Word→PDF | Merge | Edit | Lock
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const toast = document.getElementById('toast');

    /* ─── Utility: Theme Toggle ─── */
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Load saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    }

    themeBtn?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        showToast(`Theme switched to ${isDark ? 'Dark' : 'Light'} Mode`);
    });

    /* ─── Utility: TOS Section ─── */
    const tosSection = document.getElementById('tos-section');
    const tosLink    = document.getElementById('tos-link');
    const tosBack    = document.getElementById('tos-back-btn');

    tosLink?.addEventListener('click', (e) => {
        e.preventDefault();
        // Hide all tool containers
        document.querySelectorAll('.tool-container').forEach(c => c.classList.remove('active'));
        // Show TOS section
        tosSection.classList.add('active');
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    tosBack?.addEventListener('click', () => {
        tosSection.classList.remove('active');
        // Show the default tool or last active one
        document.getElementById('extractor-tool').classList.add('active');
        document.querySelector('.nav-btn.extractor-btn').classList.add('active');
    });

    /* ─── Utility: Privacy Section ─── */
    const privacySection = document.getElementById('privacy-section');
    const privacyLink    = document.getElementById('privacy-link');

    privacyLink?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tool-container').forEach(c => c.classList.remove('active'));
        privacySection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('.priv-back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            privacySection.classList.remove('active');
            document.getElementById('extractor-tool').classList.add('active');
            document.querySelector('.nav-btn.extractor-btn').classList.add('active');
        });
    });

    /* ─── Utility: Toast ─── */
    function showToast(msg, isError = false) {
        toast.textContent = msg;
        toast.style.background = isError ? '#ef4444' : '#0f172a';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    /* ─── Utility: Toggle password visibility ─── */
    window.togglePwd = (inputId, btn) => {
        const inp = document.getElementById(inputId);
        const icon = btn.querySelector('i');
        if (inp.type === 'password') {
            inp.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            inp.type = 'password';
            icon.className = 'fas fa-eye';
        }
    };


    /* ─── Utility: Format file size ─── */
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    /* ─── Utility: Show file preview card ─── */
    function showFileCard(wrapperId, file, accent, iconClass, onRemove) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const ext = file.name.split('.').pop().toUpperCase();
        wrapper.innerHTML = `
            <div class="file-card ${accent}" id="${wrapperId}-card">
                <div class="file-card-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="file-card-info">
                    <span class="file-card-name" title="${file.name}">${file.name}</span>
                    <div class="file-card-meta">
                        <span class="file-card-size">${formatSize(file.size)}</span>
                        <span class="file-card-badge">${ext}</span>
                    </div>
                    <div class="file-card-status">
                        <span class="status-dot" id="${wrapperId}-status-dot"></span>
                        <span id="${wrapperId}-status-text">Ready to process</span>
                    </div>
                </div>
                <button class="file-card-remove" id="${wrapperId}-remove-btn" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            </div>`;
        document.getElementById(`${wrapperId}-remove-btn`).addEventListener('click', () => {
            wrapper.innerHTML = '';
            if (onRemove) onRemove();
        });
    }

    /* ─── Utility: Update file card status ─── */
    function updateFileCardStatus(wrapperId, status, isError = false) {
        const dot = document.getElementById(`${wrapperId}-status-dot`);
        const text = document.getElementById(`${wrapperId}-status-text`);
        if (!dot || !text) return;
        
        text.textContent = status;
        dot.classList.remove('success');
        dot.style.background = isError ? '#ef4444' : (status === 'Processing...' ? '#6366f1' : '#10b981');
        
        if (status === 'Processing...') {
            dot.style.animation = 'pulse-dot 1s infinite';
        } else if (status === 'Completed') {
            dot.classList.add('success');
            dot.style.animation = 'none';
        } else {
            dot.style.animation = 'none';
        }
    }

    /* ─── Utility: Clear file card ─── */
    function clearFileCard(wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        if (wrapper) wrapper.innerHTML = '';
    }

    function setupDropZone(zoneId, inputId, onFiles) {
        const zone  = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        if (!zone || !input) return;

        zone.addEventListener('click',  () => {
            console.log(`Drop zone ${zoneId} clicked`);
            input.click();
        });

        zone.addEventListener('dragover', e => { 
            e.preventDefault(); 
            zone.classList.add('drag-over'); 
        });

        zone.addEventListener('dragleave', () => { 
            zone.classList.remove('drag-over'); 
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            console.log(`File(s) dropped on ${zoneId}`);
            zone.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFiles(e.dataTransfer.files);
            }
        });

        input.addEventListener('change', () => {
            console.log(`File(s) selected via input for ${zoneId}`);
            if (input.files && input.files.length > 0) {
                onFiles(input.files);
            }
        });
    }

    /* ─── Navigation ─── */
    const navBtns   = document.querySelectorAll('.nav-btn');
    const toolPanels = document.querySelectorAll('.tool-container');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tool;
            toolPanels.forEach(p => p.classList.toggle('active', p.id === target));
        });
    });

    /* ─── Tab Switching (Extractor) ─── */
    const tabBtns   = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.tab;
            tabPanels.forEach(p => p.classList.toggle('hidden', p.id !== target));
        });
    });

    /* ════════════════════════════════════════════
       TOOL 1 · PDF Extractor
    ════════════════════════════════════════════ */
    let extractedText = '';
    const extractLoader  = document.getElementById('extract-loader');
    const extractResults = document.getElementById('extract-results');
    const textOutput     = document.getElementById('text-output');
    const summaryOutput  = document.getElementById('summary-output');
    const searchInput    = document.getElementById('search-input');
    const summaryRange   = document.getElementById('summary-range');
    const rangeLabel     = document.getElementById('range-label');

    let currentExtractFile = null;
    const extractActionContainer = document.getElementById('extract-action-container');
    const startExtractBtn = document.getElementById('start-extract-btn');

    setupDropZone('extract-drop-zone', 'pdfFile', files => {
        if (files[0]) {
            currentExtractFile = files[0];
            showFileCard('extract-file-card', files[0], 'accent-indigo', 'fas fa-file-pdf', () => {
                document.getElementById('pdfFile').value = '';
                extractResults.classList.add('hidden');
                extractActionContainer.classList.add('hidden');
                extractedText = '';
                currentExtractFile = null;
            });
            extractActionContainer.classList.remove('hidden');
            extractResults.classList.add('hidden');
        }
    });

    startExtractBtn?.addEventListener('click', () => {
        if (currentExtractFile) {
            extractActionContainer.classList.add('hidden');
            handleExtract(currentExtractFile);
        }
    });

    async function handleExtract(file) {
        if (!file || file.type !== 'application/pdf') return showToast('Please select a valid PDF file.', true);
        updateFileCardStatus('extract-file-card', 'Processing...');
        extractLoader.classList.remove('hidden');
        extractResults.classList.add('hidden');
        try {
            const buf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page    = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(it => it.str).join(' ') + '\n\n';
            }
            extractedText = fullText.trim();
            textOutput.textContent = extractedText;
            document.getElementById('stat-pages').textContent = pdf.numPages;
            document.getElementById('stat-words').textContent = extractedText.split(/\s+/).filter(Boolean).length;
            document.getElementById('stat-chars').textContent = extractedText.length;
            updateSummary();
            updateFileCardStatus('extract-file-card', 'Completed');
            extractLoader.classList.add('hidden');
            extractResults.classList.remove('hidden');
            showToast('✅ PDF extracted successfully!');
        } catch (err) {
            console.error(err);
            updateFileCardStatus('extract-file-card', 'Error', true);
            extractLoader.classList.add('hidden');
            showToast('Error reading PDF file.', true);
        }
    }

    function updateSummary() {
        if (!extractedText) return;
        const levels = { 1: 'Very Short', 2: 'Short', 3: 'Medium', 4: 'Long', 5: 'Full' };
        const sentences = extractedText.match(/[^.!?]+[.!?]+/g) || [];
        const count = Math.max(2, Math.floor(sentences.length * (parseInt(summaryRange.value) / 5)));
        summaryOutput.textContent = sentences.slice(0, count).join(' ');
        rangeLabel.textContent = levels[summaryRange.value];
    }
    if (summaryRange) summaryRange.addEventListener('input', updateSummary);

    /* Search */
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim().toLowerCase();
            if (!q) { textOutput.textContent = extractedText; return; }
            const regex = new RegExp(`(${q})`, 'gi');
            textOutput.innerHTML = extractedText.replace(regex, '<mark style="background:#fef08a;">$1</mark>');
        });
    }

    /* Copy / Download */
    document.getElementById('copy-text-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(extractedText).then(() => showToast('Text copied!'));
    });
    document.getElementById('copy-summary-btn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(summaryOutput.textContent).then(() => showToast('Summary copied!'));
    });
    document.getElementById('download-text-btn')?.addEventListener('click', () => {
        saveAs(new Blob([extractedText], { type: 'text/plain' }), 'extracted-text.txt');
    });
    document.getElementById('download-summary-btn')?.addEventListener('click', () => {
        saveAs(new Blob([summaryOutput.textContent], { type: 'text/plain' }), 'summary.txt');
    });
    document.getElementById('extract-reset-btn')?.addEventListener('click', () => {
        extractResults.classList.add('hidden');
        extractActionContainer.classList.add('hidden');
        document.getElementById('extract-drop-zone').style.display = '';
        document.getElementById('pdfFile').value = '';
        extractedText = '';
        currentExtractFile = null;
        clearFileCard('extract-file-card');
    });

    /* ════════════════════════════════════════════
       TOOL 2 · Image to PDF
    ════════════════════════════════════════════ */
    let selectedImages = [];
    const imagePreview       = document.getElementById('image-preview-section');
    const imageGrid          = document.getElementById('image-grid');
    const imageCount         = document.getElementById('image-count');
    const imageDownloadBanner = document.getElementById('image-download-banner');
    const imageDownloadBtn   = document.getElementById('image-download-btn');

    const imageActionContainer = document.getElementById('image-action-container');
    const triggerImageBtn      = document.getElementById('trigger-image-convert-btn');

    setupDropZone('image-drop-zone', 'imageFiles', files => {
        if (files.length > 0) {
            const label = files.length === 1 ? files[0].name : `${files.length} images selected`;
            const fakeFile = { name: label, size: Array.from(files).reduce((s,f) => s+f.size, 0) };
            showFileCard('image-file-card', fakeFile, 'accent-pink', 'fas fa-images', () => {
                selectedImages = [];
                renderImageGrid();
                document.getElementById('imageFiles').value = '';
                imageActionContainer.classList.add('hidden');
                imagePreview.classList.add('hidden');
            });
            imageActionContainer.classList.remove('hidden');
            imagePreview.classList.add('hidden'); // Keep grid hidden until processed or shown
        }
        addImages(files);
    });

    triggerImageBtn?.addEventListener('click', () => {
        if (selectedImages.length > 0) {
            imageActionContainer.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            // We can either auto-convert here or just show the grid as we do now.
            // Let's scroll to the grid
            imagePreview.scrollIntoView({ behavior: 'smooth' });
        }
    });

    function addImages(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = e => {
                selectedImages.push(e.target.result);
                renderImageGrid();
            };
            reader.readAsDataURL(file);
        });
    }

    function renderImageGrid() {
        imageGrid.innerHTML = '';
        selectedImages.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = 'image-card';
            card.innerHTML = `<img src="${src}" alt="Image ${i+1}">
                <button class="del-btn" data-idx="${i}"><i class="fas fa-times"></i></button>`;
            imageGrid.appendChild(card);
        });
        imageCount.textContent = selectedImages.length;
        imagePreview.classList.toggle('hidden', selectedImages.length === 0);
        imageDownloadBanner.classList.add('hidden');
    }

    imageGrid.addEventListener('click', e => {
        const btn = e.target.closest('.del-btn');
        if (btn) { selectedImages.splice(+btn.dataset.idx, 1); renderImageGrid(); }
    });

    document.getElementById('clear-images-btn')?.addEventListener('click', () => {
        selectedImages = [];
        renderImageGrid();
    });

    document.getElementById('convert-images-btn')?.addEventListener('click', () => {
        if (!selectedImages.length) return showToast('Add at least one image.', true);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        selectedImages.forEach((src, i) => {
            if (i > 0) doc.addPage();
            doc.addImage(src, 'JPEG', 5, 5, 200, 287);
        });
        const blob = doc.output('blob');
        imageDownloadBtn.href = URL.createObjectURL(blob);
        imageDownloadBanner.classList.remove('hidden');
        showToast('✅ PDF created!');
    });

    /* ════════════════════════════════════════════
       TOOL 3 · Word to PDF
    ════════════════════════════════════════════ */
    const wordLoader         = document.getElementById('word-loader');
    const wordDownloadBanner = document.getElementById('word-download-banner');
    const wordDownloadBtn    = document.getElementById('word-download-btn');

    let currentWordFile = null;
    const wordActionContainer = document.getElementById('word-action-container');
    const startWordBtn = document.getElementById('start-word-btn');

    setupDropZone('word-drop-zone', 'wordFile', files => {
        if (files[0]) {
            currentWordFile = files[0];
            showFileCard('word-file-card', files[0], 'accent-blue', 'fas fa-file-word', () => {
                document.getElementById('wordFile').value = '';
                wordDownloadBanner.classList.add('hidden');
                wordActionContainer.classList.add('hidden');
                currentWordFile = null;
            });
            wordActionContainer.classList.remove('hidden');
            wordDownloadBanner.classList.add('hidden');
        }
    });

    startWordBtn?.addEventListener('click', () => {
        if (currentWordFile) {
            wordActionContainer.classList.add('hidden');
            handleOfficeConvert(currentWordFile, 'docx', 'word');
        }
    });

    /* ════════════════════════════════════════════
       TOOL 4 · Excel to PDF
    ════════════════════════════════════════════ */
    const excelLoader = document.getElementById('excel-loader');
    const excelDownloadBanner = document.getElementById('excel-download-banner');
    const excelDownloadBtn = document.getElementById('excel-download-btn');
    const excelActionContainer = document.getElementById('excel-action-container');
    const startExcelBtn = document.getElementById('start-excel-btn');
    let currentExcelFile = null;

    setupDropZone('excel-drop-zone', 'excelFile', files => {
        if (files[0]) {
            currentExcelFile = files[0];
            showFileCard('excel-file-card', files[0], 'accent-green', 'fas fa-file-excel', () => {
                document.getElementById('excelFile').value = '';
                excelActionContainer.classList.add('hidden');
                excelDownloadBanner.classList.add('hidden');
                currentExcelFile = null;
            });
            excelActionContainer.classList.remove('hidden');
            excelDownloadBanner.classList.add('hidden');
        }
    });

    startExcelBtn?.addEventListener('click', () => {
        if (currentExcelFile) {
            excelActionContainer.classList.add('hidden');
            handleOfficeConvert(currentExcelFile, 'xlsx', 'excel');
        }
    });

    /* ════════════════════════════════════════════
       TOOL 5 · PPT to PDF
    ════════════════════════════════════════════ */
    const pptLoader = document.getElementById('ppt-loader');
    const pptDownloadBanner = document.getElementById('ppt-download-banner');
    const pptDownloadBtn = document.getElementById('ppt-download-btn');
    const pptActionContainer = document.getElementById('ppt-action-container');
    const startPptBtn = document.getElementById('start-ppt-btn');
    let currentPptFile = null;

    setupDropZone('ppt-drop-zone', 'pptFile', files => {
        if (files[0]) {
            currentPptFile = files[0];
            showFileCard('ppt-file-card', files[0], 'accent-orange', 'fas fa-file-powerpoint', () => {
                document.getElementById('pptFile').value = '';
                pptActionContainer.classList.add('hidden');
                pptDownloadBanner.classList.add('hidden');
                currentPptFile = null;
            });
            pptActionContainer.classList.remove('hidden');
            pptDownloadBanner.classList.add('hidden');
        }
    });

    startPptBtn?.addEventListener('click', () => {
        if (currentPptFile) {
            pptActionContainer.classList.add('hidden');
            handleOfficeConvert(currentPptFile, 'pptx', 'ppt');
        }
    });

    /* Reusable Office Converter (Word, Excel, PPT) via ConvertAPI */
    async function handleOfficeConvert(file, fromExt, toolPrefix) {
        const loader = document.getElementById(`${toolPrefix}-loader`);
        const banner = document.getElementById(`${toolPrefix}-download-banner`);
        const btn    = document.getElementById(`${toolPrefix}-download-btn`);
        const cardId = `${toolPrefix}-file-card`;

        updateFileCardStatus(cardId, 'Processing...');
        loader.classList.remove('hidden');
        banner.classList.add('hidden');

        try {
            const CONVERT_API_SECRET = 'KgInQw3FbUZG1opX6VTqE9EyXsQzMB57';
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const response = await fetch(
                `https://v2.convertapi.com/convert/${fromExt}/to/pdf?Secret=${CONVERT_API_SECRET}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Parameters: [
                            { Name: 'File', FileValue: { Name: file.name, Data: base64 } },
                            { Name: 'StoreFile', Value: true }
                        ]
                    })
                }
            );

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const pdfResponse = await fetch(data.Files[0].Url);
            const pdfBlob = await pdfResponse.blob();

            btn.href = URL.createObjectURL(pdfBlob);
            btn.download = file.name.substring(0, file.name.lastIndexOf('.')) + '.pdf';
            updateFileCardStatus(cardId, 'Completed');
            loader.classList.add('hidden');
            banner.classList.remove('hidden');
            showToast('✅ Conversion successful!');

        } catch (err) {
            console.error('ConvertAPI failed:', err);
            // Local fallback only for Word
            if (fromExt === 'docx') {
                handleWordLocalFallback(file);
            } else {
                updateFileCardStatus(cardId, 'Error', true);
                loader.classList.add('hidden');
                showToast('Conversion failed. Check your internet.', true);
            }
        }
    }

    async function handleWordLocalFallback(file) {
        updateFileCardStatus('word-file-card', 'Processing (Local)...');
        try {
            const buf = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: buf });
            const styledHtml = `<style>body{font-family:serif;padding:50px;}</style>${result.value}`;
            const container = document.createElement('div');
            container.innerHTML = styledHtml;
            document.body.appendChild(container);
            const pdfBlob = await html2pdf().from(container).set({ margin:10 }).output('blob');
            document.body.removeChild(container);
            wordDownloadBtn.href = URL.createObjectURL(pdfBlob);
            wordDownloadBtn.download = file.name.replace('.docx', '.pdf');
            updateFileCardStatus('word-file-card', 'Completed');
            wordLoader.classList.add('hidden');
            wordDownloadBanner.classList.remove('hidden');
            showToast('⚠️ Converted locally.');
        } catch (e) {
            updateFileCardStatus('word-file-card', 'Error', true);
            wordLoader.classList.add('hidden');
            showToast('Local conversion failed.', true);
        }
    }

    /* ════════════════════════════════════════════
       TOOL 6 · Merge PDF
    ════════════════════════════════════════════ */
    let mergeFiles = [];
    const mergeListSection   = document.getElementById('merge-list-section');
    const mergeFileList      = document.getElementById('merge-file-list');
    const mergeCount         = document.getElementById('merge-count');
    const mergeLoader        = document.getElementById('merge-loader');
    const mergeDownloadBanner = document.getElementById('merge-download-banner');
    const mergeDownloadBtn   = document.getElementById('merge-download-btn');

    setupDropZone('merge-drop-zone', 'mergeFiles', files => {
        if (files.length > 0) {
            const label = files.length === 1 ? files[0].name : `${files.length} PDFs selected`;
            const fakeFile = { name: label, size: Array.from(files).reduce((s,f) => s+f.size, 0) };
            showFileCard('merge-file-card', fakeFile, 'accent-violet', 'fas fa-object-group', () => {
                mergeFiles = [];
                renderMergeList();
                document.getElementById('mergeFiles').value = '';
            });
        }
        addMergeFiles(files);
    });

    document.getElementById('add-more-files-btn')?.addEventListener('click', () => {
        document.getElementById('mergeFiles').click();
    });

    function addMergeFiles(files) {
        Array.from(files).forEach(f => { if (f.type === 'application/pdf') mergeFiles.push(f); });
        renderMergeList();
    }

    function renderMergeList() {
        mergeFileList.innerHTML = mergeFiles.map((f, i) => `
            <div class="merge-file-item">
                <span><i class="fas fa-file-pdf" style="color:#e11d48; margin-right:8px;"></i>${f.name}</span>
                <button class="btn btn-danger btn-sm" data-midx="${i}"><i class="fas fa-trash"></i></button>
            </div>`).join('');
        mergeCount.textContent = mergeFiles.length;
        mergeListSection.classList.toggle('hidden', mergeFiles.length === 0);
        mergeDownloadBanner.classList.add('hidden');
    }

    mergeFileList.addEventListener('click', e => {
        const btn = e.target.closest('[data-midx]');
        if (btn) { mergeFiles.splice(+btn.dataset.midx, 1); renderMergeList(); }
    });

    document.getElementById('merge-btn')?.addEventListener('click', async () => {
        if (mergeFiles.length < 2) return showToast('Select at least 2 PDF files.', true);
        mergeLoader.classList.remove('hidden');
        mergeDownloadBanner.classList.add('hidden');
        try {
            const { PDFDocument } = PDFLib;
            const merged = await PDFDocument.create();
            for (const f of mergeFiles) {
                const buf = await f.arrayBuffer();
                const doc = await PDFDocument.load(buf.slice(0));
                const pages = await merged.copyPages(doc, doc.getPageIndices());
                pages.forEach(p => merged.addPage(p));
            }
            const bytes = await merged.save();
            const blob  = new Blob([bytes], { type: 'application/pdf' });
            mergeDownloadBtn.href = URL.createObjectURL(blob);
            mergeLoader.classList.add('hidden');
            mergeDownloadBanner.classList.remove('hidden');
            showToast('✅ PDFs merged!');
        } catch (err) {
            console.error(err);
            mergeLoader.classList.add('hidden');
            showToast('Error merging files.', true);
        }
    });

    /* ════════════════════════════════════════════
       TOOL 7 · Edit PDF (Rotate + Delete + Annotate)
    ════════════════════════════════════════════ */
    let editBuffer   = null;
    let editState    = [];   // [{ rotation, deleted, annotations[] }]
    let editingPage  = -1;

    const editLoader    = document.getElementById('edit-loader');
    const editWorkspace = document.getElementById('edit-workspace');
    const pagesGrid     = document.getElementById('pages-grid');

    /* Modal refs */
    const annoModal    = document.getElementById('anno-modal');
    const annoCanvas   = document.getElementById('anno-canvas');
    const annoOverlays = document.getElementById('anno-overlays');
    const annoFontSize = document.getElementById('anno-font-size');
    const annoColor    = document.getElementById('anno-color');

    setupDropZone('edit-drop-zone', 'editFile', files => {
        if (files[0]) showFileCard('edit-file-card', files[0], 'accent-red', 'fas fa-edit', () => {
            document.getElementById('editFile').value = '';
            editWorkspace.classList.add('hidden');
            editBuffer = null;
        });
        handleEdit(files[0]);
    });

    async function handleEdit(file) {
        if (!file || file.type !== 'application/pdf') return showToast('Please select a PDF.', true);
        document.getElementById('edit-filename').textContent = file.name;
        editLoader.classList.remove('hidden');
        editWorkspace.classList.add('hidden');
        try {
            editBuffer = await file.arrayBuffer();
            const pdf  = await pdfjsLib.getDocument({ data: editBuffer.slice(0) }).promise;
            editState  = Array.from({ length: pdf.numPages }, () => ({ rotation: 0, deleted: false, annotations: [] }));
            await renderEditGrid();
            editLoader.classList.add('hidden');
            editWorkspace.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            showToast('Error loading PDF.', true);
        }
    }

    document.getElementById('edit-reset-btn')?.addEventListener('click', () => {
        editWorkspace.classList.add('hidden');
        document.getElementById('editFile').value = '';
        editBuffer = null;
        clearFileCard('edit-file-card');
        showToast('Editor reset.');
    });

    async function renderEditGrid() {
        const pdf = await pdfjsLib.getDocument({ data: editBuffer.slice(0) }).promise;
        pagesGrid.innerHTML = '';
        for (let i = 0; i < pdf.numPages; i++) {
            if (editState[i].deleted) continue;
            const page     = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 0.4, rotation: editState[i].rotation });
            const canvas   = document.createElement('canvas');
            const ctx      = canvas.getContext('2d');
            canvas.width   = viewport.width;
            canvas.height  = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;

            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `<div class="page-card-info">Page ${i + 1}</div>
                <div class="page-card-actions">
                    <button class="btn btn-secondary btn-sm" title="Annotate" data-action="annotate" data-page="${i}"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-secondary btn-sm" title="Rotate" data-action="rotate" data-page="${i}"><i class="fas fa-sync-alt"></i></button>
                    <button class="btn btn-danger btn-sm" title="Delete" data-action="delete" data-page="${i}"><i class="fas fa-trash"></i></button>
                </div>`;
            card.insertBefore(canvas, card.firstChild);
            pagesGrid.appendChild(card);
        }
    }

    pagesGrid.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const idx    = +btn.dataset.page;
        if (action === 'rotate') {
            editState[idx].rotation = (editState[idx].rotation + 90) % 360;
            renderEditGrid();
            showToast('Page rotated.');
        } else if (action === 'delete') {
            if (confirm('Delete this page?')) {
                editState[idx].deleted = true;
                renderEditGrid();
                showToast('Page deleted.');
            }
        } else if (action === 'annotate') {
            openAnnotationModal(idx);
        }
    });

    let currentZoom = 1;
    async function renderAnnoPage(pageIdx, zoom) {
        const pdf      = await pdfjsLib.getDocument({ data: editBuffer.slice(0) }).promise;
        const page     = await pdf.getPage(pageIdx + 1);
        const containerH = window.innerHeight * 0.75; 
        const unscaledVP = page.getViewport({ scale: 1 });
        const fitScale   = (containerH / unscaledVP.height) * zoom;
        const viewport   = page.getViewport({ scale: fitScale });
        
        annoCanvas.width  = viewport.width;
        annoCanvas.height = viewport.height;
        await page.render({ canvasContext: annoCanvas.getContext('2d'), viewport }).promise;
        document.getElementById('anno-zoom-val').textContent = Math.round(zoom * 100) + '%';
    }

    /* ── Annotation Modal ── */
    async function openAnnotationModal(pageIdx) {
        editingPage = pageIdx;
        currentZoom = 1;
        const pageNumSpan = document.getElementById('modal-page-num');
        if (pageNumSpan) pageNumSpan.textContent = pageIdx + 1;
        
        await renderAnnoPage(pageIdx, currentZoom);

        /* Restore saved annotations */
        annoOverlays.innerHTML = '';
        if (editState[pageIdx].annotations) {
            editState[pageIdx].annotations.forEach(a => annoOverlays.appendChild(createAnnoEl(a)));
        }

        annoModal.classList.remove('hidden');
    }

    document.getElementById('anno-zoom-in')?.addEventListener('click', () => {
        currentZoom += 0.1;
        renderAnnoPage(editingPage, currentZoom);
    });
    document.getElementById('anno-zoom-out')?.addEventListener('click', () => {
        if (currentZoom > 0.5) {
            currentZoom -= 0.1;
            renderAnnoPage(editingPage, currentZoom);
        }
    });

    document.getElementById('anno-close')?.addEventListener('click', () => annoModal.classList.add('hidden'));

    document.getElementById('anno-add-text')?.addEventListener('click', () => {
        annoOverlays.appendChild(createAnnoEl({
            type: 'text', x: 10, y: 10, w: 30, h: 8,
            color: document.getElementById('anno-color').value, 
            fontSize: parseInt(document.getElementById('anno-font-size').value) || 24, 
            text: 'Your text here'
        }));
    });

    document.getElementById('anno-add-rect')?.addEventListener('click', () => {
        annoOverlays.appendChild(createAnnoEl({
            type: 'rect', x: 20, y: 20, w: 20, h: 15, 
            color: document.getElementById('anno-color').value,
            opacity: parseFloat(document.getElementById('anno-opacity').value) || 0.4,
            borderWidth: parseInt(document.getElementById('anno-border').value) || 2
        }));
    });

    document.getElementById('anno-add-circle')?.addEventListener('click', () => {
        annoOverlays.appendChild(createAnnoEl({
            type: 'circle', x: 25, y: 25, w: 15, h: 15, 
            color: document.getElementById('anno-color').value,
            opacity: parseFloat(document.getElementById('anno-opacity').value) || 0.4,
            borderWidth: parseInt(document.getElementById('anno-border').value) || 2
        }));
    });

    document.getElementById('anno-add-line')?.addEventListener('click', () => {
        annoOverlays.appendChild(createAnnoEl({
            type: 'line', x: 30, y: 30, w: 20, h: 2, 
            color: document.getElementById('anno-color').value,
            opacity: 1,
            borderWidth: parseInt(document.getElementById('anno-border').value) || 2
        }));
    });

    document.getElementById('anno-add-image')?.addEventListener('click', () => {
        document.getElementById('anno-image-input').click();
    });

    document.getElementById('anno-image-input')?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            annoOverlays.appendChild(createAnnoEl({
                type: 'image', x: 25, y: 25, w: 25, h: 25, 
                src: ev.target.result
            }));
            e.target.value = ''; 
        };
        reader.readAsDataURL(file);
    });

    function createAnnoEl(data) {
        const el = document.createElement('div');
        el.dataset.type = data.type;
        el.dataset.opacity = data.opacity || 1;
        el.dataset.borderWidth = data.borderWidth || 2;
        el.dataset.color = data.color || '#6366f1';
        el.dataset.src = data.src || '';
        
        el.style.cssText = `position:absolute; left:${data.x}%; top:${data.y}%;
            width:${data.w}%; height:${data.h}%; pointer-events:auto; cursor:move;
            box-sizing:border-box;`;

        if (data.type === 'circle') {
            el.style.borderRadius = '50%';
            el.style.border = `${el.dataset.borderWidth}px solid ${el.dataset.color}`;
            el.style.background = hexToRgba(el.dataset.color, el.dataset.opacity);
        } else if (data.type === 'rect') {
            el.style.borderRadius = '4px';
            el.style.border = `${el.dataset.borderWidth}px solid ${el.dataset.color}`;
            el.style.background = hexToRgba(el.dataset.color, el.dataset.opacity);
        } else if (data.type === 'line') {
            el.style.height = el.dataset.borderWidth + 'px';
            el.style.border = 'none';
            el.style.background = el.dataset.color;
        } else if (data.type === 'image') {
            el.style.backgroundImage = `url(${data.src})`;
            el.style.backgroundSize = 'contain';
            el.style.backgroundRepeat = 'no-repeat';
            el.style.backgroundPosition = 'center';
            el.style.border = '1px dashed #6366f1';
        }

        if (data.type === 'text') {
            el.style.border = 'none';
            el.contentEditable = true;
            el.innerText = data.text || 'Type something...';
            el.style.fontSize  = (data.fontSize || 24) + 'px';
            el.style.color     = el.dataset.color;
            el.style.background = 'transparent';
            el.style.padding   = '4px';
            el.style.minWidth  = '50px';
            el.style.fontWeight = '700';
            el.style.overflow  = 'hidden';
            el.style.outline   = 'none';
        } else if (data.type !== 'line' && data.type !== 'image' && data.type !== 'circle' && data.type !== 'rect') {
            el.style.background = hexToRgba(el.dataset.color, el.dataset.opacity);
        }

        /* Drag logic */
        el.addEventListener('mousedown', e => {
            if (e.target.tagName === 'BUTTON') return; // Only buttons (delete) prevent drag
            
            // If it's text, we only prevent drag if they are actually typing/selecting
            // But to make it easy to move, we'll allow dragging from anywhere
            const rect = annoCanvas.getBoundingClientRect();
            const startX = e.clientX, startY = e.clientY;
            const origL  = parseFloat(el.style.left), origT = parseFloat(el.style.top);
            
            const onMove = ev => {
                const dx = ((ev.clientX - startX) / rect.width) * 100;
                const dy = ((ev.clientY - startY) / rect.height) * 100;
                el.style.left = Math.max(0, Math.min(100 - parseFloat(el.style.width), origL + dx)) + '%';
                el.style.top  = Math.max(0, Math.min(100 - parseFloat(el.style.height), origT + dy)) + '%';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        /* Delete button */
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        delBtn.style.cssText = 'position:absolute;top:-14px;right:-14px;background:#ef4444;color:white;border:none;border-radius:10px;width:32px;height:32px;cursor:pointer;font-size:0.9rem;display:none;z-index:110;box-shadow:0 5px 15px rgba(239,68,68,0.4);';
        delBtn.onclick = (e) => { e.stopPropagation(); el.remove(); };
        el.appendChild(delBtn);

        /* 8-Point Resize Handles */
        const handles = [
            { pos: 'top-left', cursor: 'nw-resize', top: -5, left: -5 },
            { pos: 'top-right', cursor: 'ne-resize', top: -5, right: -5 },
            { pos: 'bottom-left', cursor: 'sw-resize', bottom: -5, left: -5 },
            { pos: 'bottom-right', cursor: 'se-resize', bottom: -5, right: -5 },
            { pos: 'top', cursor: 'n-resize', top: -5, left: '50%' },
            { pos: 'bottom', cursor: 's-resize', bottom: -5, left: '50%' },
            { pos: 'left', cursor: 'w-resize', left: -5, top: '50%' },
            { pos: 'right', cursor: 'e-resize', right: -5, top: '50%' }
        ];

        handles.forEach(h => {
            const hnd = document.createElement('div');
            hnd.style.cssText = `position:absolute; width:10px; height:10px; background:white; border:2px solid #6366f1; border-radius:50%; z-index:105; cursor:${h.cursor}; display:none;`;
            if (h.top !== undefined) hnd.style.top = typeof h.top === 'string' ? h.top : h.top + 'px';
            if (h.bottom !== undefined) hnd.style.bottom = typeof h.bottom === 'string' ? h.bottom : h.bottom + 'px';
            if (h.left !== undefined) hnd.style.left = typeof h.left === 'string' ? h.left : h.left + 'px';
            if (h.right !== undefined) hnd.style.right = typeof h.right === 'string' ? h.right : h.right + 'px';
            if (h.pos.includes('50%')) hnd.style.transform = 'translate(-50%, -50%)';

            hnd.addEventListener('mousedown', e => {
                e.stopPropagation(); e.preventDefault();
                const rect = annoCanvas.getBoundingClientRect();
                const startX = e.clientX, startY = e.clientY;
                const startW = el.offsetWidth, startH = el.offsetHeight;
                const startL = el.offsetLeft, startT = el.offsetTop;

                const onMove = ev => {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;

                    if (h.pos.includes('right')) el.style.width = ((startW + dx) / rect.width) * 100 + '%';
                    if (h.pos.includes('bottom')) el.style.height = ((startH + dy) / rect.height) * 100 + '%';
                    if (h.pos.includes('left')) {
                        el.style.width = ((startW - dx) / rect.width) * 100 + '%';
                        el.style.left = ((startL + dx) / rect.width) * 100 + '%';
                    }
                    if (h.pos.includes('top')) {
                        el.style.height = ((startH - dy) / rect.height) * 100 + '%';
                        el.style.top = ((startT + dy) / rect.height) * 100 + '%';
                    }
                };
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });

            el.addEventListener('mouseenter', () => hnd.style.display = 'block');
            el.addEventListener('mouseleave', () => hnd.style.display = 'none');
            el.appendChild(hnd);
        });

        el.addEventListener('mouseenter', () => delBtn.style.display = 'block');
        el.addEventListener('mouseleave', () => delBtn.style.display = 'none');

        return el;
    }

    document.getElementById('anno-save')?.addEventListener('click', () => {
        const annos = [];
        annoOverlays.querySelectorAll('div[data-type]').forEach(el => {
            annos.push({
                type: el.dataset.type,
                x: parseFloat(el.style.left),
                y: parseFloat(el.style.top),
                w: (el.offsetWidth  / annoCanvas.width)  * 100,
                h: (el.offsetHeight / annoCanvas.height) * 100,
                color: el.dataset.color,
                fontSize: parseInt(el.style.fontSize) || 24,
                text: el.innerText || '',
                opacity: parseFloat(el.dataset.opacity) || 1,
                borderWidth: parseInt(el.dataset.borderWidth) || 2,
                src: el.dataset.src || ''
            });
        });
        editState[editingPage].annotations = annos;
        annoModal.classList.add('hidden');
        showToast('✅ Changes applied to page.');
    });

    /* ── Save Edited PDF ── */
    document.getElementById('edit-save-btn')?.addEventListener('click', async () => {
        showToast('Saving changes to PDF...');
        try {
            const { PDFDocument, degrees, rgb, StandardFonts } = PDFLib;
            const pdfDoc = await PDFDocument.load(editBuffer.slice(0));
            const pages  = pdfDoc.getPages();
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            for (let i = 0; i < editState.length; i++) {
                const state = editState[i];
                const page  = pages[i];
                
                // Handle Rotation
                if (state.rotation) {
                    page.setRotation(degrees((page.getRotation().angle + state.rotation) % 360));
                }

                // Apply Annotations
                for (const a of state.annotations) {
                    const { width, height } = page.getSize();
                    
                    // High-precision coordinate mapping
                    const pdfX = (a.x / 100) * width;
                    const pdfY = height - (a.y / 100) * height;
                    const pdfW = (a.w / 100) * width;
                    const pdfH = (a.h / 100) * height;
                    
                    const col = hexToRgbFloat(a.color);

                    if (a.type === 'rect') {
                        page.drawRectangle({
                            x: pdfX,
                            y: pdfY - pdfH,
                            width: pdfW,
                            height: pdfH,
                            color: rgb(col.r, col.g, col.b),
                            opacity: a.opacity || 0.4,
                            borderWidth: a.borderWidth || 2,
                            borderColor: rgb(col.r, col.g, col.b)
                        });
                    } else if (a.type === 'circle') {
                        page.drawEllipse({
                            x: pdfX + (pdfW / 2),
                            y: pdfY - (pdfH / 2),
                            xRadius: pdfW / 2,
                            yRadius: pdfH / 2,
                            color: rgb(col.r, col.g, col.b),
                            opacity: a.opacity || 0.4,
                            borderWidth: a.borderWidth || 2,
                            borderColor: rgb(col.r, col.g, col.b)
                        });
                    } else if (a.type === 'line') {
                        page.drawLine({
                            start: { x: pdfX, y: pdfY - (pdfH / 2) },
                            end: { x: pdfX + pdfW, y: pdfY - (pdfH / 2) },
                            thickness: a.borderWidth || 2,
                            color: rgb(col.r, col.g, col.b),
                            opacity: a.opacity || 1
                        });
                    } else if (a.type === 'image' && a.src) {
                        try {
                            const imgBytes = await fetch(a.src).then(res => res.arrayBuffer());
                            const isPng = a.src.includes('image/png');
                            const pdfImg = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
                            page.drawImage(pdfImg, {
                                x: pdfX,
                                y: pdfY - pdfH,
                                width: pdfW,
                                height: pdfH
                            });
                        } catch (imgErr) {
                            console.error('Image embed error:', imgErr);
                        }
                    } else if (a.type === 'text') {
                        page.drawText(a.text, {
                            x: pdfX + 5,
                            y: pdfY - (pdfH / 2) - 5, 
                            size: (a.fontSize || 24) * (width / 600), 
                            font: helveticaFont,
                            color: rgb(col.r, col.g, col.b)
                        });
                    }
                }
            }

            // Remove deleted pages
            for (let i = editState.length - 1; i >= 0; i--) {
                if (editState[i].deleted) pdfDoc.removePage(i);
            }

            const bytes = await pdfDoc.save();
            const blob  = new Blob([bytes], { type: 'application/pdf' });
            const url   = URL.createObjectURL(blob);
            const link  = document.createElement('a');
            link.href = url;
            const originalName = document.getElementById('edit-filename').textContent;
            link.download = `edited_${originalName}`;
            link.click();
            
            showToast('✅ PDF Saved Successfully!');
        } catch (err) {
            console.error('Save error:', err);
            showToast('Error saving PDF file.', true);
        }
    });

    /* ─── Color Helpers ─── */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    function hexToRgbFloat(hex) {
        return {
            r: parseInt(hex.slice(1,3), 16) / 255,
            g: parseInt(hex.slice(3,5), 16) / 255,
            b: parseInt(hex.slice(5,7), 16) / 255
        };
    }

    /* ════════════════════════════════════════════
       TOOL 8 · Lock PDF (Password Protect)
    ════════════════════════════════════════════ */
    let lockBuffer = null;

    const lockForm         = document.getElementById('lock-form');
    const lockLoader       = document.getElementById('lock-loader');
    const lockDownloadBanner = document.getElementById('lock-download-banner');
    const lockDownloadBtn  = document.getElementById('lock-download-btn');

    const lockActionContainer = document.getElementById('lock-action-container');
    const startLockBtn        = document.getElementById('start-lock-btn');

    setupDropZone('lock-drop-zone', 'lockFile', files => {
        if (files[0]) {
            lockBuffer = null; // reset
            showFileCard('lock-file-card', files[0], 'accent-amber', 'fas fa-lock', () => {
                document.getElementById('lockFile').value = '';
                lockForm.classList.add('hidden');
                lockDownloadBanner.classList.add('hidden');
                lockActionContainer.classList.add('hidden');
                lockBuffer = null;
            });
            lockActionContainer.classList.remove('hidden');
            lockForm.classList.add('hidden');
            lockDownloadBanner.classList.add('hidden');
            
            // Still need to load the buffer for handleLockFile to work later
            const reader = new FileReader();
            reader.onload = e => { lockBuffer = e.target.result; document.getElementById('lock-filename').textContent = files[0].name; };
            reader.readAsArrayBuffer(files[0]);
        }
    });

    startLockBtn?.addEventListener('click', () => {
        if (lockBuffer) {
            lockActionContainer.classList.add('hidden');
            lockForm.classList.remove('hidden');
        }
    });

    document.getElementById('lock-btn')?.addEventListener('click', async () => {
        const pwd     = document.getElementById('lock-password').value;
        const confirm = document.getElementById('lock-password-confirm').value;

        if (!pwd)          return showToast('Please enter a password.', true);
        if (pwd !== confirm) return showToast('Passwords do not match!', true);
        if (pwd.length < 4) return showToast('Password must be at least 4 characters.', true);

        updateFileCardStatus('lock-file-card', 'Processing...');
        lockLoader.classList.remove('hidden');
        lockForm.classList.add('hidden');
        lockDownloadBanner.classList.add('hidden');

        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.load(lockBuffer.slice(0), { ignoreEncryption: true });

            // PDF-lib encrypts with user & owner password
            const pdfBytes = await pdfDoc.save({
                userPassword: pwd,
                ownerPassword: pwd + '_owner',
                permissions: {
                    printing: 'highResolution',
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: true,
                    documentAssembly: false,
                },
            });

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            lockDownloadBtn.href = URL.createObjectURL(blob);
            updateFileCardStatus('lock-file-card', 'Completed');
            lockLoader.classList.add('hidden');
            lockDownloadBanner.classList.remove('hidden');
            showToast('🔒 PDF locked successfully!');
        } catch (err) {
            console.error(err);
            lockLoader.classList.add('hidden');
            lockForm.classList.remove('hidden');
            showToast('Error encrypting PDF. Try another file.', true);
        }
    });

    /* ─── Utility: Color Conversion ─── */
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function hexToRgbFloat(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return { r, g, b };
    }

}); /* end DOMContentLoaded */

