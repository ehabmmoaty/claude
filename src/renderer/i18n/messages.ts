import type { AppLocale } from '../../shared/types';

type MessageMap = Record<string, string>;

const en: MessageMap = {
  // Navigation
  'nav.home': 'Home',
  'nav.conversations': 'Conversations',
  'nav.tasks': 'Tasks',
  'nav.agents': 'Agents',
  'nav.search': 'Search',

  // Home
  'home.welcome': 'Welcome back, {name}',
  'home.todayBoard': 'Today Board',
  'home.noMeetings': 'No meetings scheduled',
  'home.quickActions': 'Quick Actions',
  'home.recentConversations': 'Recent Conversations',

  // Recording
  'recording.start': 'Start Recording',
  'recording.stop': 'Stop Recording',
  'recording.pause': 'Pause',
  'recording.resume': 'Resume',
  'recording.privacyPause': 'Privacy Pause',
  'recording.idle': 'Ready to record',
  'recording.active': 'Recording...',
  'recording.paused': 'Recording paused',
  'recording.privacyActive': 'Privacy mode — all capture stopped',

  // Conversations
  'conversations.title': 'Conversations',
  'conversations.search': 'Search conversations...',
  'conversations.searchTranscript': 'Search in transcript...',
  'conversations.empty': 'No conversations yet. Start recording to begin.',
  'conversations.notFound': 'Conversation not found.',
  'conversations.noTranscript': 'No transcript available.',
  'conversations.count': '{count, plural, one {# conversation} other {# conversations}}',
  'conversations.segments': 'segments',
  'conversations.segmentCount': '{count, plural, one {# segment} other {# segments}}',
  'conversations.speakers': '{count, plural, one {# speaker} other {# speakers}}',
  'conversations.filter.all': 'All',
  'conversations.filter.today': 'Today',
  'conversations.filter.week': 'This Week',
  'conversations.filter.month': 'This Month',
  'conversations.sort.newest': 'Newest first',
  'conversations.sort.oldest': 'Oldest first',
  'conversations.tab.transcript': 'Transcript',
  'conversations.tab.highlights': 'Highlights',
  'conversations.details': 'Details',
  'conversations.languages': 'Languages',
  'conversations.tags': 'Tags',
  'conversations.status': 'Status',
  'conversations.prev': 'Previous',
  'conversations.next': 'Next',
  'conversations.viewAll': 'View all',
  'conversations.renamePrompt': 'Enter a new title:',
  'conversations.deleteConfirm': 'Are you sure you want to delete this conversation? This cannot be undone.',
  'conversations.highlights.keyPoint': 'Key Points',
  'conversations.highlights.decision': 'Decisions',
  'conversations.highlights.commitment': 'Commitments',
  'conversations.highlights.actionItem': 'Action Items',
  'conversations.highlights.empty': 'No highlights yet.',

  // Tasks
  'tasks.title': 'Tasks',
  'tasks.myTasks': 'My Tasks',
  'tasks.delegated': 'Delegated',
  'tasks.waitingOn': 'Waiting On',
  'tasks.empty': 'No tasks yet. Tasks will be extracted from your conversations.',

  // Agents (Companions)
  'agents.title': 'Agents',
  'agents.create': 'Create Agent',
  'agents.studio': 'Agent Studio',
  'agents.empty': 'Describe what kind of AI assistant you need.',

  // Search
  'search.title': 'Search',
  'search.placeholder': 'Search across all conversations, tasks, and agents...',
  'search.noResults': 'No results found',

  // Auth
  'auth.signIn': 'Sign in with ADGOV Account',
  'auth.signOut': 'Sign Out',
  'auth.signingIn': 'Signing in...',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.system': 'System',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.export': 'Export',
  'common.share': 'Share',
};

