#!/bin/bash

echo "========================================"
echo "个人网站 - 启动脚本"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] 检查后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "后端依赖未安装，正在安装..."
    npm install
fi

echo ""
echo "[2/3] 初始化后端数据..."
if [ ! -d "data" ]; then
    npm run init
fi

echo ""
echo "[3/3] 启动服务..."
echo ""
echo "正在启动后端服务器 (端口 3001)..."
npm start &
BACKEND_PID=$!

sleep 3

cd ..
echo "正在启动前端服务器 (端口 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "服务启动完成！"
echo "========================================"
echo ""
echo "前端地址: http://localhost:5173"
echo "管理后台: http://localhost:5173/admin/login"
echo "后端API: http://localhost:3001/api"
echo ""
echo "管理员账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

wait
