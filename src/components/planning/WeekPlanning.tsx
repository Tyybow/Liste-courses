import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { DayOfWeek, MealTime } from '../../types';
import { DAYS_OF_WEEK } from '../../types';

export default function WeekPlanning() {
  const { meals, recipes, addMeal, deleteMeal, updateMeal, clearPlanning } = useStore();
  const [addingSlot, setAddingSlot] = useState<{ day: DayOfWeek; time: MealTime } | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [servings, setServings] = useState(2);

  const getMeals = (day: DayOfWeek, time: MealTime) =>
    meals.filter((m) => m.day === day && m.mealTime === time);

  const getRecipeName = (id: string) =>
    recipes.find((r) => r.id === id)?.name ?? 'Recette inconnue';

  const handleAdd = () => {
    if (!addingSlot || !selectedRecipeId) return;
    addMeal({
      day: addingSlot.day,
      mealTime: addingSlot.time,
      recipeId: selectedRecipeId,
      servings,
    });
    setAddingSlot(null);
    setSelectedRecipeId('');
    setServings(2);
  };

  const sortedRecipes = [...recipes].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Planning de la semaine</h2>
        {meals.length > 0 && (
          <button
            onClick={clearPlanning}
            className="text-sm text-danger hover:text-red-700 font-medium cursor-pointer"
          >
            Vider le planning
          </button>
        )}
      </div>

      {recipes.length === 0 && (
        <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          Ajoutez d'abord des recettes avant de planifier vos repas.
        </p>
      )}

      {/* Vue calendrier */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700">{day}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {(['midi', 'soir'] as MealTime[]).map((time) => {
                const slotMeals = getMeals(day, time);
                const isAdding = addingSlot?.day === day && addingSlot?.time === time;

                return (
                  <div key={time} className="px-4 py-3 min-h-[80px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-400 uppercase">{time === 'midi' ? '☀️ Midi' : '🌙 Soir'}</span>
                      <button
                        onClick={() => {
                          setAddingSlot(isAdding ? null : { day, time });
                          setSelectedRecipeId('');
                          setServings(2);
                        }}
                        className="text-xs text-primary hover:text-primary-dark font-medium cursor-pointer"
                      >
                        {isAdding ? 'Annuler' : '+ Ajouter'}
                      </button>
                    </div>

                    {slotMeals.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2 mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{getRecipeName(meal.recipeId)}</span>
                          <span className="text-xs text-gray-400 ml-2">{meal.servings} pers.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={meal.servings}
                            onChange={(e) => updateMeal(meal.id, { servings: Number(e.target.value) })}
                            className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n}>{n} pers.</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="text-danger hover:text-red-700 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {isAdding && (
                      <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                        <select
                          value={selectedRecipeId}
                          onChange={(e) => setSelectedRecipeId(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          autoFocus
                        >
                          <option value="">Choisir une recette...</option>
                          {sortedRecipes.map((r) => (
                            <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <select
                            value={servings}
                            onChange={(e) => setServings(Number(e.target.value))}
                            className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n}>{n} pers.</option>
                            ))}
                          </select>
                          <button
                            onClick={handleAdd}
                            disabled={!selectedRecipeId}
                            className="flex-1 bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    )}

                    {slotMeals.length === 0 && !isAdding && (
                      <p className="text-xs text-gray-300 italic">Aucun repas</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