const ar: MessageMap = {
  // Navigation
  'nav.home': 'الرئيسية',
  'nav.conversations': 'المحادثات',
  'nav.tasks': 'المهام',
  'nav.agents': 'الوكلاء',
  'nav.search': 'البحث',

  // Home
  'home.welcome': 'أهلاً بعودتك، {name}',
  'home.todayBoard': 'لوحة اليوم',
  'home.noMeetings': 'لا توجد اجتماعات مجدولة',
  'home.quickActions': 'إجراءات سريعة',
  'home.recentConversations': 'المحادثات الأخيرة',

  // Recording
  'recording.start': 'بدء التسجيل',
  'recording.stop': 'إيقاف التسجيل',
  'recording.pause': 'إيقاف مؤقت',
  'recording.resume': 'استئناف',
  'recording.privacyPause': 'وقفة خصوصية',
  'recording.idle': 'جاهز للتسجيل',
  'recording.active': 'جارٍ التسجيل...',
  'recording.paused': 'التسجيل متوقف مؤقتاً',
  'recording.privacyActive': 'وضع الخصوصية — تم إيقاف جميع الالتقاط',

  // Conversations
  'conversations.title': 'المحادثات',
  'conversations.search': 'البحث في المحادثات...',
  'conversations.searchTranscript': 'البحث في النص...',
  'conversations.empty': 'لا توجد محادثات بعد. ابدأ التسجيل للبدء.',
  'conversations.notFound': 'المحادثة غير موجودة.',
  'conversations.noTranscript': 'لا يوجد نص متاح.',
  'conversations.count': '{count, plural, one {محادثة واحدة} other {# محادثات}}',
  'conversations.segments': 'مقاطع',
  'conversations.segmentCount': '{count, plural, one {مقطع واحد} other {# مقاطع}}',
  'conversations.speakers': '{count, plural, one {متحدث واحد} other {# متحدثين}}',
  'conversations.filter.all': 'الكل',
  'conversations.filter.today': 'اليوم',
  'conversations.filter.week': 'هذا الأسبوع',
  'conversations.filter.month': 'هذا الشهر',
  'conversations.sort.newest': 'الأحدث أولاً',
  'conversations.sort.oldest': 'الأقدم أولاً',
  'conversations.tab.transcript': 'النص',
  'conversations.tab.highlights': 'النقاط المهمة',
  'conversations.details': 'التفاصيل',
  'conversations.languages': 'اللغات',
  'conversations.tags': 'الوسوم',
  'conversations.status': 'الحالة',
  'conversations.prev': 'السابق',
  'conversations.next': 'التالي',
  'conversations.viewAll': 'عرض الكل',
  'conversations.renamePrompt': 'أدخل عنواناً جديداً:',
  'conversations.deleteConfirm': 'هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.',
  'conversations.highlights.keyPoint': 'النقاط الرئيسية',
  'conversations.highlights.decision': 'القرارات',
  'conversations.highlights.commitment': 'الالتزامات',
  'conversations.highlights.actionItem': 'بنود العمل',
  'conversations.highlights.empty': 'لا توجد نقاط مهمة بعد.',

  // Tasks
  'tasks.title': 'المهام',
  'tasks.myTasks': 'مهامي',
  'tasks.delegated': 'مهام مُفوَّضة',
  'tasks.waitingOn': 'في الانتظار',
  'tasks.empty': 'لا توجد مهام بعد. سيتم استخراج المهام من محادثاتك.',

  // Agents (Companions)
  'agents.title': 'الوكلاء',
  'agents.create': 'إنشاء وكيل',
  'agents.studio': 'استوديو الوكلاء',
  'agents.empty': 'صِف نوع المساعد الذكي الذي تحتاجه.',

  // Search
  'search.title': 'البحث',
  'search.placeholder': 'البحث في جميع المحادثات والمهام والوكلاء...',
  'search.noResults': 'لم يتم العثور على نتائج',

  // Auth
  'auth.signIn': 'تسجيل الدخول بحساب حكومة أبوظبي',
  'auth.signOut': 'تسجيل الخروج',
  'auth.signingIn': 'جارٍ تسجيل الدخول...',

  // Settings
  'settings.title': 'الإعدادات',
  'settings.language': 'اللغة',
  'settings.theme': 'المظهر',
  'settings.theme.light': 'فاتح',
  'settings.theme.dark': 'داكن',
  'settings.theme.system': 'النظام',

  // Common
  'common.loading': 'جارٍ التحميل...',
  'common.error': 'حدث خطأ ما',
  'common.retry': 'إعادة المحاولة',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.export': 'تصدير',
  'common.share': 'مشاركة',
};

export const messages: Record<AppLocale, MessageMap> = { en, ar };
