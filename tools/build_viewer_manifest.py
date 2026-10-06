"""Deterministic, offline metadata projection. No captured artifacts are modified."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit


def safe_path(root, value):
    path=Path(value)
    if path.is_absolute() or '..' in path.parts or path.parts[0]!='samples':raise ValueError('Unsafe artifact path')
    result=root/path
    if not result.is_file() or any(p.is_symlink() for p in (result,*result.parents)):raise ValueError('Missing/unsafe artifact')
    return result


def build(root):
    rows=[json.loads(x) for x in (root/'manifest.jsonl').read_text().splitlines()]
    if len({r['sample_id'] for r in rows})!=len(rows):raise ValueError('Duplicate sample IDs')
    entries=[]
    for row in sorted(rows,key=lambda r:r['sample_id']):
        paths={k:safe_path(root,row[k]) for k in ('screenshot_path','dom_path','report_path')}
        report=json.loads(paths['report_path'].read_text())
        e={k:row[k] for k in ('sample_id','source_url','capture_source','capture_timestamp','screenshot_path','dom_path','report_path')}
        e['hostname']=urlsplit(row['source_url']).hostname or ''
        e['final_url']=row.get('captured_url') or report.get('browser_final_url') or report.get('final_url')
        for key in ('requested_url','http_status','javascript_enabled','navigation_status','title','capture_strategy','recovery_strategy','dom_source'):
            if key in report:e[key]=report[key]
            elif key in row:e[key]=row[key]
        strategy=e.get('capture_strategy') or e.get('recovery_strategy')
        e['strategy_filter']='nojs' if strategy=='javascript_disabled_fallback' else 'commit' if strategy=='commit_fallback' else 'recovery' if report.get('recovery',{}).get('attempted') or 'timeout' in report.get('navigation_status','') else 'normal' if report.get('navigation_status')=='complete' else 'historical' if row['capture_source']=='urlscan' else 'other'
        e['dom_size']=paths['dom_path'].stat().st_size;e['screenshot_size']=paths['screenshot_path'].stat().st_size
        e['quality_flags']=row.get('quality_flags') or report.get('quality_flags') or []
        for key in ('source_count','source_urls'):
            if key in report:e[key]=report[key]
            elif key in row:e[key]=row[key]
        provenance=report.get('provenance') or row.get('provenance')
        if provenance:e['provenance_count']=len(provenance)
        if row.get('urlscan_uuid'):e['urlscan_uuid']=row['urlscan_uuid']
        recovery=report.get('recovery')
        if recovery:e['recovery']={k:recovery[k] for k in ('attempted','original_status','original_navigation_status','original_capture_timestamp','recovered_at','result') if k in recovery}
        entries.append(e)
    return {'dataset_version':'F0-v1','total':len(entries),'sources':{s:sum(e['capture_source']==s for e in entries) for s in sorted({e['capture_source'] for e in entries})},'entries':entries}


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);p.add_argument('--output',type=Path);a=p.parse_args()
    root=a.root.resolve();output=a.output or root/'viewer/data/viewer_manifest.json'
    data=build(root);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(data,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n')
    print(f"{data['total']} viewer entries; {output.stat().st_size} bytes")
