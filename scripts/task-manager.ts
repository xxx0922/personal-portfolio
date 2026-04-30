/**
 * 任务管理脚本 - 用于记录和追踪 Claude Code 的工作
 *
 * 使用方法:
 *   bun scripts/task-manager.ts create "任务标题" "任务描述"
 *   bun scripts/task-manager.ts start <taskId>
 *   bun scripts/task-manager.ts complete <taskId> "完成备注"
 *   bun scripts/task-manager.ts list
 *   bun scripts/task-manager.ts stats
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';

const WORKLOG_PATH = join(process.cwd(), '.claude', 'worklog.json');

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  durationMs: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  tokenUsed: number;
  apiCalls: number;
  filesCreated: string[];
  filesModified: string[];
  notes: string[];
}

interface WorklogData {
  version: string;
  tasks: Task[];
  sessions: any[];
  dailyStats: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalTokenUsed: number;
    totalApiCalls: number;
    totalFilesCreated: number;
    totalFilesModified: number;
  };
}

async function loadWorklog(): Promise<WorklogData> {
  if (!existsSync(WORKLOG_PATH)) {
    return {
      version: '1.0.0',
      tasks: [],
      sessions: [],
      dailyStats: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        totalTokenUsed: 0,
        totalApiCalls: 0,
        totalFilesCreated: 0,
        totalFilesModified: 0
      }
    };
  }
  const content = await readFile(WORKLOG_PATH, 'utf-8');
  return JSON.parse(content);
}

async function saveWorklog(data: WorklogData): Promise<void> {
  const dir = dirname(WORKLOG_PATH);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await writeFile(WORKLOG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatDuration(ms: number): string {
  if (ms < 60000) return Math.round(ms / 1000) + 's';
  if (ms < 3600000) return Math.round(ms / 60000) + 'm';
  return (ms / 3600000).toFixed(1) + 'h';
}

function formatToken(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// 命令处理
async function createTask(title: string, description: string = '', type: string = 'other') {
  const data = await loadWorklog();

  const task: Task = {
    id: generateId(),
    title,
    description,
    type,
    status: 'pending',
    createdAt: new Date().toISOString(),
    durationMs: 0,
    priority: 'medium',
    tags: [],
    tokenUsed: 0,
    apiCalls: 0,
    filesCreated: [],
    filesModified: [],
    notes: []
  };

  data.tasks.push(task);
  await saveWorklog(data);

  console.log(`✅ 创建任务：${task.id}`);
  console.log(`   标题：${task.title}`);
  console.log(`   类型：${task.type}`);
}

async function startTask(taskId: string) {
  const data = await loadWorklog();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(`❌ 任务不存在：${taskId}`);
    process.exit(1);
  }

  task.status = 'in_progress';
  task.startedAt = new Date().toISOString();

  await saveWorklog(data);

  console.log(`🚀 开始任务：${task.title}`);
  console.log(`   时间：${task.startedAt}`);
}

async function completeTask(taskId: string, notes: string = '') {
  const data = await loadWorklog();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    console.error(`❌ 任务不存在：${taskId}`);
    process.exit(1);
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();

  if (task.startedAt) {
    task.durationMs = new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime();
  }

  if (notes) {
    task.notes.push(notes);
  }

  await saveWorklog(data);

  console.log(`✅ 完成任务：${task.title}`);
  console.log(`   耗时：${formatDuration(task.durationMs)}`);
  console.log(`   Token: ${formatToken(task.tokenUsed)}`);
  console.log(`   文件：${task.filesCreated.length} 创建，${task.filesModified.length} 修改`);
}

async function listTasks(statusFilter?: string) {
  const data = await loadWorklog();

  let tasks = data.tasks;
  if (statusFilter) {
    tasks = tasks.filter(t => t.status === statusFilter);
  }

  tasks = tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (tasks.length === 0) {
    console.log('暂无任务');
    return;
  }

  console.log(`\n📋 任务列表 (${tasks.length} 个)\n`);
  console.log('='.repeat(80));

  for (const task of tasks) {
    const statusIcon = {
      'completed': '✅',
      'in_progress': '🔄',
      'pending': '⏳',
      'blocked': '🚫',
      'cancelled': '❌'
    }[task.status] || '📋';

    console.log(`\n${statusIcon} [${task.id}] ${task.title}`);
    console.log(`   状态：${task.status} | 类型：${task.type} | 优先级：${task.priority}`);
    console.log(`   创建：${new Date(task.createdAt).toLocaleString('zh-CN')}`);

    if (task.durationMs > 0) {
      console.log(`   耗时：${formatDuration(task.durationMs)}`);
    }

    if (task.tokenUsed > 0 || task.apiCalls > 0) {
      console.log(`   Token: ${formatToken(task.tokenUsed)} | API: ${task.apiCalls}`);
    }

    if (task.filesCreated.length > 0) {
      console.log(`   创建：${task.filesCreated.slice(0, 3).join(', ')}${task.filesCreated.length > 3 ? ` +${task.filesCreated.length - 3}` : ''}`);
    }

    if (task.filesModified.length > 0) {
      console.log(`   修改：${task.filesModified.slice(0, 3).join(', ')}${task.filesModified.length > 3 ? ` +${task.filesModified.length - 3}` : ''}`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

async function showStats() {
  const data = await loadWorklog();

  console.log('\n📊 工作统计\n');
  console.log('='.repeat(40));
  console.log(`总任务数：${data.stats.totalTasks}`);
  console.log(`已完成：${data.stats.completedTasks}`);
  console.log(`完成率：${data.stats.totalTasks > 0 ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100) : 0}%`);
  console.log('-'.repeat(40));
  console.log(`Token 消耗：${formatToken(data.stats.totalTokenUsed)}`);
  console.log(`API 调用：${data.stats.totalApiCalls}`);
  console.log(`文件创建：${data.stats.totalFilesCreated}`);
  console.log(`文件修改：${data.stats.totalFilesModified}`);
  console.log('='.repeat(40));

  // 按类型统计
  const typeCount = data.tasks.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n按类型分布:');
  for (const [type, count] of Object.entries(typeCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      await createTask(args[1] || 'Untitled', args[2] || '', args[3] || 'other');
      break;
    case 'start':
      await startTask(args[1]);
      break;
    case 'complete':
      await completeTask(args[1], args.slice(2).join(' '));
      break;
    case 'list':
      await listTasks(args[1]);
      break;
    case 'stats':
      await showStats();
      break;
    case 'help':
    default:
      console.log(`
任务管理器 - 使用方法:

  bun scripts/task-manager.ts create <标题> [描述] [类型]
      创建新任务 (类型：code, debug, feature, refactor, test, docs, config, other)

  bun scripts/task-manager.ts start <任务 ID>
      开始任务

  bun scripts/task-manager.ts complete <任务 ID> [备注]
      完成任务

  bun scripts/task-manager.ts list [状态]
      列出任务 (状态：pending, in_progress, completed, blocked)

  bun scripts/task-manager.ts stats
      显示统计信息
`);
  }
}

main().catch(console.error);
