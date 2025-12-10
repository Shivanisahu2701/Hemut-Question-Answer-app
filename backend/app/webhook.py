import requests
import os

WEBHOOK_URL = os.getenv("WEBHOOK_URL") 

def call_webhook(payload: dict):
    if not WEBHOOK_URL:
        return None
    try:
        r = requests.post(WEBHOOK_URL, json=payload, timeout=3)
        return r.status_code
    except Exception:
        return None
