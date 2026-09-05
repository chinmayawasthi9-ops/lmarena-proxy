import asyncio
import json
import os
import sys
import time
import urllib.parse
import uuid
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

# Authenticated session cookies to bypass LOGIN_GATE
DEFAULT_COOKIES = [
    {
        "name": "__cf_bm",
        "value": "ccHryy0cepAopnydnj6WD6SKtNaqWRMsCUr3KckRkAg-1788584443.5658386-1.0.1.1-q0nXGQ.p.hGCKMOFQGb599V3s8K5As7uiPDqITpeH57llCTUrFxzgysli4iheExEP8yZZW286gHoM3MKdncVeVc_r0OVu2xlwophz4b4MCP2wcar8Y5X5GqIhZK3UKrQ",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "None",
        "secure": True,
        "httpOnly": True
    },
    {
        "name": "_dd_s",
        "value": "isExpired=1&aid=a5e0f45f-3a20-4dab-8d4d-af7285da5b22",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "_ga",
        "value": "GA1.1.658474583.1788551058",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "_ga_DB32ZN1WHB",
        "value": "GS2.1.s1788579972$o4$g1$t1788583286$j38$l0$h0",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "_ga_L5C4D55WJJ",
        "value": "GS2.1.s1788579972$o4$g1$t1788583286$j38$l0$h0",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "arena_visit_id",
        "value": "%7B%22id%22%3A%2201a06fac-8556-727c-9fa8-d673240fe988%22%2C%22started%22%3A1788579972438%2C%22lastSeen%22%3A1788583286765%7D",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "arena-auth-prod-v1.0",
        "value": "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpBNVlUSTNPVFl6TFRjek5tWXROR00wWmkwNU5HSXlMV0ptWXpSaU1XSTJNV1k0T0NJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmgxYjJkNmIyVnhlbU55WkhacmQzUjJiMlJwTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lKaFpEZzNZelU1WWkwM016RTRMVFExT0dVdE9XRXhZUzFtWm1Sak9UazNPV1UyWm1VaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemc0TlRnek5UY3hMQ0pwWVhRaU9qRTNPRGcxTnprNU56RXNJbVZ0WVdsc0lqb2lZMmhwYm0xaGVXRjNZWE4wYUdrNE56WkFaMjFoYVd3dVkyOXRJaXdpY0dodmJtVWlPaUlpTENKaGNIQmZiV1YwWVdSaGRHRWlPbnNpY0hKdmRtbGtaWElpT2lKbmIyOW5iR1VpTENKd2NtOTJhV1JsY25NaU9sc2laMjl2WjJ4bElsMTlMQ0oxYzJWeVgyMWxkR0ZrWVhSaElqcDdJbUYyWVhSaGNsOTFjbXdpT2lKb2RIUndjem92TDJ4b015NW5iMjluYkdWMWMyVnlZMjl1ZEdWdWRDNWpiMjB2WVM5QlEyYzRiMk5KVGxOSVlYRmxjR1JFTmtOVmIwbERkblZ0ZVhoMlFuZHFPR2xuZERsSlZYRnVVMkZwTjNWZk5FcE5Va0ZUUFhNNU5pMWpJaXdpWlcxaGFXd2lPaUpqYUdsdWJXRjVZWGRoYzNSb2FUZzNOa0JuYldGcGJDNWpiMjBpTENKbGJXRnBiRjkyWlhKcFptbGxaQ0k2ZEhKMVpTd2lablZzYkY5dVlXMWxJam9pUTJocGJtMWhlU0lzSW1sa0lqb2lNREZoTURaa1pqTXROR1pqWmkwM1lUQXdMV0V4TVRrdE16azNOekk1TXpCbU5HUTRJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhZMk52ZFc1MGN5NW5iMjluYkdVdVkyOXRJaXdpYkdGemRGOXNhVzVyWldSZmMzVndZV0poYzJWZmRYTmxjbLlwWkNJNklqUmpZVEppWTJZNExUUTRPRFV0TkRRd01TMWhPVEF4TFRreU5XUTRNbVF4TURJeE55SXNJbTVoYldVaU9pSkRhR2x1YldGNUlpd2ljR2h2Ym1WZmRtVnlhV1pwWldRaU9tWmhiSE5sTENKd2FXTjBkWEpsSWpvaWFIUjBjSE02THk5c2FETXVaMjl2WjJ4bGRYTmxjbU52Ym5SbGJuUXVZMjl0TDJFdlFVTm5PRzlqU1U1VFNHRnhaWEJrUkRaRFZXOUpRM1oxYlhsNGRrSjNhamhwWjNRNVNWVnhibE5oYVRkMVh6UktUVkpCVXoxek9UWXRZeUlzSW5CeWIzWnBaR1Z5WDJsa0lqb2lNVEUwTXprNE16Z3hNakkzTlRJeE5qWXdOak0xSWl3aWMzVmlJam9pTVRFME16azRNemd4TWpJM05USXhOall3TmpNMUluMHNJbkp2YkdVaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVlXRnNJam9pWVdGc01TSXNJbUZ0Y2lJNlczc2liV1YwYUc5a0lqb2liMkYxZEdnaUxDSjBhVzFsYzNSaGJYQWlPakUzT0RnMU5URXdOek45WFN3aWMyVnpjMmx2Ymw5cFpDSTZJamMyWm1Vek1UaG1MVEEzTXpJdE5EY3pOaTFoT0RBNUxUYzFOakEyT1dWa09EYzROeUlzSW1selgyRnViMjU1Ylc5MWN5STZabUZzYzJWOS5uX3MtaEpaZzFrYldfRFN2bUlNamQ5eTV0c1JsVDNVdXk3MmoxNUZiTFI2WkhzZVdWcEFJVnp3UTVYc00zcFlRWWpycGt6eVd6NmlBSVlGMUpTN05uQSIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzg4NTgzNTcxLCJyZWZyZXNoX3Rva2VuIjoiNDNtanRzbHEyN2h3IiwidXNlciI6eyJpZCI6ImFkODdjNTliLTczMTgtNDU4ZS05YTFhLWZmZGM5OTc5ZTZmZSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy4yODAwNzZaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI4MDA3NloiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjY1NjY1NVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJTlNIYXFlcGRENkNVb0lDdnVteXh2QndqOGlndDlJVXFuU2FpN3VfNEpNUkFTPXM5Ni1jIiwiZW1haWwiOiJjaGlubWF5YXdhc3RoaTg3NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQ2hpbm1heSIsImlkIjoiMDFhMDZkZjMtNGZjZi03YTAwLWExMTktMzk3NzI5MzBmNGQ4IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibGFzdF9saW5rZWRfc3VwYWJhc2VfdXNlcl9pZCI6IjRjYTJiY2Y4LTQ4ODUtNDQwMS1hOTAxLTkyNWQ4MmQxMDIxNyIsIm5hbWUiOiJDaGlubWF5IiwicGhvbmVfdmVyaWZpZWQiOmZhb",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "arena-auth-prod-v1.1",
        "value": "HNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1Iiwic3ViIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1In0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiZWE4YTU3OTEtMjNkYy00ZGMzLWJjNzktNTJmOTYzM2EzMzFmIiwiaWQiOiIxMTQzOTgzODEyMjc1MjE2NjA2MzUiLCJ1c2VyX2lkIjoiYWQ4N2M1OWItNzMxOC00NThlLTlhMWEtZmZkYzk5NzllNmZlIiwiaWRlbnRpdHlfZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkNoaW5tYXkiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQ2hpbm1heSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lOU0hhcWVwZEQ2Q1VvSUN2dW15eHZCd2o4aWd0OUlVcW5TYWk3dV80Sk1SQVM9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSIsInN1YiI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSJ9LCJwcm92aWRlciI6Imdvb2dsZSIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjYtMDktMDRUMTk6NDQ6MzMuMjc1OTkzWiIsImNyZWF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI3NjAzNFoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy4yNzYwMzRaIiwiZW1haWwiOiJjaGlubWF5YXdhc3RoaTg3NkBnbWFpbC5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI3MzEzOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNVQwMzo0NjoxMS4yNDExMDVaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX19",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "cf_clearance",
        "value": "IIPxBuIVqpheYQpFyKtwB_ofcCxmIVjaSYDEt.d1GbE-1788583015-1.2.1.1-PNOGD5Snp03DgX7UC6BRTmTOd47.uhS5v4WxG_7aOemIKdS3fLz0m1MaT_Mf63ow1RQgAsKmbf43pVGon9mM9ZbTTzzsyDli9sFsFT84slncBQraNE5iHIuTHd9uLScfDuAWys0part7wORJtIMckWYcCT8N7_iGNrRj.GqetDi7lRwy5j6SPpgB6CkLLYCy17amuNheyXfuRdLRk7KTi2dxNQpc8P9RD_68VlKLmpX62GWASiRbX84_yFi3UnOlkYj7bwK.TFvwJAtlKrtHcpFfXQB2bQ2vlbCA_8O3jR4wkkw0xYmn4zGJc2U282VD1l8iOn.2CajcL2rSdenoi.PRPnMif1D0leOrlIg3trs",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "None",
        "secure": True,
        "httpOnly": True
    },
    {
        "name": "ph_phc_LG7IJbVJqBsk584rbcKca0D5lV2vHguiijDrVji7yDM_posthog",
        "value": "%7B%22%24device_id%22%3A%2201a06fdf-17c3-76c9-8b87-46b1331599ab%22%2C%22distinct_id%22%3A%2201a06df3-4fcf-7a00-a119-39772930f4d8%22%2C%22%24sesid%22%3A%5B1788584470146%2C%2201a06fac-8567-730e-80a1-bd4f4ade3b6a%22%2C1788579972454%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Farena.ai%2F%22%7D%2C%22%24user_state%22%3A%22identified%22%7D",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "provisional_user_id",
        "value": "01a06ff0-c69b-7d08-8a72-b721c18fce85",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True,
        "httpOnly": True
    },
    {
        "name": "sidebar_state",
        "value": "true",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "user_country_code",
        "value": "IN",
        "domain": ".arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    }
]

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
                "--disable-blink-features=AutomationControlled",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )

        # Collect base cookies
        cookie_map = {c["name"]: dict(c) for c in DEFAULT_COOKIES}

        # Dynamically load fresh tokens/cookies from fresh_tokens.json if provided
        try:
            tokens_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fresh_tokens.json")
            if os.path.exists(tokens_file):
                with open(tokens_file, "r") as tf:
                    tdata = json.load(tf)
                    if isinstance(tdata, dict):
                        if "cookies" in tdata and isinstance(tdata["cookies"], list):
                            for fc in tdata["cookies"]:
                                cookie_map[fc["name"]] = dict(fc)
                            print(f"🎉 Loaded {len(tdata['cookies'])} cookies from fresh_tokens.json!")
                        elif tdata.get("v0") and not tdata["v0"].startswith("base64-[^") and len(tdata["v0"]) > 50:
                            cookie_map["arena-auth-prod-v1.0"] = {
                                "name": "arena-auth-prod-v1.0",
                                "value": tdata["v0"],
                                "domain": ".arena.ai",
                                "path": "/",
                                "sameSite": "Lax",
                                "secure": True
                            }
                            if tdata.get("v1"):
                                cookie_map["arena-auth-prod-v1.1"] = {
                                    "name": "arena-auth-prod-v1.1",
                                    "value": tdata["v1"],
                                    "domain": ".arena.ai",
                                    "path": "/",
                                    "sameSite": "Lax",
                                    "secure": True
                                }
                            print("🎉 Loaded fresh session tokens from fresh_tokens.json!")
        except Exception as e:
            print(f"⚠️ Note on fresh_tokens: {e}")

        cookies_to_add = list(cookie_map.values())
        await context.add_cookies(cookies_to_add)
        print(f"🔑 Injected {len(cookies_to_add)} base cookies cleanly!")

        page = await context.new_page()

        # Stealth evasions to prevent Cloudflare bot detection in headless mode
        stealth_script = """
        try {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        } catch (_) {}
        """
        await page.add_init_script(stealth_script)
        await page.add_init_script(injector_code)

        # Pipe console messages directly to GitHub Actions terminal
        page.on("console", lambda msg: print(f"[Browser Console] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser Error] {err}"))

        # Intercept and log network interactions for create-evaluation
        def on_request(req):
            if "evaluation" in req.url:
                print(f"[Net Req] {req.method} {req.url}")
                cookie_hdr = req.headers.get("cookie", "")
                cookie_names = [c.split("=")[0].strip() for c in cookie_hdr.split(";") if c.strip()]
                print(f"[Net Req Cookies] {cookie_names}")
                print(f"[Net Req Headers] Origin: {req.headers.get('origin')} | Referer: {req.headers.get('referer')} | Content-Type: {req.headers.get('content-type')}")
                print(f"[Net Req Body Preview] {req.post_data[:200] if req.post_data else 'None'}")

        async def on_response(resp):
            if "evaluation" in resp.url:
                print(f"[Net Resp] {resp.status} {resp.url}")
                try:
                    text = await resp.text()
                    print(f"[Net Resp Text] {text[:500]}")
                except Exception as e:
                    print(f"[Net Resp Text Error] {e}")

        page.on("request", on_request)
        page.on("response", on_response)

        # ── Turnstile Auto-Solver ──────────────────────────────────────────────
        async def auto_solve_turnstile():
            """
            Continuously watches for Cloudflare Turnstile iframes, checkboxes,
            and verification buttons. Runs as a background task from the moment
            the page is created so any challenge is solved instantly.
            """
            print("[Turnstile] 🤖 Auto-solver started — watching for challenges...")
            consecutive_idle = 0
            while True:
                try:
                    await asyncio.sleep(1.5)  # Fast poll every 1.5 seconds

                    # Strategy 0: Check main page for Cloudflare verification button/checkbox
                    main_btn = await page.query_selector("button:has-text('Verify you are human'), input[type='checkbox']#challenge-stage, .cf-turnstile-wrapper")
                    if main_btn and await main_btn.is_visible():
                        print("[Turnstile] 🔔 Main page verification widget found! Clicking...")
                        await main_btn.click()
                        await asyncio.sleep(2)

                    frames = page.frames
                    
                    # Strategy 1: Detect and solve Turnstile iframes
                    turnstile_frames = [
                        f for f in frames
                        if "challenges.cloudflare.com/turnstile" in f.url
                        or "turnstile" in f.url.lower()
                    ]

                    if turnstile_frames:
                        consecutive_idle = 0
                        print(f"[Turnstile] 🔔 Detected {len(turnstile_frames)} Turnstile iframe(s)! Attempting to solve...")
                        for frame in turnstile_frames:
                            try:
                                checkbox = await frame.query_selector("input[type='checkbox']")
                                if checkbox:
                                    await checkbox.click()
                                    print("[Turnstile] ✅ Clicked checkbox input in iframe!")
                                    await asyncio.sleep(1)
                                    continue

                                label = await frame.query_selector(".ctp-checkbox-label, .ctp-checkbox, [aria-label*='checkbox'], [role='checkbox']")
                                if label:
                                    await label.click()
                                    print("[Turnstile] ✅ Clicked label/aria-checkbox in iframe!")
                                    await asyncio.sleep(1)
                                    continue

                                body = await frame.query_selector("body")
                                if body:
                                    box = await body.bounding_box()
                                    if box:
                                        await page.mouse.click(
                                            box["x"] + box["width"] / 2,
                                            box["y"] + box["height"] / 2
                                        )
                                        print(f"[Turnstile] ✅ Clicked center of Turnstile widget at ({box['x'] + box['width']/2:.0f}, {box['y'] + box['height']/2:.0f})")
                                        await asyncio.sleep(1)

                            except Exception as frame_err:
                                print(f"[Turnstile] ⚠️ Error interacting with frame {frame.url}: {frame_err}")

                    # Strategy 2: Detect Google reCAPTCHA v2 checkbox iframes (CRITICAL: Runs independently every tick!)
                    recaptcha_frames = [
                        f for f in frames
                        if "google.com/recaptcha" in f.url or "recaptcha/enterprise" in f.url
                    ]
                    if recaptcha_frames:
                        for rframe in recaptcha_frames:
                            try:
                                rcheckbox = await rframe.query_selector("#recaptcha-anchor, .recaptcha-checkbox, [role='checkbox']")
                                if rcheckbox and await rcheckbox.is_visible():
                                    checked = await rcheckbox.get_attribute("aria-checked")
                                    if checked != "true":
                                        print("[reCAPTCHA] 🔔 Auto-clicking reCAPTCHA v2 checkbox in frame!")
                                        await rcheckbox.click()
                                        await asyncio.sleep(2)
                            except Exception as rc_err:
                                pass

                    if not turnstile_frames and not recaptcha_frames:
                        consecutive_idle += 1
                        if consecutive_idle % 40 == 0:  # Log every 60s of idle
                            print(f"[Auto-Solver] 💤 No challenge detected (idle {consecutive_idle * 1.5:.0f}s)")

                    for _ in range(8):
                        await asyncio.sleep(1)
                        token = await page.evaluate("""
                            () => {
                                if (window.latestTurnstileToken) return window.latestTurnstileToken;
                                try {
                                    const el = document.querySelector('[name="cf-turnstile-response"]');
                                    if (el && el.value) return el.value;
                                } catch(_) {}
                                return null;
                            }
                        """)
                        if token:
                            print(f"[Turnstile] 🎉 Token obtained after solve! ({len(token)} chars)")
                            break

                except asyncio.CancelledError:
                    print("[Turnstile] 🛑 Auto-solver cancelled.")
                    break
                except Exception as e:
                    print(f"[Turnstile] ❌ Solver error: {e}")
                    await asyncio.sleep(3)

        # Start the Turnstile auto-solver as a background task BEFORE navigation
        turnstile_task = asyncio.create_task(auto_solve_turnstile())

        print("[2/3] Navigating to https://arena.ai/text/direct-battle...")
        try:
            await page.goto("https://arena.ai/text/direct-battle", wait_until="domcontentloaded", timeout=60000)
            print(f"✅ Page loaded! Current URL: {page.url}")
            await asyncio.sleep(2)

            # Auto-dismiss any Terms of Use / Consent modals
            try:
                consent_btns = await page.locator("button:has-text('Agree'), button:has-text('Accept'), button:has-text('I Agree'), button:has-text('Got it')").all()
                for btn in consent_btns:
                    if await btn.is_visible():
                        btn_txt = await btn.inner_text()
                        print(f"🤝 Auto-clicking consent button: {btn_txt}")
                        await btn.click()
                        await asyncio.sleep(1)
            except Exception as modal_err:
                print(f"Consent check notice: {modal_err}")

            # Simulate native user interaction to trigger arena.ai's useHasInteracted() hook
            print("🖱️ Simulating user interaction to initialize guest/anonymous session...")
            try:
                await page.mouse.move(250, 250)
                await page.mouse.down()
                await page.mouse.up()
                await page.keyboard.press("Shift")
                await page.evaluate("""
                    () => {
                        ['mousemove', 'mousedown', 'mouseup', 'click', 'keydown', 'scroll'].forEach(name => {
                            document.dispatchEvent(new Event(name, { bubbles: true }));
                            window.dispatchEvent(new Event(name, { bubbles: true }));
                        });
                    }
                """)
                await asyncio.sleep(1)

                # Click the chat input to guarantee activation
                inputs = await page.locator("textarea, [contenteditable='true'], [role='textbox']").all()
                if inputs:
                    await inputs[0].click()
                    print("📝 Clicked chat input element!")
            except Exception as act_err:
                print(f"Interaction notice: {act_err}")

            # Wait for arena.ai auth cookies to be verified/refreshed
            print("⏳ Checking session auth state...")
            for attempt in range(15):
                cookies_now = await context.cookies()
                auth_cookies = [c for c in cookies_now if "arena-auth" in c["name"]]
                if auth_cookies:
                    print(f"🎉 Authenticated session active! Auth cookies: {[c['name'] for c in auth_cookies]}")
                    break
                await asyncio.sleep(1)

            doc_cookies = await page.evaluate("() => document.cookie")
            print(f"📄 document.cookie preview: {doc_cookies[:200]}")
            active_cookies = await context.cookies()
            print(f"🍪 Active cookies in context: {[c['name'] for c in active_cookies]}")
        except Exception as e:
            print(f"⚠️ Navigation note: {e}")
        # Keep running for ~5.5 hours
        start_time = time.time()
        max_duration = 5.5 * 3600
        iteration = 0

        print("[3/3] Running 24/7 background session...")

        try:
            while time.time() - start_time < max_duration:
                await asyncio.sleep(30)
                iteration += 1

                # Every 30 minutes (60 iterations * 30s = 1800s): reload page to keep session tokens fresh
                if iteration % 60 == 0:
                    elapsed_min = int((time.time() - start_time) / 60)
                    print(f"🔄 [Keep-Alive] Proactive 30m session refresh (Elapsed: {elapsed_min}m)...")
                    try:
                        await page.reload(wait_until="domcontentloaded", timeout=30000)
                        print(f"✅ [Keep-Alive] Page refreshed cleanly. Current URL: {page.url}")
                    except Exception as ref_err:
                        print(f"⚠️ [Keep-Alive] Refresh notice: {ref_err}")

                if iteration % 10 == 0:
                    elapsed_min = int((time.time() - start_time) / 60)
                    print(f"[Heartbeat] Cloud browser active. Elapsed: {elapsed_min} minutes. URL: {page.url}")
                    try:
                        await page.evaluate("() => window.scrollTo(0, Math.random() * 100)")
                    except Exception:
                        pass
        finally:
            turnstile_task.cancel()
            try:
                await turnstile_task
            except asyncio.CancelledError:
                pass

        print("Max job duration reached. Exiting cleanly for next scheduled run.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
