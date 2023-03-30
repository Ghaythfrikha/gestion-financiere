<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\SalaryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/users', UserController::class);
    Route::apiResource('/salaries', SalaryController::class);
    Route::apiResource('/expenses', ExpenseController::class);
    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('/checks', CheckController::class);
    Route::apiResource('/events', EventController::class);
    Route::get('/user-events/{id}', [EventController::class, 'userEvents']);
    Route::get('/checks-valid/{id}', [CheckController::class, 'validChecks']);
    Route::patch('/check-validate/{id}', [CheckController::class, 'validateCheck']);
    Route::get('/user-expenses/{id}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}', [SalaryController::class, 'userSalaries']);
    Route::get('/user-expenses/{id}/{month}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}/{month}', [SalaryController::class, 'userSalaries']);
    Route::get('/user-expenses/{id}/{month}/{year}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}/{month}/{year}', [SalaryController::class, 'userSalaries']);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
