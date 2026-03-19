import type { Ingredient, Recipe } from '../types';
import { v4 as uuid } from 'uuid';

// Helper pour créer un ingrédient rapidement
const ing = (name: string, category: Ingredient['category'], defaultUnit: Ingredient['defaultUnit']): Ingredient => ({
  id: uuid(), name, category, defaultUnit,
});

// ============================================================
// VIANDE & POISSON
// ============================================================
const cuissesPoulet = ing('Cuisses de poulet', 'Viande & Poisson', 'pièce(s)');
const blancsDepoulet = ing('Blancs de poulet', 'Viande & Poisson', 'pièce(s)');
const pouletEntier = ing('Poulet entier', 'Viande & Poisson', 'pièce(s)');
const steakHache = ing('Steak haché', 'Viande & Poisson', 'pièce(s)');
const boeufBourguignon = ing('Boeuf (bourguignon)', 'Viande & Poisson', 'g');
const escalopesVeau = ing('Escalopes de veau', 'Viande & Poisson', 'pièce(s)');
const cotesDePorcIng = ing('Côtes de porc', 'Viande & Poisson', 'pièce(s)');
const rotiDePorc = ing('Rôti de porc', 'Viande & Poisson', 'g');
const saucisses = ing('Saucisses', 'Viande & Poisson', 'pièce(s)');
const merguez = ing('Merguez', 'Viande & Poisson', 'pièce(s)');
const lardonsFumes = ing('Lardons fumés', 'Viande & Poisson', 'g');
const lardonsNature = ing('Lardons nature', 'Viande & Poisson', 'g');
const jambon = ing('Jambon blanc', 'Viande & Poisson', 'tranche(s)');
const jambonCru = ing('Jambon cru', 'Viande & Poisson', 'tranche(s)');
const saucisson = ing('Saucisson sec', 'Viande & Poisson', 'pièce(s)');
const escalopeDinde = ing('Escalope de dinde', 'Viande & Poisson', 'pièce(s)');
const agneauGigot = ing('Gigot d\'agneau', 'Viande & Poisson', 'g');
const agneauSouris = ing('Souris d\'agneau', 'Viande & Poisson', 'pièce(s)');
const saumon = ing('Saumon (filet)', 'Viande & Poisson', 'pièce(s)');
const saumonFume = ing('Saumon fumé', 'Viande & Poisson', 'tranche(s)');
const cabillaud = ing('Cabillaud (filet)', 'Viande & Poisson', 'pièce(s)');
const crevettes = ing('Crevettes', 'Viande & Poisson', 'g');
const moules = ing('Moules', 'Viande & Poisson', 'g');
const thonBoite = ing('Thon en boîte', 'Viande & Poisson', 'g');
const sardinesBoite = ing('Sardines en boîte', 'Viande & Poisson', 'pièce(s)');
const dorade = ing('Dorade', 'Viande & Poisson', 'pièce(s)');
const truite = ing('Truite', 'Viande & Poisson', 'pièce(s)');
const chorizo = ing('Chorizo', 'Viande & Poisson', 'g');
const canard = ing('Magret de canard', 'Viande & Poisson', 'pièce(s)');
const viandeFondue = ing('Viande hachée', 'Viande & Poisson', 'g');

