import Dashboard from './pages/Dashboard';
import DataSimulator from './pages/DataSimulator';
import HistoryView from './pages/HistoryView';
import DataUpload from './pages/DataUpload';
import TrendComparison from './pages/TrendComparison';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Forbidden from './pages/Forbidden';
import BackendManagement from './pages/BackendManagement';
import ReservationManagement from './pages/ReservationManagement';
import ParkingManagement from './pages/ParkingManagement';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '交通监控仪表盘',
    path: '/',
    element: <Dashboard />
  },
  {
    name: '登录',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: '管理员后台',
    path: '/admin',
    element: <Admin />,
    visible: false
  },
  {
    name: '后端管理',
    path: '/backend',
    element: <BackendManagement />,
    visible: false
  },
  {
    name: '预约游客管理',
    path: '/reservation',
    element: <ReservationManagement />,
    visible: false
  },
  {
    name: '月亮湾停车场管理',
    path: '/parking-management',
    element: <ParkingManagement />,
    visible: false
  },
  {
    name: '禁止访问',
    path: '/403',
    element: <Forbidden />,
    visible: false
  },
  {
    name: '历史数据查看',
    path: '/history',
    element: <HistoryView />
  },
  {
    name: '趋势对比分析',
    path: '/trends',
    element: <TrendComparison />
  },
  {
    name: '数据上传',
    path: '/upload',
    element: <DataUpload />
  },
  {
    name: '数据模拟器',
    path: '/simulator',
    element: <DataSimulator />
  }
];

export default routes;
