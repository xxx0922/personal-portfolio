/**
 * 四象限数据服务 - 管理四象限任务数据
 */

import type { Task } from '../types';

// 存储键名
const STORAGE_KEY = 'quadrant_tasks';

// 模拟飞书API数据
const mockFeishuData = {
  calendar: [
    {
      id: 'fs-1',
      title: '项目进度会议',
      description: '每周项目进度汇报会议',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      category: 'work'
    },
    {
      id: 'fs-2',
      title: '团队建设活动',
      description: '季度团队建设活动规划',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
      category: 'life'
    }
  ],
  tasks: [
    {
      id: 'ft-1',
      title: '完成项目文档',
      description: '编写项目技术文档',
      priority: 'high',
      status: 'pending' as const,
      dueDate: new Date().toISOString(),
      category: 'work'
    },
    {
      id: 'ft-2',
      title: '准备周会材料',
      description: '整理周会汇报材料',
      priority: 'medium' as const,
      status: 'pending' as const,
      dueDate: new Date().toISOString(),
      category: 'work'
    }
  ]
};

// 模拟AGI社区课程数据
const mockAgiCourses = [
  {
    id: 'ac-1',
    title: 'AGI基础课程',
    description: '复习AGI基础概念和发展历程',
    dueDate: new Date().toISOString(),
    category: 'study'
  },
  {
    id: 'ac-2',
    title: '机器学习进阶',
    description: '复习机器学习算法原理',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    category: 'study'
  }
];

// 从本地存储获取数据
const getStoredTasks = (): Record<string, Task[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {
      work: [],
      life: [],
      study: [],
      other: []
    };
  } catch (error) {
    console.error('Error getting stored tasks:', error);
    return {
      work: [],
      life: [],
      study: [],
      other: []
    };
  }
};

// 保存数据到本地存储
const saveTasks = (tasks: Record<string, Task[]>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

// 获取所有四象限任务
export const getAllQuadrantTasks = async (): Promise<Record<string, Task[]>> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 从本地存储获取数据
  let tasks = getStoredTasks();
  
  // 如果没有数据，初始化模拟数据
  if (Object.values(tasks).every(arr => arr.length === 0)) {
    // 工作象限：飞书任务 + 模拟任务
    const workTasks: Task[] = [
      ...mockFeishuData.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as 'high' | 'medium' | 'low',
        status: task.status as 'pending' | 'in_progress' | 'completed' | 'postponed',
        createdAt: new Date().toISOString(),
        dueDate: task.dueDate,
        category: 'work'
      })),
      {
        id: 'work-1',
        title: '整理项目图纸',
        description: '完成项目设计图纸的整理和归档',
        priority: 'high',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        category: 'work'
      }
    ];
    
    // 生活象限：微习惯
    const lifeTasks: Task[] = [
      {
        id: 'life-1',
        title: '喝水',
        description: '每天喝够8杯水',
        priority: 'low',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        category: 'life'
      },
      {
        id: 'life-2',
        title: '散步',
        description: '下午休息时间散步10分钟',
        priority: 'low',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        category: 'life'
      }
    ];
    
    // 学习象限：AGI课程
    const studyTasks: Task[] = [
      ...mockAgiCourses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        priority: 'medium' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: course.dueDate,
        category: 'study'
      }))
    ];
    
    // 其他象限：自定义事项
    const otherTasks: Task[] = [
      {
        id: 'other-1',
        title: '副业项目',
        description: '完成副业项目的需求文档',
        priority: 'medium' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        category: 'other'
      }
    ];
    
    tasks = {
      work: workTasks,
      life: lifeTasks,
      study: studyTasks,
      other: otherTasks
    };
    
    // 保存到本地存储
    saveTasks(tasks);
  }
  
  return tasks;
};

// 获取指定象限的任务
export const getQuadrantTasks = async (quadrant: string): Promise<Task[]> => {
  const allTasks = await getAllQuadrantTasks();
  return allTasks[quadrant] || [];
};

// 添加任务
export const addTask = async (quadrant: string, task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const allTasks = await getAllQuadrantTasks();
  
  const newTask: Task = {
    ...task,
    id: `${quadrant}-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  
  allTasks[quadrant] = [...(allTasks[quadrant] || []), newTask];
  saveTasks(allTasks);
  
  return newTask;
};

// 更新任务
export const updateTask = async (quadrant: string, taskId: string, updates: Partial<Task>): Promise<Task | null> => {
  const allTasks = await getAllQuadrantTasks();
  const quadrantTasks = allTasks[quadrant] || [];
  
  const taskIndex = quadrantTasks.findIndex(task => task.id === taskId);
  if (taskIndex === -1) {
    return null;
  }
  
  const updatedTask = {
    ...quadrantTasks[taskIndex],
    ...updates
  };
  
  quadrantTasks[taskIndex] = updatedTask;
  allTasks[quadrant] = quadrantTasks;
  saveTasks(allTasks);
  
  return updatedTask;
};

// 删除任务
export const deleteTask = async (quadrant: string, taskId: string): Promise<boolean> => {
  const allTasks = await getAllQuadrantTasks();
  const quadrantTasks = allTasks[quadrant] || [];
  
  const newTasks = quadrantTasks.filter(task => task.id !== taskId);
  if (newTasks.length === quadrantTasks.length) {
    return false;
  }
  
  allTasks[quadrant] = newTasks;
  saveTasks(allTasks);
  
  return true;
};

// 更新任务状态
export const updateTaskStatus = async (quadrant: string, taskId: string, status: Task['status']): Promise<Task | null> => {
  return updateTask(quadrant, taskId, { status });
};

// 模拟从飞书API获取数据
export const fetchFeishuData = async (): Promise<any> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockFeishuData;
};

// 模拟从AGI社区获取课程数据
export const fetchAgiCourses = async (): Promise<any> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockAgiCourses;
};

// 清空所有任务
export const clearAllTasks = async (): Promise<void> => {
  saveTasks({
    work: [],
    life: [],
    study: [],
    other: []
  });
};