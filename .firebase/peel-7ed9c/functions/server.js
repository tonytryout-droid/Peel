const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrpeel7ed9c = onRequest({"region":"us-central1"}, (req, res) => server.then(it => it.handle(req, res)));
  