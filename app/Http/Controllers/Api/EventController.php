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
        Expense::query()->where('event_id', $event->id)->delete();
        $event->delete();
        return response(null, 204);
    }

    public function userEvents($id, $month = null, $year = null)
    {
        // get all events by user id, get all expenses by event id, sum all expenses by event id and return each event with the sum of it's expenses
        $events = Event::query()
            ->where('user_id', $id)
            ->whereMonth('date', $month ?? (now()->month))
            ->whereYear('date', $year ?? (now()->year))
            ->get();
        foreach ($events as $event) {
            $event->expenses = Expense::query()->where('event_id', $event->id)->sum('amount');
        }
        return EventResource::collection($events);
    }

    public function userEventsAll($id)
    {
        // get all events by user id, get all expenses by event id, sum all expenses by event id and return each event with the sum of it's expenses
        $events = Event::query()
            ->where('user_id', $id)
            ->get();
        foreach ($events as $event) {
            $event->expenses = Expense::query()->where('event_id', $event->id)->sum('amount');
        }
        return EventResource::collection($events);
    }

    public function userEventsYear($id, $year = null)
    {
        $events = Event::query()
            ->where('user_id', $id)
            ->whereYear('date', $year ?? (now()->year))
            ->get();
        foreach ($events as $event) {
            $event->expenses = Expense::query()->where('event_id', $event->id)->sum('amount');
        }
        // dd($events);
        // create an array of events and expenses
        // return the array

        return EventResource::collection($events);
    }
}