// ============================================================
// LÉGUMES
// ============================================================
const ail = ing('Ail', 'Légumes', 'gousse(s)');
const oignon = ing('Oignon', 'Légumes', 'pièce(s)');
const oignonRouge = ing('Oignon rouge', 'Légumes', 'pièce(s)');
const echalote = ing('Échalote', 'Légumes', 'pièce(s)');
const tomates = ing('Tomates', 'Légumes', 'pièce(s)');
const tomateCerise = ing('Tomates cerises', 'Légumes', 'g');
const carotte = ing('Carottes', 'Légumes', 'pièce(s)');
const pommeDeTerre = ing('Pommes de terre', 'Légumes', 'g');
const courgette = ing('Courgettes', 'Légumes', 'pièce(s)');
const aubergine = ing('Aubergine', 'Légumes', 'pièce(s)');
const poivronRouge = ing('Poivron rouge', 'Légumes', 'pièce(s)');
const poivronVert = ing('Poivron vert', 'Légumes', 'pièce(s)');
const poivronJaune = ing('Poivron jaune', 'Légumes', 'pièce(s)');
const brocoli = ing('Brocoli', 'Légumes', 'pièce(s)');
const chouFleur = ing('Chou-fleur', 'Légumes', 'pièce(s)');
const chouVert = ing('Chou vert', 'Légumes', 'pièce(s)');
const chouRouge = ing('Chou rouge', 'Légumes', 'pièce(s)');
const epinards = ing('Épinards frais', 'Légumes', 'g');
const champignons = ing('Champignons de Paris', 'Légumes', 'g');
const haricotVerts = ing('Haricots verts', 'Légumes', 'g');
const petitsPois = ing('Petits pois', 'Légumes', 'g');
const laitue = ing('Laitue', 'Légumes', 'pièce(s)');
const saladeMache = ing('Mâche', 'Légumes', 'g');
const roquette = ing('Roquette', 'Légumes', 'g');
const concombre = ing('Concombre', 'Légumes', 'pièce(s)');
const celeri = ing('Céleri branche', 'Légumes', 'pièce(s)');
const celeriRave = ing('Céleri-rave', 'Légumes', 'pièce(s)');
const poireau = ing('Poireaux', 'Légumes', 'pièce(s)');
const navet = ing('Navets', 'Légumes', 'pièce(s)');
const radis = ing('Radis', 'Légumes', 'pièce(s)');
const betterave = ing('Betterave', 'Légumes', 'pièce(s)');
const avocat = ing('Avocat', 'Légumes', 'pièce(s)');
const fenouil = ing('Fenouil', 'Légumes', 'pièce(s)');
const asperges = ing('Asperges', 'Légumes', 'pièce(s)');
const artichaut = ing('Artichaut', 'Légumes', 'pièce(s)');
const mais = ing('Maïs en boîte', 'Légumes', 'g');
const endive = ing('Endives', 'Légumes', 'pièce(s)');
const courgeButternut = ing('Courge butternut', 'Légumes', 'pièce(s)');
const patateDouce = ing('Patate douce', 'Légumes', 'pièce(s)');
const gingembre = ing('Gingembre frais', 'Légumes', 'g');
const persilFrais = ing('Persil frais', 'Légumes', 'pièce(s)');
const coriandre = ing('Coriandre fraîche', 'Légumes', 'pièce(s)');
const basilicFrais = ing('Basilic frais', 'Légumes', 'pièce(s)');
const mentheFraiche = ing('Menthe fraîche', 'Légumes', 'pièce(s)');
const ciboulette = ing('Ciboulette', 'Légumes', 'pièce(s)');

// ============================================================
// FRUITS
// ============================================================
const citron = ing('Citron', 'Fruits', 'pièce(s)');
const citronVert = ing('Citron vert', 'Fruits', 'pièce(s)');
const pomme = ing('Pommes', 'Fruits', 'pièce(s)');
const banane = ing('Bananes', 'Fruits', 'pièce(s)');
const orange = ing('Oranges', 'Fruits', 'pièce(s)');
const poire = ing('Poires', 'Fruits', 'pièce(s)');
const fraise = ing('Fraises', 'Fruits', 'g');
const framboise = ing('Framboises', 'Fruits', 'g');
const myrtille = ing('Myrtilles', 'Fruits', 'g');
const raisin = ing('Raisin', 'Fruits', 'g');
const peche = ing('Pêches', 'Fruits', 'pièce(s)');
const abricot = ing('Abricots', 'Fruits', 'pièce(s)');
const kiwi = ing('Kiwis', 'Fruits', 'pièce(s)');
const mangue = ing('Mangue', 'Fruits', 'pièce(s)');
const ananas = ing('Ananas', 'Fruits', 'pièce(s)');
const melon = ing('Melon', 'Fruits', 'pièce(s)');
const pasteque = ing('Pastèque', 'Fruits', 'pièce(s)');
const cerise = ing('Cerises', 'Fruits', 'g');
const prune = ing('Prunes', 'Fruits', 'pièce(s)');
const clementine = ing('Clémentines', 'Fruits', 'pièce(s)');
const pamplemousse = ing('Pamplemousse', 'Fruits', 'pièce(s)');

