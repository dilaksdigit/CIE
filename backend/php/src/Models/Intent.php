<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Intent extends Model
{
  protected $guarded = [];
  protected $keyType = 'string';
  public $incrementing = false;
}
