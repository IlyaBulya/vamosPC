<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use PasswordValidationRules, ProfileValidationRules;

    public function index(): Response
    {
        $users = User::query()
            ->withCount(['orders'])
            ->latest()
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => (bool) $user->is_admin,
                'is_super_admin' => (bool) $user->is_super_admin,
                'orders_count' => (int) $user->orders_count,
                'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
                'created_at' => $user->created_at?->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var array{name:string, email:string, password:string} $data */
        $data = Validator::make($request->all(), [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $admin = User::query()->create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => $data['password'],
        ]);

        $admin->forceFill([
            'is_admin' => true,
        ])->save();

        return redirect()
            ->route('admin.users.index')
            ->with('status', 'Admin user created successfully.');
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'is_admin' => ['required', 'boolean'],
        ]);

        $isAdmin = (bool) $data['is_admin'];
        $currentlyAdmin = (bool) ($user->is_admin ?? false);

        if (! $isAdmin && $currentlyAdmin && (bool) ($user->is_super_admin ?? false)) {
            return back()->with('error', 'Super admin accounts cannot be demoted.');
        }

        if (! $isAdmin && $currentlyAdmin && $this->isLastAdmin($user)) {
            return back()->with('error', 'At least one admin account must remain.');
        }

        $user->forceFill([
            'is_admin' => $isAdmin,
        ])->save();

        return redirect()
            ->route('admin.users.index')
            ->with('status', $isAdmin ? 'User promoted to admin.' : 'Admin privileges removed.');
    }

    private function isLastAdmin(User $user): bool
    {
        return User::query()
            ->where('is_admin', true)
            ->whereKeyNot($user->id)
            ->doesntExist();
    }
}
