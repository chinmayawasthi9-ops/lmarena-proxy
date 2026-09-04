import asyncio
import os
import sys
import time
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)

# Exact cookie configuration matching the user's active session
DEFAULT_COOKIES = [
    {
        "name": "arena-auth-prod-v1.0",
        "value": "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpBNVlUSTNPVFl6TFRjek5tWXROR00wWmkwNU5HSXlMV0ptWXpSaU1XSTJNV1k0T0NJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmgxYjJkNmIyVnhlbU55WkhacmQzUjJiMlJwTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lKaFpEZzNZelU1WWkwM016RTRMVFExT0dVdE9XRXhZUzFtWm1Sak9UazNPV1UyWm1VaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemc0TlRVME5qY3pMQ0pwWVhRaU9qRTNPRGcxTlRFd056TXNJbVZ0WVdsc0lqb2lZMmhwYm0xaGVXRjNZWE4wYUdrNE56WkFaMjFoYVd3dVkyOXRJaXdpY0dodmJtVWlPaUlpTENKaGNIQmZiV1YwWVdSaGRHRWlPbnNpY0hKdmRtbGtaWElpT2lKbmIyOW5iR1VpTENKd2NtOTJhV1JsY25NaU9sc2laMjl2WjJ4bElsMTlMQ0oxYzJWeVgyMWxkR0ZrWVhSaElqcDdJbUYyWVhSaGNsOTFjbXdpT2lKb2RIUndjem92TDJ4b015NW5iMjluYkdWMWMyVnlZMjl1ZEdWdWRDNWpiMjB2WVM5QlEyYzRiMk5KVGxOSVlYRmxjR1JFTmtOVmIwbERkblZ0ZVhoMlFuZHFPR2xuZERsSlZYRnVVMkZwTjNWZk5FcE5Va0ZUUFhNNU5pMWpJaXdpWlcxaGFXd2lPaUpqYUdsdWJXRjVZWGRoYzNSb2FUZzNOa0JuYldGcGJDNWpiMjBpTENKbGJXRnBiRjkyWlhKcFptbGxaQ0k2ZEhKMVpTd2lablZzYkY5dVlXMWxJam9pUTJocGJtMWhlU0lzSW1sa0lqb2lNREZoTURaa1pqTXROR1pqWmkwM1lUQXdMV0V4TVRrdE16azNOekk1TXpCbU5HUTRJaXdpYVhOeklqb2lhSFIwY0hNNkx5OWhZMk52ZFc1MGN5NW5iMjluYkdVdVkyOXRJaXdpYkdGemRGOXNhVzVyWldSZmMzVndZV0poYzJWZmRYTmxjbDlwWkNJNklqUmpZVEppWTJZNExUUTRPRFV0TkRRd01TMWhPVEF4TFRreU5XUTRNbVF4TURJeE55SXNJbTVoYldVaU9pSkRhR2x1YldGNUlpd2ljR2h2Ym1WZmRtVnlhV1pwWldRaU9tWmhiSE5sTENKd2FXTjBkWEpsSWpvaWFIUjBjSE02THk5c2FETXVaMjl2WjJ4bGRYTmxjbU52Ym5SbGJuUXVZMjl0TDJFdlFVTm5PRzlqU1U1VFNHRnhaWEJrUkRaRFZXOUpRM1oxYlhsNGRrSjNhamhwWjNRNVNWVnhibE5oYVRkMVh6UktUVkpCVXoxek9UWXRZeUlzSW5CeWIzWnBaR1Z5WDJsa0lqb2lNVEUwTXprNE16Z3hNakkzTlRJeE5qWXdOak0xSWl3aWMzVmlJam9pTVRFME16azRNemd4TWpJM05USXhOall3TmpNMUluMHNJbkp2YkdVaU9pSmhkWFJvWlc1MGFXTmhkR1ZrSWl3aVlXRnNJam9pWVdGc01TSXNJbUZ0Y2lJNlczc2liV1YwYUc5a0lqb2liMkYxZEdnaUxDSjBhVzFsYzNSaGJYQWlPakUzT0RnMU5URXdOek45WFN3aWMyVnpjMmx2Ymw5cFpDSTZJamMyWm1Vek1UaG1MVEEzTXpJdE5EY3pOaTFoT0RBNUxUYzFOakEyT1dWa09EYzROeUlzSW1selgyRnViMjU1Ylc5MWN5STZabUZzYzJWOS5EN0o5dUp2czN0QmNkT2lxaU1XSWpDSWF4UXJIajZVRF8zSmt5OWEzcEltVllZWEk5THZSYVZ4c1pZVERwWVMzY21RSUdDbHpOVTZtaGpKY2dQbUV1dyIsInRva2VuX3R5cGUiOiJiZWFyZXIiLCJleHBpcmVzX2luIjozNjAwLCJleHBpcmVzX2F0IjoxNzg4NTU0NjczLCJyZWZyZXNoX3Rva2VuIjoieTNjb3RyeWd1eG1nIiwidXNlciI6eyJpZCI6ImFkODdjNTliLTczMTgtNDU4ZS05YTFhLWZmZGM5OTc5ZTZmZSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wOS0wNFQxOTo0NDozMy4yODAwNzZaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjI4MDA3NloiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTA5LTA0VDE5OjQ0OjMzLjY1NjY1NVoiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJnb29nbGUiLCJwcm92aWRlcnMiOlsiZ29vZ2xlIl19LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJTlNIYXFlcGRENkNVb0lDdnVteXh2QndqOGlndDlJVXFuU2FpN3VfNEpNUkFTPXM5Ni1jIiwiZW1haWwiOiJjaGlubWF5YXdhc3RoaTg3NkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiQ2hpbm1heSIsImlkIjoiMDFhMDZkZjMtNGZjZi03YTAwLWExMTktMzk3NzI5MzBmNGQ4IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibGFzdF9saW5rZWRfc3VwYWJhc2VfdXNlcl9pZCI6IjRjYTJiY2Y4LTQ4ODUtNDQwMS1hOTAxLTkyNWQ4MmQxMDIxNyIsIm5hbWUiOiJDaGlubWF5IiwicGhvbmVfdmVyaWZpZWQiOmZhb",
        "domain": "arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "arena-auth-prod-v1.1",
        "value": "HNlLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1Iiwic3ViIjoiMTE0Mzk4MzgxMjI3NTIxNjYwNjM1In0sImlkZW50aXRpZXMiOlt7ImlkZW50aXR5X2lkIjoiZWE4YTU3OTEtMjNkYy00ZGMzLWJjNzktNTJmOTYzM2EzMzFmIiwiaWQiOiIxMTQzOTgzODEyMjc1MjE2NjA2MzUiLCJ1c2VyX2lkIjoiYWQ4N2M1OWItNzMxOC00NThlLTlhMWEtZmZkYzk5NzllNmZlIiwiaWRlbnRpdHlfZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSU5TSGFxZXBkRDZDVW9JQ3Z1bXl4dkJ3ajhpZ3Q5SVVxblNhaTd1XzRKTVJBUz1zOTYtYyIsImVtYWlsIjoiY2hpbm1heWF3YXN0aGk4NzZAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IkNoaW5tYXkiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiQ2hpbm1heSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lOU0hhcWVwZEQ2Q1VvSUN2dW15eHZCd2o4aWd0OUlVcW5TYWk3dV80Sk1SQVM9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSIsInN1YiI6IjExNDM5ODM4MTIyNzUyMTY2MDYzNSJ9LCJwcm92aWRlciI6Imdvb2dsZSIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjUtMTEtMDJUMDU6NTY6NDEuNTk0MjNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTEtMDJUMDU6NTY6NDEuNTk0Mjc2WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE3OjMwOjIxLjAxMzU4NFoiLCJlbWFpbCI6ImNoaW5tYXkwMDAyMUBnbWFpbC5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI1LTExLTAyVDA1OjU2OjQxLjU5Mjc0NVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNFQxODo1ODo1Ni4yOTE4NDRaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX19",
        "domain": "arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "__cf_bm",
        "value": "xJ933ob22iraDRoHwx4Sn_nyWR2Jt39VDGnL.Ir.J4M-1788551058.395609-1.0.1.1-kCBW8p45U4M4pWdLs.2epMPdVDDr08UlzEfygXckku7YOpP09hNdzfhTLQYvuFmnfLmKzXX.exEmccxEYjY8ELER79bzdmg7DskWVX6cT7Y8SE.Ws9HvXB9Jqb9VyVUV",
        "domain": ".arena.ai",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "arena_visit_id",
        "value": "%7B%22id%22%3A%2201a06df3-5329-77ce-b3ff-6f86ee486c1e%22%2C%22started%22%3A1788551058217%2C%22lastSeen%22%3A1788551115127%7D",
        "domain": ".arena.ai",
        "path": "/",
        "httpOnly": True,
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "user_country_code",
        "value": "IN",
        "domain": "arena.ai",
        "path": "/",
        "httpOnly": True,
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "sidebar_state",
        "value": "false",
        "domain": "arena.ai",
        "path": "/"
    },
    {
        "name": "_ga",
        "value": "GA1.1.658474583.1788551058",
        "domain": ".arena.ai",
        "path": "/"
    },
    {
        "name": "_ga_DB32ZN1WHB",
        "value": "GS2.1.s1788551058$o1$g1$t1788551105$j13$l0$h0",
        "domain": ".arena.ai",
        "path": "/"
    },
    {
        "name": "_ga_L5C4D55WJJ",
        "value": "GS2.1.s1788551058$o1$g1$t1788551105$j13$l0$h0",
        "domain": ".arena.ai",
        "path": "/"
    },
    {
        "name": "_dd_s",
        "value": "aid=a5e0f45f-3a20-4dab-8d4d-af7285da5b22&rum=2&id=4b1c1e7a-0b62-453e-b3d3-51d0dd515c28&created=1788551058213&expire=1788552005015&logs=1",
        "domain": "arena.ai",
        "path": "/",
        "sameSite": "Strict"
    },
    {
        "name": "__Secure-1PSID",
        "value": "g.a000CAmP4lnLgKHROVP_xRXAvhcahJUlSQ_SFgJrFuCEJTSuhDmd2QQZOKpAh2rEupiDldJSdQACgYKAe8SARESFQHGX2MiDV5WPsv2Ti30uBuBqpiCRBoVAUF8yKqjRHaDRzRVYtGTWiM05EOX0076",
        "domain": ".google.com",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "__Secure-1PSIDTS",
        "value": "sidts-CjEBXMw41RCDXnqxrTShsIyfEW7OHvUIFGLHcoZrq96bnVTNGyGK9gHLQfmuKPGhzcC3EAA",
        "domain": ".google.com",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "__Secure-3PSID",
        "value": "g.a000CAmP4lnLgKHROVP_xRXAvhcahJUlSQ_SFgJrFuCEJTSuhDmdGFzZq8Uq7XqAJ7vleIzwkwACgYKAZ0SARESFQHGX2MiDkehQfFaUUriuaqHGLHVbBoVAUF8yKoumMKqp-0gu0CBj0begttl0076",
        "domain": ".google.com",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "__Secure-3PSIDTS",
        "value": "sidts-CjEBXMw41RCDXnqxrTShsIyfEW7OHvUIFGLHcoZrq96bnVTNGyGK9gHLQfmuKPGhzcC3EAA",
        "domain": ".google.com",
        "path": "/",
        "httpOnly": True,
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

        # Inject cookies across both arena.ai and .arena.ai domains for guaranteed match
        expanded_cookies = []
        for c in DEFAULT_COOKIES:
            expanded_cookies.append(c)
            if c.get("domain") == "arena.ai":
                c2 = dict(c)
                c2["domain"] = ".arena.ai"
                expanded_cookies.append(c2)
            elif c.get("domain") == ".arena.ai":
                c2 = dict(c)
                c2["domain"] = "arena.ai"
                expanded_cookies.append(c2)
        await context.add_cookies(expanded_cookies)
        print(f"🔑 Injected {len(expanded_cookies)} cookies (including domain variants)!")

        page = await context.new_page()

        # Set document.cookie on the page DOM before any scripts run
        init_cookie_script = """
        try {
            const cookies = """ + json.dumps(DEFAULT_COOKIES) + """;
            for (const c of cookies) {
                if (!c.domain.includes('google')) {
                    document.cookie = `${c.name}=${c.value}; path=/; domain=${c.domain}; SameSite=Lax`;
                }
            }
            console.log('[Runner Init] document.cookie initialized. Total length: ' + document.cookie.length);
        } catch (e) {
            console.error('[Runner Init] Cookie set error:', e);
        }
        """
        await page.add_init_script(init_cookie_script)
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

        print("[2/3] Navigating to https://arena.ai/?mode=direct...")
        try:
            await page.goto("https://arena.ai/text/direct-battle", wait_until="domcontentloaded", timeout=60000)
            print(f"✅ Page loaded! Current URL: {page.url}")
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
        while time.time() - start_time < max_duration:
            await asyncio.sleep(30)
            iteration += 1
            if iteration % 10 == 0:
                elapsed_min = int((time.time() - start_time) / 60)
                print(f"[Heartbeat] Cloud browser active. Elapsed: {elapsed_min} minutes. URL: {page.url}")
                try:
                    await page.evaluate("() => window.scrollTo(0, Math.random() * 100)")
                except Exception:
                    pass

        print("Max job duration reached. Exiting cleanly for next scheduled run.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
