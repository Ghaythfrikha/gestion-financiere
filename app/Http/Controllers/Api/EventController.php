<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\Expense;
use Illuminate\Http\Request;

class EventController extends Controller
{

    public function index()
    {
        return EventResource::collection(Event::query()->orderBy('id', 'desc')->paginate(10));
    }


    public function store(StoreEventRequest $request)
    {
        $data = $request->validated();
        $event = Event::create($data);
        return response(new EventResource($event), 201);
    }


    public function show(Event $event)
    {
        return new EventResource($event);
    }


    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();
        $event->update($data);

        return new EventResource($event);
    }


    public function destroy(Event $event)
    {
        $event->delete();

        return response(null, 204);
    }

    public function userEvents($id)
    {
        $events = Event::query()
            ->where('user_id', $id)
            ->get();
        $eventTotal = 0;
        foreach ($events as $event) {
            // total expenses for each event
            $eventTotal += Expense::query()
                ->where('event_id', $event->id)
                ->sum('amount');
        }
        // collapse each event with its total expenses
        $events = $events->map(function ($event) use ($eventTotal) {
            return [
                'id' => $event->id,
                'user_id' => $event->user_id,
                'amount' => $event->amount,
                'date' => $event->date,
                'description' => $event->description,
                'type' => $event->type,
                'total' => $eventTotal
            ];
        });
        return response()->json($events);
    }
}
