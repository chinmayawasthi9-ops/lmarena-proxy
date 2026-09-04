import os
import sys
import time
import subprocess
import signal

def main():
    print("=" * 60)
    print("🚀 Starting GitHub Cloud Browser Bridge for Cloudflare Worker")
    print("Target: wss://lmarena-worker.crosskhrome1.workers.dev/ws")
    print("=" * 60)

    # 1. Start Xvfb virtual display
    print("[1/3] Starting Xvfb virtual display (:99)...")
    xvfb_proc = subprocess.Popen([
        "Xvfb", ":99", "-screen", "0", "1280x1024x24", "-ac"
    ])
    os.environ["DISPLAY"] = ":99"
    time.sleep(2)

    # 2. Path to extension
    workspace = os.path.dirname(os.path.abspath(__file__))
    extension_path = os.path.join(workspace, "extension")
    print(f"[2/3] Loading extension from: {extension_path}")

    # 3. Launch Google Chrome
    chrome_bin = "google-chrome"
    # Check if google-chrome or chromium is available
    if subprocess.call(["which", "google-chrome"], stdout=subprocess.DEVNULL) != 0:
        chrome_bin = "chromium"

    print(f"[3/3] Launching {chrome_bin} with LMArena extension...")
    chrome_proc = subprocess.Popen([
        chrome_bin,
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        f"--disable-extensions-except={extension_path}",
        f"--load-extension={extension_path}",
        "--enable-logging=stderr",
        "--v=1",
        f"--user-data-dir=/tmp/chrome-profile-{int(time.time())}",
        "https://arena.ai"
    ])

    print("✅ Headless browser running and connected to Cloudflare Worker!")
    print("Keeping cloud bridge active (Max run: ~5.5 hours per runner)...")

    # Run for up to 5.5 hours (GitHub Actions max is 6 hours)
    start_time = time.time()
    max_duration = 5.5 * 3600  # 5.5 hours in seconds

    def cleanup(signum, frame):
        print("\nStopping browser processes...")
        chrome_proc.terminate()
        xvfb_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    try:
        iteration = 0
        while time.time() - start_time < max_duration:
            time.sleep(60)
            iteration += 1
            elapsed_min = int((time.time() - start_time) / 60)
            if iteration % 10 == 0:
                print(f"[Heartbeat] Cloud browser still active. Elapsed: {elapsed_min} minutes.")
                # Ensure chrome is still running
                if chrome_proc.poll() is not None:
                    print("⚠️ Chrome exited, restarting...")
                    chrome_proc = subprocess.Popen([
                        chrome_bin,
                        "--no-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        f"--load-extension={extension_path}",
                        "https://lmarena.ai"
                    ])
    finally:
        cleanup(None, None)

if __name__ == "__main__":
    main()
