import { useEffect, useState } from 'react';
import { getSeoSettings } from '../services/dataService';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  googleSiteVerification?: string;
  baiduSiteVerification?: string;
  bingSiteVerification?: string;
}

const DEFAULT_SEO: SEOProps = {
  title: '个人展示网站 - 展示您的精彩人生',
  description: '一个展示个人多面生活的综合性网站，包含工作成就、兴趣爱好、知识分享等内容',
  keywords: '个人网站, 作品展示, 项目管理, 摄影作品, 知识分享',
  author: '张三',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

export const useSEO = (seoData: SEOProps = {}) => {
  const [apiSeoSettings, setApiSeoSettings] = useState<any>(null);

  useEffect(() => {
    // 从API加载SEO设置
    const loadSeoSettings = async () => {
      const settings = await getSeoSettings();
      if (settings) {
        setApiSeoSettings(settings);
      }
    };
    loadSeoSettings();
  }, []);

  useEffect(() => {
    // 合并SEO数据: API设置 > 页面传入的数据 > 默认数据
    let mergedData = { ...DEFAULT_SEO };

    if (apiSeoSettings) {
      mergedData = {
        ...mergedData,
        title: apiSeoSettings.basic?.siteTitle || mergedData.title,
        description: apiSeoSettings.basic?.siteDescription || mergedData.description,
        keywords: apiSeoSettings.basic?.keywords?.join(', ') || mergedData.keywords,
        ogTitle: apiSeoSettings.og?.ogTitle || mergedData.ogTitle,
        ogDescription: apiSeoSettings.og?.ogDescription || mergedData.ogDescription,
        ogImage: apiSeoSettings.og?.ogImage || mergedData.ogImage,
        ogUrl: apiSeoSettings.og?.ogUrl || window.location.origin,
        googleSiteVerification: apiSeoSettings.verification?.googleSiteVerification,
        baiduSiteVerification: apiSeoSettings.verification?.baiduSiteVerification,
        bingSiteVerification: apiSeoSettings.verification?.bingSiteVerification,
      };
    }

    // 页面传入的数据优先级最高
    const data = { ...mergedData, ...seoData };

    // 设置页面标题
    document.title = data.title || DEFAULT_SEO.title || '';

    // 设置或更新 meta 标签
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      if (!content) return;

      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // 基本 SEO meta 标签
    setMetaTag('description', data.description || '');
    setMetaTag('keywords', data.keywords || '');
    setMetaTag('author', data.author || '');

    // 网站验证 meta 标签
    if (data.googleSiteVerification) {
      setMetaTag('google-site-verification', data.googleSiteVerification);
    }
    if (data.baiduSiteVerification) {
      setMetaTag('baidu-site-verification', data.baiduSiteVerification);
    }
    if (data.bingSiteVerification) {
      setMetaTag('msvalidate.01', data.bingSiteVerification);
    }

    // Open Graph meta 标签
    setMetaTag('og:title', data.ogTitle || data.title || '', true);
    setMetaTag('og:description', data.ogDescription || data.description || '', true);
    setMetaTag('og:image', data.ogImage || '', true);
    setMetaTag('og:url', data.ogUrl || window.location.href, true);
    setMetaTag('og:type', data.ogType || 'website', true);

    // Twitter Card meta 标签
    setMetaTag('twitter:card', data.twitterCard || 'summary_large_image');
    setMetaTag('twitter:title', data.twitterTitle || data.title || '');
    setMetaTag('twitter:description', data.twitterDescription || data.description || '');
    setMetaTag('twitter:image', data.twitterImage || data.ogImage || '');

    // 结构化数据 (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.author || '张三',
      description: data.description,
      url: window.location.origin,
    };

    let scriptTag = document.querySelector(
      'script[type="application/ld+json"]'
    ) as HTMLScriptElement;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(structuredData);
  }, [seoData, apiSeoSettings]);
};
