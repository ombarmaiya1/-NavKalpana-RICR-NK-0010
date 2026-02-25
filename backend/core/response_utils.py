from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional

def success_response(data: Any = None, message: str = "Operation successful", status_code: int = 200):
    content = {
        "success": True,
        "message": message,
        "data": data
    }
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(content)
    )

def error_response(message: str = "An error occurred", data: Any = None, status_code: int = 400):
    content = {
        "success": False,
        "message": message,
        "data": data
    }
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(content)
    )
