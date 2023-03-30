<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'amount' => 'required|numeric',
            'date' => 'required|date',
            'category_id' => 'required|integer|exists:category,id',
            'user_id' => 'required|integer|exists:users,id',
            'description' => 'nullable|string',
            'event_id' => 'nullable|integer|exists:event,id',
        ];
    }
}
