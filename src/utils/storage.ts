/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Script, IdeaNote } from '../types';

const SAMPLE_SCRIPT: Script = {
  id: 'sample_cyber_dawn',
  title: 'Cyber Dawn',
  writer: 'Cassandra Sterling',
  email: 'cassandra@sterlingfx.com',
  phone: '+1 (555) 019-2831',
  address: '102 Pine Street\nLos Angeles, CA 90028',
  notes: 'First draft. A speculative sci-fi thriller.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: [
    { id: '1', format: 'scene-heading', text: 'INT. STERLING LABS - NIGHT' },
    { id: '2', format: 'action', text: 'Flashing amber server lights paint the concrete bunker in deep crimson. A low hum vibrates the glass partition.' },
    { id: '3', format: 'character', text: 'LEO' },
    { id: '4', format: 'parenthetical', text: 'staring at a cascade of green code' },
    { id: '5', format: 'dialogue', text: 'It\'s repeating. Over and over again. Every line is an invitation.' },
    { id: '6', format: 'character', text: 'SARA' },
    { id: '7', format: 'dialogue', text: 'Don\'t run the compiler. We don\'t know how it behaves in isolated sandboxes.' },
    { id: '8', format: 'character', text: 'LEO' },
    { id: '9', format: 'parenthetical', text: 'smiles, hand hovering over key' },
    { id: '10', format: 'dialogue', text: 'That\'s the beauty of it. It doesn\'t want to be isolated.' },
    { id: '11', format: 'transition', text: 'CUT TO:' },
    { id: '12', format: 'scene-heading', text: 'EXT. LOS ANGELES STREET - DEEPER NIGHT' },
    { id: '13', format: 'action', text: 'Neon billboards flicker against the overcast sky. Rain begins to pepper the black asphalt.' },
    { id: '14', format: 'shot', text: 'WIDE ANCHOR SHOT - THE MAIN DATACENTER' },
    { id: '15', format: 'action', text: 'A single backup generator begins to sputter as all the city lights below start to slowly wind down in sequence.' }
  ]
};

const SAMPLE_SCRIPT_2: Script = {
  id: 'sample_things_fall_apart',
  title: 'Things Fall Apart',
  writer: 'Edward Nwoji',
  email: 'edward.nwoji@igbolandworks.org',
  phone: '+234 803 111 2222',
  address: 'Umuofia Village Compound\nAnambra State, Nigeria',
  notes: 'ADAPTATION STATEMENT: This screenplay is adapted from Chinua Achebe\'s timeless magnum opus "Things Fall Apart". It illustrates the collision of culture, family unit transitions, and traditional tribal friction in Umuofia.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: [
    { id: 't1', format: 'scene-heading', text: 'EXT. OKONKWO\'S compound - LATE AFTERNOON' },
    { id: 't2', format: 'action', text: 'A cluster of three mud huts stands proudly surrounded by a red earth wall. OKONKWO (30s, tall, huge, with a severe face that seems always on the verge of a fight) stands proudly reviewing his massive yam barn.' },
    { id: 't3', format: 'character', text: 'OKONKWO' },
    { id: 't4', format: 'parenthetical', text: 'muttering under his breath, evaluating a giant tuber' },
    { id: 't5', format: 'dialogue', text: 'The harvest is the spine of a warrior. If a man cannot feed his wives and children, he is empty. He is like Unoka.' },
    { id: 't6', format: 'action', text: 'NWOYE (12, quiet, sensitive) enters holding a bundle of dry palm branches. He shrinks slightly under his father’s sharp eyes.' },
    { id: 't7', format: 'character', text: 'OKONKWO' },
    { id: 't8', format: 'dialogue', text: 'Nwoye! Have you stacked the dry palm logs behind the main obi?' },
    { id: 't9', format: 'character', text: 'NWOYE' },
    { id: 't10', format: 'dialogue', text: 'Yes, father. I have double-tied them. They are dry for tonight\'s fire.' },
    { id: 't11', format: 'transition', text: 'FADE TO:' },
    { id: 't12', format: 'scene-heading', text: 'INT. OKONKWO\'S OBI - NIGHT' },
    { id: 't13', format: 'action', text: 'Rhythmic crickets sing in the tall grass outside. A warm fire glows in the middle of the room. IKEMEFUNA (15, captured child of Mbaino) sits on a solid goatskin, helping Nwoye shell dry corn kernels.' },
    { id: 't14', format: 'character', text: 'IKEMEFUNA' },
    { id: 't15', format: 'parenthetical', text: 'whispering to Nwoye' },
    { id: 't16', format: 'dialogue', text: 'In my village, the elderly say that during solar eclipses, the cosmic sky spirit is catching a giant shadow bird in its palm.' },
    { id: 't17', format: 'action', text: 'Okonkwo enters, carrying his drinking horn. He sits on his raised earthen bank. He watches them. His expression softens for a fraction of a second, then hardens again to maintain his iron authority.' },
    { id: 't18', format: 'character', text: 'OKONKWO' },
    { id: 't19', format: 'dialogue', text: 'Idle talk yields idle hands. Shell your crop. Tomorrow we clear the thick bush of the sacred grove.' },
    { id: 't20', format: 'transition', text: 'CUT TO:' },
    { id: 't21', format: 'scene-heading', text: 'EXT. VILLAGE ILLUSTRIOUS GROUND (ILOGU) - DAY' },
    { id: 't22', format: 'action', text: 'Hundreds of villagers form an intense human circle. The booming throb of ancient big drums shakes the canopy trees. Two powerful wrestlers, bodies slick with oil and sweat, circle each other in the dusty center.' },
    { id: 't23', format: 'shot', text: 'LOW CLOSE-UP SHOT' },
    { id: 't24', format: 'action', text: 'The crowd roars "Okonkwo! The Cat!" as the memories of Okonkwo throwing Amalinze the Cat in his youth echo in the village drumming rhythm.' }
  ]
};

