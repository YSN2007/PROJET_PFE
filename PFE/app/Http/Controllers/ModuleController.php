<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Module;

class ModuleController extends Controller
{
    public function index()
    {
        return response()->json(Module::with(['groupe', 'formateur.user'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_module' => 'required',
            'masse_horaire' => 'required|numeric',
            'groupe_id' => 'required',
            'formateur_id' => 'nullable|exists:formateurs,id',
        ]);

        $module = Module::create($validated);
        $module->load(['groupe', 'formateur.user']);

        return response()->json($module, 201);
    }

    public function show($id)
    {
        return response()->json(Module::with(['groupe', 'formateur.user'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'nom_module' => 'sometimes|required',
            'masse_horaire' => 'sometimes|required|numeric',
            'groupe_id' => 'sometimes|required',
            'formateur_id' => 'nullable|exists:formateurs,id',
        ]);

        $module->update($validated);
        $module->load(['groupe', 'formateur.user']);

        return response()->json($module);
    }

    public function destroy($id)
    {
        Module::destroy($id);
        return response()->json(['message' => 'Deleted']);
    }
}
