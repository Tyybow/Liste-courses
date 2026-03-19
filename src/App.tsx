import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import type { Tab } from './components/layout/Navbar';
import IngredientList from './components/ingredients/IngredientList';
import RecipeList from './components/recipes/RecipeList';
import WeekPlanning from './components/planning/WeekPlanning';
import ShoppingList from './components/shopping/ShoppingList';
import NonFoodList from './components/settings/NonFoodList';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {activeTab === 'recipes' && <RecipeList />}
          {activeTab === 'planning' && <WeekPlanning />}
          {activeTab === 'shopping' && <ShoppingList />}
          {activeTab === 'settings' && (
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Paramètres</h2>
              </div>
              <IngredientList />
              <div className="border-t border-gray-200/60" />
              <NonFoodList />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
