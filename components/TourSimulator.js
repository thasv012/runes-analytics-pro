import { WhaleTrackerSimulator } from './WhaleTrackerSimulator.js';
import { mockInteractions } from '../data/mock-interactions.js';

// Assumes a global translation function exists, e.g., window.translate(key, lang, replacements)
// Ensure your language script (e.g., js/language.js) is loaded before this script
// and defines the global translation function.
const translate = window.translate || function(key, lang, replacements = {}) { 
    console.warn('Global translate function not found. Using key as fallback.'); 
    let text = key;
    for (const placeholder in replacements) {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        text = text.replace(regex, replacements[placeholder]);
    }
    return text; 
}; 

export class TourSimulator {
    constructor(containerId, buttonsSelector, language = 'en') {
        this.container = document.getElementById(containerId);
        this.buttons = document.querySelectorAll(buttonsSelector);
        this.buttonsSelector = buttonsSelector;
        this.language = language;
        this.activeSimulation = null;
        this.currentTimeout = null;
        this.simulationContentElements = {};
        this.whaleSimulatorInstance = null;
        this.simulationOrder = ['dashboard', 'onChainAnalysis', 'customAlerts', 'whaleTracker'];
        this.currentSimIndex = -1;
        this.pitchIntervalSeconds = 8;
        this.pitchTimeoutId = null;
        this.isPitchMode = false;
        this.positionIndicator = null;

        // --- Recording State ---
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.screenStream = null;
        this.isRecording = false;

        // --- Analytics Dashboard State ---
        this.analyticsModal = null;
        this.analyticsChartInstance = null;

        // Analytics Setup (using localStorage)
        window.TourAnalytics = window.TourAnalytics || {
            storageKey: 'tourAnalyticsEvents',
            log: (event, data = {}) => {
                const eventData = {
                    action: event,
                    timestamp: new Date().toISOString(),
                    details: data
                };
                console.log(`[TourAnalytics] Event: ${event}`, eventData);
                try {
                    let existingEvents = [];
                    const storedData = localStorage.getItem(this.storageKey);
                    if (storedData) {
                        try {
                             existingEvents = JSON.parse(storedData);
                             if (!Array.isArray(existingEvents)) existingEvents = [];
                        } catch (parseError) {
                             console.error("[TourAnalytics] Error parsing stored events:", parseError);
                             existingEvents = [];
                        }
                    }
                    existingEvents.push(eventData);
                    localStorage.setItem(this.storageKey, JSON.stringify(existingEvents));
                } catch (storageError) {
                    console.error("[TourAnalytics] Error saving event to localStorage:", storageError);
                }
            },
            exportData: () => {
                 try {
                    const storedData = localStorage.getItem(this.storageKey);
                    if (!storedData || storedData === '[]') {
                        alert('No analytics data found to export.'); return;
                    }
                    const blob = new Blob([storedData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'tour_analytics_export.json';
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    console.log('[TourAnalytics] Data exported.');
                 } catch (e) {
                     console.error('[TourAnalytics] Failed to export data:', e);
                     alert('Failed to export analytics data.');
                 }
            },
             clearData: () => {
                 if(confirm('Are you sure you want to clear the stored tour analytics data?')) {
                     try {
                         localStorage.removeItem(this.storageKey);
                         console.log('[TourAnalytics] Data cleared.');
                         alert('Analytics data cleared.');
                     } catch (e) {
                          console.error('[TourAnalytics] Failed to clear data:', e);
                          alert('Failed to clear analytics data.');
                     }
                 }
             }
        };
        // Ensure context is bound
        window.TourAnalytics.log = window.TourAnalytics.log.bind(window.TourAnalytics);
        window.TourAnalytics.exportData = window.TourAnalytics.exportData.bind(window.TourAnalytics);
        window.TourAnalytics.clearData = window.TourAnalytics.clearData.bind(window.TourAnalytics);

        if (!this.container) {
            console.error(`TourSimulator: Container with ID "${containerId}" not found.`);
            return;
        }

        // Pitch Mode Check
        try {
             const urlParams = new URLSearchParams(window.location.search);
             this.isPitchMode = urlParams.get('mode') === 'pitch';
        } catch (e) { console.warn('Could not parse URL parameters for pitch mode check.'); }

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        this.addCloseButton();
        this.addNavigationButtons();

        this.buttons = document.querySelectorAll(this.buttonsSelector);

        if (this.isPitchMode) {
            console.log('[Tour] Pitch Mode Activated');
            window.TourAnalytics.log('tour-pitch-mode-start');
            this.container.classList.add('pitch-mode');
            this.addRecordButton();

            const tourButtonContainer = this.buttons[0]?.closest('.list-group');
             if(tourButtonContainer) tourButtonContainer.style.display = 'none';

             this.updateNavigation();
             setTimeout(() => this.startPitchMode(), 1000);
        } else {
             this.buttons.forEach(button => {
                 button.addEventListener('click', () => {
                     if (this.isPitchMode) return;
                     const simType = button.dataset.simulates;
                     if (simType) {
                         window.TourAnalytics.log('tour-button-click', { type: simType });
                         this.updateButtonActiveState(simType);
                         this.showSimulation(simType);
                     }
                 });
             });
             this.updateNavigation();
        }
        console.log('TourSimulator initialized');
    }

    startPitchMode() {
        if (!this.isPitchMode) return;
        console.log('[Tour] Starting pitch sequence...');
        this.currentSimIndex = -1;
        this.advancePitch();
    }

    advancePitch() {
        if (!this.isPitchMode || this.pitchTimeoutId === -1) return;

        clearTimeout(this.pitchTimeoutId);

        let nextIndex = this.currentSimIndex + 1;
        let validSimFound = false;
        while(nextIndex < this.simulationOrder.length) {
            const checkSimType = this.simulationOrder[nextIndex];
             const isPotentiallyValid = checkSimType === 'dashboard' || mockInteractions[checkSimType];
             if (isPotentiallyValid) {
                  validSimFound = true;
                  break;
             } else {
                  console.warn(`[Tour] Pitch Mode: Simulation data/config for '${checkSimType}' not found. Skipping.`);
                  window.TourAnalytics.log('tour-pitch-skip', { type: checkSimType, reason: 'Invalid/missing' });
                  nextIndex++;
             }
        }

        if (!validSimFound) {
             console.log('[Tour] Pitch Mode Finished or no valid simulations found.');
             window.TourAnalytics.log('tour-pitch-mode-end', { reason: 'Completed sequence' });
             this.pitchTimeoutId = -1;
             if (this.isRecording) this.stopRecording();
             return;
        }

        this.currentSimIndex = nextIndex;
        const nextSimType = this.simulationOrder[this.currentSimIndex];

        console.log(`[Tour] Pitch Mode: Advancing to ${nextSimType} (Index: ${this.currentSimIndex})`);
        window.TourAnalytics.log('tour-pitch-advance', { type: nextSimType, index: this.currentSimIndex });
        this.showSimulation(nextSimType);

        this.pitchTimeoutId = setTimeout(() => this.advancePitch(), this.pitchIntervalSeconds * 1000);
    }

    showSimulation(simType) {
        if (!this.simulationOrder.includes(simType)) { console.warn(`[Tour] Attempted to show unknown simulation type: ${simType}`); return; }

        console.log(`[Tour] Showing simulation: ${simType}`);
        if (!this.isPitchMode) window.TourAnalytics.log('tour-show', { type: simType });

        if (this.currentTimeout) clearTimeout(this.currentTimeout);

        const previouslyActiveSim = this.activeSimulation;
        if (previouslyActiveSim && previouslyActiveSim !== simType) {
             const previousContentDiv = this.simulationContentElements[previouslyActiveSim];
             if (previousContentDiv) previousContentDiv.classList.remove('active');
             if (previouslyActiveSim === 'whaleTracker' && this.whaleSimulatorInstance) {
                 this.whaleSimulatorInstance.deactivate();
             }
        }

        this.activeSimulation = simType;
        this.currentSimIndex = this.simulationOrder.indexOf(simType);

        if (this.container.style.display === 'none') {
            this.container.style.display = 'block';
            void this.container.offsetWidth;
            this.container.classList.add('active');
        } else if (!this.container.classList.contains('active')) {
             this.container.classList.add('active');
        }

        this.currentTimeout = setTimeout(() => {
            const contentDiv = this.renderSimulationContent(simType);
             if(contentDiv && !contentDiv.classList.contains('active')){
                 void contentDiv.offsetWidth;
                 contentDiv.classList.add('active');
                 if (simType === 'whaleTracker' && this.whaleSimulatorInstance) {
                      this.whaleSimulatorInstance.activate();
                 }
                 console.log(`[Tour] ${simType} content activated`);
                 if (!this.isPitchMode) window.TourAnalytics.log('tour-activated', { type: simType });
             }
             this.updateNavigation();
             this.currentTimeout = null;
        }, 50);
    }

    renderSimulationContent(simType) {
        let contentDiv = this.simulationContentElements[simType];
        if (!contentDiv) {
            contentDiv = document.createElement('div');
            contentDiv.className = `simulation-content sim-${simType} ${simType === 'dashboard' ? 'iframe-container' : ''}`;
            this.container.appendChild(contentDiv);
            this.simulationContentElements[simType] = contentDiv;
        }

        let title = contentDiv.querySelector('h3');
        const data = mockInteractions[simType];
        const titleKey = data?.title_i18n || `tour.${simType}.title`;
        if (!title) {
            title = document.createElement('h3');
            contentDiv.insertBefore(title, contentDiv.firstChild);
        }
        title.textContent = translate(titleKey, this.language);
        title.setAttribute('data-i18n', titleKey);

        const hasRendered = contentDiv.dataset.rendered === 'true';

        if (simType === 'dashboard') {
            if (!contentDiv.querySelector('iframe')) {
                 this.renderDashboardIframe(contentDiv, data);
            }
        } else if (simType === 'whaleTracker') {
            if (!this.whaleSimulatorInstance) {
                 console.log('[Tour] Initializing WhaleTrackerSimulator');
                 while (contentDiv.children.length > 1) { contentDiv.removeChild(contentDiv.lastChild); }
                 this.whaleSimulatorInstance = new WhaleTrackerSimulator(contentDiv, this.language);
                 contentDiv.dataset.rendered = 'true';
            }
        } else if (!hasRendered) {
             if (!data) {
                 console.warn(`[Tour] No mock data found for '${simType}'. Displaying basic message.`);
                 while (contentDiv.children.length > 1) { contentDiv.removeChild(contentDiv.lastChild); }
                 contentDiv.innerHTML += `<p>Content for ${simType} simulation unavailable.</p>`;
                 window.TourAnalytics.log('tour-render-fail', { type: simType, reason: 'Data missing' });
             } else {
                  switch (simType) {
                      case 'onChainAnalysis': this.renderOnChainAnalysis(contentDiv, data); break;
                      case 'customAlerts': this.renderCustomAlerts(contentDiv, data); break;
                      default: contentDiv.innerHTML += `<p>Simulation for ${simType} not implemented yet.</p>`;
                  }
             }
             contentDiv.dataset.rendered = 'true';
        }
        return contentDiv;
    }

    addCloseButton() {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-simulation-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('data-i18n', 'tour.closeButton');
        closeBtn.title = translate('tour.closeButton.title', this.language);
        closeBtn.addEventListener('click', () => this.hideSimulation());
        this.container.appendChild(closeBtn);
    }

    addNavigationButtons() {
        this.positionIndicator = document.createElement('div');
        this.positionIndicator.className = 'tour-navigation';
        this.container.appendChild(this.positionIndicator);
    }

    updateNavigation() {
        const currentSim = this.simulationOrder[this.currentSimIndex];
        if (currentSim) {
            this.positionIndicator.textContent = `Current Simulation: ${currentSim}`;
        } else {
            this.positionIndicator.textContent = 'No simulation active';
        }
    }

    navigate(direction) {
        if (this.currentSimIndex !== -1) {
            const newIndex = (this.currentSimIndex + direction + this.simulationOrder.length) % this.simulationOrder.length;
            this.showSimulation(this.simulationOrder[newIndex]);
        }
    }

    hideSimulation() {
        console.log('[Tour] Hiding simulation');
        window.TourAnalytics.log('tour-hide', { type: this.activeSimulation, triggeredBy: this.isPitchMode ? 'pitch-end' : 'user' });

        if (this.isPitchMode && this.pitchTimeoutId !== -1) {
             clearTimeout(this.pitchTimeoutId);
             this.pitchTimeoutId = -1;
             console.log('[Tour] Pitch Mode Interrupted by close.');
             window.TourAnalytics.log('tour-pitch-mode-interrupted', { reason: 'Closed manually' });
             if (this.isRecording) this.stopRecording();
        }

        const simToHide = this.activeSimulation;
        this.activeSimulation = null;
        this.currentSimIndex = -1;

        if (simToHide) {
             const activeContent = this.simulationContentElements[simToHide];
             if (activeContent) activeContent.classList.remove('active');
             if (simToHide === 'whaleTracker' && this.whaleSimulatorInstance) {
                 this.whaleSimulatorInstance.deactivate();
             }
        }

        this.container.classList.remove('active');
        this.updateButtonActiveState(null);
        this.updateNavigation();

        this.currentTimeout = setTimeout(() => {
            if (!this.activeSimulation) this.container.style.display = 'none';
            this.currentTimeout = null;
        }, 500);
    }

    updateButtonActiveState(activeSimType) {
        this.buttons.forEach(button => {
            if (button.dataset.simulates === activeSimType) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    addRecordButton() {
        const recordButton = document.createElement('button');
        recordButton.className = 'tour-record-btn';
        recordButton.innerHTML = '⏺️ Record Pitch';
        recordButton.title = 'Record this presentation (requires screen sharing permission)';
         recordButton.onclick = () => {
             if (this.isRecording) this.stopRecording();
             else this.startRecording();
         };
         const navContainer = this.container.querySelector('.tour-navigation');
         if (navContainer) navContainer.parentNode.insertBefore(recordButton, navContainer.nextSibling);
         else this.container.appendChild(recordButton);
    }

    async startRecording() {
        if (this.isRecording) return;
        if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) {
            alert('Screen recording is not fully supported by this browser.');
            console.error('[Tour Record] Recording API not supported.');
            return;
        }

        const displayMediaOptions = { video: { mediaSource: "screen", cursor: "always" }, audio: false };
        const mimeType = 'video/webm;codecs=vp9';
         if (!MediaRecorder.isTypeSupported(mimeType)) {
             console.warn(`[Tour Record] MIME type ${mimeType} not supported, using default.`);
         }

        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            window.TourAnalytics.log('tour-record-start');
            console.log('[Tour Record] Screen access granted.');

            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(this.screenStream, { mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) this.recordedChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                console.log('[Tour Record] Recording stopped. Processing...');
                window.TourAnalytics.log('tour-record-stop', { chunks: this.recordedChunks.length });
                const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'runes-tour-pitch.webm';
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log('[Tour Record] Download initiated.');

                 if (this.screenStream) { this.screenStream.getTracks().forEach(track => track.stop()); this.screenStream = null; }
                this.isRecording = false; this.recordedChunks = []; this.mediaRecorder = null;
                this.updateRecordButtonState();
            };

            this.mediaRecorder.onerror = (event) => {
                 console.error('[Tour Record] MediaRecorder error:', event.error);
                 window.TourAnalytics.log('tour-record-error', { error: event.error.name });
                 alert(`Recording error: ${event.error.name}`);
                 this.stopRecording(true);
            };

            this.screenStream.getVideoTracks()[0].onended = () => {
                console.log('[Tour Record] Screen sharing stopped by user.');
                if (this.isRecording && this.mediaRecorder?.state === 'recording') this.stopRecording();
             };

            this.mediaRecorder.start(); this.isRecording = true;
            console.log('[Tour Record] Recording started.');
            this.updateRecordButtonState();

        } catch (err) {
            console.error('[Tour Record] Error starting screen recording:', err);
            window.TourAnalytics.log('tour-record-error', { error: err.name });
            if (err.name !== 'NotAllowedError') alert(`Could not start recording: ${err.message}`);
            this.isRecording = false; this.updateRecordButtonState();
        }
    }

    stopRecording(force = false) {
        if (!this.isRecording && !force) return;

         console.log('[Tour Record] Stopping recording...');
         if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
             this.mediaRecorder.stop();
         } else {
              if (this.screenStream) { this.screenStream.getTracks().forEach(track => track.stop()); this.screenStream = null; }
             this.isRecording = false; this.recordedChunks = []; this.mediaRecorder = null;
             this.updateRecordButtonState();
         }
    }

     updateRecordButtonState() {
         const recordButton = this.container.querySelector('.tour-record-btn');
         if (recordButton) {
              if (this.isRecording) {
                  recordButton.innerHTML = '⏹️ Stop Recording'; recordButton.title = 'Stop the recording and download';
                  recordButton.classList.add('recording');
              } else {
                  recordButton.innerHTML = '⏺️ Record Pitch'; recordButton.title = 'Record this presentation';
                  recordButton.classList.remove('recording');
              }
         }
     }

    createAnalyticsDashboard() {
         if (this.analyticsModal && this.analyticsModal.parentElement) {
             this.analyticsModal.style.display = 'flex';
             this.analyticsModal.classList.add('visible');
             this.updateAnalyticsDashboard();
             return;
         }

         window.TourAnalytics.log('tour-analytics-view');

         this.analyticsModal = document.createElement('div');
         this.analyticsModal.className = 'analytics-modal-overlay';

         const modalContent = document.createElement('div');
         modalContent.className = 'analytics-modal-content';

         const closeButton = document.createElement('button');
         closeButton.className = 'analytics-modal-close'; closeButton.innerHTML = '&times;';
         closeButton.onclick = () => this.closeAnalyticsDashboard();

         const title = document.createElement('h2'); title.textContent = 'Tour Interaction Analytics';
         const chartContainer = document.createElement('div'); chartContainer.className = 'analytics-chart-container';
         const canvas = document.createElement('canvas'); chartContainer.appendChild(canvas);
         const actionsContainer = document.createElement('div'); actionsContainer.className = 'analytics-actions';
         const exportButton = document.createElement('button'); exportButton.textContent = 'Export Raw Data';
         exportButton.onclick = () => window.TourAnalytics.exportData();
         const clearButton = document.createElement('button'); clearButton.textContent = 'Clear Data';
         clearButton.onclick = () => { window.TourAnalytics.clearData(); this.updateAnalyticsDashboard(); };
         actionsContainer.appendChild(exportButton); actionsContainer.appendChild(clearButton);

         modalContent.appendChild(closeButton); modalContent.appendChild(title);
         modalContent.appendChild(chartContainer); modalContent.appendChild(actionsContainer);
         this.analyticsModal.appendChild(modalContent);
         document.body.appendChild(this.analyticsModal);

         this.renderAnalyticsChart(canvas);

         this.analyticsModal.classList.add('visible');

         this.analyticsModal.addEventListener('click', (event) => {
            if (event.target === this.analyticsModal) this.closeAnalyticsDashboard();
         });
     }

     closeAnalyticsDashboard() {
          if (this.analyticsModal) {
             this.analyticsModal.classList.remove('visible');
          }
     }

     updateAnalyticsDashboard() {
          if (!this.analyticsModal || !this.analyticsModal.classList.contains('visible')) return;
          const canvas = this.analyticsModal.querySelector('canvas');
          if (!canvas) return;
          if (this.analyticsChartInstance) this.analyticsChartInstance.destroy();
          this.renderAnalyticsChart(canvas);
     }

     renderAnalyticsChart(canvasElement) {
         if (typeof Chart === 'undefined') {
             console.error('[Tour Analytics] Chart.js not loaded.');
             canvasElement.parentElement.innerHTML = '<p style="color: var(--tour-error);">Chart.js not found.</p>';
             return;
         }
         try {
             const storedData = localStorage.getItem(window.TourAnalytics.storageKey);
             const events = storedData ? JSON.parse(storedData) : [];
             if (!Array.isArray(events)) throw new Error("Stored data invalid");

             const simViewCounts = {};
             this.simulationOrder.forEach(sim => { simViewCounts[sim] = 0; });

             events.forEach(event => {
                 if ((event.action === 'tour-show' || event.action === 'tour-activated') && event.details?.type) {
                      const type = event.details.type;
                      if (simViewCounts.hasOwnProperty(type)) simViewCounts[type]++;
                 }
             });

             const labels = Object.keys(simViewCounts);
             const data = Object.values(simViewCounts);

             const ctx = canvasElement.getContext('2d');
             this.analyticsChartInstance = new Chart(ctx, {
                 type: 'bar',
                 data: {
                     labels: labels.map(l => mockInteractions[l]?.title_i18n ? translate(mockInteractions[l].title_i18n, this.language) : l),
                     datasets: [{
                         label: '# Views/Activations', data: data,
                         backgroundColor: ['rgba(0, 255, 255, 0.6)','rgba(255, 0, 255, 0.6)','rgba(255, 255, 0, 0.6)','rgba(0, 255, 128, 0.6)','rgba(138, 43, 226, 0.6)','rgba(255, 165, 0, 0.6)'],
                         borderColor: ['rgba(0, 255, 255, 1)','rgba(255, 0, 255, 1)','rgba(255, 255, 0, 1)','rgba(0, 255, 128, 1)','rgba(138, 43, 226, 1)','rgba(255, 165, 0, 1)'],
                         borderWidth: 1
                     }]
                 },
                 options: {
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                         legend: { display: false },
                         tooltip: { enabled: true }
                     },
                     scales: {
                         y: { 
                             beginAtZero: true,
                             grid: { color: 'rgba(255, 255, 255, 0.1)' },
                             ticks: { display: false }
                          },
                         x: {
                             grid: { display: false },
                             ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                         }
                     }
                 }
             });
         } catch (error) {
             console.error("[Tour Analytics] Error processing/rendering chart:", error);
             canvasElement.parentElement.innerHTML = `<p style="color: var(--tour-error);">Error loading analytics: ${error.message}</p>`;
         }
     }

    renderDashboardIframe(parent, data) {
        const iframe = document.createElement('iframe');
        iframe.src = data.iframe_url;
        iframe.width = '100%';
        iframe.height = '300px';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        parent.appendChild(iframe);
    }

    renderOnChainAnalysis(parent, data) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart';
        parent.appendChild(chartContainer);
        
        chartContainer.textContent = translate(data.data_i18n, this.language); 
        chartContainer.setAttribute('data-i18n', data.data_i18n);
        chartContainer.title = translate(data.tooltip_i18n, this.language, { value: 'N/A', date: 'N/A' });

        if (typeof Chart !== 'undefined') {
            chartContainer.textContent = '';
            const canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);
            this.renderSampleChart(canvas); 
        } else {
            console.warn('Chart.js not found. Displaying placeholder text for onChainAnalysis chart.');
        }

