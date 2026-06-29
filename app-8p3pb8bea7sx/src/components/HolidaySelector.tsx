import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { HOLIDAYS, type Holiday } from '@/data/holidays';
import { parseLocalDate } from '@/lib/utils';

interface HolidaySelectorProps {
  onSelectHoliday?: (startDate: Date, endDate: Date, holidayName: string) => void;
  className?: string;
}

export default function HolidaySelector({ onSelectHoliday, className }: HolidaySelectorProps) {
  const [selectedYear, setSelectedYear] = useState<string>('');

  const handleSelectHoliday = (holiday: Holiday) => {
    if (onSelectHoliday && holiday.dates.length > 0) {
      const startDate = parseLocalDate(holiday.dates[0]);
      const endDate = parseLocalDate(holiday.dates[holiday.dates.length - 1]);
      if (startDate && endDate) {
        onSelectHoliday(startDate, endDate, holiday.name);
      }
    }
  };

  const availableYears = Object.keys(HOLIDAYS);
  const selectedHolidays = selectedYear ? (HOLIDAYS[selectedYear as keyof typeof HOLIDAYS] || []) : [];

  return (
    <Card className={`shadow-lg ${className || ''}`}>
      <CardHeader className="border-b bg-gradient-to-r from-accent/5 to-transparent pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-accent" />
            法定节假日快捷选择
          </CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择年份" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedYear ? '点击节假日快速设置日期范围' : '请先选择年份查看节假日'}
        </p>
      </CardHeader>
      {selectedYear && selectedHolidays.length > 0 && (
        <CardContent className="pt-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedHolidays.map((holiday: Holiday, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col items-start gap-1 rounded-lg p-3 hover:bg-primary/5 hover:border-primary"
                onClick={() => handleSelectHoliday(holiday)}
              >
                <div className="flex w-full items-center justify-between">
                  <Badge variant="default" className="bg-primary">
                    {holiday.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {holiday.dates.length} 天
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(parseLocalDate(holiday.dates[0]) || new Date(holiday.dates[0]), 'MM-dd', { locale: zhCN })}
                  {holiday.dates.length > 1 && ` ~ ${format(parseLocalDate(holiday.dates[holiday.dates.length - 1]) || new Date(holiday.dates[holiday.dates.length - 1]), 'MM-dd', { locale: zhCN })}`}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
