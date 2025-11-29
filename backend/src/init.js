import { initializeData } from './services/dataService.js';

// 初始化数据
initializeData().then(() => {
  console.log('Data initialization complete!');
  process.exit(0);
}).catch(error => {
  console.error('Data initialization failed:', error);
  process.exit(1);
});