// ============================================================
// PRODUITS LAITIERS
// ============================================================
const lait = ing('Lait', 'Produits laitiers', 'ml');
const beurre = ing('Beurre', 'Produits laitiers', 'g');
const cremeFraiche = ing('Crème fraîche', 'Produits laitiers', 'g');
const cremeLiquide = ing('Crème liquide', 'Produits laitiers', 'ml');
const yaourt = ing('Yaourt nature', 'Produits laitiers', 'pièce(s)');
const fromageRape = ing('Fromage râpé (emmental)', 'Produits laitiers', 'g');
const parmesanRape = ing('Parmesan râpé', 'Produits laitiers', 'g');
const mozzarella = ing('Mozzarella', 'Produits laitiers', 'pièce(s)');
const chevre = ing('Fromage de chèvre (bûche)', 'Produits laitiers', 'pièce(s)');
const roquefort = ing('Roquefort', 'Produits laitiers', 'g');
const comte = ing('Comté', 'Produits laitiers', 'g');
const camembert = ing('Camembert', 'Produits laitiers', 'pièce(s)');
const brie = ing('Brie', 'Produits laitiers', 'g');
const feta = ing('Feta', 'Produits laitiers', 'g');
const ricotta = ing('Ricotta', 'Produits laitiers', 'g');
const mascarpone = ing('Mascarpone', 'Produits laitiers', 'g');
const fromageARadiclette = ing('Fromage à raclette', 'Produits laitiers', 'g');
const gruyere = ing('Gruyère', 'Produits laitiers', 'g');

// ============================================================
// OEUFS
// ============================================================
const oeufs = ing('Oeufs', 'Oeufs', 'pièce(s)');

// ============================================================
// PAIN & FÉCULENTS
// ============================================================
const spaghetti = ing('Spaghetti', 'Pain & Féculents', 'g');
const penne = ing('Penne', 'Pain & Féculents', 'g');
const fusilli = ing('Fusilli', 'Pain & Féculents', 'g');
const tagliatelles = ing('Tagliatelles', 'Pain & Féculents', 'g');
const lasagnesFeuilles = ing('Feuilles de lasagnes', 'Pain & Féculents', 'pièce(s)');
const coquillettes = ing('Coquillettes', 'Pain & Féculents', 'g');
const riz = ing('Riz', 'Pain & Féculents', 'g');
const rizBasmati = ing('Riz basmati', 'Pain & Féculents', 'g');
const rizArborio = ing('Riz arborio (risotto)', 'Pain & Féculents', 'g');
const boulghour = ing('Boulghour', 'Pain & Féculents', 'g');
const quinoa = ing('Quinoa', 'Pain & Féculents', 'g');
const semoule = ing('Semoule', 'Pain & Féculents', 'g');
const pain = ing('Pain (baguette)', 'Pain & Féculents', 'pièce(s)');
const painDeMie = ing('Pain de mie', 'Pain & Féculents', 'tranche(s)');
const painBurger = ing('Pains à burger', 'Pain & Féculents', 'pièce(s)');
const tortilla = ing('Tortillas (wraps)', 'Pain & Féculents', 'pièce(s)');
const pateBrisee = ing('Pâte brisée', 'Pain & Féculents', 'pièce(s)');
const pateFeuilletee = ing('Pâte feuilletée', 'Pain & Féculents', 'pièce(s)');
const patePizza = ing('Pâte à pizza', 'Pain & Féculents', 'pièce(s)');
const lentilles = ing('Lentilles', 'Pain & Féculents', 'g');
const lentillesCorail = ing('Lentilles corail', 'Pain & Féculents', 'g');
const poisChiches = ing('Pois chiches', 'Pain & Féculents', 'g');
const haricotsRouges = ing('Haricots rouges', 'Pain & Féculents', 'g');
const haricotsBlancs = ing('Haricots blancs', 'Pain & Féculents', 'g');
const farine = ing('Farine', 'Pain & Féculents', 'g');
const maizenaTmp = ing('Maïzena', 'Pain & Féculents', 'g');
const gnocchi = ing('Gnocchi', 'Pain & Féculents', 'g');
const couscous = ing('Couscous (semoule)', 'Pain & Féculents', 'g');
const crackers = ing('Crackers / Biscottes', 'Pain & Féculents', 'pièce(s)');