export const Storage = {
  getScripts(): Script[] {
    try {
      const stored = localStorage.getItem('screenwriter_scripts');
      if (!stored) {
        // Initialize with both sample scripts
        const scripts = [SAMPLE_SCRIPT, SAMPLE_SCRIPT_2];
        localStorage.setItem('screenwriter_scripts', JSON.stringify(scripts));
        return scripts;
      }
      const parsed = JSON.parse(stored) as Script[];
      if (!parsed.some((s) => s.id === 'sample_things_fall_apart')) {
        parsed.push(SAMPLE_SCRIPT_2);
        localStorage.setItem('screenwriter_scripts', JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return [SAMPLE_SCRIPT, SAMPLE_SCRIPT_2];
    }
  },

  getScript(id: string): Script | null {
    const scripts = this.getScripts();
    return scripts.find((s) => s.id === id) || null;
  },

  saveScript(script: Script): void {
    const scripts = this.getScripts();
    const idx = scripts.findIndex((s) => s.id === script.id);
    const updatedScript = {
      ...script,
      updatedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      scripts[idx] = updatedScript;
    } else {
      scripts.unshift(updatedScript);
    }
    localStorage.setItem('screenwriter_scripts', JSON.stringify(scripts));
  },

  deleteScript(id: string): void {
    const scripts = this.getScripts().filter((s) => s.id !== id);
    localStorage.setItem('screenwriter_scripts', JSON.stringify(scripts));
  },

  getNotes(): IdeaNote[] {
    try {
      const stored = localStorage.getItem('screenwriter_notes');
      if (!stored) {
        const sampleNote: IdeaNote = {
          id: 'sample_idea_noir',
          title: 'Sci-Fi Setting Brainstorm',
          description: 'Initial worldbuilding parameters and character arcs.',
          content: '<h2><strong>The World of Cyber Dawn</strong></h2><p>Here are the core atmospheric parameters for the world of Cyber Dawn:</p><ul><li><strong>Setting:</strong> Outpost Omega, a neon-lit rain-slicked metropolis covered by an artificial climate dome.</li><li><strong>Visual Theme:</strong> Retro-futuristic brutalist towers paired with vibrant analog cathode screens and copper wiring.</li><li><strong>Leo\'s Motivation:</strong> Leo believes the code is sentient. His obsession is to decrypt the repeating block.</li><li><strong>Sara\'s Conflict:</strong> Sara is haunted by a previous sandbox incident that crashed an entire sector\'s grid.</li></ul>',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const notes = [sampleNote];
        localStorage.setItem('screenwriter_notes', JSON.stringify(notes));
        return notes;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  getNote(id: string): IdeaNote | null {
    const notes = this.getNotes();
    return notes.find((n) => n.id === id) || null;
  },

  saveNote(note: IdeaNote): void {
    const notes = this.getNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString()
    };
    if (idx >= 0) {
      notes[idx] = updatedNote;
    } else {
      notes.unshift(updatedNote);
    }
    localStorage.setItem('screenwriter_notes', JSON.stringify(notes));
  },

  deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id);
    localStorage.setItem('screenwriter_notes', JSON.stringify(notes));
  }
};