        const explanation = document.createElement('p');
        explanation.className = 'explanation';
        explanation.textContent = translate(data.explanation_i18n, this.language);
        explanation.setAttribute('data-i18n', data.explanation_i18n);
        parent.appendChild(explanation);
        parent.dataset.rendered = 'true';
    }

    renderSampleChart(canvasElement) {
        const ctx = canvasElement.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Simulated Volume',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: 'rgba(0, 255, 204, 0.7)',
                    backgroundColor: 'rgba(0, 255, 204, 0.1)',
                    borderWidth: 1,
                    tension: 0.3,
                    pointRadius: 0,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { display: false }
                     },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
                    }
                }
            }
        });
    }

    renderCustomAlerts(parent, data) {
        const form = document.createElement('div');
        form.className = 'form';
        form.textContent = translate(data.form_i18n, this.language);
        form.setAttribute('data-i18n', data.form_i18n);
        parent.appendChild(form);

        const controlsContainer = document.createElement('div');
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.marginTop = '15px';
        parent.appendChild(controlsContainer);

        const simButton = document.createElement('button');
        simButton.className = 'create-button';
        simButton.textContent = translate('tour.alerts.createButton', this.language);
        simButton.setAttribute('data-i18n', 'tour.alerts.createButton');
        controlsContainer.appendChild(simButton);

        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'feedback-container';
        controlsContainer.appendChild(feedbackContainer);

        const feedback = document.createElement('span');
        feedback.className = 'success-badge';
        feedback.textContent = translate(data.successMessage_i18n, this.language);
        feedback.setAttribute('data-i18n', data.successMessage_i18n);
        feedbackContainer.appendChild(feedback);

        simButton.onclick = () => {
            feedback.classList.add('show');
            setTimeout(() => feedback.classList.remove('show'), 2500);
        };
        parent.dataset.rendered = 'true';
    }
}

// Example Usage (in your main script or demo.html):
// window.addEventListener('DOMContentLoaded', () => {
//     const tour = new TourSimulator('tour-simulation-area', '#interactive-tour-buttons button');

//     // Optional: Language switcher example
//     const langSelector = document.getElementById('language-selector');
//     if (langSelector) {
//         langSelector.addEventListener('change', (event) => {
//             tour.setLanguage(event.target.value);
//         });
//     }
// }); 
// }); 