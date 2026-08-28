(function () {
  'use strict';

  function updateGitHubLink() {
    var gitRepoBtn = document.getElementById('git-repository-button');
    var gitEditBtn = document.getElementById('git-edit-button');

    if (gitRepoBtn && gitEditBtn) {
      var editLink = gitEditBtn.closest('a');
      var repoLink = gitRepoBtn.closest('a');
      if (editLink && repoLink && editLink.href) {
        repoLink.href = editLink.href;
      }
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    updateGitHubLink();
  } else {
    document.addEventListener('DOMContentLoaded', updateGitHubLink);
  }
})();
