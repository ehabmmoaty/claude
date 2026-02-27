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
  'conversations.empty': 'No conversations yet. Start recording to begin.',
  'conversations.filter.all': 'All',
  'conversations.filter.today': 'Today',
  'conversations.filter.week': 'This Week',
  'conversations.filter.month': 'This Month',

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
  'conversations.empty': 'لا توجد محادثات بعد. ابدأ التسجيل للبدء.',
  'conversations.filter.all': 'الكل',
  'conversations.filter.today': 'اليوم',
  'conversations.filter.week': 'هذا الأسبوع',
  'conversations.filter.month': 'هذا الشهر',

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
