<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return rtrim((string) config('app.frontend_url'), '/').'/reset-password?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });

        // Register maintenance mode middleware on web and api groups
        if ($this->app->bound('router')) {
            $router = $this->app->make('router');
            // push to api and web middleware groups if they exist
            try {
                $router->pushMiddlewareToGroup('api', \App\Http\Middleware\CheckMaintenanceMode::class);
            } catch (\Throwable $e) {
                // ignore if group missing
            }
            try {
                $router->pushMiddlewareToGroup('web', \App\Http\Middleware\CheckMaintenanceMode::class);
            } catch (\Throwable $e) {
                // ignore if group missing
            }
        }
    }
}