// ============================================================
// ÉPICERIE SÈCHE
// ============================================================
const sucre = ing('Sucre', 'Épicerie sèche', 'g');
const sucreBrun = ing('Sucre brun / cassonade', 'Épicerie sèche', 'g');
const miel = ing('Miel', 'Épicerie sèche', 'c. à soupe');
const confiture = ing('Confiture', 'Épicerie sèche', 'g');
const chocolatNoir = ing('Chocolat noir', 'Épicerie sèche', 'g');
const chocolatAuLait = ing('Chocolat au lait', 'Épicerie sèche', 'g');
const cacao = ing('Cacao en poudre', 'Épicerie sèche', 'g');
const levure = ing('Levure chimique', 'Épicerie sèche', 'sachet(s)');
const concentreTomate = ing('Concentré de tomate', 'Épicerie sèche', 'c. à soupe');
const tomatePelee = ing('Tomates pelées (boîte)', 'Épicerie sèche', 'g');
const coulisDTomate = ing('Coulis de tomate', 'Épicerie sèche', 'g');
const laitDeCoco = ing('Lait de coco', 'Épicerie sèche', 'ml');
const noixDeCoco = ing('Noix de coco râpée', 'Épicerie sèche', 'g');
const oliveVertes = ing('Olives vertes', 'Épicerie sèche', 'g');
const olivesNoires = ing('Olives noires', 'Épicerie sèche', 'g');
const capres = ing('Câpres', 'Épicerie sèche', 'c. à soupe');
const cornichons = ing('Cornichons', 'Épicerie sèche', 'pièce(s)');
const bouillonCube = ing('Bouillon cube', 'Épicerie sèche', 'pièce(s)');
const pignonsDePin = ing('Pignons de pin', 'Épicerie sèche', 'g');
const noix = ing('Noix', 'Épicerie sèche', 'g');
const noisettes = ing('Noisettes', 'Épicerie sèche', 'g');
const amandes = ing('Amandes', 'Épicerie sèche', 'g');
const raisinsSecs = ing('Raisins secs', 'Épicerie sèche', 'g');
const chapelure = ing('Chapelure', 'Épicerie sèche', 'g');
const gelatine = ing('Gélatine', 'Épicerie sèche', 'pièce(s)');
const biscuitsCuillere = ing('Biscuits cuillère', 'Épicerie sèche', 'pièce(s)');

// ============================================================
// CONDIMENTS & ÉPICES
// ============================================================
const huileOlive = ing('Huile d\'olive', 'Condiments & Épices', 'c. à soupe');
const huileTournesol = ing('Huile de tournesol', 'Condiments & Épices', 'c. à soupe');
const vinaigreBalsam = ing('Vinaigre balsamique', 'Condiments & Épices', 'c. à soupe');
const vinaigreVin = ing('Vinaigre de vin', 'Condiments & Épices', 'c. à soupe');
const vinaigre = ing('Vinaigre de cidre', 'Condiments & Épices', 'c. à soupe');
const sauceSoja = ing('Sauce soja', 'Condiments & Épices', 'c. à soupe');
const moutarde = ing('Moutarde', 'Condiments & Épices', 'c. à soupe');
const moutardeAncienne = ing('Moutarde à l\'ancienne', 'Condiments & Épices', 'c. à soupe');
const ketchup = ing('Ketchup', 'Condiments & Épices', 'c. à soupe');
const mayonnaise = ing('Mayonnaise', 'Condiments & Épices', 'c. à soupe');
const sel = ing('Sel', 'Condiments & Épices', 'g');
const poivre = ing('Poivre', 'Condiments & Épices', 'g');
const paprika = ing('Paprika', 'Condiments & Épices', 'c. à café');
const cumin = ing('Cumin', 'Condiments & Épices', 'c. à café');
const curry = ing('Curry', 'Condiments & Épices', 'c. à café');
const curcuma = ing('Curcuma', 'Condiments & Épices', 'c. à café');
const cannelle = ing('Cannelle', 'Condiments & Épices', 'c. à café');
const muscade = ing('Noix de muscade', 'Condiments & Épices', 'c. à café');
const pimentDoux = ing('Piment doux', 'Condiments & Épices', 'c. à café');
const pimentFort = ing('Piment fort / Cayenne', 'Condiments & Épices', 'c. à café');
const herbesDeProvence = ing('Herbes de Provence', 'Condiments & Épices', 'c. à café');
const thym = ing('Thym', 'Condiments & Épices', 'branche(s)');
const romarin = ing('Romarin', 'Condiments & Épices', 'branche(s)');
const laurier = ing('Laurier (feuilles)', 'Condiments & Épices', 'pièce(s)');
const origan = ing('Origan', 'Condiments & Épices', 'c. à café');
const pesto = ing('Pesto', 'Condiments & Épices', 'c. à soupe');
const tabasco = ing('Tabasco', 'Condiments & Épices', 'c. à café');
const worcestershire = ing('Sauce Worcestershire', 'Condiments & Épices', 'c. à soupe');
const nuocMam = ing('Nuoc-mâm', 'Condiments & Épices', 'c. à soupe');
const vanille = ing('Extrait de vanille', 'Condiments & Épices', 'c. à café');

