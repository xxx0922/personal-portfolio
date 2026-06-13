import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-foreground">403</h1>
        <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
          禁止访问
        </h2>
        <p className="mb-8 text-muted-foreground">
          您没有权限访问此页面，请联系管理员
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} variant="default">
            返回首页
          </Button>
          <Button onClick={() => navigate(-1)} variant="outline">
            返回上一页
          </Button>
        </div>
      </div>
    </div>
  );
}
