<?php

namespace App\Utils;

/**
 * CIE v2.3.1 — Schema.org Product JSON-LD renderer by tier.
 * Generates structured data for page <head> based on SKU tier.
 */
class JsonLdRenderer
{
    /**
     * Render Schema.org Product JSON-LD script tag based on SKU tier.
     * 
     * Tier rules:
     * - Hero: Full schema with Product, name, description (answer_block), brand, offers,
     *         material with sameAs Wikidata URI, additionalProperty for Expert Authority, Best For, Not For
     * - Support: Basic schema - Product, name, description, brand, offers
     * - Harvest: Minimal - Product, name, offers only
     * - Kill: Return empty string (no schema)
     * 
     * @param \App\Models\Sku|object $sku SKU model/object with tier, title, ai_answer_block, etc.
     * @return string HTML script tag with JSON-LD or empty string for Kill tier
     */
    public static function renderCieJsonld($sku): string
    {
        $tier = strtolower(trim($sku->tier ?? ''));
        
        // Kill tier: no schema
        if ($tier === 'kill') {
            return '';
        }
        
        // Base schema structure
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $sku->title ?? '',
        ];
        
        // Brand (from env or config)
        $brandName = env('CIE_BRAND_NAME', config('app.name', 'CIE'));
        $schema['brand'] = [
            '@type' => 'Brand',
            'name' => $brandName,
        ];
        
        // Offers (price, currency, availability)
        $price = $sku->current_price ?? $sku->price ?? null;
        if ($price && $price > 0) {
            $schema['offers'] = [
                '@type' => 'Offer',
                'priceCurrency' => 'GBP',
                'price' => (float) $price,
                'availability' => 'https://schema.org/InStock',
            ];
        }
        
        // Support and Hero: include description (from answer_block)
        if (in_array($tier, ['hero', 'support'])) {
            $description = $sku->ai_answer_block ?? $sku->short_description ?? '';
            if ($description) {
                $schema['description'] = $description;
            }
        }
        
        // Hero only: full schema with Wikidata, Expert Authority, Best For, Not For
        if ($tier === 'hero') {
            // Material with Wikidata URI (sameAs)
            $wikidataUri = $sku->wikidata_uri ?? $sku->wikidata_entities ?? null;
            if ($wikidataUri) {
                // If wikidata_entities is JSON, extract URI; otherwise use as-is
                if (is_string($wikidataUri) && str_starts_with($wikidataUri, '{')) {
                    $decoded = json_decode($wikidataUri, true);
                    $wikidataUri = $decoded['uri'] ?? $decoded['sameAs'] ?? $wikidataUri;
                }
                if (filter_var($wikidataUri, FILTER_VALIDATE_URL) || str_starts_with($wikidataUri, 'https://wikidata.org/entity/')) {
                    $schema['material'] = [
                        '@type' => 'Text',
                        'name' => $sku->material_name ?? 'Product Material',
                        'sameAs' => $wikidataUri,
                    ];
                }
            }
            
            // Additional properties: Expert Authority, Best For, Not For
            $additionalProps = [];
            
            if (!empty($sku->expert_authority_name ?? $sku->expert_authority ?? '')) {
                $additionalProps[] = [
                    '@type' => 'PropertyValue',
                    'name' => 'Expert Authority',
                    'value' => $sku->expert_authority_name ?? $sku->expert_authority ?? '',
                ];
            }
            
            // Best For (comma-separated or array)
            $bestFor = $sku->best_for ?? '';
            if ($bestFor) {
                if (is_string($bestFor)) {
                    $bestForArray = array_filter(array_map('trim', explode(',', $bestFor)));
                } else {
                    $bestForArray = is_array($bestFor) ? array_filter($bestFor) : [];
                }
                if (!empty($bestForArray)) {
                    $additionalProps[] = [
                        '@type' => 'PropertyValue',
                        'name' => 'Best For',
                        'value' => implode('; ', $bestForArray),
                    ];
                }
            }
            
            // Not For (comma-separated or array)
            $notFor = $sku->not_for ?? '';
            if ($notFor) {
                if (is_string($notFor)) {
                    $notForArray = array_filter(array_map('trim', explode(',', $notFor)));
                } else {
                    $notForArray = is_array($notFor) ? array_filter($notFor) : [];
                }
                if (!empty($notForArray)) {
                    $additionalProps[] = [
                        '@type' => 'PropertyValue',
                        'name' => 'Not For',
                        'value' => implode('; ', $notForArray),
                    ];
                }
            }
            
            if (!empty($additionalProps)) {
                $schema['additionalProperty'] = $additionalProps;
            }
        }
        
        // Encode JSON with pretty-print for readability (optional: use JSON_UNESCAPED_SLASHES)
        $json = json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        return '<script type="application/ld+json">' . "\n" . $json . "\n" . '</script>';
    }
}