// ============================================================
// SURGELÉS
// ============================================================
const petitsPoisSurgeles = ing('Petits pois surgelés', 'Surgelés', 'g');
const epinardsSurgeles = ing('Épinards surgelés', 'Surgelés', 'g');
const frites = ing('Frites surgelées', 'Surgelés', 'g');
const poissonPaneSurg = ing('Poisson pané surgelé', 'Surgelés', 'pièce(s)');
const pizzaSurgelee = ing('Pizza surgelée', 'Surgelés', 'pièce(s)');
const glaceTmp = ing('Glace', 'Surgelés', 'ml');
const legumesPoeles = ing('Légumes poêlés surgelés', 'Surgelés', 'g');

// ============================================================
// AUTRE (boissons, etc.)
// ============================================================
const eauGazeuse = ing('Eau gazeuse', 'Autre', 'L');
const vinBlanc = ing('Vin blanc (cuisine)', 'Autre', 'ml');
const vinRouge = ing('Vin rouge (cuisine)', 'Autre', 'ml');
const biere = ing('Bière', 'Autre', 'pièce(s)');
const cafe = ing('Café', 'Autre', 'g');
const the = ing('Thé', 'Autre', 'sachet(s)');
const jusDorange = ing('Jus d\'orange', 'Autre', 'L');

// ============================================================
// Export : tous les ingrédients
// ============================================================
export const initialIngredients: Ingredient[] = [
  // Viande & Poisson
  cuissesPoulet, blancsDepoulet, pouletEntier, steakHache, boeufBourguignon,
  escalopesVeau, cotesDePorcIng, rotiDePorc, saucisses, merguez,
  lardonsFumes, lardonsNature, jambon, jambonCru, saucisson,
  escalopeDinde, agneauGigot, agneauSouris, saumon, saumonFume,
  cabillaud, crevettes, moules, thonBoite, sardinesBoite,
  dorade, truite, chorizo, canard, viandeFondue,

  // Légumes
  ail, oignon, oignonRouge, echalote, tomates, tomateCerise,
  carotte, pommeDeTerre, courgette, aubergine,
  poivronRouge, poivronVert, poivronJaune,
  brocoli, chouFleur, chouVert, chouRouge,
  epinards, champignons, haricotVerts, petitsPois,
  laitue, saladeMache, roquette, concombre,
  celeri, celeriRave, poireau, navet, radis, betterave,
  avocat, fenouil, asperges, artichaut, mais,
  endive, courgeButternut, patateDouce, gingembre,
  persilFrais, coriandre, basilicFrais, mentheFraiche, ciboulette,

  // Fruits
  citron, citronVert, pomme, banane, orange, poire,
  fraise, framboise, myrtille, raisin,
  peche, abricot, kiwi, mangue, ananas,
  melon, pasteque, cerise, prune, clementine, pamplemousse,

  // Produits laitiers
  lait, beurre, cremeFraiche, cremeLiquide, yaourt,
  fromageRape, parmesanRape, mozzarella, chevre, roquefort,
  comte, camembert, brie, feta, ricotta, mascarpone,
  fromageARadiclette, gruyere,

  // Oeufs
  oeufs,

  // Pain & Féculents
  spaghetti, penne, fusilli, tagliatelles, lasagnesFeuilles, coquillettes,
  riz, rizBasmati, rizArborio, boulghour, quinoa, semoule,
  pain, painDeMie, painBurger, tortilla,
  pateBrisee, pateFeuilletee, patePizza,
  lentilles, lentillesCorail, poisChiches, haricotsRouges, haricotsBlancs,
  farine, maizenaTmp, gnocchi, couscous, crackers,

  // Épicerie sèche
  sucre, sucreBrun, miel, confiture,
  chocolatNoir, chocolatAuLait, cacao, levure,
  concentreTomate, tomatePelee, coulisDTomate,
  laitDeCoco, noixDeCoco,
  oliveVertes, olivesNoires, capres, cornichons,
  bouillonCube, pignonsDePin, noix, noisettes, amandes, raisinsSecs,
  chapelure, gelatine, biscuitsCuillere,

  // Condiments & Épices
  huileOlive, huileTournesol,
  vinaigreBalsam, vinaigreVin, vinaigre,
  sauceSoja, moutarde, moutardeAncienne, ketchup, mayonnaise,
  sel, poivre, paprika, cumin, curry, curcuma, cannelle, muscade,
  pimentDoux, pimentFort, herbesDeProvence,
  thym, romarin, laurier, origan,
  pesto, tabasco, worcestershire, nuocMam, vanille,

  // Surgelés
  petitsPoisSurgeles, epinardsSurgeles, frites,
  poissonPaneSurg, pizzaSurgelee, glaceTmp, legumesPoeles,

  // Autre
  eauGazeuse, vinBlanc, vinRouge, biere, cafe, the, jusDorange,
];

