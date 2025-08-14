// Multi-language Support for SafeNepal

const languageManager = {
    // Current language
    currentLanguage: 'en',
    
    // Available languages
    languages: {
        'en': 'English',
        'ne': 'नेपाली'
    },
    
    // Initialize language support
    init() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferred_language');
        if (savedLanguage && this.languages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
        
        // Update UI to reflect current language
        this.updateLanguageUI();
        
        // Set up language switcher
        this.setupLanguageSwitcher();
        
        // Apply translations
        this.applyTranslations();
    },
    
    // Set up language switcher
    setupLanguageSwitcher() {
        const languageOptions = document.querySelectorAll('.language-option');
        if (languageOptions.length === 0) return;
        
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                this.changeLanguage(lang);
            });
        });
        
        // Update language text in dropdown
        const languageText = document.querySelector('.language-text');
        if (languageText) {
            languageText.textContent = this.languages[this.currentLanguage];
        }
    },
    
    // Change language
    changeLanguage(lang) {
        if (!this.languages[lang]) return;
        
        this.currentLanguage = lang;
        
        // Save preference
        localStorage.setItem('preferred_language', lang);
        
        // Update UI
        this.updateLanguageUI();
        
        // Apply translations
        this.applyTranslations();
        
        // Show notification
        this.showLanguageChangeNotification();
    },
    
    // Update language UI
    updateLanguageUI() {
        // Update language text in dropdown
        const languageText = document.querySelector('.language-text');
        if (languageText) {
            languageText.textContent = this.languages[this.currentLanguage];
        }
        
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
    },
    
    // Apply translations to the page
    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });
    },
    
    // Show language change notification
    showLanguageChangeNotification() {
        // Check if notifications are supported
        if (typeof showToast === 'function') {
            const langName = this.languages[this.currentLanguage];
            showToast('Language', `Changed to ${langName}`, 'info');
        }
    },
    
    // Translations
    translations: {
        // English translations (default)
        'en': {
            // Navigation
            'nav_home': 'Home',
            'nav_safety': 'Safety Guides',
            'nav_contacts': 'Emergency Contacts',
            'nav_shelters': 'Find Shelters',
            
            // Home page
            'home_title': 'SafeNepal: Disaster Preparedness Hub',
            'home_subtitle': 'Your comprehensive resource for disaster preparedness in Nepal',
            'home_cta': 'Prepare Now',
            'emergency_alert': 'Emergency Alert',
            'latest_updates': 'Latest Updates',
            'weather_forecast': 'Weather Forecast',
            'earthquake_updates': 'Recent Earthquake Activity',
            
            // Safety guides
            'safety_title': 'Disaster Safety Guides',
            'earthquake_safety': 'Earthquake Safety',
            'flood_safety': 'Flood Safety',
            'landslide_safety': 'Landslide Safety',
            'fire_safety': 'Fire Safety',
            'before_disaster': 'Before Disaster',
            'during_disaster': 'During Disaster',
            'after_disaster': 'After Disaster',
            
            // Emergency contacts
            'contacts_title': 'Emergency Contacts',
            'add_contact': 'Add Contact',
            'edit_contact': 'Edit Contact',
            'delete_contact': 'Delete Contact',
            'import_contacts': 'Import Contacts',
            'export_contacts': 'Export Contacts',
            'share_contacts': 'Share Contacts',
            'name': 'Name',
            'phone': 'Phone',
            'relationship': 'Relationship',
            'address': 'Address',
            'notes': 'Notes',
            
            // Shelters
            'shelters_title': 'Emergency Shelters',
            'find_nearest': 'Find Nearest Shelter',
            'shelter_type': 'Shelter Type',
            'shelter_capacity': 'Capacity',
            'get_directions': 'Get Directions',
            'current_location': 'Use Current Location',
            'search_location': 'Search Location',
            
            // Offline
            'offline_mode': 'Offline Mode',
            'offline_message': 'You\'re offline. Some features may be limited.',
            'cached_content': 'Cached Content',
            
            // Alerts
            'alert_high': 'High Alert',
            'alert_medium': 'Medium Alert',
            'alert_low': 'Low Alert',
            'alert_info': 'Information',
            
            // Weather
            'weather_now': 'Current Weather',
            'forecast': '5-Day Forecast',
            'temperature': 'Temperature',
            'humidity': 'Humidity',
            'wind': 'Wind',
            'precipitation': 'Precipitation',
            'severe_weather_alert': 'Severe Weather Alert',
            
            // Buttons and actions
            'save': 'Save',
            'cancel': 'Cancel',
            'confirm': 'Confirm',
            'delete': 'Delete',
            'edit': 'Edit',
            'share': 'Share',
            'download': 'Download',
            'upload': 'Upload',
            'search': 'Search',
            'filter': 'Filter',
            'clear': 'Clear',
            'refresh': 'Refresh',
            'loading': 'Loading...',
            'success': 'Success!',
            'error': 'Error!',
            'warning': 'Warning!',
            'info': 'Information',
            
            // Settings
            'settings': 'Settings',
            'language': 'Language',
            'notifications': 'Notifications',
            'theme': 'Theme',
            'dark_mode': 'Dark Mode',
            'light_mode': 'Light Mode',
            'data_usage': 'Data Usage',
            'privacy': 'Privacy',
            'about': 'About',
            'help': 'Help',
            'feedback': 'Feedback',
            
            // Notifications
            'enable_notifications': 'Enable Notifications',
            'disable_notifications': 'Disable Notifications',
            'notification_settings': 'Notification Settings',
            'alert_types': 'Alert Types',
            'alert_frequency': 'Alert Frequency',
            
            // Errors
            'error_loading': 'Error loading data',
            'error_saving': 'Error saving data',
            'error_connection': 'Connection error',
            'error_location': 'Could not determine location',
            'error_permission': 'Permission denied',
            'try_again': 'Try Again'
        },
        
        // Nepali translations
        'ne': {
            // Navigation
            'nav_home': 'गृहपृष्ठ',
            'nav_safety': 'सुरक्षा निर्देशिकाहरू',
            'nav_contacts': 'आपतकालीन सम्पर्कहरू',
            'nav_shelters': 'आश्रयस्थल खोज्नुहोस्',
            
            // Home page
            'home_title': 'सेफनेपाल: प्रकोप पूर्वतयारी केन्द्र',
            'home_subtitle': 'नेपालमा प्रकोप पूर्वतयारीको लागि तपाईंको व्यापक स्रोत',
            'home_cta': 'अहिले तयार गर्नुहोस्',
            'emergency_alert': 'आपतकालीन सूचना',
            'latest_updates': 'नवीनतम अपडेटहरू',
            'weather_forecast': 'मौसम पूर्वानुमान',
            'earthquake_updates': 'हालैको भूकम्प गतिविधि',
            
            // Safety guides
            'safety_title': 'प्रकोप सुरक्षा निर्देशिकाहरू',
            'earthquake_safety': 'भूकम्प सुरक्षा',
            'flood_safety': 'बाढी सुरक्षा',
            'landslide_safety': 'पहिरो सुरक्षा',
            'fire_safety': 'आगलागी सुरक्षा',
            'before_disaster': 'प्रकोप अघि',
            'during_disaster': 'प्रकोप को समयमा',
            'after_disaster': 'प्रकोप पछि',
            
            // Emergency contacts
            'contacts_title': 'आपतकालीन सम्पर्कहरू',
            'add_contact': 'सम्पर्क थप्नुहोस्',
            'edit_contact': 'सम्पर्क सम्पादन गर्नुहोस्',
            'delete_contact': 'सम्पर्क मेटाउनुहोस्',
            'import_contacts': 'सम्पर्कहरू आयात गर्नुहोस्',
            'export_contacts': 'सम्पर्कहरू निर्यात गर्नुहोस्',
            'share_contacts': 'सम्पर्कहरू साझा गर्नुहोस्',
            'name': 'नाम',
            'phone': 'फोन',
            'relationship': 'सम्बन्ध',
            'address': 'ठेगाना',
            'notes': 'नोटहरू',
            
            // Shelters
            'shelters_title': 'आपतकालीन आश्रयस्थलहरू',
            'find_nearest': 'नजिकको आश्रयस्थल खोज्नुहोस्',
            'shelter_type': 'आश्रयस्थल प्रकार',
            'shelter_capacity': 'क्षमता',
            'get_directions': 'दिशानिर्देश प्राप्त गर्नुहोस्',
            'current_location': 'हालको स्थान प्रयोग गर्नुहोस्',
            'search_location': 'स्थान खोज्नुहोस्',
            
            // Offline
            'offline_mode': 'अफलाइन मोड',
            'offline_message': 'तपाईं अफलाइन हुनुहुन्छ। केही सुविधाहरू सीमित हुन सक्छन्।',
            'cached_content': 'क्यास गरिएको सामग्री',
            
            // Alerts
            'alert_high': 'उच्च सतर्कता',
            'alert_medium': 'मध्यम सतर्कता',
            'alert_low': 'न्यून सतर्कता',
            'alert_info': 'जानकारी',
            
            // Weather
            'weather_now': 'हालको मौसम',
            'forecast': '५-दिने पूर्वानुमान',
            'temperature': 'तापक्रम',
            'humidity': 'आर्द्रता',
            'wind': 'हावा',
            'precipitation': 'वर्षा',
            'severe_weather_alert': 'गम्भीर मौसम सतर्कता',
            
            // Buttons and actions
            'save': 'सुरक्षित गर्नुहोस्',
            'cancel': 'रद्द गर्नुहोस्',
            'confirm': 'पुष्टि गर्नुहोस्',
            'delete': 'मेटाउनुहोस्',
            'edit': 'सम्पादन गर्नुहोस्',
            'share': 'साझा गर्नुहोस्',
            'download': 'डाउनलोड गर्नुहोस्',
            'upload': 'अपलोड गर्नुहोस्',
            'search': 'खोज्नुहोस्',
            'filter': 'फिल्टर गर्नुहोस्',
            'clear': 'खाली गर्नुहोस्',
            'refresh': 'रिफ्रेस गर्नुहोस्',
            'loading': 'लोड हुँदैछ...',
            'success': 'सफलता!',
            'error': 'त्रुटि!',
            'warning': 'चेतावनी!',
            'info': 'जानकारी',
            
            // Settings
            'settings': 'सेटिङहरू',
            'language': 'भाषा',
            'notifications': 'सूचनाहरू',
            'theme': 'थिम',
            'dark_mode': 'डार्क मोड',
            'light_mode': 'लाइट मोड',
            'data_usage': 'डाटा उपयोग',
            'privacy': 'गोपनीयता',
            'about': 'हाम्रो बारेमा',
            'help': 'सहायता',
            'feedback': 'प्रतिक्रिया',
            
            // Notifications
            'enable_notifications': 'सूचनाहरू सक्षम गर्नुहोस्',
            'disable_notifications': 'सूचनाहरू अक्षम गर्नुहोस्',
            'notification_settings': 'सूचना सेटिङहरू',
            'alert_types': 'सतर्कता प्रकारहरू',
            'alert_frequency': 'सतर्कता आवृत्ति',
            
            // Errors
            'error_loading': 'डाटा लोड गर्न त्रुटि',
            'error_saving': 'डाटा सुरक्षित गर्न त्रुटि',
            'error_connection': 'जडान त्रुटि',
            'error_location': 'स्थान निर्धारण गर्न सकिएन',
            'error_permission': 'अनुमति अस्वीकृत',
            'try_again': 'पुन: प्रयास गर्नुहोस्'
        },
        
        // Hindi translations
        'hi': {
            // Navigation
            'nav_home': 'होम',
            'nav_safety': 'सुरक्षा गाइड',
            'nav_contacts': 'आपातकालीन संपर्क',
            'nav_shelters': 'आश्रय खोजें',
            
            // Home page
            'home_title': 'सेफनेपाल: आपदा तैयारी केंद्र',
            'home_subtitle': 'नेपाल में आपदा तैयारी के लिए आपका व्यापक संसाधन',
            'home_cta': 'अभी तैयार करें',
            'emergency_alert': 'आपातकालीन अलर्ट',
            'latest_updates': 'नवीनतम अपडेट',
            'weather_forecast': 'मौसम का पूर्वानुमान',
            'earthquake_updates': 'हालिया भूकंप गतिविधि',
            
            // Safety guides
            'safety_title': 'आपदा सुरक्षा गाइड',
            'earthquake_safety': 'भूकंप सुरक्षा',
            'flood_safety': 'बाढ़ सुरक्षा',
            'landslide_safety': 'भूस्खलन सुरक्षा',
            'fire_safety': 'अग्नि सुरक्षा',
            'before_disaster': 'आपदा से पहले',
            'during_disaster': 'आपदा के दौरान',
            'after_disaster': 'आपदा के बाद',
            
            // Emergency contacts
            'contacts_title': 'आपातकालीन संपर्क',
            'add_contact': 'संपर्क जोड़ें',
            'edit_contact': 'संपर्क संपादित करें',
            'delete_contact': 'संपर्क हटाएं',
            'import_contacts': 'संपर्क आयात करें',
            'export_contacts': 'संपर्क निर्यात करें',
            'share_contacts': 'संपर्क साझा करें',
            'name': 'नाम',
            'phone': 'फोन',
            'relationship': 'रिश्ता',
            'address': 'पता',
            'notes': 'नोट्स',
            
            // Shelters
            'shelters_title': 'आपातकालीन आश्रय',
            'find_nearest': 'निकटतम आश्रय खोजें',
            'shelter_type': 'आश्रय प्रकार',
            'shelter_capacity': 'क्षमता',
            'get_directions': 'दिशा-निर्देश प्राप्त करें',
            'current_location': 'वर्तमान स्थान का उपयोग करें',
            'search_location': 'स्थान खोजें',
            
            // Offline
            'offline_mode': 'ऑफलाइन मोड',
            'offline_message': 'आप ऑफलाइन हैं। कुछ सुविधाएं सीमित हो सकती हैं।',
            'cached_content': 'कैश्ड सामग्री',
            
            // Alerts
            'alert_high': 'उच्च अलर्ट',
            'alert_medium': 'मध्यम अलर्ट',
            'alert_low': 'निम्न अलर्ट',
            'alert_info': 'जानकारी',
            
            // Weather
            'weather_now': 'वर्तमान मौसम',
            'forecast': '5-दिन का पूर्वानुमान',
            'temperature': 'तापमान',
            'humidity': 'आर्द्रता',
            'wind': 'हवा',
            'precipitation': 'वर्षा',
            'severe_weather_alert': 'गंभीर मौसम अलर्ट',
            
            // Buttons and actions
            'save': 'सहेजें',
            'cancel': 'रद्द करें',
            'confirm': 'पुष्टि करें',
            'delete': 'हटाएं',
            'edit': 'संपादित करें',
            'share': 'साझा करें',
            'download': 'डाउनलोड करें',
            'upload': 'अपलोड करें',
            'search': 'खोजें',
            'filter': 'फ़िल्टर करें',
            'clear': 'साफ़ करें',
            'refresh': 'रीफ्रेश करें',
            'loading': 'लोड हो रहा है...',
            'success': 'सफलता!',
            'error': 'त्रुटि!',
            'warning': 'चेतावनी!',
            'info': 'जानकारी',
            
            // Settings
            'settings': 'सेटिंग्स',
            'language': 'भाषा',
            'notifications': 'सूचनाएं',
            'theme': 'थीम',
            'dark_mode': 'डार्क मोड',
            'light_mode': 'लाइट मोड',
            'data_usage': 'डेटा उपयोग',
            'privacy': 'गोपनीयता',
            'about': 'हमारे बारे में',
            'help': 'सहायता',
            'feedback': 'प्रतिक्रिया',
            
            // Notifications
            'enable_notifications': 'सूचनाएं सक्षम करें',
            'disable_notifications': 'सूचनाएं अक्षम करें',
            'notification_settings': 'सूचना सेटिंग्स',
            'alert_types': 'अलर्ट प्रकार',
            'alert_frequency': 'अलर्ट आवृत्ति',
            
            // Errors
            'error_loading': 'डेटा लोड करने में त्रुटि',
            'error_saving': 'डेटा सहेजने में त्रुटि',
            'error_connection': 'कनेक्शन त्रुटि',
            'error_location': 'स्थान निर्धारित नहीं किया जा सका',
            'error_permission': 'अनुमति अस्वीकृत',
            'try_again': 'पुनः प्रयास करें'
        },
        
        // Chinese translations (simplified)
        'zh': {
            // Navigation
            'nav_home': '首页',
            'nav_safety': '安全指南',
            'nav_contacts': '紧急联系人',
            'nav_shelters': '寻找避难所',
            
            // Home page
            'home_title': '安全尼泊尔：灾害准备中心',
            'home_subtitle': '您在尼泊尔灾害准备的综合资源',
            'home_cta': '立即准备',
            'emergency_alert': '紧急警报',
            'latest_updates': '最新更新',
            'weather_forecast': '天气预报',
            'earthquake_updates': '近期地震活动',
            
            // Safety guides
            'safety_title': '灾害安全指南',
            'earthquake_safety': '地震安全',
            'flood_safety': '洪水安全',
            'landslide_safety': '山体滑坡安全',
            'fire_safety': '火灾安全',
            'before_disaster': '灾害前',
            'during_disaster': '灾害期间',
            'after_disaster': '灾害后',
            
            // Emergency contacts
            'contacts_title': '紧急联系人',
            'add_contact': '添加联系人',
            'edit_contact': '编辑联系人',
            'delete_contact': '删除联系人',
            'import_contacts': '导入联系人',
            'export_contacts': '导出联系人',
            'share_contacts': '分享联系人',
            'name': '姓名',
            'phone': '电话',
            'relationship': '关系',
            'address': '地址',
            'notes': '备注',
            
            // Shelters
            'shelters_title': '紧急避难所',
            'find_nearest': '寻找最近的避难所',
            'shelter_type': '避难所类型',
            'shelter_capacity': '容量',
            'get_directions': '获取路线',
            'current_location': '使用当前位置',
            'search_location': '搜索位置',
            
            // Offline
            'offline_mode': '离线模式',
            'offline_message': '您处于离线状态。某些功能可能受限。',
            'cached_content': '缓存内容',
            
            // Alerts
            'alert_high': '高级警报',
            'alert_medium': '中级警报',
            'alert_low': '低级警报',
            'alert_info': '信息',
            
            // Weather
            'weather_now': '当前天气',
            'forecast': '5天预报',
            'temperature': '温度',
            'humidity': '湿度',
            'wind': '风力',
            'precipitation': '降水量',
            'severe_weather_alert': '恶劣天气警报',
            
            // Buttons and actions
            'save': '保存',
            'cancel': '取消',
            'confirm': '确认',
            'delete': '删除',
            'edit': '编辑',
            'share': '分享',
            'download': '下载',
            'upload': '上传',
            'search': '搜索',
            'filter': '筛选',
            'clear': '清除',
            'refresh': '刷新',
            'loading': '加载中...',
            'success': '成功！',
            'error': '错误！',
            'warning': '警告！',
            'info': '信息',
            
            // Settings
            'settings': '设置',
            'language': '语言',
            'notifications': '通知',
            'theme': '主题',
            'dark_mode': '深色模式',
            'light_mode': '浅色模式',
            'data_usage': '数据使用',
            'privacy': '隐私',
            'about': '关于',
            'help': '帮助',
            'feedback': '反馈',
            
            // Notifications
            'enable_notifications': '启用通知',
            'disable_notifications': '禁用通知',
            'notification_settings': '通知设置',
            'alert_types': '警报类型',
            'alert_frequency': '警报频率',
            
            // Errors
            'error_loading': '加载数据错误',
            'error_saving': '保存数据错误',
            'error_connection': '连接错误',
            'error_location': '无法确定位置',
            'error_permission': '权限被拒绝',
            'try_again': '重试'
        }
    },
    
    // Initialize language support
    init() {
        // Load saved language preference
        this.loadLanguagePreference();
        
        // Set up language selector
        this.setupLanguageSelector();
        
        // Translate the page
        this.translatePage();
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    // Load saved language preference
    loadLanguagePreference() {
        const savedLanguage = localStorage.getItem('safeNepal_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            // Try to detect browser language
            this.detectBrowserLanguage();
        }
    },
    
    // Detect browser language
    detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        
        // Check if we support this language
        if (this.translations[browserLang]) {
            this.currentLanguage = browserLang;
            localStorage.setItem('safeNepal_language', browserLang);
        }
    },
    
    // Set up language selector
    setupLanguageSelector() {
        const languageSelector = document.getElementById('language-selector');
        if (!languageSelector) return;
        
        // Clear existing options
        languageSelector.innerHTML = '';
        
        // Add options for each language
        Object.keys(this.languages).forEach(langCode => {
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = this.languages[langCode];
            option.selected = langCode === this.currentLanguage;
            languageSelector.appendChild(option);
        });
        
        // Add change event listener
        languageSelector.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    },
    
    // Set up event listeners
    setupEventListeners() {
        // Listen for language change events from other parts of the app
        document.addEventListener('safeNepal_languageChanged', (e) => {
            if (e.detail && e.detail.language) {
                this.changeLanguage(e.detail.language);
            }
        });
    },
    
    // Change language
    changeLanguage(langCode) {
        if (this.translations[langCode]) {
            this.currentLanguage = langCode;
            localStorage.setItem('safeNepal_language', langCode);
            this.translatePage();
            
            // Update language selector if it exists
            const languageSelector = document.getElementById('language-selector');
            if (languageSelector) {
                languageSelector.value = langCode;
            }
            
            // Dispatch event for other components
            document.dispatchEvent(new CustomEvent('safeNepal_languageChanged', {
                detail: { language: langCode }
            }));
        }
    },
    
    // Translate the page
    translatePage() {
        // Get all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Check if the element has children that should be preserved
                if (element.children.length > 0 && !element.hasAttribute('data-i18n-replace-all')) {
                    element.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            node.nodeValue = translation;
                        }
                    });
                } else {
                    element.innerHTML = translation;
                }
            }
        });
        
        // Translate placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });
        
        // Translate titles/tooltips
        const titles = document.querySelectorAll('[data-i18n-title]');
        titles.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('title', translation);
            }
        });
        
        // Translate aria-labels
        const ariaLabels = document.querySelectorAll('[data-i18n-aria-label]');
        ariaLabels.forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });
        
        // Update document title if it has a data-i18n attribute
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                document.title = translation;
            }
        }
    },
    
    // Get translation for a key
    getTranslation(key) {
        // If the key doesn't exist in the current language, fall back to English
        if (this.translations[this.currentLanguage] && 
            this.translations[this.currentLanguage][key]) {
            return this.translations[this.currentLanguage][key];
        } else if (this.translations['en'] && this.translations['en'][key]) {
            return this.translations['en'][key];
        }
        
        // If the key doesn't exist at all, return the key itself
        return key;
    },
    
    // Translate a specific text
    translate(key) {
        return this.getTranslation(key);
    },
    
    // Format date according to current language
    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        let options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        try {
            return date.toLocaleDateString(this.getLocale(), options);
        } catch (e) {
            // Fallback to English if the locale is not supported
            return date.toLocaleDateString('en-US', options);
        }
    },
    
    // Format number according to current language
    formatNumber(number) {
        try {
            return number.toLocaleString(this.getLocale());
        } catch (e) {
            // Fallback to English if the locale is not supported
            return number.toLocaleString('en-US');
        }
    },
    
    // Get locale for the current language
    getLocale() {
        const localeMap = {
            'en': 'en-US',
            'ne': 'ne-NP',
            'hi': 'hi-IN',
            'zh': 'zh-CN'
        };
        
        return localeMap[this.currentLanguage] || 'en-US';
    },
    
    // Add a new translation
    addTranslation(langCode, key, value) {
        if (!this.translations[langCode]) {
            this.translations[langCode] = {};
        }
        
        this.translations[langCode][key] = value;
    },
    
    // Add multiple translations at once
    addTranslations(langCode, translations) {
        if (!this.translations[langCode]) {
            this.translations[langCode] = {};
        }
        
        Object.assign(this.translations[langCode], translations);
    },
    
    // Get all available languages
    getAvailableLanguages() {
        return this.languages;
    },
    
    // Get current language code
    getCurrentLanguage() {
        return this.currentLanguage;
    },
    
    // Get current language name
    getCurrentLanguageName() {
        return this.languages[this.currentLanguage];
    }
};

// Initialize language support when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    languageManager.init();
});