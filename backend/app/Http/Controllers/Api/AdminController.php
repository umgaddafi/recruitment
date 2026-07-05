<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\College;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function users(Request $request)
    {
        return response()->json(User::with('roles')->whereDoesntHave('roles', function($q) { $q->where('name', 'applicant'); })->latest()->paginate($request->integer('per_page', 50)));
    }

    public function storeUser(Request $request, AuditService $audit)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['required', 'min:8'],
            'roles' => ['required', 'array'],
            'roles.*' => ['exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
        ]);
        $user->roles()->sync(Role::whereIn('name', $data['roles'])->pluck('id'));
        $audit->log('user_created', "Created user {$user->email}.", ['user_id' => $user->id], $request);

        return response()->json($user->load('roles'), 201);
    }

    public function updateUser(Request $request, User $user, AuditService $audit)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', 'max:40'],
            'password' => ['nullable', 'min:8'],
            'status' => ['sometimes', 'in:active,inactive'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['exists:roles,name'],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update(collect($data)->except('roles')->all());
        if (isset($data['roles'])) {
            $user->roles()->sync(Role::whereIn('name', $data['roles'])->pluck('id'));
        }
        $audit->log('user_updated', "Updated user {$user->email}.", ['user_id' => $user->id], $request);

        return response()->json($user->fresh('roles'));
    }

    public function deleteUser(User $user, AuditService $audit)
    {
        $audit->log('user_deleted', "Deleted user {$user->email}.", ['user_id' => $user->id], request());
        $user->delete();
        return response()->noContent();
    }

    public function organization()
    {
        return response()->json([
            'colleges' => College::with('departments.units')->get(),
            'departments' => Department::with('college', 'units')->get(),
        ]);
    }

    public function storeCollege(Request $request)
    {
        return response()->json(College::create($request->validate(['name' => ['required'], 'code' => ['required', 'unique:colleges,code'], 'description' => ['nullable']])), 201);
    }

    public function storeDepartment(Request $request)
    {
        return response()->json(Department::create($request->validate(['college_id' => ['nullable', 'exists:colleges,id'], 'name' => ['required'], 'code' => ['required', 'unique:departments,code'], 'type' => ['required', 'in:academic,non-academic']])), 201);
    }

    public function documentTypes(Request $request)
    {
        if ($request->isMethod('post')) {
            return response()->json(DocumentType::create($request->validate([
                'name' => ['required', 'unique:document_types,name'],
                'slug' => ['required', 'unique:document_types,slug'],
                'is_required_by_default' => ['boolean'],
                'allowed_mimes' => ['nullable', 'string'],
                'max_size_kb' => ['nullable', 'integer'],
            ])), 201);
        }

        return response()->json(DocumentType::orderBy('name')->get());
    }

    public function settings(Request $request)
    {
        if ($request->isMethod('post')) {
            $data = $request->validate(['key' => ['required'], 'value' => ['nullable'], 'group' => ['nullable', 'string']]);

            return response()->json(SystemSetting::updateOrCreate(['key' => $data['key']], ['value' => $data['value'] ?? null, 'group' => $data['group'] ?? 'general']));
        }

        return response()->json(SystemSetting::orderBy('group')->orderBy('key')->get());
    }

    public function auditLogs(Request $request)
    {
        return response()->json(
            AuditLog::with('user')
                ->whereDoesntHave('user.roles', function ($q) {
                    $q->where('name', 'applicant');
                })
                ->latest()
                ->paginate($request->integer('per_page', 30))
        );
    }
}
