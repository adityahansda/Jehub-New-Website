import asyncio
import os
import uvicorn
from fastapi import FastAPI, Request, Response
from telegram import Update

from bot import create_bot_application

# Initialize FastAPI app
app = FastAPI()

# Get the bot application
bot_app = create_bot_application()

@app.on_event("startup")
async def startup_event():
    """On startup, set the webhook for the bot."""
    webhook_url = os.getenv('VERCEL_URL')
    if not webhook_url:
        print("VERCEL_URL environment variable not set. Webhook not configured.")
        return

    print(f"Setting webhook to {webhook_url}/api/telegram")
    await bot_app.bot.set_webhook(f"{webhook_url}/api/telegram")

@app.post("/api/telegram")
async def handle_telegram_update(request: Request):
    """Handle incoming Telegram updates."""
    try:
        body = await request.json()
        update = Update.de_json(body, bot_app.bot)
        await bot_app.process_update(update)
        return Response(status_code=200)
    except Exception as e:
        print(f"Error processing update: {e}")
        return Response(status_code=500)

@app.get("/")
def index():
    return {"status": "ok", "message": "Telegram bot is running."}

# To run locally for testing (optional)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)