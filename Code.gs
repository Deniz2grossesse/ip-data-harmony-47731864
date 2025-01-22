function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Network Rules Manager')
    .setFaviconUrl('https://www.google.com/images/favicon.ico');
}

function showNetworkRulesUI() {
  const html = HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Network Rules Manager')
    .setWidth(1000)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Gestionnaire de règles réseau');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function renderTopologyView(rules) {
  const template = HtmlService.createTemplate(
    `<div id="topology-root"></div>
    <script>
      const rules = <?= JSON.stringify(rules) ?>;
      // React rendering logic would go here
    </script>`
  );
  template.rules = rules;
  return template.evaluate().getContent();
}
