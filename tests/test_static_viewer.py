"""Offline/static checks and localhost browser UI tests. No dataset URLs are visited.
Run using an environment with Playwright and Chromium installed.
"""
import asyncio
from collections import Counter
import functools
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('generator',ROOT/'tools/build_viewer_manifest.py')
g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
MANIFEST=ROOT/'viewer/data/viewer_manifest.json'


class ManifestTests(unittest.TestCase):
    def test_projection_deterministic_artifacts_and_no_review_fields(self):
        first=g.build(ROOT);second=g.build(ROOT)
        self.assertEqual(first,second)
        encoded=json.dumps(first,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n'
        self.assertEqual(encoded,MANIFEST.read_text())
        self.assertEqual(first['total'],488)
        self.assertEqual(first['sources'],{'urlscan':287,'live_playwright':201})
        for e in first['entries']:
            for key in ('screenshot_path','dom_path','report_path'):self.assertTrue(g.safe_path(ROOT,e[key]).is_file())
            self.assertFalse(set(e)&{'manual_review','review_decision','decision','reviewed_at'})
        nojs=[e for e in first['entries'] if e['strategy_filter']=='nojs']
        self.assertEqual(len(nojs),2)
        self.assertTrue(all(e['javascript_enabled'] is False for e in nojs))
        self.assertEqual(Counter(e['strategy_filter'] for e in first['entries'])['commit'],6)
    def test_safe_path_rejects_external_traversal(self):
        for path in ('https://evil.test/dom.txt','../samples/x/dom.txt','/samples/x/dom.txt'):
            with self.assertRaises(ValueError):g.safe_path(ROOT,path)
    def test_checksum_files(self):
        for name in ('SHA256SUMS','VIEWER_SHA256SUMS'):
            for line in (ROOT/name).read_text().splitlines():
                h,path=line.split('  ',1)
                self.assertEqual(hashlib.sha256((ROOT/path).read_bytes()).hexdigest(),h,path)


class ProjectHandler(SimpleHTTPRequestHandler):
    prefix='/scam-website-dataset-f0/'
    def log_message(self,*args):pass
    def translate_path(self,path):
        if not path.startswith(self.prefix):return str(ROOT/'DOES_NOT_EXIST')
        return super().translate_path('/'+path[len(self.prefix):])


class BrowserTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(ProjectHandler,directory=str(ROOT)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.origin=f'http://127.0.0.1:{cls.server.server_port}'
    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.thread.join()
    async def asyncSetUp(self):
        from playwright.async_api import async_playwright
        self.pw=await async_playwright().start()
        self.browser=await self.pw.chromium.launch(headless=True,chromium_sandbox=True)
        self.context=await self.browser.new_context(viewport={'width':1100,'height':700},service_workers='block')
        self.page=await self.context.new_page();self.external=[];self.paths=[];self.errors=[]
        async def only_local(route):
            url=route.request.url
            if urlsplit(url).netloc!=urlsplit(self.origin).netloc:self.external.append(url);await route.abort();return
            self.paths.append(urlsplit(url).path)
            await route.continue_()
        await self.context.route('**/*',only_local)
        self.page.on('pageerror',lambda err:self.errors.append(str(err)))
    async def asyncTearDown(self):
        await self.context.close();await self.browser.close();await self.pw.stop()
        self.assertFalse(self.external)
        self.assertFalse(self.errors)
    async def load(self):
        await self.page.goto(self.origin+ProjectHandler.prefix)
        await self.page.wait_for_selector('.card')
    async def test_gallery_filters_modal_keyboard_nojs_base_path_and_lazy(self):
        await self.load()
        self.assertEqual(await self.page.locator('.card').count(),488)
        self.assertEqual(await self.page.locator('.card img[loading="lazy"]').count(),488)
        box=await self.page.locator('.card img').first.bounding_box()
        self.assertAlmostEqual(box['width']/box['height'],1365/768,delta=.03)
        self.assertFalse(any(p.endswith(('dom.txt','report.json')) for p in self.paths))
        self.assertLess(sum(p.endswith('screenshot.png') for p in self.paths),488)
        self.assertTrue(all(p.startswith(ProjectHandler.prefix) for p in self.paths))
        data=json.loads(MANIFEST.read_text());entry=data['entries'][0]
        await self.page.locator('#search').fill(entry['sample_id'])
        self.assertEqual(await self.page.locator('.card').count(),1)
        await self.page.locator('#search').fill('');await self.page.locator('#source').select_option('live_playwright')
        self.assertEqual(await self.page.locator('.card').count(),201)
        await self.page.locator('#strategy').select_option('nojs')
        self.assertEqual(await self.page.locator('.card').count(),2)
        await self.page.locator('.card').first.click()
        self.assertTrue(await self.page.locator('#detail').is_visible())
        metadata=await self.page.locator('#metadata').inner_text()
        self.assertIn('Disabled',metadata);self.assertIn('javascript_disabled_fallback',metadata)
        first=await self.page.locator('#metadata').inner_text()
        self.assertTrue(await self.page.locator('#previous').is_disabled())
        await self.page.keyboard.press('ArrowRight');self.assertNotEqual(first,await self.page.locator('#metadata').inner_text())
        self.assertTrue(await self.page.locator('#next').is_disabled())
        await self.page.locator('#previous').click();self.assertEqual(first,await self.page.locator('#metadata').inner_text())
        await self.page.keyboard.press('Escape');self.assertFalse(await self.page.locator('#detail').is_visible())
        await self.page.locator('#source').select_option('all');await self.page.locator('#strategy').select_option('all')
        year=entry['capture_timestamp'][:4];await self.page.locator('#year').select_option(year)
        expected=sum(e['capture_timestamp'][:4]==year for e in data['entries'])
        self.assertEqual(await self.page.locator('.card').count(),expected)
    async def test_responsive_column_counts(self):
        await self.load()
        for width,expected in ((1800,6),(1300,5),(1050,4),(800,3),(600,2),(350,1)):
            await self.page.set_viewport_size({'width':width,'height':700})
            columns=await self.page.locator('#gallery').evaluate("e=>getComputedStyle(e).gridTemplateColumns.split(' ').length")
            self.assertEqual(columns,expected,width)

    async def test_untrusted_metadata_and_dom_preview_are_inert_bounded(self):
        payload=json.loads(MANIFEST.read_text());e=payload['entries'][0]
        attack='<img src="https://evil.test/pixel" onerror="window.executed=true">'
        e['hostname']=attack;e['title']=attack
        await self.page.route('**/viewer_manifest.json',lambda route:route.fulfill(json=payload))
        await self.page.route('**/dom.txt',lambda route:route.fulfill(body='<script>window.executed=true</script>'+('X'*250000),content_type='text/plain'))
        await self.load();await self.page.locator('.card').first.click()
        self.assertIn(attack,await self.page.locator('#detail-heading').inner_text())
        self.assertEqual(await self.page.locator('#metadata img').count(),0)
        await self.page.locator('#view-dom').click();await self.page.wait_for_selector('#dom-text:not([hidden])')
        text=await self.page.locator('#dom-text').inner_text()
        self.assertIn('<script>',text);self.assertLessEqual(len(text),200*1024)
        self.assertEqual(await self.page.locator('#dom-text script').count(),0)
        self.assertFalse(await self.page.evaluate('Boolean(window.executed)'))
        self.assertIn('200 KiB',await self.page.locator('#dom-status').inner_text())
        await self.page.locator('#close').click();self.assertFalse(await self.page.locator('#detail').is_visible())


if __name__=='__main__':unittest.main()
