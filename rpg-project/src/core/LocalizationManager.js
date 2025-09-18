/**
 * Localization Manager
 * Handles text localization using resource files
 */
class LocalizationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.fallbackLanguage = 'en';
        this.resourceFiles = new Map();
        this.loadedResources = new Map();
        this.isLoaded = false;

        // Default English resources
        this.defaultResources = {
            ui: {
                ok: 'OK',
                cancel: 'Cancel',
                yes: 'Yes',
                no: 'No',
                continue: 'Continue',
                back: 'Back',
                next: 'Next',
                previous: 'Previous',
                close: 'Close',
                save: 'Save',
                load: 'Load',
                new_game: 'New Game',
                settings: 'Settings',
                quit: 'Quit',
                inventory: 'Inventory',
                equipment: 'Equipment',
                skills: 'Skills',
                quests: 'Quests',
                map: 'Map',
                status: 'Status'
            },
            dialog: {
                greeting: 'Hello there!',
                farewell: 'Goodbye!',
                busy: 'I\'m busy right now.',
                thanks: 'Thank you!',
                no_thanks: 'No thanks.',
                what_do_you_need: 'What do you need?',
                im_listening: 'I\'m listening.',
                tell_me_more: 'Tell me more.',
                interesting: 'That\'s interesting.',
                i_see: 'I see.',
                perhaps_later: 'Perhaps later.',
                not_interested: 'Not interested.'
            },
            npc: {
                merchant_greeting: 'Welcome! Take a look at my wares.',
                guard_halt: 'Halt! Who goes there?',
                innkeeper_offer: 'Would you like a room for the night?',
                quest_available: 'I have a task for someone like you.',
                quest_in_progress: 'Have you completed my quest?',
                quest_complete: 'Excellent work! Here\'s your reward.'
            },
            combat: {
                attack: 'Attack',
                defend: 'Defend',
                magic: 'Magic',
                item: 'Item',
                run: 'Run',
                victory: 'Victory!',
                defeat: 'Defeated...',
                escaped: 'Successfully escaped!',
                experience_gained: 'Experience gained: {exp}',
                gold_found: 'Gold found: {gold}',
                level_up: 'Level up!',
                critical_hit: 'Critical hit!',
                miss: 'Miss!'
            },
            items: {
                health_potion: 'Health Potion',
                mana_potion: 'Mana Potion',
                sword: 'Sword',
                shield: 'Shield',
                armor: 'Armor',
                helmet: 'Helmet',
                gloves: 'Gloves',
                boots: 'Boots',
                ring: 'Ring',
                amulet: 'Amulet'
            },
            errors: {
                not_enough_gold: 'Not enough gold.',
                inventory_full: 'Inventory is full.',
                cannot_equip: 'Cannot equip this item.',
                invalid_action: 'Invalid action.',
                save_failed: 'Save failed.',
                load_failed: 'Load failed.'
            }
        };
    }

    async loadLanguage(languageCode, resourceFiles = []) {
        this.currentLanguage = languageCode;

        // If loading English, use defaults
        if (languageCode === 'en') {
            this.loadedResources.set('en', this.defaultResources);
            this.isLoaded = true;
            return true;
        }

        // Load resource files
        const languageResources = {};

        for (const file of resourceFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    console.warn(`Failed to load localization file: ${file}`);
                    continue;
                }

                const data = await response.json();
                this.mergeResources(languageResources, data);
            } catch (error) {
                console.error(`Error loading localization file ${file}:`, error);
            }
        }

        // Merge with defaults for missing keys
        this.mergeResources(languageResources, this.defaultResources);

        this.loadedResources.set(languageCode, languageResources);
        this.isLoaded = true;

        return true;
    }

    mergeResources(target, source) {
        for (const [key, value] of Object.entries(source)) {
            if (typeof value === 'object' && value !== null) {
                if (!target[key]) target[key] = {};
                this.mergeResources(target[key], value);
            } else {
                if (!target[key]) {
                    target[key] = value;
                }
            }
        }
    }

    getText(key, variables = {}) {
        const resources = this.loadedResources.get(this.currentLanguage) ||
                         this.loadedResources.get(this.fallbackLanguage) ||
                         this.defaultResources;

        const text = this.getNestedValue(resources, key);

        if (!text) {
            console.warn(`Localization key not found: ${key}`);
            return key;
        }

        return this.interpolateVariables(text, variables);
    }

    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }

        return current;
    }

    interpolateVariables(text, variables) {
        let result = text;

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{${key}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value);
        }

        return result;
    }

    getAvailableLanguages() {
        return Array.from(this.loadedResources.keys());
    }

    setLanguage(languageCode) {
        if (this.loadedResources.has(languageCode)) {
            this.currentLanguage = languageCode;
            return true;
        }
        return false;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Batch text retrieval for performance
    getBatchTexts(keys, variables = {}) {
        const result = {};

        for (const key of keys) {
            result[key] = this.getText(key, variables);
        }

        return result;
    }

    // Add or update text at runtime
    setText(key, text, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        if (!this.loadedResources.has(lang)) {
            this.loadedResources.set(lang, {});
        }

        const resources = this.loadedResources.get(lang);
        this.setNestedValue(resources, key, text);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }

    // Export current language resources
    exportLanguage(languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        return JSON.stringify(this.loadedResources.get(lang) || {}, null, 2);
    }

    // Validate resource structure
    validateResources(resources) {
        const errors = [];

        const validateObject = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof value === 'object' && value !== null) {
                    validateObject(value, currentPath);
                } else if (typeof value !== 'string') {
                    errors.push(`Invalid value type at ${currentPath}: expected string, got ${typeof value}`);
                }
            }
        };

        validateObject(resources);
        return errors;
    }

    // Get text with pluralization support
    getPluralText(key, count, variables = {}) {
        const singularKey = `${key}.singular`;
        const pluralKey = `${key}.plural`;

        let textKey;
        if (count === 1) {
            textKey = this.getNestedValue(this.loadedResources.get(this.currentLanguage), singularKey) ?
                     singularKey : key;
        } else {
            textKey = this.getNestedValue(this.loadedResources.get(this.currentLanguage), pluralKey) ?
                     pluralKey : key;
        }

        return this.getText(textKey, { ...variables, count });
    }

    // Get all keys for a category
    getCategoryKeys(category) {
        const resources = this.loadedResources.get(this.currentLanguage) ||
                         this.loadedResources.get(this.fallbackLanguage) ||
                         this.defaultResources;

        const categoryData = this.getNestedValue(resources, category);
        if (!categoryData || typeof categoryData !== 'object') {
            return [];
        }

        const keys = [];
        const collectKeys = (obj, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'string') {
                    keys.push(`${category}.${fullKey}`);
                } else if (typeof value === 'object') {
                    collectKeys(value, fullKey);
                }
            }
        };

        collectKeys(categoryData);
        return keys;
    }
}

