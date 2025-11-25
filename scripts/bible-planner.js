/**
 * Ethiopian Bible Planner Application
 * Complete version with persistent storage, performance optimizations, and advanced features
 * Version 3.0 - Production Ready
 */

'use strict';

// ===================================
// UTILITY FUNCTIONS
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===================================
// STORAGE MANAGER MODULE
// ===================================
class StorageManager {
    constructor() {
        this.useNativeStorage = typeof window.storage !== 'undefined';
        this.memoryStorage = {};
        console.log(`Storage Manager initialized: ${this.useNativeStorage ? 'Using native storage' : 'Using memory storage'}`);
    }

    async get(key, defaultValue = null) {
        try {
            if (this.useNativeStorage) {
                try {
                    const result = await window.storage.get(key);
                    return result ? JSON.parse(result.value) : defaultValue;
                } catch (keyError) {
                    console.debug(`Key "${key}" not found, returning default value`);
                    return defaultValue;
                }
            } else {
                return this.memoryStorage[key] !== undefined ? this.memoryStorage[key] : defaultValue;
            }
        } catch (error) {
            console.warn(`Failed to load ${key}:`, error);
            return defaultValue;
        }
    }

    async set(key, value) {
        try {
            const data = JSON.stringify(value);
            if (this.useNativeStorage) {
                const result = await window.storage.set(key, data);
                return result !== null;
            } else {
                this.memoryStorage[key] = value;
                return true;
            }
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            return false;
        }
    }

    async delete(key) {
        try {
            if (this.useNativeStorage) {
                await window.storage.delete(key);
            } else {
                delete this.memoryStorage[key];
            }
            return true;
        } catch (error) {
            console.error(`Failed to delete ${key}:`, error);
            return false;
        }
    }

