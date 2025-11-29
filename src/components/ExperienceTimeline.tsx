import { Link } from 'react-router-dom';
import type { Experience } from '../types';

interface ExperienceTimelineProps {
  experiences: Experience[];
}

const ExperienceTimeline = ({ experiences }: ExperienceTimelineProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  const calculateDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0 && remainingMonths > 0) {
      return `${years}年${remainingMonths}个月`;
    } else if (years > 0) {
      return `${years}年`;
    } else {
      return `${remainingMonths}个月`;
    }
  };

  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* 时间线 */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-600 to-primary-300" />

      <div className="space-y-12">
        {experiences.map((experience, index) => (
          <div
            key={experience.id}
            className={`relative flex items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
          >
            {/* 时间线圆点 */}
            <div className="absolute left-8 md:left-1/2 w-4 h-4 -ml-2 bg-primary-600 border-4 border-white rounded-full z-10 shadow-lg" />

            {/* 内容卡片 */}
            <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 pl-16' : 'md:pl-12 pl-16'}`}>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                {/* 公司logo和名称 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {experience.logo && (
                      <img
                        src={experience.logo}
                        alt={experience.company}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{experience.position}</h3>
                      <p className="text-primary-600 font-semibold">{experience.company}</p>
                    </div>
                  </div>
                  {experience.endDate === null && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      在职
                    </span>
                  )}
                </div>

                {/* 时间和地点 */}
                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : '至今'}
                    <span className="ml-1 text-gray-400">
                      ({calculateDuration(experience.startDate, experience.endDate)})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {experience.location}
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-700 mb-4">{experience.description}</p>

                {/* 职责 */}
                {experience.responsibilities && experience.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">工作职责：</h4>
                    <ul className="space-y-1">
                      {experience.responsibilities.map((responsibility, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 成就 */}
                {experience.achievements && experience.achievements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">主要成就：</h4>
                    <ul className="space-y-1">
                      {experience.achievements.map((achievement, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 技术栈 */}
                {experience.technologies && experience.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {experience.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* 查看详情按钮 */}
                <Link
                  to={`/experience/${experience.id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  查看详情
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceTimeline;