// Predefined language configurations
const LanguageConfigs = {
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        rtl: false,
        font: 'monospace'
    },
    es: {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸',
        rtl: false,
        font: 'monospace'
    },
    fr: {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷',
        rtl: false,
        font: 'monospace'
    },
    de: {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪',
        rtl: false,
        font: 'monospace'
    },
    ja: {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵',
        rtl: false,
        font: 'monospace' // Would use Japanese font in practice
    },
    zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        rtl: false,
        font: 'monospace' // Would use Chinese font in practice
    },
    ar: {
        code: 'ar',
        name: 'العربية',
        flag: '🇸🇦',
        rtl: true,
        font: 'monospace' // Would use Arabic font in practice
    },
    ru: {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺',
        rtl: false,
        font: 'monospace' // Would use Cyrillic font in practice
    }
};

// Resource file loader with caching
class ResourceFileLoader {
    static cache = new Map();

    static async loadResourceFile(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }

            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error(`Error loading resource file ${url}:`, error);
            throw error;
        }
    }

    static clearCache() {
        this.cache.clear();
    }

    static getCached(url) {
        return this.cache.get(url);
    }

    static isCached(url) {
        return this.cache.has(url);
    }
}

// Text formatter for localized text
class LocalizedTextFormatter {
    constructor(localizationManager) {
        this.loc = localizationManager;
    }

    formatNumber(number, format = 'decimal') {
        // Basic number formatting - can be extended with locale-specific formatting
        switch (format) {
            case 'currency':
                return this.loc.getText('ui.currency_format', { amount: number.toFixed(2) });
            case 'percentage':
                return `${number}%`;
            case 'ordinal':
                return this.getOrdinalSuffix(number);
            default:
                return number.toString();
        }
    }

    getOrdinalSuffix(number) {
        const j = number % 10;
        const k = number % 100;

        if (j === 1 && k !== 11) return `${number}st`;
        if (j === 2 && k !== 12) return `${number}nd`;
        if (j === 3 && k !== 13) return `${number}rd`;
        return `${number}th`;
    }

    formatDate(date, format = 'short') {
        // Basic date formatting
        const options = format === 'long' ?
            { year: 'numeric', month: 'long', day: 'numeric' } :
            { year: 'numeric', month: 'short', day: 'numeric' };

        return date.toLocaleDateString(this.loc.getCurrentLanguage(), options);
    }

    formatList(items, conjunction = 'and') {
        if (items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

        const allButLast = items.slice(0, -1).join(', ');
        return `${allButLast}, ${conjunction} ${items[items.length - 1]}`;
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return this.loc.getText('ui.duration_days', { days, hours: hours % 24 });
        } else if (hours > 0) {
            return this.loc.getText('ui.duration_hours', { hours, minutes: minutes % 60 });
        } else if (minutes > 0) {
            return this.loc.getText('ui.duration_minutes', { minutes, seconds: seconds % 60 });
        } else {
            return this.loc.getText('ui.duration_seconds', { seconds });
        }
    }
}

export {
    LocalizationManager,
    LanguageConfigs,
    ResourceFileLoader,
    LocalizedTextFormatter
};