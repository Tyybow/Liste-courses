import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import IngredientList from './components/ingredients/IngredientList';
import RecipeList from './components/recipes/RecipeList';
import WeekPlanning from './components/planning/WeekPlanning';
import ShoppingList from './components/shopping/ShoppingList';

type Tab = 'ingredients' | 'recipes' | 'planning' | 'shopping';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'ingredients' && <IngredientList />}
        {activeTab === 'recipes' && <RecipeList />}
        {activeTab === 'planning' && <WeekPlanning />}
        {activeTab === 'shopping' && <ShoppingList />}
      </main>
    </div>
  );
}

export default App;
