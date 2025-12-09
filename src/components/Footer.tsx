import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFooterSettings, getFriendLinks } from '../services/dataService';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<any>(null);
  const [friendLinks, setFriendLinks] = useState<any[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getFooterSettings();
      if (data) setSettings(data);
    };
    const loadFriendLinks = async () => {
      const links = await getFriendLinks();
      setFriendLinks(links);
    };
    loadSettings();
    loadFriendLinks();
  }, []);

  const quickLinks = [
    { name: '首页', href: '/' },
    { name: '项目经验', href: '/#projects' },
    { name: '影音书籍', href: '/#media' },
    { name: '精彩瞬间', href: '/#photos' },
    { name: '知识文档', href: '/#documents' },
    { name: '联系我', href: '/#contact' },
  ];

  const socialLinks = settings ? [
    {
      name: '微信',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.478c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/>
          <path d="M23.759 11.99c0-3.459-3.394-6.266-7.568-6.266-4.174 0-7.568 2.807-7.568 6.266s3.394 6.267 7.568 6.267a9.28 9.28 0 0 0 2.428-.326.652.652 0 0 1 .547.068l1.626.944a.279.279 0 0 0 .143.047c.139 0 .248-.118.248-.252 0-.062-.026-.122-.041-.182l-.334-1.264a.506.506 0 0 1 .182-.569c1.568-1.154 2.569-2.856 2.569-4.733zm-10.42-1.084c-.438 0-.793-.36-.793-.804 0-.444.355-.804.793-.804.438 0 .793.36.793.804 0 .444-.355.804-.793.804zm4.948 0c-.438 0-.793-.36-.793-.804 0-.444.355-.804.793-.804.438 0 .793.36.793.804 0 .444-.355.804-.793.804z"/>
        </svg>
      ),
      onClick: () => alert(`微信号: ${settings.social.wechat}`),
    },
    {
      name: 'GitHub',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
      href: settings.social.github,
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      href: settings.social.linkedin,
    },
    {
      name: 'Email',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: `mailto:${settings.contact.email}`,
    },
  ] : [];

  const handleScrollToSection = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      const element = document.querySelector(`#${sectionId}`);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 关于部分 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4">{settings?.about?.title || '关于本站'}</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              {settings?.about?.description || '这是一个展示个人项目、技能和经验的个人网站。'}
            </p>
            <p className="text-gray-400 text-sm">
              © {currentYear} {settings?.about?.copyright || '个人网站'}. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {settings?.about?.icpNumber || 'ICP备案号: 京ICP备XXXXXXXX号'}
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">快速链接</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/#') ? (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleScrollToSection(link.href);
                      }}
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">联系方式</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">{settings?.contact?.email || 'contact@example.com'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400">{settings?.contact?.phone || '+86 138-0000-0000'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">{settings?.contact?.location || '中国·上海'}</span>
              </div>
            </div>

            {/* 社交媒体 */}
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3">关注我</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target={social.href ? '_blank' : undefined}
                    rel={social.href ? 'noopener noreferrer' : undefined}
                    onClick={social.onClick}
                    className="text-gray-400 hover:text-white transition-colors"
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 友情链接 */}
        {friendLinks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="text-white text-lg font-bold mb-4">友情链接</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition group"
                  title={link.description}
                >
                  {link.logo ? (
                    <img
                      src={link.logo}
                      alt={link.name}
                      className="w-8 h-8 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0 text-sm">
                      🔗
                    </div>
                  )}
                  <span className="text-gray-400 group-hover:text-white text-sm truncate">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 底部分隔线和额外信息 */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>Designed & Built by {settings?.branding?.designedBy || '个人'}</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/admin/login" className="hover:text-white transition-colors">
                管理后台
              </Link>
              <span>|</span>
              <a href={settings?.links?.privacyPolicy || '#'} className="hover:text-white transition-colors">
                隐私政策
              </a>
              <span>|</span>
              <a href={settings?.links?.termsOfService || '#'} className="hover:text-white transition-colors">
                使用条款
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 回到顶部按钮 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 z-50"
        aria-label="回到顶部"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
