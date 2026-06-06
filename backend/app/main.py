from fastapi import FastAPI

from app.api.routes import router as api_router
from app.utils.logger import configure_logging

configure_logging()

app = FastAPI(
    title="Policy Mitra AI",
    version="0.1.0",
    description="Backend scaffold for a policy explanation workflow engine."
)

app.include_router(api_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}
