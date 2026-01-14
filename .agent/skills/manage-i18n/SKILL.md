---
name: manage-i18n
description: Helps manage i18n keys across multiple languages (en, vi, ko) to ensure consistency.
---

# Manage i18n Skill

This skill assists in adding, updating, and organizing internationalization (i18n) keys to ensure all languages are synchronized.

## When to use this skill

- When creating a new feature with new UI text
- When the user asks to "add translations" or "fix missing keys"
- When refactoring hardcoded text to i18n keys

## How to use it

### 1. Identify Namespace & Keys
Determine which namespace the key belongs to (e.g., `common`, `auth`, `products`).
Format: `namespace:section.key` (e.g., `products:list.title`).

### 2. Update Translation Files
You must update ALL three language files simultaneously:

- `apps/web-core/src/locales/en/{namespace}.json`
- `apps/web-core/src/locales/vi/{namespace}.json`
- `apps/web-core/src/locales/ko/{namespace}.json`

### 3. Conventions
- **Keys**: snake_case (e.g., `create_success`)
- **Variables**: `{{variable}}`
- **Missing Translations**: If you don't know the translation for a language (e.g., Korean), use the English text but mark it with `[KO]` prefix temporarily or ask the user.

### 4. Verification
- Use `grep_search` to ensure the key is not duplicated.
- Ensure the key structure is identical across all files.
