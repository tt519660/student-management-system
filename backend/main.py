"""FastAPI 后端 - 学苑学生管理系统"""

import json
import re
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="学苑学生管理系统 API", version="0.1.0")

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 测试数据文件路径
TEST_DATA_PATH = Path(__file__).parent / "test_data.js"


def load_test_data() -> dict:
    """从 test_data.js 加载数据"""
    raw = TEST_DATA_PATH.read_text(encoding="utf-8")
    # 提取 JSON 对象（test_data.js 中 const TEST_DATA = {...}）
    match = re.search(r"const\s+TEST_DATA\s*=\s*(\{.*\});", raw, re.DOTALL)
    if not match:
        raise ValueError("无法解析 test_data.js")
    return json.loads(match.group(1))


@app.get("/")
async def root():
    return {"message": "学苑学生管理系统 API", "docs": "/docs"}


@app.get("/api/data")
async def get_all_data():
    """返回全部测试数据"""
    data = load_test_data()
    return {"success": True, "data": data}


@app.get("/api/data/{entity}")
async def get_entity(entity: str):
    """返回指定实体数据，如 /api/data/students"""
    data = load_test_data()
    if entity not in data:
        return {"success": False, "error": f"未知实体: {entity}"}
    return {"success": True, "data": data[entity]}


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
