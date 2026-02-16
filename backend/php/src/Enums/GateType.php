<?php
namespace App\Enums;
enum GateType: string
{
 case G1_BASIC_INFO = 'G1_BASIC_INFO';
 case G2_IMAGES = 'G2_IMAGES';
 case G3_SEO = 'G3_SEO';
 case G4_VECTOR = 'G4_VECTOR';
 case G5_TECHNICAL = 'G5_TECHNICAL';
 case G6_COMMERCIAL = 'G6_COMMERCIAL';
 case G7_EXPERT = 'G7_EXPERT';
 
 public function displayName(): string
 {
 return match($this) {
 self::G1_BASIC_INFO => 'G1 - Basic Information',
 self::G2_IMAGES => 'G2 - Images',
 self::G3_SEO => 'G3 - SEO Metadata',
 self::G4_VECTOR => 'G4 - Semantic Validation',
 self::G5_TECHNICAL => 'G5 - Technical Specifications',
 self::G6_COMMERCIAL => 'G6 - Commercial Data',
 self::G7_EXPERT => 'G7 - Expert Authority',
 };
 }
 
 public function isBlockingForTier(TierType $tier): bool
 {
 // G1-G6 always blocking
 if ($this !== self::G7_EXPERT) {
 return true;
 }
 
 // G7 only blocking for Hero and Support
 return in_array($tier, [TierType::HERO, TierType::SUPPORT]);
 }
}