// ============================================================
// Recettes d'exemple
// ============================================================
export const initialRecipes: Recipe[] = [
  {
    id: uuid(),
    name: 'Pâtes carbonara',
    category: 'Pâtes',
    prepTime: 10,
    cookTime: 15,
    difficulty: 'Facile',
    instructions: '1. Faire cuire les spaghetti al dente.\n2. Faire revenir les lardons avec l\'ail émincé.\n3. Mélanger les oeufs avec le parmesan râpé.\n4. Égoutter les pâtes, ajouter les lardons.\n5. Hors du feu, ajouter le mélange oeufs-parmesan.\n6. Mélanger rapidement et servir.',
    ingredients: [
      { ingredientId: spaghetti.id, quantity: 200, unit: 'g' },
      { ingredientId: lardonsFumes.id, quantity: 150, unit: 'g' },
      { ingredientId: oeufs.id, quantity: 3, unit: 'pièce(s)' },
      { ingredientId: parmesanRape.id, quantity: 60, unit: 'g' },
      { ingredientId: ail.id, quantity: 1, unit: 'gousse(s)' },
    ],
  },
  {
    id: uuid(),
    name: 'Poulet rôti aux herbes',
    category: 'Viande',
    prepTime: 15,
    cookTime: 60,
    difficulty: 'Facile',
    instructions: '1. Préchauffer le four à 200°C.\n2. Couper les pommes de terre en quartiers.\n3. Disposer le poulet et les pommes de terre dans un plat.\n4. Arroser d\'huile d\'olive et de jus de citron.\n5. Parsemer de thym et romarin.\n6. Enfourner 60 min en arrosant régulièrement.',
    ingredients: [
      { ingredientId: cuissesPoulet.id, quantity: 2, unit: 'pièce(s)' },
      { ingredientId: pommeDeTerre.id, quantity: 300, unit: 'g' },
      { ingredientId: citron.id, quantity: 1, unit: 'pièce(s)' },
      { ingredientId: huileOlive.id, quantity: 2, unit: 'c. à soupe' },
      { ingredientId: thym.id, quantity: 2, unit: 'branche(s)' },
      { ingredientId: romarin.id, quantity: 2, unit: 'branche(s)' },
    ],
  },
  {
    id: uuid(),
    name: 'Salade niçoise',
    category: 'Salade',
    prepTime: 20,
    cookTime: 15,
    difficulty: 'Facile',
    instructions: '1. Faire cuire les oeufs durs (10 min).\n2. Cuire les haricots verts à l\'eau salée.\n3. Laver et couper la laitue, les tomates.\n4. Égoutter le thon.\n5. Disposer tous les ingrédients dans un saladier.\n6. Ajouter les olives noires.\n7. Assaisonner avec de l\'huile d\'olive.',
    ingredients: [
      { ingredientId: oeufs.id, quantity: 2, unit: 'pièce(s)' },
      { ingredientId: thonBoite.id, quantity: 160, unit: 'g' },
      { ingredientId: haricotVerts.id, quantity: 200, unit: 'g' },
      { ingredientId: tomates.id, quantity: 2, unit: 'pièce(s)' },
      { ingredientId: laitue.id, quantity: 1, unit: 'pièce(s)' },
      { ingredientId: olivesNoires.id, quantity: 50, unit: 'g' },
    ],
  },
];
