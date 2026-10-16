"""FastAPI 后端 - 学苑学生管理系统"""

import json
import re
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# 配置
SECRET_KEY = "your-secret-key-change-in-production"  # 生产环境应使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

app = FastAPI(title="学苑学生管理系统 API", version="0.2.0")

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# 测试数据文件路径
TEST_DATA_PATH = Path(__file__).parent / "test_data.js"

# 演示用户密码哈希（明文: 123456）
# bcrypt 生成的哈希值，实际项目中应从数据库读取
DEMO_PASSWORD_HASH = "$2b$12$LJ3m4ys3Gv0DUbBqQq3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"


# ========== 数据模型 ==========
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserInfo(BaseModel):
    id: str
    username: str
    displayName: str
    role: str
    refId: Optional[str] = None


# ========== 工具函数 ==========
def load_test_data() -> dict:
    """从 test_data.js 加载数据"""
    raw = TEST_DATA_PATH.read_text(encoding="utf-8")
    match = re.search(r"const\s+TEST_DATA\s*=\s*(\{.*\});", raw, re.DOTALL)
    if not match:
        raise ValueError("无法解析 test_data.js")
    return json.loads(match.group(1))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    # 演示模式：直接比较明文（生产环境应使用 bcrypt）
    return plain_password == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """验证 JWT token 并返回用户信息"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    data = load_test_data()
    user = next((u for u in data.get("users", []) if u["username"] == username), None)
    if user is None:
        raise credentials_exception

    # 不返回密码
    return {
        "id": user["id"],
        "username": user["username"],
        "displayName": user["displayName"],
        "role": user["role"],
        "refId": user.get("refId"),
    }


# ========== 路由 ==========
@app.get("/")
async def root():
    return {"message": "学苑学生管理系统 API", "docs": "/docs"}


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """用户登录，返回 JWT token"""
    data = load_test_data()
    user = next(
        (u for u in data.get("users", []) if u["username"] == request.username),
        None,
    )
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码不正确",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires,
    )

    return TokenResponse(
        access_token=access_token,
        user={
            "id": user["id"],
            "username": user["username"],
            "displayName": user["displayName"],
            "role": user["role"],
            "refId": user.get("refId"),
        },
    )


@app.get("/api/auth/me", response_model=UserInfo)
async def get_me(current_user: dict = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return current_user


@app.get("/api/data")
async def get_all_data(current_user: dict = Depends(get_current_user)):
    """返回全部数据（需要认证）"""
    data = load_test_data()
    # 移除用户密码
    if "users" in data:
        data["users"] = [
            {k: v for k, v in u.items() if k != "password"} for u in data["users"]
        ]
    return {"success": True, "data": data}


@app.get("/api/data/{entity}")
async def get_entity(entity: str, current_user: dict = Depends(get_current_user)):
    """返回指定实体数据（需要认证）"""
    data = load_test_data()
    if entity not in data:
        return {"success": False, "error": f"未知实体: {entity}"}
    return {"success": True, "data": data[entity]}


@app.get("/api/health")
async def health_check():
    """健康检查（无需认证）"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
