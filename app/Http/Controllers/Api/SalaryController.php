<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalaryRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateSalaryRequest;
use App\Http\Resources\SalaryResource;
use App\Models\Salary;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    public function index()
    {
        $salaries = Salary::all();
        return SalaryResource::collection($salaries);
    }

    public function store(StoreSalaryRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->user()?->getAuthIdentifier();
        $data['date'] = now();
        $salary = Salary::create($data);
        return response(new SalaryResource($salary), 201);
    }

    public function show(Salary $salary)
    {
        return new SalaryResource($salary);
    }


    public function update(UpdateSalaryRequest $request, Salary $salary)
    {
        $data = $request->validated();
        $salary->update($data);
        return new SalaryResource($salary);
    }

    public function destroy(Salary $salary)
    {
        $salary->delete();

        return response(null, 204);
    }

    public function userSalaries($id, $month = null, $year = null)
    {
        $salaries = Salary::query()
            ->where('user_id', $id)
            ->whereMonth('date', $month ?? (now()->month))
            ->whereYear('date', $year ?? (now()->year))
            ->get();
        $total = $salaries->sum('amount');
        return response()->json(['salaries' => SalaryResource::collection($salaries), 'total' => $total]);
    }
}
