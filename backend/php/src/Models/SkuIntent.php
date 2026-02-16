<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SkuIntent extends Model
{
 protected $guarded = [];
 public function sku() { return $this->belongsTo(Sku::class); }
 public function intent() { return $this->belongsTo(Intent::class); }
}
