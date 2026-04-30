/**
 * vCard电子名片生成工具
 * 支持生成标准的vCard 3.0格式
 */

import type { PersonalInfo, Contact } from '../types';

/**
 * 生成vCard格式的电子名片
 */
export const generateVCard = (personalInfo: PersonalInfo, contact: Contact): string => {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${personalInfo.name}`,
    `N:${personalInfo.name};;;`,
    `TITLE:${personalInfo.title}`,
    `TEL;TYPE=CELL:${contact.phone || ''}`,
    `EMAIL:${contact.email || ''}`,
    `ADR;TYPE=WORK:;;${personalInfo.location};;;`,
    `NOTE:${personalInfo.bio}`,
    // 可选：添加照片（Base64编码）
    // `PHOTO;ENCODING=b;TYPE=JPEG:${base64Photo}`,
    'END:VCARD'
  ].join('\n');

  return vcard;
};

/**
 * 下载vCard文件
 */
export const downloadVCard = (personalInfo: PersonalInfo, contact: Contact) => {
  const vcard = generateVCard(personalInfo, contact);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${personalInfo.name}-名片.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 释放URL对象
  URL.revokeObjectURL(url);
};

/**
 * 生成二维码内容（后续可扩展）
 */
export const generateQRCodeContent = (personalInfo: PersonalInfo, contact: Contact): string => {
  return generateVCard(personalInfo, contact);
};
