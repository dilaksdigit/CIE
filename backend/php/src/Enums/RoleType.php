<?php
namespace App\Enums;

enum RoleType: string {
    case ADMIN = 'ADMIN';
    case GOVERNOR = 'GOVERNOR';
    case EDITOR = 'EDITOR';
    case VIEWER = 'VIEWER';
    
    // PHP Enums don't support multiple cases with same value.
    // If we need the legacy names, we can use a method.
    public static function fromLegacy(string $name): string {
        return match($name) {
            'CONTENT_EDITOR' => self::EDITOR->value,
            'SEO_GOVERNOR' => self::GOVERNOR->value,
            default => $name
        };
    }
}
