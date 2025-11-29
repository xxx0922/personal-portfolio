@echo off
echo ========================================
echo 个人网站 - 启动脚本
echo ========================================
echo.

cd /d %~dp0

echo [1/3] 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo 后端依赖未安装，正在安装...
    call npm install
)

echo.
echo [2/3] 初始化后端数据...
if not exist "data" (
    call npm run init
)

echo.
echo [3/3] 启动服务...
echo.
echo 正在启动后端服务器 (端口 3001)...
start "后端服务器" cmd /k "npm start"

timeout /t 3 >nul

cd ..
echo 正在启动前端服务器 (端口 5173)...
start "前端服务器" cmd /k "npm run dev"

echo.
echo ========================================
echo 服务启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:5173
echo 管理后台: http://localhost:5173/admin/login
echo 后端API: http://localhost:3001/api
echo.
echo 管理员账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 按任意键退出...
pause >nul
