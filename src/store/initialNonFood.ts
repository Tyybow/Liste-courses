import type { NonFoodItem } from '../types';
import { v4 as uuid } from 'uuid';

const nf = (name: string, category: NonFoodItem['category']): NonFoodItem => ({
  id: uuid(), name, category,
});

export const initialNonFoodItems: NonFoodItem[] = [
  // Hygiène & Beauté
  nf('Papier toilette', 'Hygiène & Beauté'),
  nf('Mouchoirs', 'Hygiène & Beauté'),
  nf('Savon', 'Hygiène & Beauté'),
  nf('Shampooing', 'Hygiène & Beauté'),
  nf('Après-shampooing', 'Hygiène & Beauté'),
  nf('Gel douche', 'Hygiène & Beauté'),
  nf('Dentifrice', 'Hygiène & Beauté'),
  nf('Brosse à dents', 'Hygiène & Beauté'),
  nf('Déodorant', 'Hygiène & Beauté'),
  nf('Crème hydratante', 'Hygiène & Beauté'),
  nf('Rasoirs', 'Hygiène & Beauté'),
  nf('Mousse à raser', 'Hygiène & Beauté'),
  nf('Coton-tiges', 'Hygiène & Beauté'),
  nf('Cotons démaquillants', 'Hygiène & Beauté'),
  nf('Protections hygiéniques', 'Hygiène & Beauté'),
  nf('Crème solaire', 'Hygiène & Beauté'),

  // Ménage & Entretien
  nf('Liquide vaisselle', 'Ménage & Entretien'),
  nf('Éponges', 'Ménage & Entretien'),
  nf('Pastilles lave-vaisselle', 'Ménage & Entretien'),
  nf('Lessive', 'Ménage & Entretien'),
  nf('Adoucissant', 'Ménage & Entretien'),
  nf('Nettoyant multi-surfaces', 'Ménage & Entretien'),
  nf('Nettoyant vitres', 'Ménage & Entretien'),
  nf('Javel', 'Ménage & Entretien'),
  nf('Sacs poubelle', 'Ménage & Entretien'),
  nf('Essuie-tout', 'Ménage & Entretien'),
  nf('Papier aluminium', 'Ménage & Entretien'),
  nf('Film alimentaire', 'Ménage & Entretien'),
  nf('Sacs congélation', 'Ménage & Entretien'),
  nf('Désodorisant', 'Ménage & Entretien'),
  nf('Serpillière', 'Ménage & Entretien'),
  nf('Ampoules', 'Ménage & Entretien'),
  nf('Piles', 'Ménage & Entretien'),

  // Bébé
  nf('Couches', 'Bébé'),
  nf('Lingettes bébé', 'Bébé'),
  nf('Lait infantile', 'Bébé'),

  // Animaux
  nf('Croquettes chien', 'Animaux'),
  nf('Croquettes chat', 'Animaux'),
  nf('Litière chat', 'Animaux'),

  // Autre
  nf('Bougies', 'Autre'),
  nf('Allumettes / Briquet', 'Autre'),
];
