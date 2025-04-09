export const mockInteractions = {
  dashboard: {
    title_i18n: "tour.dashboard.title",
    components: [
      { type: 'chart', data_i18n: "tour.dashboard.chartData" },
      { type: 'leaderboard', data_i18n: "tour.dashboard.leaderboardData" },
      { type: 'xp', value: 1250, data_i18n: "tour.dashboard.xpLabel" },
      { type: 'card', title_i18n: "tour.dashboard.card1Title", content_i18n: "tour.dashboard.card1Content" },
      { type: 'card', title_i18n: "tour.dashboard.card2Title", content_i18n: "tour.dashboard.card2Content" },
    ]
  },
  onChainAnalysis: {
    title_i18n: "tour.onChain.title",
    chartType: 'bar', // or 'line'
    data_i18n: "tour.onChain.chartData",
    tooltip_i18n: "tour.onChain.tooltip",
    explanation_i18n: "tour.onChain.explanation"
  },
  customAlerts: {
    title_i18n: "tour.alerts.title",
    form_i18n: "tour.alerts.formContent",
    successMessage_i18n: "tour.alerts.success"
  },
  whaleTracker: {
    title_i18n: "tour.whaleTracker.title",
    feed_i18n: "tour.whaleTracker.feed", // Array of simulated movements
    terminal: {
      command: "$ whale-tracker --watch ORDI --limit 5",
      monitoring_i18n: "tour.whaleTracker.terminal.monitoring",
      activity_i18n_prefix: "tour.whaleTracker.terminal.activity" // Key prefix for activity lines
    }
  }
};

// REMOVED Placeholder helper function `t`. Assuming a global function like `window.translate(key, lang, replacements)` is available.
// Make sure to load your main language script BEFORE TourSimulator. 