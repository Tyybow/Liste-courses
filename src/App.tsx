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
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'recipes' && <RecipeList />}
        {activeTab === 'planning' && <WeekPlanning />}
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-800">⚙️ Paramètres</h2>
            <IngredientList />
            <hr className="border-gray-200" />
            <NonFoodList />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
