import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5000"
OUTPUT_DIR = "screenshots/final"

def capture_screenshots():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Increase viewport size to ensure good screenshots
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        print(f"Navigating to {BASE_URL}...")
        page.goto(BASE_URL)

        # Wait for the app to load (look for AETHER_OS text)
        page.wait_for_selector("text=AETHER_OS", timeout=10000)

        # If boot sequence is shown, wait for it or it might be already done since we just loaded.
        # The code says: const [showBootSequence, setShowBootSequence] = useState(() => { ... return !hasSeenBoot })
        # If it's the first time, it might show.
        # Let's wait a bit just in case, or look for the 'skip' button if there is one, or just wait for the main content.
        # The boot sequence has onComplete which sets localStorage.

        # We can try to force set localStorage before navigating if we want to skip boot.
        # But let's just wait.

        time.sleep(2) # Give it a moment to settle animations

        # 1. Synapse (Default)
        print("Capturing Synapse...")
        page.screenshot(path=f"{OUTPUT_DIR}/synapse_final.png")

        # 2. Canvas
        print("Switching to Canvas...")
        page.get_by_role("tab", name="CANVAS").click()
        time.sleep(1) # Wait for animation
        page.screenshot(path=f"{OUTPUT_DIR}/canvas_final.png")

        # 3. Holo-Chat
        print("Switching to Holo-Chat...")
        page.get_by_role("tab", name="HOLO-CHAT").click()
        time.sleep(1)
        page.screenshot(path=f"{OUTPUT_DIR}/chat_final.png")

        # 4. Vault
        print("Switching to Vault...")
        page.get_by_role("tab", name="VAULT").click()
        time.sleep(1)
        page.screenshot(path=f"{OUTPUT_DIR}/vault_final.png")

        browser.close()
        print("Done!")

if __name__ == "__main__":
    capture_screenshots()
