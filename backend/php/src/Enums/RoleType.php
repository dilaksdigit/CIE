<?php

namespace App\Enums;

/**
 * Canonical role names per CIE spec.
 */
enum RoleType: string
{
    case CONTENT_EDITOR    = 'content_editor';
    case PRODUCT_SPECIALIST= 'product_specialist';
    case SEO_GOVERNOR      = 'seo_governor';
    case CHANNEL_MANAGER   = 'channel_manager';
    case AI_OPS            = 'ai_ops';
    case PORTFOLIO_HOLDER  = 'portfolio_holder';
    case FINANCE           = 'finance';
    case ADMIN             = 'admin';
    case SYSTEM            = 'system';

    public static function fromDatabase(string $name): ?self
    {
        return match (strtoupper($name)) {
            'CONTENT_EDITOR'    => self::CONTENT_EDITOR,
            'PRODUCT_SPECIALIST'=> self::PRODUCT_SPECIALIST,
            'SEO_GOVERNOR'      => self::SEO_GOVERNOR,
            'CHANNEL_MANAGER'   => self::CHANNEL_MANAGER,
            'AI_OPS'            => self::AI_OPS,
            'PORTFOLIO_HOLDER'  => self::PORTFOLIO_HOLDER,
            'FINANCE'           => self::FINANCE,
            'ADMIN'             => self::ADMIN,
            'SYSTEM'            => self::SYSTEM,
            default             => null,
        };
    }
}
