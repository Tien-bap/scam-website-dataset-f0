'use strict';
(() => {
  const byId = id => document.getElementById(id);
  const labels = {normal:'Thông thường',recovery:'Khôi phục',commit:'Commit fallback',nojs:'NO-JS',historical:'Lịch sử',other:'Khác'};
  const maxDomBytes = 200 * 1024;
  let datasetRoot = null, loadEpoch = 0;
  let entries = [], filtered = [], index = -1, lastOpener = null, domController = null, domEpoch = 0;
  const dialog = byId('detail');
  function artifact(path) {
    if (typeof path !== 'string' || !/^samples\/[A-Za-z0-9_-]+\/(?:screenshot\.png|dom\.txt|report\.json)$/.test(path)) throw new Error('Đường dẫn artifact không hợp lệ');
    return new URL(path, datasetRoot).href;
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
  function sourceLabel(e) { return {urlscan:'URLScan',live_playwright:'Playwright live'}[e.capture_source] || e.capture_source || 'Không rõ'; }
  function resetDom() {
    domEpoch++; if (domController) domController.abort(); domController = null;
    byId('dom-text').textContent = ''; byId('dom-text').hidden = true; byId('dom-status').textContent = ''; byId('view-dom').disabled = false;
  }
  function draw() {
    filtered = filterEntries(entries,byId('search').value,byId('source').value,byId('strategy').value,byId('year').value);
    byId('showing').textContent = `Đang hiển thị: ${filtered.length} / ${entries.length}`;
    const fragment = document.createDocumentFragment();
    filtered.forEach((e,i) => {
      const card = document.createElement('button');card.type = 'button';card.className = 'card';card.dataset.sample = e.sample_id;
      card.setAttribute('aria-label',`Xem ${e.hostname || e.sample_id}`);
      const img = document.createElement('img');img.loading = 'lazy';img.decoding = 'async';img.width = 1365;img.height = 768;img.src = artifact(e.screenshot_path);img.alt = `Screenshot của ${e.hostname || e.sample_id}`;
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
    if (!filtered.length) {const p = document.createElement('p');p.textContent = 'Không có mẫu phù hợp với bộ lọc.';byId('gallery').append(p);}
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
    byId('position').textContent = `${i+1} / ${filtered.length} trong kết quả hiện tại`;
    byId('detail-image').src = artifact(e.screenshot_path);byId('detail-image').alt = `Screenshot đã capture của ${e.hostname || e.sample_id}`;
    byId('detail-badges').replaceChildren(badge(sourceLabel(e)),badge(labels[e.strategy_filter] || e.strategy_filter,e.strategy_filter === 'nojs'));
    byId('metadata').replaceChildren();
    [['Mã mẫu','sample_id'],['URL nguồn','source_url'],['URL yêu cầu','requested_url'],['URL cuối / trình duyệt','final_url'],['Hostname','hostname'],['Nguồn dữ liệu','capture_source'],['Mã HTTP','http_status'],['Thời điểm capture','capture_timestamp'],['Chiến lược capture','capture_strategy'],['Chiến lược khôi phục','recovery_strategy'],['Trạng thái điều hướng','navigation_status'],['Nguồn DOM','dom_source'],['Tiêu đề','title'],['Kích thước DOM (bytes)','dom_size'],['Kích thước screenshot (bytes)','screenshot_size'],['Số bản ghi nguồn','source_count'],['Các URL nguồn','source_urls'],['Số mục provenance','provenance_count'],['URLScan UUID','urlscan_uuid'],['Cờ chất lượng','quality_flags'],['Thông tin khôi phục','recovery']].forEach(([label,key]) => metadata(label,e[key]));
    if (typeof e.javascript_enabled === 'boolean') metadata('JavaScript',e.javascript_enabled ? 'Bật' : 'Tắt');
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
    const e = filtered[index], epoch = domEpoch;domController = new AbortController();byId('view-dom').disabled = true;byId('dom-status').textContent = 'Đang tải DOM cục bộ…';
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
      byId('dom-status').textContent = truncated ? 'Bản xem giới hạn 200 KiB. DOM được hiển thị dạng văn bản thuần.' : 'DOM được hiển thị dạng văn bản thuần.';
    } catch (error) {if (epoch === domEpoch && error.name !== 'AbortError') byId('dom-status').textContent = `Không tải được DOM cục bộ: ${error.message}`;}
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
  async function localJson(path) {
    const response = await fetch(path,{credentials:'omit',redirect:'error'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  async function loadDataset(dataset) {
    const epoch = ++loadEpoch;
    if (dialog.open) close();
    resetDom(); entries = []; filtered = []; index = -1; byId('gallery').replaceChildren();
    byId('load-error').hidden = true;
    byId('dataset-subtitle').textContent = 'Đang tải bộ dữ liệu…';
    byId('showing').textContent = ''; byId('source-summary').textContent = '';
    ['source','strategy','year'].forEach(id => byId(id).value = 'all'); byId('search').value = '';
    byId('year').replaceChildren(new Option('Tất cả','all'));
    try {
      const data = await localJson(`data/${dataset.manifest}`);
      if (epoch !== loadEpoch) return;
      if (!Array.isArray(data.entries) || data.entries.length !== data.total || data.total !== dataset.sample_count ||
          new Set(data.entries.map(e => e.sample_id)).size !== data.total) throw new Error('Manifest không hợp lệ');
      datasetRoot = new URL(`../datasets/${dataset.id}/`,location.href);
      data.entries.forEach(e => ['screenshot_path','dom_path','report_path'].forEach(k => artifact(e[k])));
      entries = data.entries;
      byId('source').replaceChildren(new Option('Tất cả','all'), ...[...new Set(entries.map(e => e.capture_source).filter(Boolean))].sort().map(source => new Option(sourceLabel({capture_source:source}),source)));
      byId('strategy').replaceChildren(new Option('Tất cả','all'), ...[...new Set(entries.map(e => e.strategy_filter).filter(Boolean))].sort().map(strategy => new Option(labels[strategy] || strategy,strategy)));
      byId('dataset-subtitle').textContent = `Tổng số mẫu: ${entries.length} · ${dataset.version}`;
      const sources = data.sources || {};
      byId('source-summary').textContent = `${sources.urlscan || 0} mẫu URLScan lịch sử · ${sources.live_playwright || 0} mẫu Playwright live`;
      byId('dataset-readme').href = new URL('README.md',datasetRoot).href;
      byId('dataset-report').href = new URL('DATASET_REPORT.md',datasetRoot).href;
      [...new Set(entries.map(e => String(e.capture_timestamp || '').slice(0,4)).filter(Boolean))].sort().forEach(year => byId('year').append(new Option(year,year)));
      draw();
    } catch (error) {
      if (epoch === loadEpoch) {byId('load-error').hidden = false;byId('load-error').textContent = `Không tải được bộ dữ liệu: ${error.message}. Hãy mở reviewer qua HTTP.`;}
    }
  }
  localJson('data/datasets.json').then(async registry => {
    if (!Array.isArray(registry.datasets) || !registry.datasets.length ||
        new Set(registry.datasets.map(d => d.id)).size !== registry.datasets.length) throw new Error('Danh sách dataset không hợp lệ');
    registry.datasets.forEach(d => {
      if (!/^[A-Za-z0-9_-]+$/.test(d.id) || !/^[A-Za-z0-9_-]+\.json$/.test(d.manifest) || !Number.isInteger(d.sample_count) || d.sample_count < 0) throw new Error('Đường dẫn dataset không hợp lệ');
    });
    byId('dataset').replaceChildren(...registry.datasets.map(d => new Option(`${d.name} (${d.version})`,d.id)));
    byId('dataset').addEventListener('change',() => loadDataset(registry.datasets.find(d => d.id === byId('dataset').value)));
    await loadDataset(registry.datasets[0]);
  }).catch(error => {byId('load-error').hidden = false;byId('load-error').textContent = `Không tải được danh sách dataset: ${error.message}`;});
})();
