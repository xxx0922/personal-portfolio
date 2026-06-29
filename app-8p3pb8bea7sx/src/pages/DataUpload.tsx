import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router';
import { 
  Upload, 
  ArrowLeft, 
  FileSpreadsheet, 
  Download,
  Trash2,
  CheckCircle,
  FileText
} from 'lucide-react';
import { batchInsertHistoricalTraffic, getHistoricalTraffic, deleteHistoricalTraffic, updateHistoricalTraffic } from '@/db/api';
import type { HistoricalTraffic } from '@/types/traffic';
import { parseLocalDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export default function DataUpload() {
  const [csvData, setCsvData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalTraffic[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingRecord, setEditingRecord] = useState<HistoricalTraffic | null>(null);
  const [editForm, setEditForm] = useState<Partial<HistoricalTraffic>>({});
  const [saving, setSaving] = useState(false);
  const [singleForm, setSingleForm] = useState({
    date: '',
    day_of_week: '',
    festival: '',
    actual_visitor_count: '',
    forecast_visitors: '',
    weather: '',
    yuelvwan_open_time: '',
    guoyuan_remaining_spaces: '',
    guoyuan_parking_count: '',
    yuelvwan_parking_count: '',
  });

  // 页面加载时自动获取历史数据（不显示toast）
  useEffect(() => {
    loadHistoricalData(false);
  }, []);

  const loadHistoricalData = async (showToast = true) => {
    try {
      setLoading(true);
      const data = await getHistoricalTraffic();
      setHistoricalData(data);
      if (showToast) {
        if (data.length === 0) {
          toast.info('暂无历史数据，请先上传数据');
        } else {
          toast.success(`已加载 ${data.length} 条历史数据`);
        }
      }
    } catch (error) {
      console.error('加载历史数据失败:', error);
      toast.error('加载历史数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      toast.success('文件读取成功');
    };
    reader.onerror = () => {
      toast.error('文件读取失败');
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string): Omit<HistoricalTraffic, 'id' | 'created_at'>[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV文件格式错误：至少需要标题行和一行数据');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const records: Omit<HistoricalTraffic, 'id' | 'created_at'>[] = [];
    let skippedRows = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        skippedRows++;
        continue;
      }

      const record: Record<string, unknown> = {};
      let hasRequiredFields = true; // 标记是否有必填字段
      let missingFields: string[] = []; // 记录缺失的必填字段
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // 空字符串统一处理为null
        const isEmpty = !value || value === '' || value === 'null' || value === 'NULL';
        
        // 字段名映射：将CSV中的total_visitors映射到数据库的actual_visitor_count
        let fieldName = header;
        if (header === 'total_visitors') {
          fieldName = 'actual_visitor_count';
        }
        
        // 处理不同字段类型
        if (fieldName === 'date') {
          if (isEmpty) {
            hasRequiredFields = false;
            missingFields.push('date');
          } else {
            record[fieldName] = value;
          }
        } else if (fieldName === 'day_of_week') {
          if (isEmpty) {
            hasRequiredFields = false;
            missingFields.push('day_of_week');
          } else {
            record[fieldName] = value;
          }
        } else if (fieldName === 'festival') {
          // 节日：非必填，空值转为null
          record[fieldName] = isEmpty ? null : value;
        } else if (fieldName === 'actual_visitor_count') {
          // actual_visitor_count是必填字段，不能为null
          if (isEmpty) {
            hasRequiredFields = false;
            missingFields.push('actual_visitor_count');
          } else {
            record[fieldName] = parseInt(value, 10);
          }
        } else if (fieldName === 'weather' || fieldName === 'weather_forecast') {
          record[fieldName] = isEmpty ? null : value;
        } else if (fieldName.includes('time')) {
          // 时间字段：空值转为null，否则保持原值
          record[fieldName] = isEmpty ? null : value;
        } else if (fieldName.includes('count') || fieldName.includes('visitors') || fieldName.includes('spaces') || fieldName.includes('year')) {
          // 数字字段：空值转为null，否则解析为整数
          record[fieldName] = isEmpty ? null : parseInt(value, 10);
        } else {
          record[fieldName] = isEmpty ? null : value;
        }
      });

      // 只添加包含所有必填字段的记录
      if (hasRequiredFields) {
        records.push(record as Omit<HistoricalTraffic, 'id' | 'created_at'>);
      } else {
        skippedRows++;
        console.warn(`[DataUpload] 第${i + 1}行：缺少必填字段 [${missingFields.join(', ')}]，跳过此记录`);
      }
    }

    console.log(`[DataUpload] 解析完成：有效记录 ${records.length} 条，跳过 ${skippedRows} 条`);
    return records;
  };

  const handleUpload = async () => {
    console.log('[DataUpload] handleUpload 被调用');
    console.log('[DataUpload] csvData 长度:', csvData.length);
    console.log('[DataUpload] csvData trim 长度:', csvData.trim().length);
    
    if (!csvData.trim()) {
      console.log('[DataUpload] CSV数据为空，显示错误提示');
      toast.error('请先上传或粘贴CSV数据');
      return;
    }

    try {
      setUploading(true);
      console.log('[DataUpload] 开始解析CSV数据...');
      console.log('[DataUpload] CSV数据前100字符:', csvData.substring(0, 100));
      
      // 计算总行数（不包括表头）
      const totalLines = csvData.trim().split('\n').length - 1;
      
      const records = parseCSV(csvData);
      console.log('[DataUpload] 解析完成，有效记录数:', records.length);
      console.log('[DataUpload] 总行数:', totalLines);
      
      const skippedCount = totalLines - records.length;
      
      if (records.length > 0) {
        console.log('[DataUpload] 第一条记录:', JSON.stringify(records[0]));
      }
      
      if (records.length === 0) {
        toast.error('没有有效的数据记录，请检查必填字段（日期、星期、游客数量）是否完整');
        return;
      }

      console.log('[DataUpload] 开始批量插入数据...');
      const result = await batchInsertHistoricalTraffic(records);
      console.log('[DataUpload] 数据插入成功，结果:', result);
      
      // 显示成功消息
      if (skippedCount > 0) {
        toast.success(`成功导入 ${records.length} 条记录，跳过 ${skippedCount} 条无效记录（缺少必填字段）`, {
          duration: 5000,
        });
      } else {
        toast.success(`成功导入 ${records.length} 条记录`);
      }
      
      setCsvData('');
      await loadHistoricalData(false);
    } catch (error) {
      console.error('[DataUpload] 上传失败:', error);
      console.error('[DataUpload] 错误类型:', typeof error);
      console.error('[DataUpload] 错误对象键:', error ? Object.keys(error) : 'null');
      
      // 提取详细错误信息
      let errorMessage = '未知错误';
      
      // Supabase错误对象结构
      if (error && typeof error === 'object') {
        const err = error as any;
        
        // 尝试多种方式提取错误信息
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);
        } else if (err.error_description) {
          errorMessage = err.error_description;
        }
        
        // 添加错误代码
        if (err.code) {
          errorMessage = `${errorMessage} (错误代码: ${err.code})`;
        }
        
        // 添加详细信息
        if (err.details) {
          errorMessage += `\n详情: ${err.details}`;
        }
        
        // 添加提示
        if (err.hint) {
          errorMessage += `\n提示: ${err.hint}`;
        }
        
        // 如果还是没有有用信息，输出整个对象
        if (errorMessage === '未知错误') {
          errorMessage = `数据库错误: ${JSON.stringify(err, null, 2)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      console.error('[DataUpload] 详细错误信息:', errorMessage);
      toast.error(`上传失败: ${errorMessage}`, {
        duration: 8000, // 显示8秒
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await deleteHistoricalTraffic(id);
      toast.success('删除成功');
      await loadHistoricalData(false);
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const handleEdit = (record: HistoricalTraffic) => {
    setEditingRecord(record);
    setEditForm({ ...record });
  };

  const handleCloseEdit = () => {
    setEditingRecord(null);
    setEditForm({});
  };

  const handleEditChange = (field: keyof HistoricalTraffic, value: string | number | null) => {
    setEditForm((prev) => ({ ...prev, [field]: value === '' ? null : value }));
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    try {
      setSaving(true);
      const updates: Partial<Omit<HistoricalTraffic, 'id' | 'created_at'>> = { ...editForm };
      // 移除 id 和 created_at 避免误更新
      delete (updates as any).id;
      delete (updates as any).created_at;
      await updateHistoricalTraffic(editingRecord.id, updates);
      toast.success('记录已更新');
      handleCloseEdit();
      await loadHistoricalData(false);
    } catch (error) {
      console.error('更新失败:', error);
      toast.error('更新失败，请检查数据格式');
    } finally {
      setSaving(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('请先选择要删除的数据');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条记录吗？`)) return;

    try {
      await Promise.all(selectedIds.map(id => deleteHistoricalTraffic(id)));
      toast.success(`成功删除 ${selectedIds.length} 条记录`);
      setSelectedIds([]);
      await loadHistoricalData(false);
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === historicalData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(historicalData.map(item => item.id));
    }
  };

  // 切换单个选择
  const handleToggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 格式化日期（按本地时区解析，避免 new Date('YYYY-MM-DD') 被当作 UTC 而错位）
  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr) || new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 格式化时间
  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return '-';
    // 如果已经是HH:MM格式，直接返回
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr;
    // 如果是HH:MM:SS格式，截取前5位
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr.substring(0, 5);
    return timeStr;
  };

  // 格式化数字
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('zh-CN');
  };

  // Excel日期序列号转换为日期字符串
  const excelDateToString = (serial: number | string): string => {
    if (typeof serial === 'string') {
      // 如果已经是字符串格式，检查是否是有效日期
      if (/^\d{4}-\d{2}-\d{2}$/.test(serial)) {
        return serial;
      }
      // 尝试转换为数字
      const num = parseFloat(serial);
      if (isNaN(num)) return '';
      serial = num;
    }
    
    // Excel日期从1900年1月1日开始计数
    // 但Excel错误地认为1900年是闰年，所以需要调整
    const excelEpoch = new Date(1899, 11, 30);
    const days = Math.floor(serial);
    const date = new Date(excelEpoch.getTime() + days * 86400000);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  // Excel时间小数转换为时间字符串
  const excelTimeToString = (decimal: number | string): string => {
    if (typeof decimal === 'string') {
      // 如果已经是字符串格式，检查是否是有效时间
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(decimal)) {
        return decimal.substring(0, 5); // 返回HH:MM格式
      }
      // 尝试转换为数字
      const num = parseFloat(decimal);
      if (isNaN(num)) return '';
      decimal = num;
    }
    
    // Excel时间是一天的小数部分（0-1）
    const totalMinutes = Math.round(decimal * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // 清理和格式化值
  const cleanValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    return String(value).trim();
  };

  const downloadTemplate = () => {
    const template = `date,day_of_week,festival,year_2022,year_2023,total_visitors,weather,forecast_visitors,weather_forecast,yuelvwan_open_time,yuelvwan_open_visitor_count,guoyuan_remaining_spaces,guoyuan_full_time,linghu_bridge_diversion_start,linghu_bridge_diversion_end,highway_stop_diversion_time,qianbo_bridge_stop_diversion_time,linghu_road_open_time,linghu_road_full_time,guzhu_open_time,guoyuan_parking_count,yuelvwan_parking_count
2023-10-01,周日,中秋国庆,16131,15000,15982,小雨转晴,16000,晴,08:40,3100,1300,10:30,08:40,12:30,12:20,12:30,10:20,11:20,13:10,4200,1290
2023-10-02,周一,中秋国庆,13524,28002,23253,多云,25000,多云,08:30,4500,800,10:00,08:30,12:00,12:00,12:10,10:05,11:00,12:30,4501,1489`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '历史数据导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV模板已下载');
  };

  // 下载Excel模板
  const downloadExcelTemplate = () => {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 定义表头（15个字段，与 handleExcelUpload 的列映射保持一致）
    const headers = [
      '日期',
      '农历',
      '节日',
      '当天游客预报人数',
      '天气',
      '月亮湾启用时间',
      '月亮湾启用果园停车场车位',
      '高速路口分流时间',
      '千波桥分流时间',
      '灵湖大桥分流时间',
      '灵湖路开放停车时间',
      '古竹两侧开放时间',
      '当天游客入园数量',
      '果园停车场停车数量',
      '月亮湾停车场停车数量'
    ];

    // 示例数据
    const sampleData = [
      [
        '2023-10-01',
        '八月十七',
        '中秋国庆',
        16000,
        '小雨转晴',
        '08:40',
        1300,
        '12:20',
        '12:30',
        '08:40',
        '10:20',
        '13:10',
        15982,
        4200,
        1290
      ],
      [
        '2023-10-02',
        '八月十八',
        '中秋国庆',
        25000,
        '多云',
        '08:30',
        800,
        '12:00',
        '12:10',
        '08:30',
        '10:05',
        '12:30',
        23253,
        4501,
        1489
      ]
    ];
    
    // 创建工作表数据
    const wsData = [headers, ...sampleData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 12 }, // 日期
      { wch: 10 }, // 农历
      { wch: 12 }, // 节日
      { wch: 18 }, // 当天游客预报人数
      { wch: 12 }, // 天气
      { wch: 16 }, // 月亮湾启用时间
      { wch: 24 }, // 月亮湾启用果园停车场车位
      { wch: 18 }, // 高速路口分流时间
      { wch: 16 }, // 千波桥分流时间
      { wch: 18 }, // 灵湖大桥分流时间
      { wch: 20 }, // 灵湖路开放停车时间
      { wch: 18 }, // 古竹两侧开放时间
      { wch: 18 }, // 当天游客入园数量
      { wch: 20 }, // 果园停车场停车数量
      { wch: 22 }  // 月亮湾停车场停车数量
    ];
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '历史数据');
    
    // 生成Excel文件并下载
    XLSX.writeFile(wb, '历史数据导入模板.xlsx');
    toast.success('Excel模板已下载');
  };

  // 处理Excel文件上传
  const handleSingleFormChange = (field: keyof typeof singleForm, value: string) => {
    setSingleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSingleRecord = async () => {
    if (!singleForm.date || !singleForm.day_of_week || !singleForm.actual_visitor_count) {
      toast.error('请填写日期、农历/星期、入园人数');
      return;
    }

    try {
      const record = {
        date: singleForm.date,
        day_of_week: singleForm.day_of_week,
        festival: singleForm.festival || null,
        actual_visitor_count: Number(singleForm.actual_visitor_count),
        forecast_visitors: singleForm.forecast_visitors ? Number(singleForm.forecast_visitors) : null,
        weather: singleForm.weather || null,
        weather_forecast: null,
        year_2019: null,
        year_2020: null,
        year_2021: null,
        year_2022: null,
        year_2023: null,
        year_2024: null,
        year_2025: null,
        year_2026: null,
        yuelvwan_open_time: singleForm.yuelvwan_open_time || null,
        yuelvwan_open_visitor_count: null,
        guoyuan_remaining_spaces: singleForm.guoyuan_remaining_spaces ? Number(singleForm.guoyuan_remaining_spaces) : null,
        guoyuan_full_time: null,
        linghu_bridge_diversion_start: null,
        linghu_bridge_diversion_end: null,
        highway_stop_diversion_time: null,
        qianbo_bridge_stop_diversion_time: null,
        linghu_road_open_time: null,
        linghu_road_full_time: null,
        guzhu_open_time: null,
        guoyuan_parking_count: singleForm.guoyuan_parking_count ? Number(singleForm.guoyuan_parking_count) : null,
        yuelvwan_parking_count: singleForm.yuelvwan_parking_count ? Number(singleForm.yuelvwan_parking_count) : null,
      };

      await batchInsertHistoricalTraffic([record]);
      toast.success('单条数据添加成功');
      setSingleForm({
        date: '',
        day_of_week: '',
        festival: '',
        actual_visitor_count: '',
        forecast_visitors: '',
        weather: '',
        yuelvwan_open_time: '',
        guoyuan_remaining_spaces: '',
        guoyuan_parking_count: '',
        yuelvwan_parking_count: '',
      });
      await loadHistoricalData(false);
    } catch (error) {
      console.error('添加单条数据失败:', error);
      toast.error('添加失败，请检查数据格式');
    }
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // 读取第一个工作表
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // 转换为JSON（使用raw: true获取原始数值）
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' }) as unknown[][];
        
        // 跳过表头和空行，转换为CSV格式
        const csvRows = jsonData.slice(1)
          .filter((row: unknown[]) => {
            // 过滤掉完全空的行或日期为空的行
            return row.some(cell => cell !== null && cell !== undefined && cell !== '') && row[0];
          })
          .map((row: unknown[]) => {
            // 映射Excel列到CSV格式（15个字段）
            // Excel顺序：日期、农历、节日、当天游客预报人数、天气、月亮湾启用时间、月亮湾启用果园停车场车位、
            //           高速路口分流时间、千波桥分流时间、灵湖大桥分流时间、灵湖路开放停车时间、
            //           古竹两侧开放时间、入园人数、果园停车场停车数量、月亮湾停车场停车数量

            // 转换日期（Excel序列号转日期字符串）
            let date = '';
            if (row[0]) {
              try {
                date = excelDateToString(row[0] as number | string);
              } catch (e) {
                console.error('日期转换失败:', row[0], e);
              }
            }

            // 如果日期转换失败，跳过这一行
            if (!date) {
              console.warn('跳过无效行（日期为空）:', row);
              return null;
            }

            // 转换时间字段（Excel小数转时间字符串）
            const yuelvwanOpenTime = row[5] ? excelTimeToString(row[5] as number | string) : '';
            const highwayStopTime = row[7] ? excelTimeToString(row[7] as number | string) : '';
            const qianboBridgeTime = row[8] ? excelTimeToString(row[8] as number | string) : '';
            const linghuBridgeTime = row[9] ? excelTimeToString(row[9] as number | string) : '';
            const linghuRoadTime = row[10] ? excelTimeToString(row[10] as number | string) : '';
            const guzhuOpenTime = row[11] ? excelTimeToString(row[11] as number | string) : '';

            return [
              date,                    // 0  date - 日期
              cleanValue(row[1]),      // 1  day_of_week - 农历
              cleanValue(row[2]),      // 2  festival - 节日 ✅ 补上这一列
              '',                      // 3  year_2022 - 留空
              '',                      // 4  year_2023 - 留空
              cleanValue(row[12]),     // 5  total_visitors - 入园人数
              cleanValue(row[4]),      // 6  weather - 天气
              cleanValue(row[3]),      // 7  forecast_visitors - 当天游客预报人数
              '',                      // 8  weather_forecast - 留空
              yuelvwanOpenTime,        // 9  yuelvwan_open_time - 月亮湾启用时间
              '',                      // 10 yuelvwan_open_visitor_count - 留空
              cleanValue(row[6]),      // 11 guoyuan_remaining_spaces - 月亮湾启用果园停车场车位
              '',                      // 12 guoyuan_full_time - 留空
              linghuBridgeTime,        // 13 linghu_bridge_diversion_start - 灵湖大桥分流时间
              '',                      // 14 linghu_bridge_diversion_end - 留空
              highwayStopTime,         // 15 highway_stop_diversion_time - 高速路口分流时间
              qianboBridgeTime,        // 16 qianbo_bridge_stop_diversion_time - 千波桥分流时间
              linghuRoadTime,          // 17 linghu_road_open_time - 灵湖路开放停车时间
              '',                      // 18 linghu_road_full_time - 留空
              guzhuOpenTime,           // 19 guzhu_open_time - 古竹两侧开放时间
              cleanValue(row[13]),     // 20 guoyuan_parking_count - 果园停车场停车数量
              cleanValue(row[14])      // 21 yuelvwan_parking_count - 月亮湾停车场停车数量
            ].join(',');
          })
          .filter((row): row is string => row !== null); // 过滤掉null值
        
        const csvContent = csvRows.join('\n');
        
        // 添加CSV表头
        const csvHeader = 'date,day_of_week,festival,year_2022,year_2023,total_visitors,weather,forecast_visitors,weather_forecast,yuelvwan_open_time,yuelvwan_open_visitor_count,guoyuan_remaining_spaces,guoyuan_full_time,linghu_bridge_diversion_start,linghu_bridge_diversion_end,highway_stop_diversion_time,qianbo_bridge_stop_diversion_time,linghu_road_open_time,linghu_road_full_time,guzhu_open_time,guoyuan_parking_count,yuelvwan_parking_count';
        const csvWithHeader = csvHeader + '\n' + csvContent;
        
        setCsvData(csvWithHeader);
        toast.success(`已解析 ${csvRows.length} 行数据`);
      } catch (error) {
        console.error('解析Excel文件失败:', error);
        toast.error('解析Excel文件失败，请检查文件格式');
      }
    };
    
    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground xl:text-3xl">
              批量数据上传
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              上传历年小长假客流车流数据
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              下载CSV模板
            </Button>
            <Button variant="outline" onClick={downloadExcelTemplate}>
              <FileText className="mr-2 h-4 w-4" />
              下载Excel模板
            </Button>
            <Button variant="outline" onClick={() => loadHistoricalData()}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              查看数据
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回仪表盘
              </Link>
            </Button>
          </div>
        </div>

        {/* 上传区域 */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>CSV文件上传</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">选择CSV文件</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mt-2"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  支持CSV格式文件，请确保文件编码为UTF-8
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="mb-2 font-medium">字段说明</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• date: 日期 (YYYY-MM-DD)</p>
                  <p>• day_of_week: 星期</p>
                  <p>• total_visitors: 当天游客入园数量</p>
                  <p>• weather: 天气</p>
                  <p>• forecast_visitors: 当天游客预报人数</p>
                  <p>• yuelvwan_open_time: 月亮湾启用时间 (HH:MM)</p>
                  <p>• guoyuan_full_time: 果园停车场停满时间</p>
                  <p>• linghu_road_open_time: 灵湖路开放停车时间</p>
                  <p>• 更多字段请参考CSV模板文件</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Excel文件上传</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="excel-upload">选择Excel文件</Label>
                <Input
                  id="excel-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="mt-2"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  支持Excel格式文件（.xlsx, .xls）
                </p>
              </div>

              <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                <h3 className="mb-2 font-medium text-success">Excel模板字段</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• 日期</p>
                  <p>• 农历</p>
                  <p>• 当天游客预报人数</p>
                  <p>• 天气</p>
                  <p>• 月亮湾启用时间</p>
                  <p>• 月亮湾启用果园停车场车位</p>
                  <p>• 高速路口分流时间</p>
                  <p>• 千波桥分流时间</p>
                  <p>• 灵湖大桥分流时间</p>
                  <p>• 灵湖路开放停车时间</p>
                  <p>• 古竹两侧开放时间</p>
                  <p>• 当天游客入园数量</p>
                  <p>• 果园停车场停车数量</p>
                  <p>• 月亮湾停车场停车数量</p>
                </div>
                <p className="mt-2 text-xs text-warning">
                  提示：请下载Excel模板填写数据后上传
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>数据预览/粘贴</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="csv-data">CSV数据</Label>
                <Textarea
                  id="csv-data"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="粘贴CSV数据或通过文件上传..."
                  className="mt-2 min-h-[300px] font-mono text-xs"
                />
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || !csvData.trim()}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    批量导入
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 单条数据录入 */}
        <Card>
          <CardHeader>
            <CardTitle>逐条添加数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <Label>日期 *</Label>
                <Input type="date" value={singleForm.date} onChange={(e) => handleSingleFormChange('date', e.target.value)} />
              </div>
              <div>
                <Label>农历/星期 *</Label>
                <Input placeholder="如 初一 / 周一" value={singleForm.day_of_week} onChange={(e) => handleSingleFormChange('day_of_week', e.target.value)} />
              </div>
              <div>
                <Label>节日</Label>
                <Input placeholder="春节/五一/国庆" value={singleForm.festival} onChange={(e) => handleSingleFormChange('festival', e.target.value)} />
              </div>
              <div>
                <Label>入园人数 *</Label>
                <Input type="number" placeholder="如 35000" value={singleForm.actual_visitor_count} onChange={(e) => handleSingleFormChange('actual_visitor_count', e.target.value)} />
              </div>
              <div>
                <Label>预报人数</Label>
                <Input type="number" placeholder="如 30000" value={singleForm.forecast_visitors} onChange={(e) => handleSingleFormChange('forecast_visitors', e.target.value)} />
              </div>
              <div>
                <Label>天气</Label>
                <Input placeholder="晴/多云/小雨" value={singleForm.weather} onChange={(e) => handleSingleFormChange('weather', e.target.value)} />
              </div>
              <div>
                <Label>月亮湾启用时间</Label>
                <Input placeholder="08:30" value={singleForm.yuelvwan_open_time} onChange={(e) => handleSingleFormChange('yuelvwan_open_time', e.target.value)} />
              </div>
              <div>
                <Label>果园剩余车位</Label>
                <Input type="number" placeholder="如 800" value={singleForm.guoyuan_remaining_spaces} onChange={(e) => handleSingleFormChange('guoyuan_remaining_spaces', e.target.value)} />
              </div>
              <div>
                <Label>果园停车数</Label>
                <Input type="number" placeholder="如 4200" value={singleForm.guoyuan_parking_count} onChange={(e) => handleSingleFormChange('guoyuan_parking_count', e.target.value)} />
              </div>
              <div>
                <Label>月亮湾停车数</Label>
                <Input type="number" placeholder="如 1290" value={singleForm.yuelvwan_parking_count} onChange={(e) => handleSingleFormChange('yuelvwan_parking_count', e.target.value)} />
              </div>
            </div>
            <Button onClick={handleAddSingleRecord} className="w-full md:w-auto">
              <CheckCircle className="mr-2 h-4 w-4" />
              添加单条数据
            </Button>
          </CardContent>
        </Card>

        {/* 数据列表 */}
        <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle>已导入数据</CardTitle>
                  <Badge variant="outline">{historicalData.length} 条记录</Badge>
                  {selectedIds.length > 0 && (
                    <Badge variant="secondary">{selectedIds.length} 条已选</Badge>
                  )}
                </div>
                {selectedIds.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    批量删除
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === historicalData.length}
                          onChange={handleSelectAll}
                          className="h-4 w-4 cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>农历</TableHead>
                      <TableHead>预报人数</TableHead>
                      <TableHead>入园人数</TableHead>
                      <TableHead>天气</TableHead>
                      <TableHead>月亮湾启用</TableHead>
                      <TableHead>果园车位</TableHead>
                      <TableHead>果园停车数</TableHead>
                      <TableHead>月亮湾停车数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                          暂无数据，可通过上方批量导入或逐条添加数据
                        </TableCell>
                      </TableRow>
                    ) : historicalData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(record.id)}
                            onChange={() => handleToggleSelect(record.id)}
                            className="h-4 w-4 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        <TableCell>{record.day_of_week || '-'}</TableCell>
                        <TableCell className="text-right">{formatNumber(record.forecast_visitors)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatNumber(record.actual_visitor_count)}</TableCell>
                        <TableCell>{record.weather || '-'}</TableCell>
                        <TableCell>{formatTime(record.yuelvwan_open_time)}</TableCell>
                        <TableCell className="text-right">{formatNumber(record.guoyuan_remaining_spaces)}</TableCell>
                        <TableCell className="text-right">{formatNumber(record.guoyuan_parking_count)}</TableCell>
                        <TableCell className="text-right">{formatNumber(record.yuelvwan_parking_count)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>

        {/* 编辑弹窗 */}
        {editingRecord && (
          <Dialog open onOpenChange={handleCloseEdit}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>编辑历史数据</DialogTitle>
                <DialogDescription>
                  修改 {editingRecord.date} 的数据
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2 py-4">
                <div>
                  <Label>日期</Label>
                  <Input
                    type="date"
                    value={(editForm.date as string) || ''}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>农历/星期</Label>
                  <Input
                    value={(editForm.day_of_week as string) || ''}
                    onChange={(e) => handleEditChange('day_of_week', e.target.value)}
                  />
                </div>
                <div>
                  <Label>节日</Label>
                  <Input
                    value={(editForm.festival as string) || ''}
                    onChange={(e) => handleEditChange('festival', e.target.value)}
                  />
                </div>
                <div>
                  <Label>入园人数</Label>
                  <Input
                    type="number"
                    value={editForm.actual_visitor_count ?? ''}
                    onChange={(e) => handleEditChange('actual_visitor_count', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>预报人数</Label>
                  <Input
                    type="number"
                    value={editForm.forecast_visitors ?? ''}
                    onChange={(e) => handleEditChange('forecast_visitors', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>天气</Label>
                  <Input
                    value={(editForm.weather as string) || ''}
                    onChange={(e) => handleEditChange('weather', e.target.value)}
                  />
                </div>
                <div>
                  <Label>月亮湾启用时间</Label>
                  <Input
                    value={(editForm.yuelvwan_open_time as string) || ''}
                    onChange={(e) => handleEditChange('yuelvwan_open_time', e.target.value)}
                  />
                </div>
                <div>
                  <Label>果园剩余车位</Label>
                  <Input
                    type="number"
                    value={editForm.guoyuan_remaining_spaces ?? ''}
                    onChange={(e) => handleEditChange('guoyuan_remaining_spaces', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>果园停车数</Label>
                  <Input
                    type="number"
                    value={editForm.guoyuan_parking_count ?? ''}
                    onChange={(e) => handleEditChange('guoyuan_parking_count', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>月亮湾停车数</Label>
                  <Input
                    type="number"
                    value={editForm.yuelvwan_parking_count ?? ''}
                    onChange={(e) => handleEditChange('yuelvwan_parking_count', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseEdit} disabled={saving}>
                  取消
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
