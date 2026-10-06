'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const labels = {normal:'Normal',recovery:'Recovery',commit:'Commit fallback',nojs:'NO-JS',historical:'Historical',other:'Other'};
  const maxDomBytes = 200 * 1024;
  let entries = [], filtered = [], index = -1, lastOpener = null, domController = null, domEpoch = 0;
  const dialog = byId('detail');
  function artifact(path) {
    if (typeof path !== 'string' || !/^samples\/[A-Za-z0-9_-]+\/(?:screenshot\.png|dom\.txt|report\.json)$/.test(path)) throw new Error('Unsafe local artifact path');
    return new URL(path, new URL('.', location.href)).href;
  }
  function filterEntries(rows, query, source, strategy, year) {
    const q = query.trim().toLowerCase();
    return rows.filter(e => (source === 'all' || e.capture_source === source) &&
      (strategy === 'all' || e.strategy_filter === strategy) &&
      (year === 'all' || String(e.capture_timestamp || '').slice(0,4) === year) &&
      (!q || [e.hostname,e.source_url,e.final_url,e.sample_id,e.title].some(v => String(v || '').toLowerCase().includes(q))));
  }
  function badge(text, special = false) {
    const element = document.createElement('span'); element.className = 'badge' + (special ? ' special' : ''); element.textContent = text; return element;
  }
  function sourceLabel(e) { return e.capture_source === 'urlscan' ? 'URLScan' : 'Live'; }
  function resetDom() {
    domEpoch++; if (domController) domController.abort(); domController = null;
    byId('dom-text').textContent = ''; byId('dom-text').hidden = true; byId('dom-status').textContent = ''; byId('view-dom').disabled = false;
  }
  function draw() {
    filtered = filterEntries(entries,byId('search').value,byId('source').value,byId('strategy').value,byId('year').value);
    byId('showing').textContent = `Showing ${filtered.length} / ${entries.length}`;
    const fragment = document.createDocumentFragment();
    filtered.forEach((e,i) => {
      const card = document.createElement('button');card.type = 'button';card.className = 'card';card.dataset.sample = e.sample_id;
      card.setAttribute('aria-label',`View ${e.hostname || e.sample_id}`);
      const img = document.createElement('img');img.loading = 'lazy';img.decoding = 'async';img.width = 1365;img.height = 768;img.src = artifact(e.screenshot_path);img.alt = `Screenshot of ${e.hostname || e.sample_id}`;
      const body = document.createElement('span');body.className = 'card-body';
      const title = document.createElement('strong');title.textContent = e.hostname || e.sample_id;body.append(title);
      const badges = document.createElement('span');badges.className = 'badges';badges.append(badge(sourceLabel(e)));
      if (e.strategy_filter !== 'normal' && e.strategy_filter !== 'historical') badges.append(badge(labels[e.strategy_filter] || e.strategy_filter,true));
      body.append(badges);
      const date = document.createElement('small');date.textContent = String(e.capture_timestamp || '').slice(0,10);body.append(date);
      const id = document.createElement('small');id.className = 'card-id';id.textContent = e.sample_id.slice(0,22) + '…';body.append(id);
      card.append(img,body);card.addEventListener('click',() => {lastOpener = card;open(i);});fragment.append(card);
    });
    byId('gallery').replaceChildren(fragment);
    if (!filtered.length) {const p = document.createElement('p');p.textContent = 'No samples match these filters.';byId('gallery').append(p);}
  }
  function metadata(label,value) {
    if (value === undefined || value === null || value === '') return;
    const dt = document.createElement('dt'), dd = document.createElement('dd');dt.textContent = label;
    dd.textContent = typeof value === 'object' ? JSON.stringify(value,null,2) : String(value);byId('metadata').append(dt,dd);
  }
  function open(i) {
    if (i < 0 || i >= filtered.length) return;
    resetDom();index = i;const e = filtered[i];
    byId('detail-heading').textContent = e.hostname || e.sample_id;
    byId('position').textContent = `${i+1} / ${filtered.length} in current results`;
    byId('detail-image').src = artifact(e.screenshot_path);byId('detail-image').alt = `Captured screenshot of ${e.hostname || e.sample_id}`;
    byId('detail-badges').replaceChildren(badge(sourceLabel(e)),badge(labels[e.strategy_filter] || e.strategy_filter,e.strategy_filter === 'nojs'));
    byId('metadata').replaceChildren();
    [['Sample ID','sample_id'],['Source URL','source_url'],['Requested URL','requested_url'],['Final / browser URL','final_url'],['Hostname','hostname'],['Capture source','capture_source'],['HTTP status','http_status'],['Capture timestamp','capture_timestamp'],['Capture strategy','capture_strategy'],['Recovery strategy','recovery_strategy'],['Navigation status','navigation_status'],['DOM source','dom_source'],['Title','title'],['DOM bytes','dom_size'],['Screenshot bytes','screenshot_size'],['Source record count','source_count'],['Source URLs','source_urls'],['Provenance entries','provenance_count'],['URLScan UUID','urlscan_uuid'],['Quality flags','quality_flags'],['Recovery','recovery']].forEach(([label,key]) => metadata(label,e[key]));
    if (typeof e.javascript_enabled === 'boolean') metadata('JavaScript',e.javascript_enabled ? 'Enabled' : 'Disabled');
    byId('report-link').href = artifact(e.report_path);byId('previous').disabled = i === 0;byId('next').disabled = i === filtered.length-1;
    if (!dialog.open) {dialog.showModal();byId('close').focus();}
    dialog.scrollTop = 0;
  }
  function close() {
    resetDom();dialog.close();byId('detail-image').removeAttribute('src');index = -1;
    if (lastOpener && lastOpener.isConnected) lastOpener.focus();
  }
  async function viewDom() {
    if (index < 0) return;
    const e = filtered[index], epoch = domEpoch;domController = new AbortController();byId('view-dom').disabled = true;byId('dom-status').textContent = 'Loading local DOM text…';
    try {
      const response = await fetch(artifact(e.dom_path),{signal:domController.signal,credentials:'omit',redirect:'error'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body.getReader(), decoder = new TextDecoder();let size = 0, text = '', truncated = false;
      try {
        while (true) {const chunk = await reader.read();if (chunk.done) break;const remaining = maxDomBytes-size;
          text += decoder.decode(chunk.value.subarray(0,remaining),{stream:true});size += Math.min(chunk.value.length,remaining);
          if (size >= maxDomBytes) {truncated = true;await reader.cancel();break;}
        }
        text += decoder.decode();
      } finally {reader.releaseLock();}
      if (epoch !== domEpoch) return;
      byId('dom-text').textContent = text;byId('dom-text').hidden = false;
      byId('dom-status').textContent = truncated ? 'Preview limited to 200 KiB. DOM displayed as plain text.' : 'DOM displayed as plain text.';
    } catch (error) {if (epoch === domEpoch && error.name !== 'AbortError') byId('dom-status').textContent = `Could not load local DOM: ${error.message}`;}
    finally {if (epoch === domEpoch) byId('view-dom').disabled = false;}
  }
  ['search','source','strategy','year'].forEach(id => byId(id).addEventListener(id === 'search' ? 'input' : 'change',draw));
  byId('previous').addEventListener('click',() => open(index-1));byId('next').addEventListener('click',() => open(index+1));byId('close').addEventListener('click',close);byId('view-dom').addEventListener('click',viewDom);
  dialog.addEventListener('cancel',event => {event.preventDefault();close();});
  document.addEventListener('keydown',event => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') {event.preventDefault();open(index-1);}
    if (event.key === 'ArrowRight') {event.preventDefault();open(index+1);}
    if (event.key === 'Escape') {event.preventDefault();close();}
  });
  fetch('viewer/data/viewer_manifest.json',{credentials:'omit',redirect:'error'}).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);return response.json();
  }).then(data => {
    if (!Array.isArray(data.entries) || data.entries.length !== data.total || new Set(data.entries.map(e => e.sample_id)).size !== data.total) throw new Error('Invalid viewer manifest');
    data.entries.forEach(e => ['screenshot_path','dom_path','report_path'].forEach(k => artifact(e[k])));entries = data.entries;
    byId('dataset-subtitle').textContent = `${entries.length} curated samples · ${data.dataset_version}`;
    byId('source-summary').textContent = `${data.sources.urlscan || 0} URLScan Historical · ${data.sources.live_playwright || 0} Live Captures`;
    [...new Set(entries.map(e => String(e.capture_timestamp || '').slice(0,4)).filter(Boolean))].sort().forEach(year => {const option = document.createElement('option');option.value = year;option.textContent = year;byId('year').append(option);});draw();
  }).catch(error => {byId('load-error').hidden = false;byId('load-error').textContent = `Could not load dataset: ${error.message}. Serve this repository over HTTP.`;});
})();
