<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{

    public function index()
    {
        return CategoryResource::collection(Category::query()->orderBy('id', 'desc')->paginate(10));
    }


    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        $category = Category::create($data);
        return response(new CategoryResource($category), 201);
    }


    public function show(Category $category)
    {
        return new CategoryResource($category);
    }


    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        $category->update($data);

        return new CategoryResource($category);
    }


    public function destroy(Category $category)
    {
        $category->delete();

        return response(null, 204);
    }

    // get categories by user id
    public function getCategoriesByUserId($id)
    {
        $categories = Category::query()
            ->where('user_id', $id)
            ->get();
        return CategoryResource::collection($categories);
    }
}
