<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseEventRequest;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use DateTime;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{

    public function index()
    {
        // get all expenses with the category relationship
        $expenses = Expense::with('category', 'event')->get();
        return ExpenseResource::collection($expenses);
    }


    public function store(StoreExpenseRequest $request)
    {
        $data = $request->validated();
        $expense = Expense::create($data);
        return response(new ExpenseResource($expense), 201);
    }

    public function addExpense(StoreExpenseEventRequest $request)
    {
        $data = $request->validated();
        $expense = Expense::create($data);
        return response(new ExpenseResource($expense), 201);
    }


    public function show(Expense $expense)
    {
        return new ExpenseResource($expense);
    }


    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $data = $request->validated();
        $expense->update($data);
        return new ExpenseResource($expense);
    }


    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response(null, 204);
    }

    // get all expenses for a specific user with the category relationship and calculate the total amount of expenses
    public function userExpenses($id, $month = null, $year = null)
    {
        $expenses = Expense::query()
            ->where('user_id', $id)
            //->where('event_id', null)
            ->whereMonth('date', $month ?? (now()->month))
            ->whereYear('date', $year ?? (now()->year))
            ->with('category')
            ->get();
        $total = $expenses->sum('amount');
        return response()->json(['expenses' => ExpenseResource::collection($expenses), 'total' => $total]);
    }

    // get all expenses for a specific user with the category relationship and event relationship
    public function userExpensesAll($id)
    {
        $expenses = Expense::query()
            ->where('user_id', $id)
            ->get();
        return ExpenseResource::collection($expenses);
    }

    // get all expenses for a user in a specific year or null
    public function userExpensesYear($id, $year = null)
    {
        $expenses = Expense::query()
            ->where('user_id', $id)
            ->whereYear('date', $year ?? (now()->year))
            ->get();

        $monthlyExpenses = $expenses->groupBy(function ($expense) {
            return (new DateTime($expense->date))->format('F');
        })->map(function ($expenses) {
            return $expenses->sum('amount');
        })->toArray();

        $monthlyExpenses = array_map(function ($expense) {
            return round($expense, 2);
        }, $monthlyExpenses);

        $total = $expenses->sum('amount');
        return response()->json(['expenses' => ExpenseResource::collection($expenses),
            'total' => $total, 'monthlyExpenses' => $monthlyExpenses
        ]);
    }
}
