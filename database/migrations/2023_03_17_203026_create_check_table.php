<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('check', function (Blueprint $table) {
            $table->id();
            $table->decimal('amount');
            $table->string('number');
            $table->timestamp('date');
            $table->string('description')->nullable();
            $table->string('status');
            $table->foreignId('user_id')->constrained('users');
            $table->boolean('validated')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('check');
    }
};
