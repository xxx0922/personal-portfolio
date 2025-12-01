/**
 * Netlify Blobs 数据服务层
 * 提供统一的数据存储接口
 */

import { getStore } from '@netlify/blobs';

// 获取 Blobs store
const getDataStore = () => {
  return getStore({
    name: 'portfolio-data',
    siteID: process.env.SITE_ID,
    token: process.env.NETLIFY_TOKEN
  });
};

/**
 * 读取数据
 * @param {string} key - 数据键名（如 'projects', 'skills' 等）
 * @returns {Promise<any>} 数据对象或数组
 */
export async function getData(key) {
  try {
    const store = getDataStore();
    const data = await store.get(key, { type: 'json' });
    return data || [];
  } catch (error) {
    console.error(`Error reading data for key "${key}":`, error);
    return [];
  }
}

/**
 * 写入数据
 * @param {string} key - 数据键名
 * @param {any} data - 要存储的数据
 * @returns {Promise<boolean>} 是否成功
 */
export async function setData(key, data) {
  try {
    const store = getDataStore();
    await store.set(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing data for key "${key}":`, error);
    return false;
  }
}

/**
 * 删除数据
 * @param {string} key - 数据键名
 * @returns {Promise<boolean>} 是否成功
 */
export async function deleteData(key) {
  try {
    const store = getDataStore();
    await store.delete(key);
    return true;
  } catch (error) {
    console.error(`Error deleting data for key "${key}":`, error);
    return false;
  }
}

/**
 * 列出所有键
 * @returns {Promise<string[]>} 所有数据键的列表
 */
export async function listKeys() {
  try {
    const store = getDataStore();
    const { blobs } = await store.list();
    return blobs.map(blob => blob.key);
  } catch (error) {
    console.error('Error listing keys:', error);
    return [];
  }
}

// 具体的数据操作函数

/**
 * 获取所有项目
 */
export async function getProjects() {
  return await getData('projects');
}

/**
 * 保存项目
 */
export async function setProjects(projects) {
  return await setData('projects', projects);
}

/**
 * 获取所有技能
 */
export async function getSkills() {
  return await getData('skills');
}

/**
 * 保存技能
 */
export async function setSkills(skills) {
  return await setData('skills', skills);
}

/**
 * 获取个人信息
 */
export async function getPersonalInfo() {
  const data = await getData('personalInfo');
  return data || {};
}

/**
 * 保存个人信息
 */
export async function setPersonalInfo(info) {
  return await setData('personalInfo', info);
}

/**
 * 获取媒体项目
 */
export async function getMedia() {
  return await getData('media');
}

/**
 * 保存媒体项目
 */
export async function setMedia(media) {
  return await setData('media', media);
}

/**
 * 获取照片
 */
export async function getPhotos() {
  return await getData('photos');
}

/**
 * 保存照片
 */
export async function setPhotos(photos) {
  return await setData('photos', photos);
}

/**
 * 获取文档
 */
export async function getDocuments() {
  return await getData('documents');
}

/**
 * 保存文档
 */
export async function setDocuments(documents) {
  return await setData('documents', documents);
}

/**
 * 获取规章制度
 */
export async function getRegulations() {
  return await getData('regulations');
}

/**
 * 保存规章制度
 */
export async function setRegulations(regulations) {
  return await setData('regulations', regulations);
}

/**
 * 获取统计数据
 */
export async function getStats() {
  const data = await getData('stats');
  return data || { yearly: [], technologies: [] };
}

/**
 * 保存统计数据
 */
export async function setStats(stats) {
  return await setData('stats', stats);
}

/**
 * 获取消息
 */
export async function getMessages() {
  return await getData('messages');
}

/**
 * 保存消息
 */
export async function setMessages(messages) {
  return await setData('messages', messages);
}

/**
 * 获取工作经历
 */
export async function getExperiences() {
  return await getData('experiences');
}

/**
 * 保存工作经历
 */
export async function setExperiences(experiences) {
  return await setData('experiences', experiences);
}

/**
 * 获取文章
 */
export async function getArticles() {
  return await getData('articles');
}

/**
 * 保存文章
 */
export async function setArticles(articles) {
  return await setData('articles', articles);
}

/**
 * 获取新闻
 */
export async function getNews() {
  return await getData('news');
}

/**
 * 保存新闻
 */
export async function setNews(news) {
  return await setData('news', news);
}

/**
 * 获取底部设置
 */
export async function getFooterSettings() {
  const data = await getData('footer-settings');
  return data || {};
}

/**
 * 保存底部设置
 */
export async function setFooterSettings(settings) {
  return await setData('footer-settings', settings);
}

/**
 * 获取网站配置
 */
export async function getSiteConfig() {
  const data = await getData('site-config');
  return data || {};
}

/**
 * 保存网站配置
 */
export async function setSiteConfig(config) {
  return await setData('site-config', config);
}

/**
 * 获取SEO设置
 */
export async function getSeoSettings() {
  const data = await getData('seo-settings');
  return data || {};
}

/**
 * 保存SEO设置
 */
export async function setSeoSettings(settings) {
  return await setData('seo-settings', settings);
}

/**
 * 获取导航菜单
 */
export async function getNavigation() {
  return await getData('navigation');
}

/**
 * 保存导航菜单
 */
export async function setNavigation(navigation) {
  return await setData('navigation', navigation);
}

/**
 * 获取友情链接
 */
export async function getFriendLinks() {
  return await getData('friend-links');
}

/**
 * 保存友情链接
 */
export async function setFriendLinks(links) {
  return await setData('friend-links', links);
}

/**
 * 获取用户数据（用于认证）
 */
export async function getUsers() {
  const data = await getData('users');
  return data || [];
}

/**
 * 保存用户数据
 */
export async function setUsers(users) {
  return await setData('users', users);
}
