/**
 * 飞书API模拟服务 - 模拟飞书开放平台API
 */

// 模拟飞书应用配置
const feishuConfig = {
  appId: 'cli_a1b2c3d4e5f6',
  appSecret: 'A1B2C3D4E5F6G7H8I9J0',
  redirectUri: 'http://localhost:5173/quadrant',
  apiBaseUrl: 'https://open.feishu.cn/open-apis'
};

// 模拟访问令牌
let accessToken = 'mock_access_token_' + Date.now();
let tokenExpiresAt = Date.now() + 7200 * 1000; // 2小时过期

// 模拟飞书数据
const mockFeishuData = {
  // 用户信息
  user: {
    id: 'u123456',
    name: '张三',
    en_name: 'zhangsan',
    avatar_url: 'https://example.com/avatar.jpg',
    email: 'zhangsan@example.com',
    mobile: '+8613800138000'
  },
  
  // 日历事件
  calendar: [
    {
      event_id: 'evt_123',
      summary: '项目进度会议',
      description: '每周项目进度汇报会议',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: '线上会议',
      organizer: {
        id: 'u123456',
        name: '张三'
      },
      attendees: [
        {
          id: 'u123456',
          name: '张三',
          response_status: 'accepted'
        },
        {
          id: 'u654321',
          name: '李四',
          response_status: 'tentative'
        }
      ]
    },
    {
      event_id: 'evt_456',
      summary: '团队建设活动',
      description: '季度团队建设活动规划',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      location: '公司会议室',
      organizer: {
        id: 'u123456',
        name: '张三'
      },
      attendees: [
        {
          id: 'u123456',
          name: '张三',
          response_status: 'accepted'
        }
      ]
    }
  ],
  
  // 任务
  tasks: [
    {
      task_id: 'task_123',
      summary: '完成项目文档',
      description: '编写项目技术文档',
      status: 'pending',
      priority: 'high',
      due_date: new Date().toISOString(),
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      created_by: {
        id: 'u123456',
        name: '张三'
      }
    },
    {
      task_id: 'task_456',
      summary: '准备周会材料',
      description: '整理周会汇报材料',
      status: 'pending',
      priority: 'medium',
      due_date: new Date().toISOString(),
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      created_by: {
        id: 'u123456',
        name: '张三'
      }
    },
    {
      task_id: 'task_789',
      summary: '代码审查',
      description: '审查团队成员提交的代码',
      status: 'in_progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      created_by: {
        id: 'u123456',
        name: '张三'
      }
    }
  ],
  
  // 消息
  messages: [
    {
      message_id: 'msg_123',
      content: '把"整理项目图纸"放进工作',
      sender: {
        id: 'u123456',
        name: '张三'
      },
      created_at: new Date().toISOString(),
      type: 'text'
    },
    {
      message_id: 'msg_456',
      content: '提醒我明天喝水',
      sender: {
        id: 'u123456',
        name: '张三'
      },
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'text'
    }
  ]
};

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟获取访问令牌
export const getAccessToken = async (): Promise<{ access_token: string; expires_in: number }> => {
  await delay(300);
  
  // 如果令牌即将过期，重新生成
  if (Date.now() > tokenExpiresAt - 60000) { // 过期前1分钟
    accessToken = 'mock_access_token_' + Date.now();
    tokenExpiresAt = Date.now() + 7200 * 1000;
  }
  
  return {
    access_token: accessToken,
    expires_in: 7200
  };
};

// 模拟获取用户信息
export const getUserInfo = async (): Promise<any> => {
  await delay(200);
  return mockFeishuData.user;
};

// 模拟获取日历事件
export const getCalendarEvents = async (startDate: string, endDate: string): Promise<any[]> => {
  await delay(400);
  return mockFeishuData.calendar;
};

// 模拟获取任务列表
export const getTasks = async (status?: string): Promise<any[]> => {
  await delay(300);
  if (status) {
    return mockFeishuData.tasks.filter(task => task.status === status);
  }
  return mockFeishuData.tasks;
};

// 模拟获取消息列表
export const getMessages = async (limit: number = 10): Promise<any[]> => {
  await delay(200);
  return mockFeishuData.messages.slice(0, limit);
};

// 模拟创建任务
export const createTask = async (taskData: {
  summary: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}): Promise<any> => {
  await delay(500);
  
  const newTask = {
    task_id: 'task_' + Date.now(),
    summary: taskData.summary,
    description: taskData.description || '',
    status: 'pending',
    priority: taskData.priority || 'medium',
    due_date: taskData.due_date || new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_by: mockFeishuData.user
  };
  
  mockFeishuData.tasks.unshift(newTask);
  return newTask;
};

// 模拟更新任务状态
export const updateTaskStatus = async (taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'canceled'): Promise<any> => {
  await delay(300);
  
  const taskIndex = mockFeishuData.tasks.findIndex(task => task.task_id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }
  
  mockFeishuData.tasks[taskIndex].status = status;
  return mockFeishuData.tasks[taskIndex];
};

// 模拟解析语音指令
export const parseVoiceCommand = async (command: string): Promise<{
  type: 'task' | 'reminder' | 'calendar';
  content: string;
  category: 'work' | 'life' | 'study' | 'other';
  time?: string;
}> => {
  await delay(200);
  
  // 简单的指令解析逻辑
  const lowerCommand = command.toLowerCase();
  
  // 解析类别
  let category: 'work' | 'life' | 'study' | 'other' = 'other';
  if (lowerCommand.includes('工作') || lowerCommand.includes('项目') || lowerCommand.includes('会议')) {
    category = 'work';
  } else if (lowerCommand.includes('生活') || lowerCommand.includes('喝水') || lowerCommand.includes('散步')) {
    category = 'life';
  } else if (lowerCommand.includes('学习') || lowerCommand.includes('课程') || lowerCommand.includes('复习')) {
    category = 'study';
  }
  
  // 解析内容
  let content = command;
  // 移除指令前缀
  const prefixes = ['把', '将', '添加', '创建', '提醒我', '记得'];
  for (const prefix of prefixes) {
    if (command.includes(prefix)) {
      content = command.replace(prefix, '').trim();
      break;
    }
  }
  // 移除类别后缀
  const suffixes = ['放进工作', '放进生活', '放进学习', '放进其他'];
  for (const suffix of suffixes) {
    if (content.includes(suffix)) {
      content = content.replace(suffix, '').trim();
      break;
    }
  }
  
  return {
    type: 'task',
    content,
    category
  };
};

// 模拟发送消息
export const sendMessage = async (chatId: string, content: string): Promise<any> => {
  await delay(300);
  
  return {
    message_id: 'msg_' + Date.now(),
    status: 'sent',
    created_at: new Date().toISOString()
  };
};

// 模拟飞书授权URL
export const getAuthorizationUrl = (state: string = ''): string => {
  const params = new URLSearchParams({
    app_id: feishuConfig.appId,
    redirect_uri: feishuConfig.redirectUri,
    state: state || Math.random().toString(36).substr(2, 9),
    scope: 'user_info,calendar,docs,tasks,im'
  });
  
  return `${feishuConfig.apiBaseUrl}/authen/v1/index?${params.toString()}`;
};

// 模拟处理授权回调
export const handleAuthorizationCallback = async (code: string): Promise<{ access_token: string; user_id: string }> => {
  await delay(500);
  
  // 模拟交换令牌
  const tokenResponse = await getAccessToken();
  
  return {
    access_token: tokenResponse.access_token,
    user_id: mockFeishuData.user.id
  };
};