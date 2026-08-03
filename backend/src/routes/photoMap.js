import { Router } from 'express';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';

const router = Router();

const DEFAULT_METADATA_PATH = process.platform === 'win32'
  ? 'D:/照片文件夹/photo_map_metadata.json'
  : '/root/data/photo_map_metadata.json';

const METADATA_PATH = process.env.PHOTO_MAP_METADATA_PATH || DEFAULT_METADATA_PATH;
const PHOTO_MAP_PASSWORD = process.env.PHOTO_MAP_PASSWORD || 'Xue0922@';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

let metadataCache = null;
let metadataError = null;

function loadMetadata() {
  if (metadataCache) return metadataCache;
  if (metadataError) throw new Error(metadataError);

  try {
    const raw = readFileSync(METADATA_PATH, 'utf-8');
    metadataCache = JSON.parse(raw);
    return metadataCache;
  } catch (err) {
    metadataError = err.message;
    console.error('[PhotoMap] Failed to load metadata:', err.message);
    throw err;
  }
}

// 从请求头 Cookie 中读取指定名称的 cookie
function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';');
  for (const c of cookies) {
    const [key, ...rest] = c.trim().split('=');
    if (key === name) {
      return rest.join('=');
    }
  }
  return null;
}

// 设置登录 cookie
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  const maxAge = 60 * 60 * 24 * 7; // 7 天
  const secureFlag = isProd ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `photo_map_token=${token}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=${maxAge}`
  );
}

// 验证是否已登录
function isAuthenticated(req) {
  if (process.env.NODE_ENV !== 'production') return true;
  const token = getCookie(req, 'photo_map_token');
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// 需要登录的中间件
function requirePhotoMapAuth(req, res, next) {
  if (isAuthenticated(req)) {
    return next();
  }
  res.status(401).json({ success: false, error: '需要登录足迹星图' });
}

// 根据国家/地区关键字推断国家
function inferCountry(city = '', province = '') {
  const text = `${city}${province}`;
  if (/印度尼西亚|巴厘岛|Bali/i.test(text)) return '印度尼西亚';
  if (/越南|芽庄/i.test(text)) return '越南';
  if (/澳门|Macau/i.test(text)) return '中国澳门';
  if (/香港|Hong Kong/i.test(text)) return '中国香港';
  if (/泰国|普吉|清迈|曼谷/i.test(text)) return '泰国';
  if (/日本|东京|大阪|京都|北海道/i.test(text)) return '日本';
  if (/韩国|首尔|济州/i.test(text)) return '韩国';
  if (/新加坡|Singapore/i.test(text)) return '新加坡';
  if (/马来西亚|吉隆坡|沙巴/i.test(text)) return '马来西亚';
  return '中国';
}

// 登录接口
router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== PHOTO_MAP_PASSWORD) {
    return res.status(401).json({ success: false, error: '密码错误' });
  }
  const token = jwt.sign({ photoMap: true }, JWT_SECRET, { expiresIn: '7d' });
  setAuthCookie(res, token);
  res.json({ success: true });
});

// 登出接口
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'photo_map_token=; Path=/; Max-Age=0');
  res.json({ success: true });
});

// 检查登录状态
router.get('/check', (req, res) => {
  res.json({ success: true, authenticated: isAuthenticated(req) });
});

