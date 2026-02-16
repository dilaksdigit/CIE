<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Sku extends Model
{
 protected $guarded = [];
 public function primaryCluster() { return $this->belongsTo(Cluster::class, 'primary_cluster_id'); }
 public function skuIntents() { return $this->hasMany(SkuIntent::class); }
}
