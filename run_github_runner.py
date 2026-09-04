import asyncio
import os
import sys
import time
from playwright.async_api import async_playwright

# Exact cookie configuration matching the user's active session
DEFAULT_COOKIES = [
    {
        "name": "arena-auth-prod-v1.0",
        "value": "base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpBNVlUSTNPVFl6TFRjek5tWXROR00wWmkwNU5HSXlMV0ptWXpSaU1XSTJNV1k0T0NJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMMmgxYjJkNmIyVnhlbU55WkhacmQzUjJiMlJwTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lKbE9XRXpORFJpT1MweE5XWTNMVFF6WlRBdFlXVm1OaTAxWldVNE9EYzBPR1JsTldNaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOemc0TlRVeE9UTTJMQ0pwWVhRaU9qRTNPRGcxTkRnek16WXNJbVZ0WVdsc0lqb2lZMmhwYm0xaGVUQXdNREl4UUdkdFlXbHNMbU52YlNJc0luQm9iMjVsSWpvaUlpd2lZWEJ3WDIxbGRHRmtZWFJoSWpwN0luQnliM1pwWkdWeUlqb2laMjl2WjJ4bElpd2ljSEp2ZG1sa1pYSnpJanBiSW1kdmIyZHNaU0pkZlN3aWRYTmxjbDl0WlhSaFpHRjBZU0k2ZXlKaGRtRjBZWEpmZFhKc0lqb2lhSFIwY0hNNkx5OXNhRE11WjI5dloyeGxkWE5sY21OdmJuUmxiblF1WTI5dEwyRXZRVU5uT0c5alRHUm1kVkpHU1hoQmRVVmtMWFF5VTNVMlNrWkdVbUV6ZVhrMVdUSndhek5GYzJZNVkyOWZOa3RaWkVwYU5sVjNQWE01Tmkxaklpd2laVzFoYVd3aU9pSmphR2x1YldGNU1EQXdNajZBWjIxaGFXd3VZMjl0SWl3aVpXMWhhV3hmZG1WeWFXWnBaV1FpT25SeWRXVXNJbVoxYkd4ZmJtRnRaU0k2SWtOb2FXNXRZWGtpTENKcFpDSTZJbU13TkRVME1qbGhMV1ZrTXpBdE5EUmxOUzFoWm1VNUxXVTFPRFJoTnpVM01EVTBNU0lzSW1semN5STZJbWgwZEhCek9pOHZZV05qYjNWdWRITXVaMjl2WjJ4bExtTnZiU0lzSW14aGMzUmZiR2x1YTJWa1gzTjFjR0ZpWVhObFgzVnpaWEpmYVdRaU9pSTVORE5oT0dabU1TMDNNekF5TFRReVlURXRPVGd3TVMwM05EUmhNbVl6TlRSaE16RWlMQ0p1WVcxbElqb2lRMmhwYm0xaGVTSXNJbkJvYjI1bFgzWmxjbWxtYVdWa0lqcG1ZV3h6WlN3aWNHbGpkSFZ5WlNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB4a1puVlNSa2w0UVhWRlpDMTBNbE4xTmtwR1JsSmhNM2w1TlZreWNHc3pSWE5tT1dOdlh6WkxXV1JLV2paVmR6MXpPVFl0WXlJc0luQnliM1pwWkdWeVgybGtJam9pTVRFd05UQTBPRFkwT1Rrek1EY3hNVEF6TkRZMUlpd2ljM1ZpSWpvaU1URXdOVEEwT0RZME9Ua3pNRGN4TVRBek5EWTFJbjBzSW5KdmJHVWlPaUpoZFhSb1pXNTBhV05oZEdWa0lpd2lZV0ZzSWpvaVlXRnNNU0lzSW1GdGNpSTZXM3NpYldWMGFHOWtJam9pYjJGMWRHZ2lMQ0owYVcxbGMzUmhiWEFpT2pFM09EZzFORE13TWpGOVhTd2ljMlZ6YzJsdmJsOXBaQ0k2SWpFM1lqTmhZVFV3TFRCa1l6a3RORGhqWWkwNU56WTRMVEU0WW1KaE16ZGlObVkzWWlJc0ltbHpYMkZ1YjI1NWJXOTFjeUk2Wm1Gc2MyVjkudm5GMjNMU3Y2bll6WkRDNTcwMmNXdXFEZ0t4WGFDS1RQR3dWR3pFaUZKbEhCeWItRGRhUGJYd1doS3lia21sa2lkWVo0MTFrVjJyeFlCOU9yREdXVlEiLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwiZXhwaXJlc19pbiI6MzYwMCwiZXhwaXJlc19hdCI6MTc4ODU1MTkzNiwicmVmcmVzaF90b2tlbiI6Imw3cm9kb3R0eGRveCIsInVzZXIiOnsiaWQiOiJlOWEzNDRiOS0xNWY3LTQzZTAtYWVmNi01ZWU4ODc0OGRlNWMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6ImNoaW5tYXkwMDAyMUBnbWFpbC5jb20iLCJlbWFpbF9jb25maXJtZWRfYXQiOiIyMDI1LTExLTAyVDA1OjU2OjQxLjU5ODQ5NFoiLCJwaG9uZSI6IiIsImNvbmZpcm1lZF9hdCI6IjIwMjUtMTEtMDJUMDU6NTY6NDEuNTk4NDk0WiIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjYtMDktMDRUMTc6MzA6MjEuNzc4MzIzWiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xkZnVSRkl4QXVFZC10MlN1NkpGRlJhM3l5NVkycGszRXNmOWNvXzZLWWRKWjZVdz1zOTYtYyIsImVtYWlsIjoiY2hpbm1heTAwMDIxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJDaGlubWF5IiwiaWQiOiJjMDQ1NDI5YS1lZDMwLTQ0ZTUtYWZlOS1lNTg0YTc1NzA1NDEiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJsYXN0X2xpbmtlZF9zdXBhYmFzZV91c2VyX2lkIjoiOTQzYThmZjEtNzMwMi00MmExLTk4MDEtNzQ0YTJmMzU0YTMxIiwibmFtZSI6IkNoaW5tYXkiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJod",
        "domain": "arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "arena-auth-prod-v1.1",
        "value": "HRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMZGZ1UkZJeEF1RWQtdDJTdTZKRkZSYTN5eTVZMnBrM0VzZjljb182S1lkSlo2VXc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMDUwNDg2NDk5MzA3MTEwMzQ2NSIsInN1YiI6IjExMDUwNDg2NDk5MzA3MTEwMzQ2NSJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6ImExMDhmYjZiLWI0MGQtNGY3MS1iOTdhLTYxMmM0MTYzYWM4NCIsImlkIjoiMTEwNTA0ODY0OTkzMDcxMTAzNDY1IiwidXNlcl9pZCI6ImU5YTM0NGI5LTE1ZjctNDNlMC1hZWY2LTVlZTg4NzQ4ZGU1YyIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xkZnVSRkl4QXVFZC10MlN1NkpGRlJhM3l5NVkycGszRXNmOWNvXzZLWWRKWjZVdz1zOTYtYyIsImVtYWlsIjoiY2hpbm1heTAwMDIxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJDaGlubWF5IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IkNoaW5tYXkiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMZGZ1UkZJeEF1RWQtdDJTdTZKRkZSYTN5eTVZMnBrM0VzZjljb182S1lkSlo2VXc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMDUwNDg2NDk5MzA3MTEwMzQ2NSIsInN1YiI6IjExMDUwNDg2NDk5MzA3MTEwMzQ2NSJ9LCJwcm92aWRlciI6Imdvb2dsZSIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjUtMTEtMDJUMDU6NTY6NDEuNTk0MjNaIiwiY3JlYXRlZF9hdCI6IjIwMjUtMTEtMDJUMDU6NTY6NDEuNTk0Mjc2WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTA5LTA0VDE3OjMwOjIxLjAxMzU4NFoiLCJlbWFpbCI6ImNoaW5tYXkwMDAyMUBnbWFpbC5jb20ifV0sImNyZWF0ZWRfYXQiOiIyMDI1LTExLTAyVDA1OjU2OjQxLjU5Mjc0NVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wOS0wNFQxODo1ODo1Ni4yOTE4NDRaIiwiaXNfYW5vbnltb3VzIjpmYWxzZX19",
        "domain": "arena.ai",
        "path": "/",
        "sameSite": "Lax",
        "secure": True
    },
    {
        "name": "cf_clearance",
        "value": "JCdWLYM_pNrqDSJe6fvXnWk8Zrg7byKIuZytNv.Q9SE-1788544000-1.2.1.1-B_BhBXNN8R9t.jCk8zzwjGYKzo4Od.1Y0ssFuxpo5qKhNcfbQMKK1_lGD6rFippXDfwX2M_AnbkW6al8SRuRuGmuQV7azywvlfTawvaUxrlCqc8ZxsL7HcAqEaFUMWxh.jTrPk8Ma52vlVM.Up67Ki7BG6zGEuy.AvkyPZbQUPTzWyrimoQ6_g0OJkC24Z6lQWJn2ZlV.bDnuKfV6C1EKxSkHRab8TOUA4ks1030PBPAJ9zNc7483J.vuU1BjlbnQYiafczrV32OEJPIZStYEwF1Wlot6HMWgIMe7TisepTwtOJJhblvTGhEZDv1utt31uFY.LMFY.mVXQNfP_O3.dW41F_a7a5gRmGLW41Wyhg",
        "domain": ".arena.ai",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "__cf_bm",
        "value": "Arjh5xX_.7gQirvUmEbTU8A5CAO_qCAJNxhpMGiwwJY-1788547824.2691774-1.0.1.1-OOKZUeHdRNh7peQaC5FYxVIAA6SZ5b2DCmur_HX9ssA4139zEW.owb78JllkNSfoDieXm58.7Fj8l0rDGVgDlUhI2cGEPMcXofEutlX9QGKR7KLc6AhMDDyXWri85pGE",
        "domain": ".arena.ai",
        "path": "/",
        "httpOnly": True,
        "secure": True
    },
    {
        "name": "arena_visit_id",
        "value": "%7B%22id%22%3A%2201a06dc9-c854-76b9-bc79-924e56c1936a%22%2C%22started%22%3A1788548335700%2C%22lastSeen%22%3A1788548335700%7D",
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
                "--disable-web-security",
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
            ]
        )

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )

        # Inject base cookies and duplicate for lmarena.ai as well
        all_cookies = []
        for c in DEFAULT_COOKIES:
            all_cookies.append(dict(c))
            # Also add for lmarena.ai
            lm_c = dict(c)
            lm_c["domain"] = c["domain"].replace("arena.ai", "lmarena.ai")
            all_cookies.append(lm_c)

        await context.add_cookies(all_cookies)
        print(f"🔑 Injected {len(all_cookies)} authentication & session cookies!")

        # Inject script into every page and frame before execution
        await context.add_init_script(injector_code)
        page = await context.new_page()

        # Pipe console messages directly to GitHub Actions terminal
        page.on("console", lambda msg: print(f"[Browser Console] {msg.text}"))
        page.on("pageerror", lambda err: print(f"[Browser Error] {err}"))

        print("[2/3] Navigating to https://arena.ai/?mode=direct...")
        try:
            await page.goto("https://arena.ai/?mode=direct", wait_until="domcontentloaded", timeout=60000)
            print(f"✅ Page loaded! Current URL: {page.url}")
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
