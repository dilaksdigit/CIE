<?php
namespace App\Services;
class ReadinessScoreService {
  /**
   * Calculate decomposed AI Readiness Score (Patch 3)
   * Weightings: Answer Block (25%), FAQ Coverage (20%), Safety Depth (15%),
   * Cross-SKU Comparison (15%), Structured Data (15%), Citation Score (10%).
   */
  public function calculate($sku): int
  {
      $components = [
          'score_answer_block' => 0.25,
          'score_faq' => 0.20,
          'score_safety' => 0.15,
          'score_comparison' => 0.15,
          'score_structured_data' => 0.15,
          'score_citation' => 0.10
      ];

      $totalScore = 0;
      foreach ($components as $field => $weight) {
          $totalScore += ($sku->$field ?? 0) * $weight;
      }

      $finalScore = (int) round($totalScore);
      $sku->update(['readiness_score' => $finalScore]);
      
      return $finalScore;
  }
}
