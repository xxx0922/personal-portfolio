import { useState, useEffect } from 'react';

// API 基础 URL - 从环境变量读取
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  order: number;
  visible: boolean;
  isExternal: boolean;
}

const NavigationManager = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNavigation();
  }, []);

  const loadNavigation = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/navigation/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to load navigation:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/navigation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(items)
      });

      if (response.ok) {
        await loadNavigation();
        alert('保存成功！');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem: NavigationItem = {
      id: Date.now().toString(),
      label: '',
      path: '',
      order: items.length,
      visible: true,
      isExternal: false
    };
    setEditingItem(newItem);
    setIsAdding(true);
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem({ ...item });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个导航项吗？')) return;
    const newItems = items.filter(item => item.id !== id);
    // 重新排序
    newItems.forEach((item, index) => {
      item.order = index;
    });
    setItems(newItems);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    // 更新order
    newItems.forEach((item, idx) => {
      item.order = idx;
    });
    setItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    // 更新order
    newItems.forEach((item, idx) => {
      item.order = idx;
    });
    setItems(newItems);
  };

  const handleToggleVisible = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const handleToggleExternal = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isExternal: !item.isExternal } : item
    ));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    if (!editingItem.label || !editingItem.path) {
      alert('请填写标签和路径');
      return;
    }

    if (isAdding) {
      setItems([...items, editingItem]);
    } else {
      setItems(items.map(item =>
        item.id === editingItem.id ? editingItem : item
      ));
    }

    setEditingItem(null);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">导航菜单管理</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + 添加菜单项
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSaving}
          >
            {isSaving ? '保存中...' : '保存更改'}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顺序
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                标签
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                路径
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id} className={!item.visible ? 'bg-gray-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{index + 1}</span>
                    <div className="flex flex-col ml-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === items.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{item.path}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleExternal(item.id)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:opacity-80 transition ${
                      item.isExternal ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.isExternal ? '外部链接' : '内部链接'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleVisible(item.id)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.visible ? '显示' : '隐藏'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">暂无导航菜单项</p>
            <p className="text-sm mt-2">点击上方按钮添加菜单项</p>
          </div>
        )}
      </div>

      {/* 编辑/添加弹窗 */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isAdding ? '添加导航项' : '编辑导航项'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="例如: 首页"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  路径 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingItem.path}
                  onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white font-mono text-sm"
                  placeholder="例如: / 或 #section 或 https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  内部链接使用 / 或 #section，外部链接使用完整URL
                </p>

                {/* 常用内部链接快捷选择 */}
                {!editingItem.isExternal && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-xs font-medium text-gray-700 mb-2">快捷选择常用链接：</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '首页', path: '/' },
                        { label: '关于我', path: '/about' },
                        { label: '博客文章', path: '/blog' },
                        { label: '新闻动态', path: '/news' },
                        { label: '项目经验', path: '#projects' },
                        { label: '影音书籍', path: '#media' },
                        { label: '精彩瞬间', path: '#photos' },
                        { label: '工作经历', path: '#experience' },
                        { label: '知识文档', path: '#documents' },
                        { label: '联系我', path: '#contact' }
                      ].map((link) => (
                        <button
                          key={link.path}
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, path: link.path })}
                          className={`px-2 py-1 text-xs rounded border transition ${
                            editingItem.path === link.path
                              ? 'bg-blue-500 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
                          }`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  链接类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={!editingItem.isExternal}
                      onChange={() => setEditingItem({ ...editingItem, isExternal: false })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">内部链接</span>
                      <span className="ml-2 text-gray-500">（本站页面）</span>
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={editingItem.isExternal}
                      onChange={() => setEditingItem({ ...editingItem, isExternal: true })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-900">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">外部链接</span>
                      <span className="ml-2 text-gray-500">（新标签打开）</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingItem.visible}
                  onChange={(e) => setEditingItem({ ...editingItem, visible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  在前端显示
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
