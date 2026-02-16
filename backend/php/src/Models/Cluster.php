<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Cluster extends Model
{
 protected $guarded = [];
 public function skus() { return $this->hasMany(Sku::class, 'primary_cluster_id'); }
}