    async clear() {
        try {
            if (this.useNativeStorage) {
                const keys = await window.storage.list('bible-planner-');
                for (const key of keys.keys) {
                    await window.storage.delete(key);
                }
            } else {
                this.memoryStorage = {};
            }
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
}

// ===================================
// UI MANAGER MODULE
// ===================================
class UIManager {
    constructor() {
        this.messageTimeout = null;
    }

    showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="flex justify-center items-center p-8">
                    <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p class="ml-4 text-gray-600">Loading your Bible plan...</p>
                </div>
            `;
        } else {
            document.body.classList.add('loading');
        }
    }

    hideLoading() {
        document.body.classList.remove('loading');
    }

    showMessage(message, type = 'success') {
        this.clearMessage();

        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message fixed top-20 right-4 z-50 max-w-md slide-in`;
        messageDiv.setAttribute('role', 'alert');
        
        const icon = type === 'success' ? 'check-circle' : 'alert-circle';
        messageDiv.innerHTML = `
            <i data-lucide="${icon}" class="w-5 h-5"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(messageDiv);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        this.messageTimeout = setTimeout(() => {
            this.clearMessage();
        }, 5000);
    }

    clearMessage() {
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageTimeout = null;
        }
        const messages = document.querySelectorAll('.success-message, .error-message');
        messages.forEach(msg => msg.remove());
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    getSkeletonHTML(count = 4) {
        return `
            <div class="skeleton-loader">
                <div class="skeleton-header" style="height: 60px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); border-radius: 12px; margin-bottom: 20px;"></div>
                ${Array(count).fill(`
                    <div class="skeleton-card" style="height: 120px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); border-radius: 12px; margin-bottom: 16px;"></div>
                `).join('')}
            </div>
        `;
    }

    destroy() {
        this.clearMessage();
    }
}

// ===================================
// ANALYTICS MANAGER MODULE
// ===================================
class AnalyticsManager {
    calculateStreak(completedReadings) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        const sortedReadings = Object.entries(completedReadings)
            .filter(([_, completed]) => completed)
            .sort((a, b) => b[0].localeCompare(a[0]));
        
        if (sortedReadings.length > 0) {
            streak = Math.min(sortedReadings.length, 30);
        }
        
        return streak;
    }

    getProgressInsights(completedReadings, totalReadings) {
        const completed = Object.values(completedReadings).filter(Boolean).length;
        const percentage = Math.round((completed / totalReadings) * 100);
        const streak = this.calculateStreak(completedReadings);
        
        return {
            percentComplete: percentage,
            readingsCompleted: completed,
            readingsRemaining: totalReadings - completed,
            currentStreak: streak,
            totalReadings: totalReadings
        };
    }

    getMostActiveMonth(completedReadings) {
        const monthCounts = {};
        
        Object.keys(completedReadings).forEach(key => {
            if (completedReadings[key]) {
                const month = key.split('-')[1] || 'unknown';
                monthCounts[month] = (monthCounts[month] || 0) + 1;
            }
        });
        
        let maxMonth = null;
        let maxCount = 0;
        
        Object.entries(monthCounts).forEach(([month, count]) => {
            if (count > maxCount) {
                maxMonth = month;
                maxCount = count;
            }
        });
        
        return maxMonth;
    }
}

// ===================================
// ERROR BOUNDARY
// ===================================
class ErrorBoundary {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.setupErrorHandling();
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }
    
    handleError(error) {
        console.error('Application error:', error);
        
        if (this.rootElement) {
            this.rootElement.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; min-height: 50vh; padding: 2rem;">
                    <div style="text-align: center; max-width: 500px; background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                        <h2 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 700;">Something went wrong</h2>
                        <p style="color: #64748b; margin-bottom: 1.5rem; line-height: 1.6;">We're sorry for the inconvenience. Please try refreshing the page.</p>
                        <details style="text-align: left; margin-bottom: 1.5rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
                            <summary style="cursor: pointer; font-weight: 600; color: #374151;">Error Details</summary>
                            <pre style="margin-top: 0.5rem; font-size: 0.875rem; overflow-x: auto; color: #dc2626;">${error.message || 'Unknown error'}${error.stack ? '\n' + error.stack : ''}</pre>
                        </details>
                        <button onclick="location.reload()" style="background: linear-gradient(135deg, #205782, #f2842f); color: white; padding: 0.75rem 2rem; border-radius: 50px; border: none; font-weight: 600; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 12px rgba(242, 132, 47, 0.3); transition: all 0.3s ease;">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// ===================================
// MAIN BIBLE PLANNER CLASS
// ===================================
class EthiopianBiblePlanner {
    constructor() {
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.analytics = new AnalyticsManager();
        
        this.state = {
            activeTab: 'calendar',
            selectedMonth: 'meskerem',
            selectedPlan: 'chronological',
            expandedWeeks: {},
            completedReadings: {},
            showStats: false,
            darkMode: false,
            reminderTime: '07:00'
        };

        this.brandColors = {
            primary: '#205782',
            secondary: '#f2842f',
            accent: '#2e8b57',
            light: '#e6f2ff',
            warm: '#fff5eb',
            success: '#10b981'
        };

        this.ethiopianMonths = [];
        this.holyDays = [];
        this.ministryEvents = [];
        this.chronologicalPlan = {};
        this.ntIntensive = [];
        this.discipleshipWeeks = [];

        this.saveDebounceTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.initializeAllData();
    }

    // ===================================
    // DATA INITIALIZATION
    // ===================================
    initializeAllData() {
        try {
            this.initializeMonthsAndEvents();
            this.initializeChronologicalPlan();
            this.initializeNT90Plan();
            this.initializeDiscipleshipWeeks();
            console.log('✓ All data initialized successfully');
        } catch (error) {
            console.error('Failed to initialize data:', error);
            throw error;
        }
    }

    initializeMonthsAndEvents() {
        this.ethiopianMonths = [
            { id: 'meskerem', name: 'Meskerem (መስከረም)', days: 30, gregorian: 'Sep 11 - Oct 10, 2024', season: 'Spring' },
            { id: 'tikimt', name: 'Tikimt (ጥቅምት)', days: 30, gregorian: 'Oct 11 - Nov 9, 2024', season: 'Spring' },
            { id: 'hidar', name: 'Hidar (ኅዳር)', days: 30, gregorian: 'Nov 10 - Dec 9, 2024', season: 'Spring' },
            { id: 'tahsas', name: 'Tahsas (ታኅሣሥ)', days: 30, gregorian: 'Dec 10, 2024 - Jan 8, 2025', season: 'Winter' },
            { id: 'tir', name: 'Tir (ጥር)', days: 30, gregorian: 'Jan 9 - Feb 7, 2025', season: 'Winter' },
            { id: 'yekatit', name: 'Yekatit (የካቲት)', days: 30, gregorian: 'Feb 8 - Mar 9, 2025', season: 'Winter' },
            { id: 'megabit', name: 'Megabit (መጋቢት)', days: 30, gregorian: 'Mar 10 - Apr 8, 2025', season: 'Summer' },
            { id: 'miazia', name: 'Miazia (ሚያዝያ)', days: 30, gregorian: 'Apr 9 - May 8, 2025', season: 'Summer' },
            { id: 'ginbot', name: 'Ginbot (ግንቦት)', days: 30, gregorian: 'May 9 - Jun 7, 2025', season: 'Summer' },
            { id: 'sene', name: 'Sene (ሰኔ)', days: 30, gregorian: 'Jun 8 - Jul 7, 2025', season: 'Rainy' },
            { id: 'hamle', name: 'Hamle (ሐምሌ)', days: 30, gregorian: 'Jul 8 - Aug 6, 2025', season: 'Rainy' },
            { id: 'nehase', name: 'Nehase (ነሐሴ)', days: 30, gregorian: 'Aug 7 - Sep 5, 2025', season: 'Rainy' },
            { id: 'pagume', name: 'Pagume (ጳጉሜን)', days: 5, gregorian: 'Sep 6-10, 2025', season: 'Special' }
        ];

        this.holyDays = [
            { month: 'meskerem', day: 1, name: 'Ethiopian New Year (እንቁጣጣሽ)', date: 'Sep 11, 2025', description: 'New Year celebration' },
            { month: 'meskerem', day: 17, name: 'Finding of True Cross (መስቀል)', date: 'Sep 27, 2025', description: 'Meskel festival' },
            { month: 'tahsas', day: 29, name: 'Ethiopian Christmas (ገና/ልደት)', date: 'Jan 7, 2026', description: 'Birth of Christ' },
            { month: 'tir', day: 11, name: 'Epiphany/Timkat (ጥምቀት)', date: 'Jan 19, 2026', description: 'Baptism of Jesus' },
            { month: 'nehase', day: 16, name: 'Assumption of Mary (ፍልሰታ)', date: 'Aug 22, 2026', description: 'Filseta celebration' }
        ];

        this.ministryEvents = [
            { month: 'tir', day: 4, name: 'Ministry Establishment', date: 'Jan 12, 2025', type: 'milestone', description: 'Foundation of ministry work' },
            { month: 'meskerem', day: 1, name: 'Phase 1 Launch (Arsi & Bale)', date: 'Sep 11, 2025', type: 'launch', description: 'Beginning outreach in Arsi and Bale regions' },
            { month: 'megabit', day: 1, name: 'Mid-Year Evaluation', date: 'Mar 10, 2026', type: 'evaluation', description: 'Review progress and adjust strategies' },
            { month: 'nehase', day: 30, name: 'Phase 1 Completion', date: 'Sep 5, 2026', type: 'milestone', description: 'Celebrate first year achievements' }
        ];
    }

    initializeChronologicalPlan() {
        this.chronologicalPlan = {
            meskerem: { 
                weeks: 4, 
                reading: 'Genesis 1-50; Exodus 1-14', 
                theme: 'Creation to Exodus',
                weeklyBreakdown: [
                    {
                        week: 1,
                        focus: 'Creation & Fall',
                        readings: 'Genesis 1-11',
                        keyThemes: 'God as Creator, Human Sin, Covenant Beginnings',
                        studyQuestions: [
                            'What does Creation teach us about God\'s character?',
                            'How does the Fall affect our relationship with God?',
                            'What promises do we see in the early covenants?'
                        ],
                        memoryVerse: 'Genesis 1:1 - "In the beginning God created the heavens and the earth."',
                        practicalApplication: 'Reflect on God as Creator in your daily life. Take time each day to notice His creation around you.'
                    },
                    {
                        week: 2,
                        focus: 'Patriarchs: Abraham',
                        readings: 'Genesis 12-25',
                        keyThemes: 'Faith, Promise, Testing, Provision',
                        studyQuestions: [
                            'How did Abraham demonstrate faith?',
                            'What can we learn from Abraham\'s mistakes?',
                            'How does God fulfill His promises?'
                        ],
                        memoryVerse: 'Genesis 15:6 - "Abram believed the LORD, and he credited it to him as righteousness."',
                        practicalApplication: 'Step out in faith in one area this week. Trust God with something that seems impossible.'
                    },
                    {
                        week: 3,
                        focus: 'Patriarchs: Jacob & Joseph',
                        readings: 'Genesis 26-50',
                        keyThemes: 'Transformation, Forgiveness, Sovereignty',
                        studyQuestions: [
                            'How did God transform Jacob\'s character?',
                            'What does Joseph\'s story teach about forgiveness?',
                            'How does God work through difficult circumstances?'
                        ],
                        memoryVerse: 'Genesis 50:20 - "You intended to harm me, but God intended it for good."',
                        practicalApplication: 'Practice forgiveness in a relationship. Choose to see God\'s purpose in difficulties.'
                    },
                    {
                        week: 4,
                        focus: 'Exodus Begins',
                        readings: 'Exodus 1-14',
                        keyThemes: 'Deliverance, Passover, Faith in Crisis',
                        studyQuestions: [
                            'How does God hear the cries of His people?',
                            'What does the Passover teach us about redemption?',
                            'How can we trust God in impossible situations?'
                        ],
                        memoryVerse: 'Exodus 14:14 - "The LORD will fight for you; you need only to be still."',
                        practicalApplication: 'Trust God with an impossible situation. Stand still and watch Him work.'
                    }
                ]
            },
            tikimt: { 
                weeks: 4, 
                reading: 'Exodus 15-40; Leviticus 1-27', 
                theme: 'Wilderness & Law',
                weeklyBreakdown: [
                    {
                        week: 5,
                        focus: 'Wilderness Journey',
                        readings: 'Exodus 15-18',
                        keyThemes: 'Provision, Testing, Leadership',
                        studyQuestions: [
                            'How does God provide in the wilderness?',
                            'What can we learn from Israel\'s complaining?',
                            'How does God raise up leaders?'
                        ],
                        memoryVerse: 'Exodus 15:2 - "The LORD is my strength and my defense."',
                        practicalApplication: 'Thank God for His daily provision. List three ways He has provided for you this week.'
                    },
                    {
                        week: 6,
                        focus: 'The Ten Commandments',
                        readings: 'Exodus 19-24',
                        keyThemes: 'Law, Covenant, Holiness',
                        studyQuestions: [
                            'What is the purpose of the Ten Commandments?',
                            'How does the law reveal God\'s character?',
                            'What does it mean to be a holy nation?'
                        ],
                        memoryVerse: 'Exodus 20:1-3 - "I am the LORD your God... You shall have no other gods before me."',
                        practicalApplication: 'Apply one commandment specifically this week. Choose one and live it intentionally.'
                    },
                    {
                        week: 7,
                        focus: 'Tabernacle & Worship',
                        readings: 'Exodus 25-40',
                        keyThemes: 'Worship, Presence, Obedience',
                        studyQuestions: [
                            'What does the tabernacle teach about God\'s presence?',
                            'Why is detailed obedience important in worship?',
                            'How does God respond to disobedience?'
                        ],
                        memoryVerse: 'Exodus 25:8 - "Have them make a sanctuary for me, and I will dwell among them."',
                        practicalApplication: 'Create a dedicated space for prayer in your home. Make worship a priority.'
                    },
                    {
                        week: 8,
                        focus: 'Laws of Holiness',
                        readings: 'Leviticus 1-27',
                        keyThemes: 'Sacrifice, Purity, Atonement',
                        studyQuestions: [
                            'What do the sacrifices teach about sin and forgiveness?',
                            'How does holiness affect everyday life?',
                            'What principles of purity apply today?'
                        ],
                        memoryVerse: 'Leviticus 19:2 - "Be holy because I, the LORD your God, am holy."',
                        practicalApplication: 'Practice holiness in your thoughts. Guard your mind against impurity.'
                    }
                ]
            },
            hidar: { 
                weeks: 4, 
                reading: 'Numbers 1-36; Deuteronomy 1-34', 
                theme: 'Wilderness Wanderings',
                weeklyBreakdown: [
                    { week: 9, focus: 'Census & Organization', readings: 'Numbers 1-10', keyThemes: 'Order, Preparation, Guidance', studyQuestions: ['Why was numbering important?', 'How did God organize His people?', 'What can we learn about guidance?'], memoryVerse: 'Numbers 9:17 - "Whenever the cloud lifted..."', practicalApplication: 'Seek God\'s guidance this week.' },
                    { week: 10, focus: 'Rebellion & Consequences', readings: 'Numbers 11-21', keyThemes: 'Complaining, Judgment, Faithfulness', studyQuestions: ['What were the consequences?', 'How did Moses handle rebellion?', 'What does the bronze snake teach?'], memoryVerse: 'Numbers 14:18 - "The LORD is slow to anger..."', practicalApplication: 'Guard against complaining.' },
                    { week: 11, focus: 'Balaam & Preparation', readings: 'Numbers 22-36', keyThemes: 'Obedience, Blessing, Inheritance', studyQuestions: ['What can we learn from Balaam?', 'How did God turn curses into blessings?', 'What governs inheritance?'], memoryVerse: 'Numbers 23:19 - "God is not human..."', practicalApplication: 'Trust God turns difficulties to blessings.' },
                    { week: 12, focus: 'Moses Final Sermons', readings: 'Deuteronomy 1-34', keyThemes: 'Covenant Renewal, Obedience, Choice', studyQuestions: ['What was Moses main message?', 'How does Deuteronomy summarize the relationship?', 'What does it mean to love God with all your heart?'], memoryVerse: 'Deuteronomy 6:4-5 - "Hear, O Israel..."', practicalApplication: 'Choose to love God wholeheartedly.' }
                ]
            },
            tahsas: { 
                weeks: 4, 
                reading: 'Joshua 1-24; Judges 1-21; Ruth 1-4', 
                theme: 'Conquest & Judges',
                weeklyBreakdown: [
                    { week: 13, focus: 'Conquest of Canaan', readings: 'Joshua 1-12', keyThemes: 'Courage, Obedience, Victory', studyQuestions: ['What was Joshua\'s key to success?', 'How did God demonstrate power at Jericho?', 'What consequences came from Achan\'s sin?'], memoryVerse: 'Joshua 1:9 - "Be strong and courageous..."', practicalApplication: 'Face a fear with courage.' },
                    { week: 14, focus: 'Land Division & Covenant', readings: 'Joshua 13-24', keyThemes: 'Inheritance, Faithfulness, Service', studyQuestions: ['How was land divided?', 'What was Joshua\'s final challenge?', 'What does serving the LORD mean practically?'], memoryVerse: 'Joshua 24:15 - "As for me and my household..."', practicalApplication: 'Decide to serve God in your family.' },
                    { week: 15, focus: 'Cycle of Judges', readings: 'Judges 1-16', keyThemes: 'Disobedience, Oppression, Deliverance', studyQuestions: ['What pattern repeats?', 'How did God use flawed leaders?', 'What can we learn from Samson?'], memoryVerse: 'Judges 21:25 - "Everyone did as they saw fit."', practicalApplication: 'Examine areas where you do what\'s right in your own eyes.' },
                    { week: 16, focus: 'Ruth & Hope', readings: 'Judges 17-21; Ruth 1-4', keyThemes: 'Loyalty, Redemption, Providence', studyQuestions: ['How does Ruth demonstrate faithful love?', 'What does Boaz as redeemer teach about Christ?', 'How does God work through ordinary people?'], memoryVerse: 'Ruth 1:16 - "Where you go I will go..."', practicalApplication: 'Show loyal love to someone in need.' }
                ]
            },
            tir: { 
                weeks: 4, 
                reading: '1 Samuel 1-31; 2 Samuel 1-24', 
                theme: 'United Kingdom',
                weeklyBreakdown: [
                    { week: 17, focus: 'Samuel & Saul', readings: '1 Samuel 1-15', keyThemes: 'Prayer, Leadership, Obedience', studyQuestions: ['What can we learn from Hannah\'s prayer?', 'Why did people want a king?', 'What was Saul\'s fatal mistake?'], memoryVerse: '1 Samuel 15:22 - "To obey is better than sacrifice..."', practicalApplication: 'Choose obedience over outward religion.' },
                    { week: 18, focus: 'David\'s Rise', readings: '1 Samuel 16-31', keyThemes: 'Anointing, Friendship, Patience', studyQuestions: ['Why was David chosen?', 'What made David and Jonathan\'s friendship special?', 'How did David handle opportunities to kill Saul?'], memoryVerse: '1 Samuel 16:7 - "The LORD looks at the heart."', practicalApplication: 'Value people for their heart character.' },
                    { week: 19, focus: 'David\'s Reign', readings: '2 Samuel 1-12', keyThemes: 'Kingship, Covenant, Sin', studyQuestions: ['How did David establish his kingdom?', 'What was God\'s covenant with David?', 'What were the consequences of David\'s sin?'], memoryVerse: '2 Samuel 7:16 - "Your throne will be established forever."', practicalApplication: 'Remember actions have consequences.' },
                    { week: 20, focus: 'Family Troubles', readings: '2 Samuel 13-24', keyThemes: 'Consequences, Repentance, Grace', studyQuestions: ['How did David\'s sin affect his family?', 'What can we learn from Absalom\'s rebellion?', 'How did David respond to discipline?'], memoryVerse: '2 Samuel 22:2-3 - "The LORD is my rock..."', practicalApplication: 'Run to God as refuge in consequences.' }
                ]
            },
            yekatit: { 
                weeks: 4, 
                reading: '1 Kings 1-22; 2 Kings 1-25; 1 Chronicles 1-29', 
                theme: 'Divided Kingdom',
                weeklyBreakdown: [
                    { week: 21, focus: 'Solomon\'s Reign', readings: '1 Kings 1-11; 1 Chronicles 1-9', keyThemes: 'Wisdom, Temple, Compromise', studyQuestions: ['What made Solomon\'s wisdom unique?', 'What was significant about the temple?', 'How did foreign wives lead him astray?'], memoryVerse: '1 Kings 3:9 - "Give your servant a discerning heart..."', practicalApplication: 'Ask God for wisdom.' },
                    { week: 22, focus: 'Kingdom Divides', readings: '1 Kings 12-22; 1 Chronicles 10-21', keyThemes: 'Division, Prophets, Idolatry', studyQuestions: ['Why did the kingdom split?', 'How did prophets confront idolatry?', 'What can we learn from Ahab and Jezebel?'], memoryVerse: '1 Kings 18:21 - "How long will you waver..."', practicalApplication: 'Eliminate idols competing for your devotion.' },
                    { week: 23, focus: 'Elisha & Decline', readings: '2 Kings 1-17; 1 Chronicles 22-29', keyThemes: 'Miracles, Faithfulness, Judgment', studyQuestions: ['How did Elisha\'s ministry differ?', 'Why was Israel taken captive?', 'What reforms did Hezekiah implement?'], memoryVerse: '2 Kings 17:13-14 - "The LORD warned... But they would not listen."', practicalApplication: 'Listen to godly counsel.' },
                    { week: 24, focus: 'Judah\'s Fall', readings: '2 Kings 18-25; 2 Chronicles 1-36', keyThemes: 'Reform, Judgment, Hope', studyQuestions: ['What made Josiah\'s reforms significant?', 'Why did Judah go into exile?', 'What hope remained?'], memoryVerse: '2 Kings 23:25 - "Neither before nor after Josiah..."', practicalApplication: 'Be a person of spiritual reform.' }
                ]
            },
            megabit: { 
                weeks: 4, 
                reading: 'Ezra 1-10; Nehemiah 1-13; Esther 1-10; Job 1-42', 
                theme: 'Return & Restoration',
                weeklyBreakdown: [
                    { week: 25, focus: 'Return from Exile', readings: 'Ezra 1-10; Nehemiah 1-7', keyThemes: 'Restoration, Worship, Opposition', studyQuestions: ['How did God move Cyrus?', 'What challenges did exiles face?', 'How did Nehemiah lead rebuilding?'], memoryVerse: 'Ezra 1:1 - "The LORD moved the heart of Cyrus..."', practicalApplication: 'Trust God can move leaders\' hearts.' },
                    { week: 26, focus: 'Spiritual Renewal', readings: 'Nehemiah 8-13; Esther 1-10', keyThemes: 'Word of God, Covenant, Providence', studyQuestions: ['How did reading the Law impact people?', 'What was significant about covenant renewal?', 'How did God use Esther?'], memoryVerse: 'Nehemiah 8:8 - "They read from the Book of the Law..."', practicalApplication: 'Commit to understanding God\'s Word better.' },
                    { week: 27, focus: 'Job: Suffering & Sovereignty', readings: 'Job 1-21', keyThemes: 'Suffering, Justice, Mystery', studyQuestions: ['What do we learn about spiritual warfare?', 'How did friends misunderstand?', 'What questions did Job raise?'], memoryVerse: 'Job 1:21 - "The LORD gave and the LORD has taken away..."', practicalApplication: 'Praise God in difficult circumstances.' },
                    { week: 28, focus: 'God Answers Job', readings: 'Job 22-42', keyThemes: 'Wisdom, Repentance, Restoration', studyQuestions: ['How did God answer Job?', 'What was God\'s main point?', 'How did Job\'s perspective change?'], memoryVerse: 'Job 42:5-6 - "My ears had heard... but now my eyes have seen..."', practicalApplication: 'Humble yourself before God\'s wisdom.' }
                ]
            },
            miazia: { 
                weeks: 4, 
                reading: 'Psalms 1-150; Proverbs 1-31', 
                theme: 'Wisdom & Worship',
                weeklyBreakdown: [
                    { week: 29, focus: 'Psalms of David', readings: 'Psalms 1-41', keyThemes: 'Worship, Lament, Trust', studyQuestions: ['What makes Psalms unique?', 'How do they express honest emotions?', 'What do we learn about God\'s character?'], memoryVerse: 'Psalm 1:1-2 - "Blessed is the one..."', practicalApplication: 'Use Psalms as model for prayers.' },
                    { week: 30, focus: 'Worship & Wisdom', readings: 'Psalms 42-89; Proverbs 1-9', keyThemes: 'Refuge, Wisdom, Fear of God', studyQuestions: ['How do Psalms portray God as refuge?', 'What is the beginning of wisdom?', 'How does wisdom protect us?'], memoryVerse: 'Psalm 46:1 - "God is our refuge and strength..."', practicalApplication: 'Memorize one Psalm for times of trouble.' },
                    { week: 31, focus: 'Songs of Ascent', readings: 'Psalms 90-118; Proverbs 10-20', keyThemes: 'Pilgrimage, Thanksgiving, Practical Wisdom', studyQuestions: ['What were Songs of Ascent for?', 'How do these express thanksgiving?', 'What practical wisdom offered?'], memoryVerse: 'Psalm 100:4-5 - "Enter his gates with thanksgiving..."', practicalApplication: 'Enter God\'s presence with thanksgiving daily.' },
                    { week: 32, focus: 'Praise & Wisdom Conclusion', readings: 'Psalms 119-150; Proverbs 21-31', keyThemes: 'Word of God, Praise, Final Wisdom', studyQuestions: ['What does Psalm 119 teach about God\'s Word?', 'How do final psalms call us to praise?', 'What wisdom does the noble wife exemplify?'], memoryVerse: 'Psalm 119:105 - "Your word is a lamp..."', practicalApplication: 'Let God\'s Word guide decisions daily.' }
                ]
            },
            ginbot: { 
                weeks: 4, 
                reading: 'Ecclesiastes 1-12; Song of Songs 1-8; Isaiah 1-66', 
                theme: 'Prophets Begin',
                weeklyBreakdown: [
                    { week: 33, focus: 'Ecclesiastes & Song', readings: 'Ecclesiastes 1-12; Song of Songs 1-8', keyThemes: 'Meaning, Love, Joy', studyQuestions: ['What is meaning of life?', 'How does Song portray godly love?', 'What place do pleasure and work have?'], memoryVerse: 'Ecclesiastes 12:13 - "Fear God and keep his commandments..."', practicalApplication: 'Find satisfaction in God not earthly pursuits.' },
                    { week: 34, focus: 'Isaiah: Judgment & Hope', readings: 'Isaiah 1-23', keyThemes: 'Sin, Judgment, Holiness', studyQuestions: ['What sins was Judah committing?', 'How does Isaiah describe holiness?', 'What judgments on nations?'], memoryVerse: 'Isaiah 6:3 - "Holy, holy, holy is the LORD..."', practicalApplication: 'Worship God for His holiness.' },
                    { week: 35, focus: 'Isaiah: Trust & Messiah', readings: 'Isaiah 24-39', keyThemes: 'Trust, Salvation, Hezekiah', studyQuestions: ['Why not trust in alliances?', 'What messianic prophecies?', 'How did Hezekiah show faith and weakness?'], memoryVerse: 'Isaiah 26:3 - "You will keep in perfect peace..."', practicalApplication: 'Trust God completely.' },
                    { week: 36, focus: 'Isaiah: Comfort & Restoration', readings: 'Isaiah 40-66', keyThemes: 'Comfort, Servant, New Creation', studyQuestions: ['How does Isaiah 40 comfort?', 'What do Servant Songs reveal about Jesus?', 'How is new creation described?'], memoryVerse: 'Isaiah 40:31 - "Those who hope in the LORD will renew..."', practicalApplication: 'Wait on the Lord for strength.' }
                ]
            },
            sene: { 
                weeks: 4, 
                reading: 'Jeremiah 1-52; Lamentations 1-5', 
                theme: 'Weeping Prophet',
                weeklyBreakdown: [
                    { week: 37, focus: 'Jeremiah\'s Call', readings: 'Jeremiah 1-20', keyThemes: 'Calling, Opposition, Lament', studyQuestions: ['How was Jeremiah called?', 'Why the weeping prophet?', 'How did people respond?'], memoryVerse: 'Jeremiah 1:7-8 - "Do not say I am too young..."', practicalApplication: 'Be obedient even when difficult.' },
                    { week: 38, focus: 'Prophecies & False Prophets', readings: 'Jeremiah 21-36', keyThemes: 'True vs False, Covenant, Hope', studyQuestions: ['How distinguish true from false prophecy?', 'What was the new covenant?', 'How did Jeremiah show hope?'], memoryVerse: 'Jeremiah 29:11 - "I know the plans I have for you..."', practicalApplication: 'Trust God\'s good plans.' },
                    { week: 39, focus: 'Fall of Jerusalem', readings: 'Jeremiah 37-52; Lamentations 1-5', keyThemes: 'Destruction, Grief, Faithfulness', studyQuestions: ['How did Jerusalem fall?', 'What can we learn about grief?', 'How did God remain faithful?'], memoryVerse: 'Lamentations 3:22-23 - "Because of the LORD\'s great love..."', practicalApplication: 'Remember God\'s faithfulness each morning.' },
                    { week: 40, focus: 'Review & Reflection', readings: 'Review Jeremiah passages', keyThemes: 'God\'s Faithfulness', studyQuestions: ['What have you learned about God\'s character?', 'How does God show mercy in judgment?', 'What warnings apply today?'], memoryVerse: 'Jeremiah 31:3 - "I have loved you with an everlasting love..."', practicalApplication: 'Reflect on God\'s everlasting love.' }
                ]
            },
            hamle: { 
                weeks: 4, 
                reading: 'Ezekiel 1-48; Daniel 1-12', 
                theme: 'Exile Prophets',
                weeklyBreakdown: [
                    { week: 41, focus: 'Ezekiel: Visions', readings: 'Ezekiel 1-24', keyThemes: 'Glory, Responsibility, Hope', studyQuestions: ['What was significant about visions?', 'What does watchman mean?', 'How did Ezekiel communicate dramatically?'], memoryVerse: 'Ezekiel 36:26 - "I will give you a new heart..."', practicalApplication: 'Ask God for a soft heart.' },
                    { week: 42, focus: 'Ezekiel: Restoration', readings: 'Ezekiel 25-48', keyThemes: 'Judgment, New Temple, River of Life', studyQuestions: ['Why judge surrounding nations?', 'What was valley of dry bones vision?', 'What does new temple represent?'], memoryVerse: 'Ezekiel 37:5 - "I will make breath enter you..."', practicalApplication: 'Believe God brings life to dead areas.' },
                    { week: 43, focus: 'Daniel: Faith in Exile', readings: 'Daniel 1-6', keyThemes: 'Faithfulness, Sovereignty, Deliverance', studyQuestions: ['How did Daniel maintain faith?', 'What can we learn from fiery furnace?', 'How did God demonstrate sovereignty?'], memoryVerse: 'Daniel 3:17-18 - "The God we serve is able..."', practicalApplication: 'Be faithful regardless of consequences.' },
                    { week: 44, focus: 'Daniel: Visions', readings: 'Daniel 7-12', keyThemes: 'Prophecy, Kingdom, End Times', studyQuestions: ['What kingdoms do visions represent?', 'What is abomination that causes desolation?', 'How does Daniel point to ultimate kingdom?'], memoryVerse: 'Daniel 2:44 - "The God of heaven will set up a kingdom..."', practicalApplication: 'Live with confidence in God\'s victory.' }
                ]
            },
            nehase: { 
                weeks: 4, 
                reading: 'Minor Prophets & Gospels', 
                theme: 'Prophecy Fulfilled',
                weeklyBreakdown: [
                    { week: 45, focus: 'Minor Prophets I', readings: 'Hosea, Joel, Amos, Obadiah, Jonah, Micah', keyThemes: 'Love, Justice, Mercy, Mission', studyQuestions: ['How did Hosea\'s marriage illustrate God\'s love?', 'What does Jonah teach?', 'How did Micah summarize requirements?'], memoryVerse: 'Micah 6:8 - "To act justly and love mercy..."', practicalApplication: 'Practice justice, mercy, humility.' },
                    { week: 46, focus: 'Minor Prophets II', readings: 'Nahum, Habakkuk, Zephaniah, Haggai, Zechariah, Malachi', keyThemes: 'Trust, Restoration, Preparation', studyQuestions: ['How did Habakkuk learn to trust?', 'What messages of hope?', 'How does Malachi prepare for Messiah?'], memoryVerse: 'Habakkuk 3:17-18 - "Yet I will rejoice in the LORD..."', practicalApplication: 'Choose joy regardless of circumstances.' },
                    { week: 47, focus: 'Gospels: Birth & Ministry', readings: 'Matthew 1-12; Mark 1-6; Luke 1-8; John 1-8', keyThemes: 'Incarnation, Kingdom, Discipleship', studyQuestions: ['How do Gospels introduce Jesus?', 'What does kingdom mean?', 'How did Jesus train disciples?'], memoryVerse: 'John 1:14 - "The Word became flesh..."', practicalApplication: 'Welcome Jesus in every area.' },
                    { week: 48, focus: 'Jesus\' Ministry', readings: 'Matthew 13-28; Mark 7-16; Luke 9-24; John 9-21', keyThemes: 'Parables, Miracles, Cross, Resurrection', studyQuestions: ['What do parables teach?', 'How did Jesus demonstrate authority?', 'What does resurrection mean for us?'], memoryVerse: 'John 14:6 - "I am the way and the truth..."', practicalApplication: 'Follow Jesus as only way to Father.' }
                ]
            },
            pagume: { 
                weeks: 1, 
                reading: 'Acts & Revelation', 
                theme: 'Church & Eternity',
                weeklyBreakdown: [
                    {
                        week: 49,
                        focus: 'Church Birth & Mission',
                        readings: 'Acts 1-28; Revelation 1-22',
                        keyThemes: 'Holy Spirit, Mission, Hope, New Creation',
                        studyQuestions: [
                            'How did the Holy Spirit empower the church?',
                            'What is our mission?',
                            'What hope does Revelation give?',
                            'How should we live in light of Christ\'s return?'
                        ],
                        memoryVerse: 'Revelation 21:5 - "I am making everything new!"',
                        practicalApplication: 'Live in the power of the resurrection and hope of Christ\'s return.'
                    }
                ]
            }
        };
    }

    initializeNT90Plan() {
        this.ntIntensive = [
            { 
                days: '1-9', 
                reading: 'Matthew 1-28', 
                focus: 'Jesus as King',
                dailyBreakdown: [
                    { day: 1, reading: 'Matthew 1-4', focus: 'Birth & Preparation', chapters: 4 },
                    { day: 2, reading: 'Matthew 5-7', focus: 'Sermon on the Mount', chapters: 3 },
                    { day: 3, reading: 'Matthew 8-10', focus: 'Miracles & Mission', chapters: 3 },
                    { day: 4, reading: 'Matthew 11-13', focus: 'Parables of Kingdom', chapters: 3 },
                    { day: 5, reading: 'Matthew 14-18', focus: 'Identity & Community', chapters: 5 },
                    { day: 6, reading: 'Matthew 19-22', focus: 'Teaching & Conflict', chapters: 4 },
                    { day: 7, reading: 'Matthew 23-25', focus: 'Woes & End Times', chapters: 3 },
                    { day: 8, reading: 'Matthew 26-28', focus: 'Passion & Resurrection', chapters: 3 },
                    { day: 9, reading: 'Review Matthew', focus: 'Reflection & Application', chapters: 0 }
                ]
            },
            { 
                days: '10-15', 
                reading: 'Mark 1-16', 
                focus: 'Jesus as Servant',
                dailyBreakdown: [
                    { day: 10, reading: 'Mark 1-3', focus: 'Rapid Ministry Start', chapters: 3 },
                    { day: 11, reading: 'Mark 4-6', focus: 'Miracles & Power', chapters: 3 },
                    { day: 12, reading: 'Mark 7-9', focus: 'Teaching & Transfiguration', chapters: 3 },
                    { day: 13, reading: 'Mark 10-12', focus: 'Servant Leadership', chapters: 3 },
                    { day: 14, reading: 'Mark 13-14', focus: 'Prophecy & Betrayal', chapters: 2 },
                    { day: 15, reading: 'Mark 15-16', focus: 'Sacrifice & Victory', chapters: 2 }
                ]
            },
            { 
                days: '16-23', 
                reading: 'Luke 1-24', 
                focus: 'Jesus as Savior',
                dailyBreakdown: [
                    { day: 16, reading: 'Luke 1-3', focus: 'Birth & Genealogy', chapters: 3 },
                    { day: 17, reading: 'Luke 4-6', focus: 'Ministry Begins', chapters: 3 },
                    { day: 18, reading: 'Luke 7-9', focus: 'Miracles & Disciples', chapters: 3 },
                    { day: 19, reading: 'Luke 10-12', focus: 'Teaching & Parables', chapters: 3 },
                    { day: 20, reading: 'Luke 13-15', focus: 'Kingdom Parables', chapters: 3 },
                    { day: 21, reading: 'Luke 16-18', focus: 'Wealth & Prayer', chapters: 3 },
                    { day: 22, reading: 'Luke 19-21', focus: 'Jerusalem Entry', chapters: 3 },
                    { day: 23, reading: 'Luke 22-24', focus: 'Passion & Resurrection', chapters: 3 }
                ]
            },
            { 
                days: '24-30', 
                reading: 'John 1-21', 
                focus: 'Jesus as God',
                dailyBreakdown: [
                    { day: 24, reading: 'John 1-3', focus: 'Divine Identity', chapters: 3 },
                    { day: 25, reading: 'John 4-6', focus: 'Living Water & Bread', chapters: 3 },
                    { day: 26, reading: 'John 7-9', focus: 'Light of the World', chapters: 3 },
                    { day: 27, reading: 'John 10-12', focus: 'Good Shepherd', chapters: 3 },
                    { day: 28, reading: 'John 13-15', focus: 'Last Supper', chapters: 3 },
                    { day: 29, reading: 'John 16-18', focus: 'Holy Spirit & Arrest', chapters: 3 },
                    { day: 30, reading: 'John 19-21', focus: 'Crucifixion & Commission', chapters: 3 }
                ]
            },
            { 
                days: '31-45', 
                reading: 'Acts 1-28', 
                focus: 'Early Church',
                dailyBreakdown: [
                    { day: 31, reading: 'Acts 1-3', focus: 'Pentecost & Power', chapters: 3 },
                    { day: 32, reading: 'Acts 4-6', focus: 'Church Growth', chapters: 3 },
                    { day: 33, reading: 'Acts 7-8', focus: 'Stephen & Persecution', chapters: 2 },
                    { day: 34, reading: 'Acts 9-10', focus: 'Paul\'s Conversion', chapters: 2 },
                    { day: 35, reading: 'Acts 11-13', focus: 'Gentile Inclusion', chapters: 3 },
                    { day: 36, reading: 'Acts 14-16', focus: 'First Mission Journey', chapters: 3 },
                    { day: 37, reading: 'Acts 17-19', focus: 'Second Journey', chapters: 3 },
                    { day: 38, reading: 'Acts 20-22', focus: 'Third Journey & Arrest', chapters: 3 },
                    { day: 39, reading: 'Acts 23-25', focus: 'Trials & Defense', chapters: 3 },
                    { day: 40, reading: 'Acts 26-28', focus: 'Appeal to Caesar', chapters: 3 }
                ]
            },
            { 
                days: '46-60', 
                reading: 'Romans & Corinthians', 
                focus: 'Paul\'s Theology',
                dailyBreakdown: [
                    { day: 46, reading: 'Romans 1-3', focus: 'Sin & Righteousness', chapters: 3 },
                    { day: 47, reading: 'Romans 4-6', focus: 'Faith & Grace', chapters: 3 },
                    { day: 48, reading: 'Romans 7-8', focus: 'Spirit & Freedom', chapters: 2 },
                    { day: 49, reading: 'Romans 9-11', focus: 'Israel & Mercy', chapters: 3 },
                    { day: 50, reading: 'Romans 12-16', focus: 'Practical Living', chapters: 5 },
                    { day: 51, reading: '1 Corinthians 1-4', focus: 'Church Divisions', chapters: 4 },
                    { day: 52, reading: '1 Corinthians 5-8', focus: 'Morality & Freedom', chapters: 4 },
                    { day: 53, reading: '1 Corinthians 9-11', focus: 'Rights & Worship', chapters: 3 },
                    { day: 54, reading: '1 Corinthians 12-14', focus: 'Spiritual Gifts', chapters: 3 },
                    { day: 55, reading: '1 Corinthians 15-16', focus: 'Resurrection', chapters: 2 },
                    { day: 56, reading: '2 Corinthians 1-4', focus: 'Comfort & Ministry', chapters: 4 },
                    { day: 57, reading: '2 Corinthians 5-8', focus: 'Reconciliation & Giving', chapters: 4 },
                    { day: 58, reading: '2 Corinthians 9-13', focus: 'Generosity & Authority', chapters: 5 }
                ]
            },
            { 
                days: '61-75', 
                reading: 'Paul\'s Letters', 
                focus: 'Church Life',
                dailyBreakdown: [
                    { day: 61, reading: 'Galatians 1-3', focus: 'Grace vs Law', chapters: 3 },
                    { day: 62, reading: 'Galatians 4-6', focus: 'Freedom & Spirit', chapters: 3 },
                    { day: 63, reading: 'Ephesians 1-3', focus: 'Spiritual Blessings', chapters: 3 },
                    { day: 64, reading: 'Ephesians 4-6', focus: 'Unity & Armor', chapters: 3 },
                    { day: 65, reading: 'Philippians 1-2', focus: 'Joy & Humility', chapters: 2 },
                    { day: 66, reading: 'Philippians 3-4', focus: 'Righteousness & Peace', chapters: 2 },
                    { day: 67, reading: 'Colossians 1-2', focus: 'Supremacy of Christ', chapters: 2 },
                    { day: 68, reading: 'Colossians 3-4', focus: 'New Life', chapters: 2 },
                    { day: 69, reading: '1 Thessalonians 1-3', focus: 'Faith & Love', chapters: 3 },
                    { day: 70, reading: '1 Thessalonians 4-5', focus: 'Coming & Living', chapters: 2 },
                    { day: 71, reading: '2 Thessalonians 1-3', focus: 'End Times & Work', chapters: 3 },
                    { day: 72, reading: '1 Timothy 1-3', focus: 'Church Order', chapters: 3 },
                    { day: 73, reading: '1 Timothy 4-6', focus: 'Godliness & Contentment', chapters: 3 },
                    { day: 74, reading: '2 Timothy 1-2', focus: 'Guard the Gospel', chapters: 2 },
                    { day: 75, reading: '2 Timothy 3-4', focus: 'Scripture & Finish', chapters: 2 }
                ]
            },
            { 
                days: '76-90', 
                reading: 'General Letters & Revelation', 
                focus: 'Faith & Hope',
                dailyBreakdown: [
                    { day: 76, reading: 'Titus 1-3', focus: 'Sound Doctrine', chapters: 3 },
                    { day: 77, reading: 'Philemon', focus: 'Forgiveness', chapters: 1 },
                    { day: 78, reading: 'Hebrews 1-4', focus: 'Superiority of Christ', chapters: 4 },
                    { day: 79, reading: 'Hebrews 5-7', focus: 'Priesthood', chapters: 3 },
                    { day: 80, reading: 'Hebrews 8-10', focus: 'New Covenant', chapters: 3 },
                    { day: 81, reading: 'Hebrews 11-13', focus: 'Faith & Endurance', chapters: 3 },
                    { day: 82, reading: 'James 1-3', focus: 'Faith & Works', chapters: 3 },
                    { day: 83, reading: 'James 4-5', focus: 'Wisdom & Prayer', chapters: 2 },
                    { day: 84, reading: '1 Peter 1-3', focus: 'Living Hope', chapters: 3 },
                    { day: 85, reading: '1 Peter 4-5', focus: 'Suffering & Leadership', chapters: 2 },
                    { day: 86, reading: '2 Peter 1-3', focus: 'Knowledge & Return', chapters: 3 },
                    { day: 87, reading: '1 John 1-3', focus: 'Light & Love', chapters: 3 },
                    { day: 88, reading: '1 John 4-5', focus: 'God is Love', chapters: 2 },
                    { day: 89, reading: '2 John, 3 John, Jude', focus: 'Truth & Contend', chapters: 3 },
                    { day: 90, reading: 'Revelation 1-22', focus: 'Victory & New Creation', chapters: 22 }
                ]
            }
        ];
    }

    initializeDiscipleshipWeeks() {
        this.discipleshipWeeks = [
            { 
                week: 1, 
                topic: 'Salvation & New Life', 
                key: 'Romans 3:21-26; Ephesians 2:1-10',
                objectives: [
                    'Understand the gospel message clearly',
                    'Explain what it means to be born again',
                    'Share personal testimony effectively'
                ],
                activities: [
                    'Write out personal salvation story',
                    'Practice sharing gospel in 3 minutes',
                    'Memorize key salvation verses'
                ],
                discussionQuestions: [
                    'What did you understand about Jesus before becoming a Christian?',
                    'How has your life changed since following Christ?',
                    'What does it mean to be a new creation?'
                ],
                memoryVerse: '2 Corinthians 5:17 - "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"'
            },
            { 
                week: 2, 
                topic: 'The Word of God', 
                key: '2 Timothy 3:16-17; Hebrews 4:12',
                objectives: [
                    'Understand the Bible\'s authority and purpose',
                    'Develop a consistent Bible reading habit',
                    'Learn basic Bible study methods'
                ],
                activities: [
                    'Set up a daily Bible reading plan',
                    'Practice the SOAP method (Scripture, Observation, Application, Prayer)',
                    'Share one truth learned from Scripture'
                ],
                discussionQuestions: [
                    'Why is the Bible important for Christian growth?',
                    'How can we hear God\'s voice through Scripture?',
                    'What obstacles prevent regular Bible reading?'
                ],
                memoryVerse: '2 Timothy 3:16 - "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness."'
            },
            { 
                week: 3, 
                topic: 'Prayer & Communion with God', 
                key: 'Matthew 6:5-15; Philippians 4:6-7',
                objectives: [
                    'Understand the purpose and power of prayer',
                    'Learn different types of prayer',
                    'Develop a consistent prayer life'
                ],
                activities: [
                    'Create a prayer journal',
                    'Practice the ACTS prayer model (Adoration, Confession, Thanksgiving, Supplication)',
                    'Pray with a partner this week'
                ],
                discussionQuestions: [
                    'What hinders you from praying regularly?',
                    'How has God answered your prayers in the past?',
                    'What does it mean to pray "in Jesus\' name"?'
                ],
                memoryVerse: 'Philippians 4:6-7 - "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."'
            },
            { 
                week: 4, 
                topic: 'The Holy Spirit', 
                key: 'John 14:15-26; Galatians 5:16-25',
                objectives: [
                    'Understand the Holy Spirit\'s role in the Trinity',
                    'Learn about the gifts of the Spirit',
                    'Understand how to be filled with the Spirit'
                ],
                activities: [
                    'Identify spiritual gifts in yourself and others',
                    'Practice listening to the Holy Spirit\'s guidance',
                    'Memorize the fruit of the Spirit'
                ],
                discussionQuestions: [
                    'How have you experienced the Holy Spirit\'s work in your life?',
                    'What is the difference between gifts and fruit of the Spirit?',
                    'How can we cooperate with the Holy Spirit\'s work?'
                ],
                memoryVerse: 'Galatians 5:22-23 - "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control."'
            },
            { 
                week: 5, 
                topic: 'The Church & Community', 
                key: 'Acts 2:42-47; 1 Corinthians 12:12-27',
                objectives: [
                    'Understand the biblical purpose of the church',
                    'Learn about spiritual gifts in community',
                    'Develop commitment to local church body'
                ],
                activities: [
                    'Identify your role in the church body',
                    'Serve in a ministry area this week',
                    'Build relationship with another believer'
                ],
                discussionQuestions: [
                    'What does it mean to be the "body of Christ"?',
                    'How can we maintain unity in the church?',
                    'What is your responsibility to other believers?'
                ],
                memoryVerse: 'Hebrews 10:24-25 - "And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together."'
            },
            { 
                week: 6, 
                topic: 'Spiritual Warfare', 
                key: 'Ephesians 6:10-18; James 4:7-8',
                objectives: [
                    'Understand the reality of spiritual battle',
                    'Learn to use the armor of God',
                    'Develop strategies for spiritual victory'
                ],
                activities: [
                    'Memorize the armor of God',
                    'Identify areas of spiritual attack in your life',
                    'Practice spiritual warfare prayers'
                ],
                discussionQuestions: [
                    'How do we recognize spiritual attacks?',
                    'What is our authority in Christ over evil forces?',
                    'How can we stand firm in spiritual battles?'
                ],
                memoryVerse: 'Ephesians 6:11 - "Put on the full armor of God, so that you can take your stand against the devil\'s schemes."'
            },
            { 
                week: 7, 
                topic: 'Evangelism & Witnessing', 
                key: 'Matthew 28:18-20; 1 Peter 3:15-16',
                objectives: [
                    'Overcome fear of sharing faith',
                    'Learn simple evangelism methods',
                    'Develop a heart for the lost'
                ],
                activities: [
                    'Share your testimony with someone',
                    'Pray for 3 non-believers by name',
                    'Practice answering common questions about faith'
                ],
                discussionQuestions: [
                    'What fears prevent us from sharing our faith?',
                    'How can we build relationships with non-believers?',
                    'What is the role of the Holy Spirit in evangelism?'
                ],
                memoryVerse: '1 Peter 3:15 - "But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have."'
            },
            { 
                week: 8, 
                topic: 'Stewardship & Generosity', 
                key: '2 Corinthians 9:6-15; 1 Timothy 6:17-19',
                objectives: [
                    'Understand biblical view of money and possessions',
                    'Learn principles of generous giving',
                    'Develop habits of good stewardship'
                ],
                activities: [
                    'Create a simple budget',
                    'Give generously to God\'s work this week',
                    'Evaluate your use of time, talents, and treasure'
                ],
                discussionQuestions: [
                    'What does it mean that God owns everything?',
                    'How can we develop contentment?',
                    'What is the relationship between faith and finances?'
                ],
                memoryVerse: '2 Corinthians 9:7 - "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."'
            },
            { 
                week: 9, 
                topic: 'God\'s Will & Decision Making', 
                key: 'Romans 12:1-2; Proverbs 3:5-6',
                objectives: [
                    'Understand how to discern God\'s will',
                    'Learn biblical decision-making principles',
                    'Trust God with uncertain outcomes'
                ],
                activities: [
                    'Make a decision using biblical principles this week',
                    'Practice listening for God\'s guidance',
                    'Surrender an area of your life to God\'s will'
                ],
                discussionQuestions: [
                    'How do we know if a decision honors God?',
                    'What role does peace play in decision making?',
                    'How do we handle decisions when God seems silent?'
                ],
                memoryVerse: 'Proverbs 3:5-6 - "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."'
            },
            { 
                week: 10, 
                topic: 'Relationships & Marriage', 
                key: 'Ephesians 5:21-33; 1 Corinthians 13:4-7',
                objectives: [
                    'Understand biblical principles for relationships',
                    'Learn godly conflict resolution',
                    'Develop healthy relationship patterns'
                ],
                activities: [
                    'Practice forgiveness in a relationship',
                    'Express appreciation to important people in your life',
                    'Memorize 1 Corinthians 13'
                ],
                discussionQuestions: [
                    'What makes relationships God-honoring?',
                    'How do we set healthy boundaries?',
                    'What is biblical love versus worldly love?'
                ],
                memoryVerse: 'Ephesians 4:32 - "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you."'
            },
            { 
                week: 11, 
                topic: 'Parenting & Family', 
                key: 'Deuteronomy 6:4-9; Proverbs 22:6',
                objectives: [
                    'Understand biblical parenting principles',
                    'Learn to create a godly home environment',
                    'Develop family worship habits'
                ],
                activities: [
                    'Start or enhance family devotions',
                    'Pray specifically for each family member',
                    'Create a family mission statement'
                ],
                discussionQuestions: [
                    'How can we spiritually lead our families?',
                    'What does it mean to train up a child?',
                    'How do we balance grace and discipline?'
                ],
                memoryVerse: 'Joshua 24:15 - "But as for me and my household, we will serve the LORD."'
            },
            { 
                week: 12, 
                topic: 'Work & Vocation', 
                key: 'Colossians 3:23-24; Ephesians 6:5-9',
                objectives: [
                    'Understand biblical view of work',
                    'Learn to be a Christian witness in workplace',
                    'Develop excellence in work as worship'
                ],
                activities: [
                    'Pray for colleagues and workplace',
                    'Look for opportunities to serve at work',
                    'Evaluate your work ethic from biblical perspective'
                ],
                discussionQuestions: [
                    'How can we honor God in our daily work?',
                    'What does it mean to work "as for the Lord"?',
                    'How do we handle workplace conflicts biblically?'
                ],
                memoryVerse: 'Colossians 3:23-24 - "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."'
            },
            { 
                week: 13, 
                topic: 'Suffering & Trials', 
                key: 'James 1:2-4; Romans 5:3-5',
                objectives: [
                    'Understand God\'s purpose in suffering',
                    'Learn to trust God in difficult times',
                    'Develop perseverance and character'
                ],
                activities: [
                    'Journal about a current trial and what God might be teaching',
                    'Memorize comforting Scriptures',
                    'Encourage someone else who is suffering'
                ],
                discussionQuestions: [
                    'Why does God allow suffering?',
                    'How can trials produce spiritual growth?',
                    'What comfort can we offer others in pain?'
                ],
                memoryVerse: 'Romans 8:28 - "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."'
            },
            { 
                week: 14, 
                topic: 'Forgiveness & Reconciliation', 
                key: 'Matthew 18:21-35; Colossians 3:12-14',
                objectives: [
                    'Understand biblical command to forgive',
                    'Learn steps to reconciliation',
                    'Overcome barriers to forgiveness'
                ],
                activities: [
                    'Forgive someone who has hurt you',
                    'Seek forgiveness if needed',
                    'Write a letter of forgiveness (even if not sent)'
                ],
                discussionQuestions: [
                    'What is the difference between forgiveness and reconciliation?',
                    'How do we forgive when it\'s difficult?',
                    'What if the other person doesn\'t apologize?'
                ],
                memoryVerse: 'Colossians 3:13 - "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you."'
            },
            { 
                week: 15, 
                topic: 'Wisdom & Discernment', 
                key: 'Proverbs 2:1-11; James 1:5-8',
                objectives: [
                    'Understand difference between knowledge and wisdom',
                    'Learn to make wise decisions',
                    'Develop discernment in complex situations'
                ],
                activities: [
                    'Seek wisdom for a specific decision',
                    'Study Proverbs for practical wisdom',
                    'Ask a wise person for counsel'
                ],
                discussionQuestions: [
                    'How do we acquire wisdom according to Scripture?',
                    'What is the role of the Holy Spirit in discernment?',
                    'How can we avoid foolish decisions?'
                ],
                memoryVerse: 'James 1:5 - "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you."'
            },
            { 
                week: 16, 
                topic: 'Eternal Perspective', 
                key: 'Matthew 6:19-21; 2 Corinthians 4:16-18',
                objectives: [
                    'Develop heavenly mindset',
                    'Understand biblical teaching on eternity',
                    'Live with purpose and eternal impact'
                ],
                activities: [
                    'Evaluate your priorities from eternal perspective',
                    'Share the gospel with someone this week',
                    'Write a personal mission statement'
                ],
                discussionQuestions: [
                    'How does eternal perspective change how we live today?',
                    'What does it mean to store up treasures in heaven?',
                    'How can we keep from being consumed by temporary things?'
                ],
                memoryVerse: 'Matthew 6:33 - "But seek first his kingdom and his righteousness, and all these things will be given to you as well."'
            }
        ];
    }

    // ===================================
    // INITIALIZATION
    // ===================================
    async init() {
        try {
            console.log('🚀 Initializing Ethiopian Bible Planner...');
            
            this.ui.showLoading();
            
            await this.loadState();
            console.log('✓ State loaded');
            
            this.initializeLucideIcons();
            console.log('✓ Icons initialized');
            
            this.setupMobileMenu();
            console.log('✓ Mobile menu setup');
            
            await this.renderInitialView();
            console.log('✓ Initial view rendered');
            
            this.setupEventListeners();
            console.log('✓ Event listeners setup');
            
            this.setupKeyboardShortcuts();
            console.log('✓ Keyboard shortcuts setup');
            
            this.setupTouchGestures();
            console.log('✓ Touch gestures setup');
            
            this.updateProgress();
            console.log('✓ Progress updated');
            
            this.ui.hideLoading();
            console.log('✅ Initialization complete!');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.ui.showErrorMessage('Failed to initialize app. Please refresh the page.');
            this.ui.hideLoading();
            throw error;
        }
    }

    async loadState() {
        try {
            const savedState = await this.storage.get('bible-planner-state', null);
            if (savedState) {
                this.state = { ...this.state, ...savedState };
                console.log('State loaded from storage');
            } else {
                console.log('No saved state found, using defaults');
            }
        } catch (error) {
            console.warn('Could not load saved state, using defaults:', error);
        }
    }

    async renderInitialView() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.renderMonthSelector();
                this.renderMonthDetails();
                this.renderChronologicalPlan();
                this.renderNT90Plan();
                this.renderDiscipleship();
            });
        } else {
            setTimeout(() => {
                this.renderMonthSelector();
                this.renderMonthDetails();
                this.renderChronologicalPlan();
                this.renderNT90Plan();
                this.renderDiscipleship();
            }, 0);
        }
    }

    // ===================================
    // STATE MANAGEMENT
    // ===================================
    async setState(newState) {
        this.state = { ...this.state, ...newState };
        await this.saveStateDebounced();
        this.updateUI();
    }

    async saveStateDebounced() {
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }
        
        this.saveDebounceTimer = setTimeout(async () => {
            try {
                const success = await this.storage.set('bible-planner-state', this.state);
                if (!success) {
                    this.ui.showErrorMessage('Failed to save progress');
                }
            } catch (error) {
                console.error('Save failed:', error);
            }
        }, 500);
    }

    // ===================================
    // UI UPDATE & RENDERING
    // ===================================
    updateUI() {
        this.updateTabView();
        this.updateMonthButtons();
        this.updatePlanButtons();
        this.renderMonthDetails();
        this.updateProgress();
        
        if (this.state.activeTab === 'reading') {
            if (this.state.selectedPlan === 'chronological') {
                this.renderChronologicalPlan();
            } else {
                this.renderNT90Plan();
            }
        } else if (this.state.activeTab === 'discipleship') {
            this.renderDiscipleship();
        }
    }

    updateTabView() {
        const calendarView = document.getElementById('calendar-view');
        const readingView = document.getElementById('reading-view');
        const discipleshipView = document.getElementById('discipleship-view');

        if (calendarView) calendarView.classList.toggle('hidden', this.state.activeTab !== 'calendar');
        if (readingView) readingView.classList.toggle('hidden', this.state.activeTab !== 'reading');
        if (discipleshipView) discipleshipView.classList.toggle('hidden', this.state.activeTab !== 'discipleship');

        document.querySelectorAll('.tab-button').forEach(button => {
            const isActive = button.dataset.tab === this.state.activeTab;
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('shadow-md', isActive);
            button.classList.toggle('scale-105', isActive);
            button.classList.toggle('text-gray-600', !isActive);
            button.classList.toggle('hover:bg-gray-50', !isActive);
            
            if (isActive) {
                button.style.backgroundColor = this.getTabColor(button.dataset.tab);
            } else {
                button.style.backgroundColor = '';
            }
        });
    }

    getTabColor(tabId) {
        const colors = {
            calendar: this.brandColors.primary,
            reading: this.brandColors.secondary,
            discipleship: this.brandColors.accent
        };
        return colors[tabId] || this.brandColors.primary;
    }

    updateMonthButtons() {
        document.querySelectorAll('.month-card, .month-button').forEach(button => {
            const isActive = button.dataset.month === this.state.selectedMonth;
            button.classList.toggle('active', isActive);
            
            if (isActive) {
                button.style.backgroundColor = '';
                button.style.color = '';
            }
        });
    }

    updatePlanButtons() {
        document.querySelectorAll('.plan-button').forEach(button => {
            const isActive = button.dataset.plan === this.state.selectedPlan;
            button.classList.toggle('active', isActive);
        });

        const chronoPlan = document.getElementById('chronological-plan');
        const nt90Plan = document.getElementById('nt90-plan');
        
        if (chronoPlan) chronoPlan.classList.toggle('hidden', this.state.selectedPlan !== 'chronological');
        if (nt90Plan) nt90Plan.classList.toggle('hidden', this.state.selectedPlan !== 'nt90');
    }

    // ===================================
    // PROGRESS TRACKING
    // ===================================
    updateProgress() {
        const totalWeeks = this.getTotalReadings();
        const insights = this.analytics.getProgressInsights(this.state.completedReadings, totalWeeks);

        const progressText = document.getElementById('progress-text');
        const progressCount = document.getElementById('progress-count');
        const progressBar = document.getElementById('progress-bar');

        if (progressText) progressText.textContent = `Progress: ${insights.percentComplete}%`;
        if (progressCount) progressCount.textContent = `${insights.readingsCompleted} / ${totalWeeks} weeks`;
        if (progressBar) {
            progressBar.style.width = `${insights.percentComplete}%`;
            progressBar.style.backgroundColor = this.brandColors.success;
        }
    }

    async toggleReading(readingId) {
        const newCompletedReadings = { ...this.state.completedReadings };
        newCompletedReadings[readingId] = !newCompletedReadings[readingId];
        
        try {
            await this.setState({ completedReadings: newCompletedReadings });
            
            if (newCompletedReadings[readingId]) {
                this.ui.showSuccessMessage('✓ Progress saved!');
                this.celebrateCompletion();
            }
            
            this.updateProgress();
        } catch (error) {
            this.ui.showErrorMessage('Failed to save progress. Please try again.');
        }
    }

    celebrateCompletion() {
        const streak = this.analytics.calculateStreak(this.state.completedReadings);
        if (streak > 0 && streak % 7 === 0) {
            this.ui.showSuccessMessage(`🎉 ${streak} day streak! Keep it up!`);
        }
    }

    getTotalReadings() {
        return Object.values(this.chronologicalPlan).reduce((sum, plan) => sum + plan.weeks, 0);
    }

    // ===================================
    // EXPORT/IMPORT FUNCTIONALITY
    // ===================================
    generateChecksum(data) {
        return btoa(JSON.stringify(data)).slice(0, 32);
    }

    async exportProgress() {
        try {
            const data = {
                completedReadings: this.state.completedReadings,
                selectedMonth: this.state.selectedMonth,
                selectedPlan: this.state.selectedPlan,
                expandedWeeks: this.state.expandedWeeks,
                timestamp: new Date().toISOString(),
                version: '3.0',
                checksum: this.generateChecksum(this.state.completedReadings)
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bible-progress-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.ui.showSuccessMessage('Progress exported successfully!');
        } catch (error) {
            this.ui.showErrorMessage('Export failed. Please try again.');
        }
    }

    async importProgress(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!this.validateImportData(data)) {
                throw new Error('Invalid file format');
            }
            
            if (data.checksum !== this.generateChecksum(data.completedReadings)) {
                if (!confirm('File may be corrupted. Import anyway?')) {
                    return;
                }
            }
            
            await this.setState({
                completedReadings: data.completedReadings || {},
                selectedMonth: data.selectedMonth || 'meskerem',
                selectedPlan: data.selectedPlan || 'chronological',
                expandedWeeks: data.expandedWeeks || {}
            });
            
            this.ui.showSuccessMessage('Progress imported successfully!');
        } catch (error) {
            this.ui.showErrorMessage('Import failed. Please check the file.');
        }
    }

    validateImportData(data) {
        return (
            data &&
            typeof data === 'object' &&
            data.version &&
            data.completedReadings &&
            typeof data.completedReadings === 'object'
        );
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    setupEventListeners() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.setState({ activeTab: button.dataset.tab });
            });
        });

        document.addEventListener('click', (e) => {
            const monthCard = e.target.closest('.month-card, .month-button');
            if (monthCard) {
                this.setState({ selectedMonth: monthCard.dataset.month });
            }
        });

        document.addEventListener('click', (e) => {
            const planButton = e.target.closest('.plan-button');
            if (planButton) {
                this.setState({ selectedPlan: planButton.dataset.plan });
            }
        });

        const statsToggle = document.getElementById('stats-toggle');
        if (statsToggle) {
            statsToggle.addEventListener('click', () => {
                this.setState({ showStats: !this.state.showStats });
                const container = document.getElementById('stats-container');
                if (container) {
                    container.classList.toggle('hidden', !this.state.showStats);
                }
            });
        }

        document.addEventListener('click', (e) => {
            const weekToggle = e.target.closest('.week-toggle');
            if (weekToggle) {
                e.stopPropagation();
                const weekId = weekToggle.dataset.week;
                const newExpandedWeeks = { ...this.state.expandedWeeks };
                newExpandedWeeks[weekId] = !newExpandedWeeks[weekId];
                this.setState({ expandedWeeks: newExpandedWeeks });
            }
        });

        document.addEventListener('click', (e) => {
            const completeToggle = e.target.closest('.complete-toggle');
            if (completeToggle) {
                e.stopPropagation();
                const readingId = completeToggle.dataset.reading;
                this.toggleReading(readingId);
            }
        });

        document.addEventListener('click', (e) => {
            const row = e.target.closest('tr.interactive');
            if (row && !e.target.closest('.complete-toggle')) {
                const weekId = row.dataset.week;
                const details = document.querySelectorAll(`tr[data-parent="${weekId}"]`);
                details.forEach(detail => detail.classList.toggle('hidden'));
                
                const newExpandedWeeks = { ...this.state.expandedWeeks };
                newExpandedWeeks[weekId] = !newExpandedWeeks[weekId];
                this.setState({ expandedWeeks: newExpandedWeeks });
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.initializeLucideIcons();
            }, 250);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input, textarea')) return;
            
            switch(e.key) {
                case '1':
                    this.setState({ activeTab: 'calendar' });
                    break;
                case '2':
                    this.setState({ activeTab: 'reading' });
                    break;
                case '3':
                    this.setState({ activeTab: 'discipleship' });
                    break;
                case 'Escape':
                    const hamburger = document.querySelector('.hamburger');
                    const navMenu = document.querySelector('.nav-menu');
                    if (hamburger && navMenu && navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                    }
                    break;
            }
        });
    }

    setupTouchGestures() {
        const plannerApp = document.getElementById('bible-planner-app');
        if (!plannerApp) return;
        
        plannerApp.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        plannerApp.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) < swipeThreshold) return;
        
        const tabs = ['calendar', 'reading', 'discipleship'];
        const currentIndex = tabs.indexOf(this.state.activeTab);
        
        if (diff > 0 && currentIndex < tabs.length - 1) {
            this.setState({ activeTab: tabs[currentIndex + 1] });
        } else if (diff < 0 && currentIndex > 0) {
            this.setState({ activeTab: tabs[currentIndex - 1] });
        }
    }

    // ===================================
    // MOBILE MENU
    // ===================================
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                const isActive = hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isActive);
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                });
            });

            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    // ===================================
    // LUCIDE ICONS
    // ===================================
    initializeLucideIcons() {
        if (typeof lucide === 'undefined') {
            console.warn('Lucide icons library not loaded');
            return;
        }
        
        requestAnimationFrame(() => {
            try {
                lucide.createIcons();
            } catch (error) {
                console.warn('Icon creation failed:', error);
            }
        });
    }

    // ===================================
    // RENDER METHODS
    // ===================================
    renderMonthSelector() {
        const container = document.getElementById('month-selector');
        if (!container) return;
        
        container.innerHTML = this.ethiopianMonths.map(month => `
            <button data-month="${month.id}" class="month-card ${
                this.state.selectedMonth === month.id ? 'active' : ''
            }">
                <h3 class="card-title">${month.name.split(' ')[0]}</h3>
                <p>${month.days} days • ${month.season}</p>
            </button>
        `).join('');
        
        this.initializeLucideIcons();
    }

    renderMonthDetails() {
        const container = document.getElementById('month-details');
        if (!container) return;
        
        const monthData = this.ethiopianMonths.find(m => m.id === this.state.selectedMonth);
        if (!monthData) return;
        
        const monthHolyDays = this.holyDays.filter(h => h.month === this.state.selectedMonth);
        const monthMinistryEvents = this.ministryEvents.filter(e => e.month === this.state.selectedMonth);

        container.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 class="responsive-subheading font-bold mb-1 text-primary">${monthData.name}</h3>
                    <p class="text-gray-600">${monthData.season} Season</p>
                </div>
                <div class="text-left md:text-right bg-gray-50 px-4 py-3 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Gregorian Equivalent</div>
                    <div class="font-semibold text-gray-700">${monthData.gregorian}</div>
                </div>
            </div>

            ${monthHolyDays.length > 0 ? `
                <div class="mb-6">
                    <h4 class="font-semibold mb-4 flex items-center gap-2 text-lg text-primary">
                        <i data-lucide="sun" class="w-6 h-6" style="color: ${this.brandColors.secondary}"></i>
                        Holy Days & Festivals
                    </h4>
                    <div class="space-y-3">
                        ${monthHolyDays.map(day => `
                            <div class="theme-section hover-lift">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                        <div class="font-bold text-lg mb-1 text-primary">${day.name}</div>
                                        <p class="text-sm text-gray-600 mb-2">${day.description}</p>
                                        <div class="text-sm text-gray-500">Day ${day.day} • ${day.date}</div>
                                    </div>
                                    <i data-lucide="sun" class="w-8 h-8 flex-shrink-0 opacity-30" style="color: ${this.brandColors.secondary}"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${monthMinistryEvents.length > 0 ? `
                <div>
                    <h4 class="font-semibold mb-4 flex items-center gap-2 text-lg text-primary">
                        <i data-lucide="map-pin" class="w-6 h-6" style="color: ${this.brandColors.accent}"></i>
                        Ministry Events
                    </h4>
                    <div class="space-y-3">
                        ${monthMinistryEvents.map(event => `
                            <div class="theme-section hover-lift" style="border-left-color: ${this.brandColors.accent}">
                                <div class="flex items-start justify-between gap-4">
                                    <div class="flex-1">
                                        <div class="font-bold text-lg mb-1 text-primary">${event.name}</div>
                                        <p class="text-sm text-gray-600 mb-2">${event.description}</p>
                                        <div class="flex items-center gap-3 flex-wrap">
                                            <span class="text-sm text-gray-500">Day ${event.day} • ${event.date}</span>
                                            <span class="badge badge-secondary">${event.type}</span>
                                        </div>
                                    </div>
                                    <i data-lucide="map-pin" class="w-8 h-8 flex-shrink-0 opacity-30" style="color: ${this.brandColors.accent}"></i>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${monthHolyDays.length === 0 && monthMinistryEvents.length === 0 ? `
                <div class="empty-state">
                    <i data-lucide="calendar" class="empty-state-icon"></i>
                    <p class="text-lg">No special events scheduled for this month</p>
                    <p class="text-sm mt-1">Enjoy regular study and worship</p>
                </div>
            ` : ''}
        `;

        this.initializeLucideIcons();
    }

    renderChronologicalPlan() {
        const container = document.getElementById('chronological-plan');
        if (!container) return;
        
        this.ui.showLoading(container);
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.renderChronologicalPlanContent(container));
        } else {
            setTimeout(() => this.renderChronologicalPlanContent(container), 0);
        }
    }

    renderChronologicalPlanContent(container) {
        container.innerHTML = `
            <div class="section-header">
                <h3 class="responsive-subheading font-bold flex items-center gap-2">
                    <i data-lucide="book-open" class="w-6 h-6"></i>
                    One-Year Chronological Plan
                </h3>
                <p class="text-gray-600 mt-2">Read through the entire Bible in Ethiopian calendar year order</p>
            </div>
            
            <div class="reading-grid">
                ${Object.entries(this.chronologicalPlan).map(([monthId, plan]) => {
                    const month = this.ethiopianMonths.find(m => m.id === monthId);
                    if (!month) return '';
                    
                    return `
                        <div class="plan-section fade-in">
                            <div class="p-5 rounded-xl mb-4 text-white shadow-lg header-gradient">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div>
                                        <h4 class="font-bold text-xl mb-1">${month.name.split(' ')[0]}</h4>
                                        <p class="opacity-90">${plan.reading}</p>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <span class="bg-white px-4 py-2 rounded-full text-sm font-medium" style="color: ${this.brandColors.primary}">${plan.weeks} weeks</span>
                                        <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">${plan.theme}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-3">
                                ${plan.weeklyBreakdown.map(week => this.renderWeekCard(week, monthId)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.initializeLucideIcons();
    }

    renderWeekCard(week, monthId) {
        const weekId = `chrono-${monthId}-${week.week}`;
        const isCompleted = this.state.completedReadings[weekId];
        const isExpanded = this.state.expandedWeeks[weekId];
        
        return `
            <div class="card border-2 rounded-xl overflow-hidden hover-lift">
                <button data-week="${weekId}" class="week-toggle w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors touch-target" style="background-color: ${isCompleted ? this.brandColors.light : this.brandColors.warm}">
                    <div class="flex items-center gap-4 flex-1">
                        <button data-reading="${weekId}" class="complete-toggle flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
                        }" style="${isCompleted ? `background-color: ${this.brandColors.success}` : ''}">
                            ${isCompleted ? '<i data-lucide="check" class="w-5 h-5 text-white"></i>' : ''}
                        </button>
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-1 flex-wrap">
                                <span class="font-bold text-lg text-primary">Week ${week.week}: ${week.focus}</span>
                                ${isCompleted ? `<span class="badge badge-success">Completed</span>` : ''}
                            </div>
                            <div class="text-sm text-gray-600">${week.readings}</div>
                        </div>
                    </div>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-6 h-6 flex-shrink-0 text-primary"></i>
                </button>
                
                ${isExpanded ? this.renderWeekDetails(week) : ''}
            </div>
        `;
    }

    renderWeekDetails(week) {
        return `
            <div class="p-6 border-t-2" style="background-color: ${this.brandColors.light}">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="target" class="w-5 h-5"></i>
                                Key Themes
                            </h5>
                            <p class="text-sm text-gray-700 bg-white p-4 rounded-lg border">${week.keyThemes}</p>
                        </div>
                        
                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="bookmark" class="w-5 h-5"></i>
                                Memory Verse
                            </h5>
                            <div class="study-questions bg-blue-50 border-blue-200 text-blue-900">
                                <p class="font-bold mb-2">${week.memoryVerse.split(' - ')[0]}</p>
                                <p class="italic">"${week.memoryVerse.split(' - ')[1]}"</p>
                            </div>
                        </div>

                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="lightbulb" class="w-5 h-5"></i>
                                Practical Application
                            </h5>
                            <div class="study-questions">
                                <p class="text-sm text-gray-700">${week.practicalApplication}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="theme-section">
                        <h5 class="font-semibold mb-3 text-lg text-primary">Study Questions</h5>
                        <div class="space-y-3">
                            ${week.studyQuestions.map((question, idx) => `
                                <div class="flex items-start p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
                                    <span class="mr-3 mt-0.5 flex-shrink-0 font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm" style="background-color: ${this.brandColors.secondary}; color: white">${idx + 1}</span>
                                    <p class="text-sm text-gray-700">${question}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNT90Plan() {
        const container = document.getElementById('nt90-plan');
        if (!container) return;
        
        container.innerHTML = `
            <div class="section-header">
                <h3 class="responsive-subheading font-bold flex items-center gap-2">
                    <i data-lucide="target" class="w-6 h-6"></i>
                    90-Day New Testament Intensive
                </h3>
                <p class="text-gray-600 mt-2">Complete the New Testament in 3 months • 3 chapters per day</p>
            </div>
            
            <div class="table-container">
                <table class="responsive-table">
                    <thead>
                        <tr>
                            <th>Days</th>
                            <th>Reading</th>
                            <th>Focus</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.ntIntensive.map((section, idx) => this.renderNTSection(section, idx)).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.initializeLucideIcons();
    }

    renderNTSection(section, idx) {
        const sectionId = `nt90-${idx}`;
        const isCompleted = this.state.completedReadings[sectionId];
        const isExpanded = this.state.expandedWeeks[sectionId];
        
        return `
            <tr class="interactive" data-week="${sectionId}">
                <td class="font-semibold text-primary">${section.days}</td>
                <td>${section.reading}</td>
                <td>${section.focus}</td>
                <td>
                    <button data-reading="${sectionId}" class="complete-toggle flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
                    }" style="${isCompleted ? `background-color: ${this.brandColors.success}` : ''}">
                        ${isCompleted ? '<i data-lucide="check" class="w-5 h-5 text-white"></i>' : ''}
                    </button>
                </td>
            </tr>
            ${section.dailyBreakdown ? section.dailyBreakdown.map(day => this.renderNTDay(day, sectionId, isExpanded)).join('') : ''}
        `;
    }

    renderNTDay(day, sectionId, isExpanded) {
        const dayId = `${sectionId}-day-${day.day}`;
        const isDayCompleted = this.state.completedReadings[dayId];
        
        return `
            <tr class="week-details ${isExpanded ? '' : 'hidden'}" data-parent="${sectionId}">
                <td class="pl-8 text-sm">Day ${day.day}</td>
                <td class="text-sm">${day.reading}</td>
                <td class="text-sm">${day.focus}</td>
                <td>
                    <button data-reading="${dayId}" class="complete-toggle flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDayCompleted ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
                    }" style="${isDayCompleted ? `background-color: ${this.brandColors.success}` : ''}">
                        ${isDayCompleted ? '<i data-lucide="check" class="w-4 h-4 text-white"></i>' : ''}
                    </button>
                </td>
            </tr>
        `;
    }

    renderDiscipleship() {
        const container = document.getElementById('discipleship-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="section-header">
                <h3 class="responsive-subheading font-bold flex items-center gap-2">
                    <i data-lucide="users" class="w-6 h-6"></i>
                    16-Week Discipleship Program
                </h3>
                <p class="text-gray-600 mt-2">Comprehensive discipleship training for spiritual growth</p>
            </div>
            
            <div class="card-grid mt-6">
                ${this.discipleshipWeeks.map(week => this.renderDiscipleshipWeek(week)).join('')}
            </div>
        `;

        this.initializeLucideIcons();
    }

    renderDiscipleshipWeek(week) {
        const weekId = `disc-${week.week}`;
        const isCompleted = this.state.completedReadings[weekId];
        const isExpanded = this.state.expandedWeeks[weekId];
        
        return `
            <div class="card border-2 rounded-xl overflow-hidden hover-lift">
                <button data-week="${weekId}" class="week-toggle w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors touch-target" style="background-color: ${isCompleted ? '#f0fdf4' : this.brandColors.warm}">
                    <div class="flex items-center gap-4 flex-1">
                        <button data-reading="${weekId}" class="complete-toggle flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted ? 'border-transparent' : 'border-gray-300 hover:border-gray-400'
                        }" style="${isCompleted ? `background-color: ${this.brandColors.success}` : ''}">
                            ${isCompleted ? '<i data-lucide="check" class="w-5 h-5 text-white"></i>' : ''}
                        </button>
                        <div class="flex-1">
                            <div class="flex flex-wrap items-center gap-3 mb-2">
                                <span class="badge font-bold text-white text-sm shadow-md" style="background-color: ${this.brandColors.accent}">Week ${week.week}</span>
                                <span class="font-bold text-xl text-primary">${week.topic}</span>
                            </div>
                            <div class="text-sm text-gray-600">Key Passages: ${week.key}</div>
                        </div>
                    </div>
                    <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-6 h-6 flex-shrink-0 text-primary"></i>
                </button>
                
                ${isExpanded ? this.renderDiscipleshipDetails(week) : ''}
            </div>
        `;
    }

    renderDiscipleshipDetails(week) {
        return `
            <div class="p-6 border-t-2" style="background-color: ${this.brandColors.light}">
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="target" class="w-5 h-5"></i>
                                Learning Objectives
                            </h5>
                            <div class="space-y-2">
                                ${week.objectives.map(objective => `
                                    <div class="flex items-start p-3 bg-white rounded-lg border">
                                        <span class="mr-3 mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: ${this.brandColors.secondary}; color: white">✓</span>
                                        <p class="text-sm text-gray-700">${objective}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="bookmark" class="w-5 h-5"></i>
                                Memory Verse
                            </h5>
                            <div class="study-questions bg-blue-50 border-blue-200 text-blue-900">
                                <p class="font-bold mb-2">${week.memoryVerse.split(' - ')[0]}</p>
                                <p class="italic">"${week.memoryVerse.split(' - ')[1]}"</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 flex items-center gap-2 text-lg text-primary">
                                <i data-lucide="clipboard-list" class="w-5 h-5"></i>
                                Practical Activities
                            </h5>
                            <div class="space-y-2">
                                ${week.activities.map(activity => `
                                    <div class="flex items-start p-3 bg-white rounded-lg border">
                                        <span class="mr-3 mt-1 flex-shrink-0 w-2 h-2 rounded-full" style="background-color: ${this.brandColors.accent}"></span>
                                        <p class="text-sm text-gray-700">${activity}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="theme-section">
                            <h5 class="font-semibold mb-3 text-lg text-primary">Discussion Questions</h5>
                            <div class="space-y-3">
                                ${week.discussionQuestions.map((question, idx) => `
                                    <div class="flex items-start p-3 bg-white rounded-lg border-2 border-gray-200">
                                        <span class="mr-3 mt-0.5 flex-shrink-0 font-bold w-7 h-7 rounded-full flex items-center justify-center text-sm" style="background-color: ${this.brandColors.primary}; color: white">Q${idx + 1}</span>
                                        <p class="text-sm text-gray-700">${question}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===================================
    // PROGRESS REPORTING
    // ===================================
    generateProgressReport() {
        const completed = Object.values(this.state.completedReadings).filter(Boolean).length;
        const total = this.getTotalReadings();
        const percentage = (completed / total) * 100;
        
        return {
            completed,
            total,
            percentage: percentage.toFixed(1),
            streak: this.analytics.calculateStreak(this.state.completedReadings),
            weeklyAverage: this.calculateWeeklyAverage(),
            strongestMonth: this.analytics.getMostActiveMonth(this.state.completedReadings)
        };
    }

    calculateWeeklyAverage() {
        const completed = Object.values(this.state.completedReadings).filter(Boolean).length;
        return (completed / 4).toFixed(1);
    }

    async shareProgress() {
        const report = this.generateProgressReport();
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Bible Reading Progress',
                    text: `I've completed ${report.percentage}% of my Bible reading plan! 📖 ${report.streak} day streak!`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        }
    }

    // ===================================
    // CLEANUP & DESTRUCTION
    // ===================================
    destroy() {
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
            this.saveDebounceTimer = null;
        }
        
        this.ui.destroy();
        
        this.storage = null;
        this.state = null;
        this.chronologicalPlan = null;
        this.ntIntensive = null;
        this.discipleshipWeeks = null;
        
        console.log('Bible Planner cleaned up');
    }
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    const app = document.getElementById('bible-planner-app');
    if (!app) {
        console.error('Bible planner app element not found!');
        return;
    }

    try {
        const errorBoundary = new ErrorBoundary(app);
        console.log('✓ Error boundary setup');
        
        window.biblePlanner = new EthiopianBiblePlanner();
        console.log('✓ Bible planner instance created');
        
        window.biblePlanner.init().catch(error => {
            console.error('Initialization failed:', error);
            errorBoundary.handleError(error);
        });
        
        window.addEventListener('beforeunload', () => {
            if (window.biblePlanner && typeof window.biblePlanner.destroy === 'function') {
                window.biblePlanner.destroy();
            }
        });
        
    } catch (error) {
        console.error('Failed to create Bible Planner:', error);
        app.innerHTML = `
            <div style="padding: 2rem; text-align: center; background: white; border-radius: 1rem; margin: 2rem;">
                <h2 style="color: #dc2626; margin-bottom: 1rem;">⚠️ Initialization Error</h2>
                <p style="color: #64748b; margin-bottom: 1rem;">Failed to initialize the Bible Planner.</p>
                <pre style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; text-align: left; overflow-x: auto; font-size: 0.875rem;">${error.message}\n${error.stack}</pre>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #205782, #f2842f); color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600;">
                    Reload Page
                </button>
            </div>
        `;
    }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EthiopianBiblePlanner, StorageManager, UIManager, AnalyticsManager, ErrorBoundary };
}