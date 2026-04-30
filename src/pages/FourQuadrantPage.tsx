import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPersonalInfo } from '../services/dataService';
import { getAllQuadrantTasks, updateTaskStatus, addTask } from '../services/quadrantService';
import { getTasks, getMessages, parseVoiceCommand } from '../services/feishuService';
import type { PersonalInfo, Task } from '../types';
import { useSEO } from '../hooks/useSEO';

const FourQuadrantPage = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [feishuLoading, setFeishuLoading] = useState(false);
  const [tasks, setTasks] = useState({
    work: [] as Task[],
    life: [] as Task[],
    study: [] as Task[],
    other: [] as Task[]
  });
  const [voiceCommand, setVoiceCommand] = useState('');
  const [commandResult, setCommandResult] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const infoData = await getPersonalInfo();
        setPersonalInfo(infoData);
        
        // 从四象限数据服务获取真实数据
        const quadrantTasks = await getAllQuadrantTasks();
        setTasks({
          work: quadrantTasks.work || [],
          life: quadrantTasks.life || [],
          study: quadrantTasks.study || [],
          other: quadrantTasks.other || []
        });
        
        // 从飞书API获取数据
        await loadFeishuData();
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 从飞书API加载数据
  const loadFeishuData = async () => {
    try {
      setFeishuLoading(true);
      
      // 获取飞书任务
      const feishuTasks = await getTasks();
      console.log('Feishu tasks:', feishuTasks);
      
      // 获取飞书消息
      const feishuMessages = await getMessages();
      console.log('Feishu messages:', feishuMessages);
      
      // 解析飞书消息中的语音指令
      for (const message of feishuMessages) {
        if (message.content.includes('放进') || message.content.includes('提醒我')) {
          try {
            const parsedCommand = await parseVoiceCommand(message.content);
            console.log('Parsed command:', parsedCommand);
            
            // 根据解析结果添加任务
            await addTask(parsedCommand.category, {
              title: parsedCommand.content,
              description: `来自飞书语音指令: ${message.content}`,
              priority: 'medium',
              status: 'pending',
              dueDate: new Date().toISOString(),
              category: parsedCommand.category
            });
          } catch (error) {
            console.error('Failed to parse command:', error);
          }
        }
      }
      
      // 重新加载任务数据
      const updatedTasks = await getAllQuadrantTasks();
      setTasks({ work: updatedTasks.work || [], life: updatedTasks.life || [], study: updatedTasks.study || [], other: updatedTasks.other || [] });
    } catch (error) {
      console.error('Failed to load Feishu data:', error);
    } finally {
      setFeishuLoading(false);
    }
  };

  // SEO优化
  useSEO({
    title: '四象限生活工作助理',
    description: '一个以四象限布局为视觉载体的轻量级个人管理界面',
    keywords: '四象限,生活工作助理,个人管理,时间管理',
    ogTitle: '四象限生活工作助理',
    ogDescription: '一个以四象限布局为视觉载体的轻量级个人管理界面',
    ogUrl: window.location.href,
  });

  const handleTaskAction = async (quadrant: string, taskId: string, action: 'start' | 'skip' | 'postpone') => {
    try {
      let newStatus: Task['status'] = 'pending';
      if (action === 'start') {
        newStatus = 'in_progress';
      } else if (action === 'skip') {
        newStatus = 'completed';
      } else if (action === 'postpone') {
        newStatus = 'postponed';
      }
      
      // 调用服务更新任务状态
      await updateTaskStatus(quadrant, taskId, newStatus);
      
      // 更新本地状态
      setTasks(prev => ({
        ...prev,
        [quadrant]: prev[quadrant].map(task => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        })
      }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // 处理语音指令提交
  const handleVoiceCommandSubmit = async () => {
    if (!voiceCommand.trim()) return;
    
    try {
      setFeishuLoading(true);
      setCommandResult(null);
      
      // 解析语音指令
      const parsedCommand = await parseVoiceCommand(voiceCommand);
      console.log('Parsed voice command:', parsedCommand);
      
      // 添加任务
      await addTask(parsedCommand.category, {
        title: parsedCommand.content,
        description: `来自语音指令: ${voiceCommand}`,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date().toISOString(),
        category: parsedCommand.category
      });
      
      // 重新加载任务数据
      const updatedTasks = await getAllQuadrantTasks();
      setTasks({ work: updatedTasks.work || [], life: updatedTasks.life || [], study: updatedTasks.study || [], other: updatedTasks.other || [] });
      
      setCommandResult(`指令已执行: ${parsedCommand.content} 已添加到 ${parsedCommand.category === 'work' ? '工作' : parsedCommand.category === 'life' ? '生活' : parsedCommand.category === 'study' ? '学习' : '其他'} 象限`);
      setVoiceCommand('');
    } catch (error) {
      console.error('Failed to process voice command:', error);
      setCommandResult('指令解析失败，请重试');
    } finally {
      setFeishuLoading(false);
    }
  };

  if (loading || !personalInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  const quadrantConfig = {
    work: {
      title: '工作',
      color: 'bg-blue-500',
      textColor: 'text-blue-900',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      accentColor: 'bg-blue-100'
    },
    life: {
      title: '生活',
      color: 'bg-orange-500',
      textColor: 'text-orange-900',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      accentColor: 'bg-orange-100'
    },
    study: {
      title: '学习',
      color: 'bg-green-500',
      textColor: 'text-green-900',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      accentColor: 'bg-green-100'
    },
    other: {
      title: '其他',
      color: 'bg-purple-500',
      textColor: 'text-purple-900',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      accentColor: 'bg-purple-100'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar personalInfo={personalInfo} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-center">四象限生活工作助理</h1>
          <p className="text-center mt-4 text-primary-100">
            一眼看清今天该做什么，轻松管理生活与工作
          </p>
        </div>
      </section>

      {/* Voice Command Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">语音指令输入</h2>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                value={voiceCommand}
                onChange={(e) => setVoiceCommand(e.target.value)}
                placeholder="例如: 把'整理项目图纸'放进工作"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={feishuLoading}
              />
              <button
                onClick={handleVoiceCommandSubmit}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto w-full"
                disabled={feishuLoading || !voiceCommand.trim()}
              >
                {feishuLoading ? '处理中...' : '执行'}
              </button>
            </div>
            {commandResult && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                {commandResult}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500">
              <p>💡 语音指令示例：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>把"整理项目图纸"放进工作</li>
                <li>提醒我明天喝水</li>
                <li>添加学习任务：复习AGI课程</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Four Quadrant Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            {/* 左上：工作 */}
            <div className={`${quadrantConfig.work.bgColor} rounded-lg shadow-lg border ${quadrantConfig.work.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className={`${quadrantConfig.work.color} text-white p-4`}>
                <h2 className="text-xl font-bold">{quadrantConfig.work.title}</h2>
                <p className="text-sm opacity-90">推进职业目标</p>
              </div>
              <div className="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
                {tasks.work.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.work.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold ${quadrantConfig.work.textColor}`}>{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTaskAction('work', task.id, 'start')}
                            className="flex-1 py-1.5 px-3 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
                          >
                            开始
                          </button>
                          <button 
                            onClick={() => handleTaskAction('work', task.id, 'skip')}
                            className="flex-1 py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            完成
                          </button>
                          <button 
                            onClick={() => handleTaskAction('work', task.id, 'postpone')}
                            className="py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            延期
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>暂无任务</p>
                    <p className="text-sm mt-1">通过飞书语音或手动添加</p>
                  </div>
                )}
              </div>
            </div>

            {/* 右上：生活 */}
            <div className={`${quadrantConfig.life.bgColor} rounded-lg shadow-lg border ${quadrantConfig.life.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className={`${quadrantConfig.life.color} text-white p-4`}>
                <h2 className="text-xl font-bold">{quadrantConfig.life.title}</h2>
                <p className="text-sm opacity-90">维持身心健康</p>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
                {tasks.life.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.life.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold ${quadrantConfig.life.textColor}`}>{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTaskAction('life', task.id, 'start')}
                            className="flex-1 py-1.5 px-3 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
                          >
                            开始
                          </button>
                          <button 
                            onClick={() => handleTaskAction('life', task.id, 'skip')}
                            className="flex-1 py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            完成
                          </button>
                          <button 
                            onClick={() => handleTaskAction('life', task.id, 'postpone')}
                            className="py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            延期
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>暂无任务</p>
                    <p className="text-sm mt-1">通过飞书语音或手动添加</p>
                  </div>
                )}
              </div>
            </div>

            {/* 左下：学习 */}
            <div className={`${quadrantConfig.study.bgColor} rounded-lg shadow-lg border ${quadrantConfig.study.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className={`${quadrantConfig.study.color} text-white p-4`}>
                <h2 className="text-xl font-bold">{quadrantConfig.study.title}</h2>
                <p className="text-sm opacity-90">积累长期能力</p>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
                {tasks.study.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.study.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold ${quadrantConfig.study.textColor}`}>{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTaskAction('study', task.id, 'start')}
                            className="flex-1 py-1.5 px-3 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
                          >
                            开始
                          </button>
                          <button 
                            onClick={() => handleTaskAction('study', task.id, 'skip')}
                            className="flex-1 py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            完成
                          </button>
                          <button 
                            onClick={() => handleTaskAction('study', task.id, 'postpone')}
                            className="py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            延期
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>暂无任务</p>
                    <p className="text-sm mt-1">通过飞书语音或手动添加</p>
                  </div>
                )}
              </div>
            </div>

            {/* 右下：其他 */}
            <div className={`${quadrantConfig.other.bgColor} rounded-lg shadow-lg border ${quadrantConfig.other.borderColor} overflow-hidden hover:shadow-xl transition-all duration-300`}>
              <div className={`${quadrantConfig.other.color} text-white p-4`}>
                <h2 className="text-xl font-bold">{quadrantConfig.other.title}</h2>
                <p className="text-sm opacity-90">满足个人探索</p>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-y-auto">
                {tasks.other.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.other.map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-semibold ${quadrantConfig.other.textColor}`}>{task.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleTaskAction('other', task.id, 'start')}
                            className="flex-1 py-1.5 px-3 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition"
                          >
                            开始
                          </button>
                          <button 
                            onClick={() => handleTaskAction('other', task.id, 'skip')}
                            className="flex-1 py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            完成
                          </button>
                          <button 
                            onClick={() => handleTaskAction('other', task.id, 'postpone')}
                            className="py-1.5 px-3 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                          >
                            延期
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>暂无任务</p>
                    <p className="text-sm mt-1">通过飞书语音或手动添加</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FourQuadrantPage;