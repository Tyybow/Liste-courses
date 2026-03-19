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

  const dayColors = [
    'from-violet-500/10 to-violet-500/5',
    'from-blue-500/10 to-blue-500/5',
    'from-cyan-500/10 to-cyan-500/5',
    'from-emerald-500/10 to-emerald-500/5',
    'from-amber-500/10 to-amber-500/5',
    'from-orange-500/10 to-orange-500/5',
    'from-rose-500/10 to-rose-500/5',
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Planning</h2>
          <p className="text-sm text-gray-400 mt-0.5">Organisez vos repas de la semaine</p>
        </div>
        {meals.length > 0 && (
          <button
            onClick={clearPlanning}
            className="text-sm text-gray-400 hover:text-danger font-medium cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-danger-light transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Vider le planning
          </button>
        )}
      </div>

      {recipes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Ajoutez d'abord des recettes avant de planifier vos repas.
        </div>
      )}

      {/* Vue calendrier */}
      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day, dayIdx) => (
          <div key={day} className="card-glass rounded-2xl border border-gray-200/60 overflow-hidden hover-lift">
            <div className={`bg-gradient-to-r ${dayColors[dayIdx]} px-5 py-3 border-b border-gray-100/60`}>
              <h3 className="font-bold text-gray-700">{day}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100/60">
              {(['midi', 'soir'] as MealTime[]).map((time) => {
                const slotMeals = getMeals(day, time);
                const isAdding = addingSlot?.day === day && addingSlot?.time === time;

                return (
                  <div key={time} className="px-5 py-4 min-h-[90px]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        {time === 'midi' ? (
                          <span className="text-amber-400">☀️</span>
                        ) : (
                          <span className="text-indigo-400">🌙</span>
                        )}
                        {time === 'midi' ? 'Midi' : 'Soir'}
                      </span>
                      <button
                        onClick={() => {
                          setAddingSlot(isAdding ? null : { day, time });
                          setSelectedRecipeId('');
                          setServings(2);
                        }}
                        className={`text-xs font-medium cursor-pointer px-2.5 py-1 rounded-lg transition-all ${
                          isAdding
                            ? 'text-gray-500 bg-gray-100'
                            : 'text-primary hover:bg-primary/8'
                        }`}
                      >
                        {isAdding ? 'Annuler' : '+ Ajouter'}
                      </button>
                    </div>

                    {slotMeals.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between bg-gradient-to-r from-primary/6 to-primary/3 rounded-xl px-3.5 py-2.5 mb-2 border border-primary/10">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{getRecipeName(meal.recipeId)}</span>
                          <span className="text-xs text-gray-400 ml-2">{meal.servings} pers.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={meal.servings}
                            onChange={(e) => updateMeal(meal.id, { servings: Number(e.target.value) })}
                            className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary/20 bg-white"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n}>{n} pers.</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteMeal(meal.id)}
                            className="text-gray-300 hover:text-danger cursor-pointer transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}

                    {isAdding && (
                      <div className="space-y-2 bg-gray-50/80 rounded-xl p-3 border border-gray-100 animate-fade-in">
                        <select
                          value={selectedRecipeId}
                          onChange={(e) => setSelectedRecipeId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
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
                            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <option key={n} value={n}>{n} pers.</option>
                            ))}
                          </select>
                          <button
                            onClick={handleAdd}
                            disabled={!selectedRecipeId}
                            className="flex-1 btn-gradient text-white px-3 py-2 rounded-xl text-sm font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
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
