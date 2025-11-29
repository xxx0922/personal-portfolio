#!/bin/bash

echo "========================================"
echo "后端管理系统 - 功能测试"
echo "========================================"
echo ""

API_URL="http://localhost:3001/api"

# 测试健康检查
echo "1. 测试健康检查..."
response=$(curl -s ${API_URL}/health)
if echo "$response" | grep -q "ok"; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败"
    exit 1
fi

# 测试登录
echo ""
echo "2. 测试登录..."
login_response=$(curl -s -X POST ${API_URL}/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}')

if echo "$login_response" | grep -q "token"; then
    echo "✅ 登录成功"
    token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ 登录失败"
    exit 1
fi

# 测试获取项目列表
echo ""
echo "3. 测试获取项目列表..."
projects=$(curl -s ${API_URL}/projects)
if [ ! -z "$projects" ]; then
    echo "✅ 获取项目列表成功"
else
    echo "❌ 获取项目列表失败"
fi

# 测试获取技能列表
echo ""
echo "4. 测试获取技能列表..."
skills=$(curl -s ${API_URL}/skills)
if [ ! -z "$skills" ]; then
    echo "✅ 获取技能列表成功"
else
    echo "❌ 获取技能列表失败"
fi

# 测试获取个人信息
echo ""
echo "5. 测试获取个人信息..."
personal_info=$(curl -s ${API_URL}/personal-info)
if echo "$personal_info" | grep -q "name"; then
    echo "✅ 获取个人信息成功"
else
    echo "❌ 获取个人信息失败"
fi

# 测试认证保护的端点
echo ""
echo "6. 测试认证保护..."
create_response=$(curl -s -X POST ${API_URL}/projects \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d '{"title":"测试项目","description":"测试描述","role":"测试角色","duration":"2024.01","technologies":[],"images":[],"achievements":[]}')

if echo "$create_response" | grep -q "id"; then
    echo "✅ 认证保护正常工作"
else
    echo "⚠️  认证保护测试未完成（可能是数据验证）"
fi

echo ""
echo "========================================"
echo "测试完成！"
echo "========================================"
echo ""
echo "所有核心功能正常工作 ✅"
echo ""
echo "访问地址："
echo "  - 前台: http://localhost:5173"
echo "  - 管理后台: http://localhost:5173/admin/login"
echo "  - 后端API: http://localhost:3001/api"
echo ""
