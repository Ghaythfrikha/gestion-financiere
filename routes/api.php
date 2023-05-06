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
    Route::post('/expense/add', [ExpenseController::class, 'addExpense']);
    Route::get('/user-events/{id}', [EventController::class, 'userEvents']);
    Route::get('/category/{id}', [CategoryController::class, 'getCategoriesByUserId']);
    Route::get('/user-events-all/{id}', [EventController::class, 'userEventsAll']);
    Route::get('/checks-valid/{id}', [CheckController::class, 'validChecks']);
    Route::get('/checks-valid-all/{id}', [CheckController::class, 'userChecksAll']);
    Route::get('/checks-valid/{id}/{month}', [CheckController::class, 'validChecks']);
    Route::get('/checks-valid/{id}/{month}/{year}', [CheckController::class, 'validChecks']);
    Route::get('/user-events/{id}/{month}', [EventController::class, 'userEvents']);
    Route::get('/user-events/{id}/{year}', [EventController::class, 'userEvents']);
    Route::get('/user-events/{id}/{month}/{year}', [EventController::class, 'userEvents']);
    Route::patch('/check-validate/{id}', [CheckController::class, 'validateCheck']);
    Route::get('/user-expenses/{id}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}', [SalaryController::class, 'userSalaries']);
    Route::get('/user-salaries-all/{id}', [SalaryController::class, 'userSalariesAll']);
    Route::get('/user-expenses-all/{id}', [ExpenseController::class, 'userExpensesAll']);
    Route::get('/user-expenses/{id}/{month}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}/{month}', [SalaryController::class, 'userSalaries']);

    Route::get('/user-salaries-year/{id}/{year}', [SalaryController::class, 'userSalariesYear']);//
    Route::get('/checks-valid-year/{id}/{year}', [CheckController::class, 'userChecksYear']);//
    Route::get('/user-expenses-year/{id}/{year}', [ExpenseController::class, 'userExpensesYear']);//
    Route::get('/user-events-year/{id}/{year}', [EventController::class, 'userEventsYear']);//

    Route::get('/user-expenses/{id}/{month}/{year}', [ExpenseController::class, 'userExpenses']);
    Route::get('/user-salaries/{id}/{month}/{year}', [SalaryController::class, 'userSalaries']);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
