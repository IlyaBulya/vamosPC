<?php

use App\Models\User;

test('admins can create new admin users', function () {
    $admin = createUser(['is_admin' => true]);

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Operations Admin',
            'email' => 'ops-admin@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'ops-admin@example.com',
        'is_admin' => true,
    ]);
});

test('super admins cannot be demoted', function () {
    $superAdmin = createUser([
        'is_admin' => true,
        'email' => 'founder@example.com',
    ]);
    $actor = createUser(['is_admin' => true]);

    config()->set('admin.super_admin_emails', ['founder@example.com']);

    $response = $this
        ->actingAs($actor)
        ->from(route('admin.users.index'))
        ->patch(route('admin.users.role.update', ['user' => $superAdmin->id]), [
            'is_admin' => false,
        ]);

    $response
        ->assertRedirect(route('admin.users.index'))
        ->assertSessionHas('error', 'Super admin accounts cannot be demoted.');

    expect($superAdmin->refresh()->is_admin)->toBeTrue();
});

test('admin privileges can be removed for non-super admins', function () {
    $targetAdmin = createUser([
        'is_admin' => true,
        'email' => 'manager@example.com',
    ]);
    $actor = createUser(['is_admin' => true]);

    config()->set('admin.super_admin_emails', ['founder@example.com']);

    $response = $this
        ->actingAs($actor)
        ->patch(route('admin.users.role.update', ['user' => $targetAdmin->id]), [
            'is_admin' => false,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.users.index'));

    expect($targetAdmin->refresh()->is_admin)->toBeFalse();
});

test('the last admin cannot remove their own admin privileges', function () {
    $lastAdmin = createUser(['is_admin' => true]);

    $response = $this
        ->actingAs($lastAdmin)
        ->from(route('admin.users.index'))
        ->patch(route('admin.users.role.update', ['user' => $lastAdmin->id]), [
            'is_admin' => false,
        ]);

    $response
        ->assertRedirect(route('admin.users.index'))
        ->assertSessionHas('error', 'At least one admin account must remain.');

    expect($lastAdmin->refresh()->is_admin)->toBeTrue();
});

test('non-admin users cannot manage admin users', function () {
    $user = createUser();

    $response = $this
        ->actingAs($user)
        ->post(route('admin.users.store'), [
            'name' => 'Blocked User',
            'email' => 'blocked@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

    $response->assertForbidden();

    expect(User::query()->where('email', 'blocked@example.com')->exists())->toBeFalse();
});
