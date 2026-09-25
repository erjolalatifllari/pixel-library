<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreign('olid')->references('olid')->on('books')->onDelete('cascade');
            $table->enum('status', ['owned', 'wishlist']);
            $table->timestamps();

            // Performance Indexing
            $table->index('user_id', 'idx_user_books_user_id');
            $table->unique(['user_id', 'olid'], 'idx_user_books_user_olid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_books');
    }
};