// 按城市聚合的照片地图数据
router.get('/cities', requirePhotoMapAuth, (req, res) => {
  try {
    const data = loadMetadata();
    const groups = {};

    for (const photo of data.photos) {
      const city = photo.city || '未知';
      if (!groups[city]) {
        groups[city] = {
          city,
          province: photo.province || '',
          country: inferCountry(city, photo.province || ''),
          lat: photo.map_lat,
          lng: photo.map_lon,
          count: 0,
          firstDate: null,
          years: new Set(),
          photos: []
        };
      }

      groups[city].count++;

      // 记录该城市最早一张照片的日期，用于轨迹排序
      const d = photo.date_taken;
      if (d && (!groups[city].firstDate || d < groups[city].firstDate)) {
        groups[city].firstDate = d;
      }

      // 记录该城市出现的年份，用于前端年份筛选
      if (d && d.length >= 4) {
        groups[city].years.add(parseInt(d.slice(0, 4), 10));
      }

      if (groups[city].photos.length < 5) {
        groups[city].photos.push({
          id: `${city}_${photo.filename}`,
          filename: photo.filename,
          url: photo.photo_url,
          thumbnailUrl: photo.thumbnail_url,
          date: photo.date_taken
        });
      }
    }

    const cities = Object.values(groups).sort((a, b) => b.count - a.count);
    cities.forEach(c => {
      c.years = Array.from(c.years).sort((a, b) => a - b);
    });
    const countries = Array.from(new Set(cities.map(c => c.country)));

    res.json({
      success: true,
      total: data.summary.total_photos,
      cityCount: cities.length,
      countryCount: countries.length,
      countries,
      cities
    });
  } catch (err) {
    console.error('[PhotoMap] /cities error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load photo map metadata',
      message: err.message
    });
  }
});

// 获取照片地图统计信息（含按时间排序的轨迹点）
router.get('/stats', requirePhotoMapAuth, (req, res) => {
  try {
    const data = loadMetadata();
    const groups = {};

    for (const photo of data.photos) {
      const city = photo.city || '未知';
      if (!groups[city]) {
        groups[city] = {
          city,
          province: photo.province || '',
          country: inferCountry(city, photo.province || ''),
          lat: photo.map_lat,
          lng: photo.map_lon,
          count: 0,
          firstDate: null
        };
      }
      groups[city].count++;
      const d = photo.date_taken;
      if (d && (!groups[city].firstDate || d < groups[city].firstDate)) {
        groups[city].firstDate = d;
      }
    }

    const cities = Object.values(groups);
    const countries = Array.from(new Set(cities.map(c => c.country)));

    // 按首次拍摄日期排序，生成旅行轨迹
    const trajectory = cities
      .filter(c => c.firstDate && c.lat && c.lng)
      .sort((a, b) => a.firstDate.localeCompare(b.firstDate))
      .map((c, index) => ({
        order: index + 1,
        city: c.city,
        province: c.province,
        country: c.country,
        lat: c.lat,
        lng: c.lng,
        firstDate: c.firstDate,
        count: c.count
      }));

    // 时间跨度
    const allDates = data.photos.map(p => p.date_taken).filter(Boolean);
    const dateRange = allDates.length
      ? { earliest: allDates.sort()[0], latest: allDates.sort()[allDates.length - 1] }
      : null;

    res.json({
      success: true,
      totalPhotos: data.summary.total_photos,
      totalCities: cities.length,
      totalCountries: countries.length,
      countries,
      dateRange,
      trajectory
    });
  } catch (err) {
    console.error('[PhotoMap] /stats error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load photo map stats',
      message: err.message
    });
  }
});

// 获取指定城市的所有照片
router.get('/city/:city', requirePhotoMapAuth, (req, res) => {
  try {
    const data = loadMetadata();
    const city = decodeURIComponent(req.params.city);

    const photos = data.photos
      .filter(photo => photo.city === city)
      .map(photo => ({
        id: `${city}_${photo.filename}`,
        filename: photo.filename,
        url: photo.photo_url,
        thumbnailUrl: photo.thumbnail_url,
        date: photo.date_taken,
        folder: photo.folder,
        hasGps: photo.has_gps,
        lat: photo.gps_lat,
        lng: photo.gps_lon
      }));

    res.json({
      success: true,
      city,
      count: photos.length,
      photos
    });
  } catch (err) {
    console.error('[PhotoMap] /city error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load city photos',
      message: err.message
    });
  }
});

export default router;
