import asyncio
import os
import sys
import time
from playwright.async_api import async_playwright

async def run():
    print("=" * 60)
    print("🚀 Launching Cloud Playwright Browser Bridge")
    print("Target Gateway: wss://lmarena-worker.crosskhrome1.workers.dev/ws")
    print("=" * 60)

    # Read injector script
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extension", "injector.js")
    with open(script_path, "r", encoding="utf-8") as f:
        injector_code = f.read()

    async with async_playwright() as p:
        print("[1/3] Launching Chromium instance with stealth flags...")
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )

        # Inject script into every page and frame before execution
        await context.add_init_script(injector_code)
        page = await context.new_page()

        # Pipe console messages directly to GitHub Actions terminal
        page.on("console", lambda msg: print(f"[Browser Console] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser Error] {err}"))

        print("[2/3] Navigating to https://arena.ai...")
        try:
            await page.goto("https://arena.ai", wait_until="domcontentloaded", timeout=60000)
            print("✅ Page loaded successfully! Bridge active.")
        except Exception as e:
            print(f"⚠️ Navigation note: {e}")

        # Keep running for ~5.5 hours
        start_time = time.time()
        max_duration = 5.5 * 3600
        iteration = 0

        print("[3/3] Running 24/7 background session...")
        while time.time() - start_time < max_duration:
            await asyncio.sleep(30)
            iteration += 1
            if iteration % 10 == 0:
                elapsed_min = int((time.time() - start_time) / 60)
                print(f"[Heartbeat] Cloud browser active. Elapsed: {elapsed_min} minutes.")
                # Perform gentle interaction to keep session alive
                try:
                    await page.evaluate("() => window.scrollTo(0, Math.random() * 100)")
                except Exception:
                    pass

        print("Max job duration reached. Exiting cleanly for next scheduled run.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
