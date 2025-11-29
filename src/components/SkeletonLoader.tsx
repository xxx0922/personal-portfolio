// 基础骨架屏组件
export const SkeletonBox = ({ className = '', width = 'w-full', height = 'h-4' }: { className?: string; width?: string; height?: string }) => (
  <div className={`${width} ${height} bg-gray-200 rounded animate-pulse ${className}`} />
);

// 文本骨架屏
export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox
        key={i}
        width={i === lines - 1 ? 'w-3/4' : 'w-full'}
        height="h-4"
      />
    ))}
  </div>
);

// 圆形骨架屏（头像）
export const SkeletonCircle = ({ size = 'w-12 h-12' }: { size?: string }) => (
  <div className={`${size} bg-gray-200 rounded-full animate-pulse`} />
);

// 项目卡片骨架屏
export const SkeletonProjectCard = () => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <SkeletonBox height="h-48" />
    <div className="p-6 space-y-3">
      <SkeletonBox height="h-6" width="w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex space-x-2">
        <SkeletonBox height="h-6" width="w-16" />
        <SkeletonBox height="h-6" width="w-20" />
        <SkeletonBox height="h-6" width="w-16" />
      </div>
    </div>
  </div>
);

// 技能卡片骨架屏
export const SkeletonSkillCard = () => (
  <div className="bg-gray-50 rounded-lg p-6">
    <SkeletonBox height="h-6" width="w-1/2" className="mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <SkeletonBox height="h-4" width="w-24" />
            <SkeletonBox height="h-4" width="w-8" />
          </div>
          <SkeletonBox height="h-2" />
        </div>
      ))}
    </div>
  </div>
);

// 媒体卡片骨架屏
export const SkeletonMediaCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <SkeletonBox height="h-64" />
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <SkeletonBox height="h-5" width="w-16" />
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} height="h-4" width="w-4" />
          ))}
        </div>
      </div>
      <SkeletonBox height="h-5" width="w-3/4" />
      <SkeletonText lines={2} />
    </div>
  </div>
);

// 照片骨架屏
export const SkeletonPhoto = () => (
  <div className="rounded-lg overflow-hidden">
    <SkeletonBox height="h-64" />
  </div>
);

// 文档卡片骨架屏
export const SkeletonDocumentCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 space-y-2">
        <SkeletonBox height="h-6" width="w-2/3" />
        <SkeletonBox height="h-4" width="w-24" />
      </div>
      <SkeletonBox height="h-4" width="w-20" />
    </div>
    <SkeletonText lines={3} />
    <div className="flex flex-wrap gap-2 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBox key={i} height="h-6" width="w-16" />
      ))}
    </div>
  </div>
);

// 完整页面骨架屏
export const SkeletonPageLoader = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Hero Section Skeleton */}
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <SkeletonCircle size="w-24 h-24" />
              <div className="space-y-2 flex-1">
                <SkeletonBox height="h-8" width="w-2/3" />
                <SkeletonBox height="h-6" width="w-1/2" />
              </div>
            </div>
            <SkeletonBox height="h-20" />
            <div className="grid grid-cols-2 gap-4">
              <SkeletonBox height="h-10" />
              <SkeletonBox height="h-10" />
            </div>
          </div>
          <SkeletonBox height="h-96" />
        </div>
      </div>
    </div>

    {/* Content Section Skeleton */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SkeletonBox height="h-8" width="w-48" className="mx-auto mb-12" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonProjectCard key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default {
  Box: SkeletonBox,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  ProjectCard: SkeletonProjectCard,
  SkillCard: SkeletonSkillCard,
  MediaCard: SkeletonMediaCard,
  Photo: SkeletonPhoto,
  DocumentCard: SkeletonDocumentCard,
  PageLoader: SkeletonPageLoader,
};
