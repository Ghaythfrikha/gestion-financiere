<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCheckRequest;
use App\Http\Requests\UpdateCheckRequest;
use App\Http\Resources\CheckResource;
use App\Models\Check;
use Illuminate\Http\Request;

class CheckController extends Controller
{

    public function index()
    {
        $checks = Check::all();
        return CheckResource::collection($checks);
    }


    public function store(StoreCheckRequest $request)
    {
        $data = $request->validated();
        $check = Check::create($data);
        return response(new CheckResource($check), 201);
    }


    public function show(Check $check)
    {
        return new CheckResource($check);
    }


    public function update(UpdateCheckRequest $request, Check $check)
    {
        $data = $request->validated();
        $check->update($data);

        return new CheckResource($check);
    }


    public function destroy(Check $check)
    {
        $check->delete();

        return response(null, 204);
    }

    public function validateCheck($id)
    {
        $check = Check::query()->findOrFail($id);
        $check->update(['validated' => true]);
        return new CheckResource($check);
    }

    public function validChecks($id, $month = null, $year = null)
    {
        // get all checks that are validated and related to the current user and calculate the total amount of each status (Entrant, Sortant) and return it
        $checks = Check::query()
            ->where('validated', true)
            ->where('user_id', $id)
            ->whereMonth('date', $month ?? (now()->month))
            ->whereYear('date', $year ?? (now()->year))
            ->get();
        $totalEntrant = 0;
        $totalSortant = 0;
        foreach ($checks as $check) {
            if ($check->status === 'Entrant') {
                $totalEntrant += $check->amount;
            } else {
                $totalSortant += $check->amount;
            }
        }
        return response()->json([
            'totalEntrant' => $totalEntrant,
            'totalSortant' => $totalSortant,
            'checks' => CheckResource::collection($checks),
        ]);
        /*$checks = Check::query()->where('validated', true)->where('user_id', $id)->get();
        return CheckResource::collection($checks);*/
    }

    public function userChecksAll($id, Request $request)
    {
        $date = $request->query('date');
        $status = $request->query('status');
        $validated = $request->query('validated');
        $checks = Check::query()->where('user_id', $id);

        if ($date) {
            // extract the month and the year from the date
            $date = explode('-', $date);
            $month = $date[1];
            $year = $date[0];
            // extract the day from the date
            $day = $date[2];
            $checks->whereDay('date', $day)->whereMonth('date', $month)->whereYear('date', $year);
        }
        if ($status) {
            $checks->where('status', $status);
        }
        if ($validated) {
            $checks->where('validated', $validated);
        }
        $checks = $checks->get();
        return CheckResource::collection($checks);
    }

    // get all checks by user id and year null
    public function userChecksYear($id, $year = null)
    {
        $checks = Check::query()
            ->where('user_id', $id)
            ->whereYear('date', $year ?? (now()->year))
            ->get();
        $totalEntrant = 0;
        $totalSortant = 0;
        foreach ($checks as $check) {
            if ($check->status === 'Entrant') {
                $totalEntrant += $check->amount;
            } else {
                $totalSortant += $check->amount;
            }
        }
        return response()->json([
            'totalEntrant' => $totalEntrant,
            'totalSortant' => $totalSortant,
            'checks' => CheckResource::collection($checks),
        ]);
    }
}
