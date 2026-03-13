<?php

use App\Models\User;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

function createUser(array $overrides = [], bool $verified = true): User
{
    return User::create(array_merge([
        'name' => 'Test User',
        'email' => 'user-'.Str::uuid().'@example.com',
        'password' => 'password',
        'email_verified_at' => $verified ? now() : null,
    ], $overrides));
}
