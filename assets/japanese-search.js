(function () {
  'use strict';

  function setupJapaneseSearch() {
    if (!window.elasticlunr || !window.search || !window.search.index) {
      setTimeout(setupJapaneseSearch, 50);
      return;
    }

    var originalSearch = window.elasticlunr.Index.prototype.search;
    window.elasticlunr.Index.prototype.search = function (query, userConfig) {
      // Run the original search first
      var results = originalSearch.call(this, query, userConfig) || [];
      var seenRefs = new Set();
      results.forEach(function (r) {
        seenRefs.add(String(r.ref));
      });

      if (!query || typeof query !== 'string') return results;
      var cleanQuery = query.trim().toLowerCase();
      if (cleanQuery.length === 0) return results;

      // Scan documentStore.docs for Japanese / substring matches
      var docs = this.documentStore && this.documentStore.docs;
      if (docs) {
        var queryTerms = cleanQuery.split(/\s+/).filter(function (t) { return t.length > 0; });
        for (var docId in docs) {
          if (!Object.prototype.hasOwnProperty.call(docs, docId)) continue;
          if (seenRefs.has(String(docId))) continue;

          var doc = docs[docId];
          var title = (doc.title || '').toLowerCase();
          var body = (doc.body || '').toLowerCase();

          // Check if all query terms match (AND query)
          var allMatch = queryTerms.every(function (term) {
            return title.indexOf(term) !== -1 || body.indexOf(term) !== -1;
          });

          if (allMatch) {
            var score = 0;
            queryTerms.forEach(function (term) {
              if (title.indexOf(term) !== -1) score += 20;
              var count = body.split(term).length - 1;
              score += Math.min(count, 10);
            });

            results.push({
              ref: docId,
              score: score,
              doc: doc
            });
            seenRefs.add(String(docId));
          }
        }
      }

      // Sort by score descending
      results.sort(function (a, b) {
        return b.score - a.score;
      });

      return results;
    };
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setupJapaneseSearch();
  } else {
    document.addEventListener('DOMContentLoaded', setupJapaneseSearch);
  }
})();
