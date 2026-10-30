(() => {
  const counter = document.querySelector('[data-download-count]');
  if (!counter) return;

  const repository = 'AshenKight/phantom-blade-zero-arabic';
  const cacheKey = `github-downloads:${repository}`;
  const render = (count) => {
    counter.textContent = new Intl.NumberFormat('en-US').format(count);
  };

  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.savedAt < 15 * 60 * 1000) {
      render(cached.count);
      return;
    }
  } catch (_) {
    sessionStorage.removeItem(cacheKey);
  }

  fetch(`https://api.github.com/repos/${repository}/releases?per_page=100`, {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then((response) => {
      if (!response.ok) throw new Error('GitHub API request failed');
      return response.json();
    })
    .then((releases) => {
      const count = releases.reduce((releaseTotal, release) => {
        const assetTotal = (release.assets || []).reduce(
          (total, asset) => total + (asset.download_count || 0),
          0
        );
        return releaseTotal + assetTotal;
      }, 0);
      render(count);
      sessionStorage.setItem(cacheKey, JSON.stringify({ count, savedAt: Date.now() }));
    })
    .catch(() => {
      counter.textContent = '—';
      counter.title = 'تعذر تحميل العداد مؤقتًا';
    });
})();
