//vamos a hacer acá un componente para  guardar notas personales

// Component for saving personal notes
// Note type definition
/**
 * @typedef {Object} Note
 * @property {string} id - Unique identifier for the note
 * @property {string} content - Content of the note
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
/**
 * @typedef {Object} Note
 */
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
/** @type {Object} Note */
  id: string;
  content: string; 
  createdAt: Date;
  updatedAt: Date;

class NotesManager {
  notes = [];

  createNote(content) {
    const note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.notes.push(note);
    return note;
  }

  getAllNotes() {
    return [...this.notes];
  }

  updateNote(id, content) {
    const note = this.notes.find(n => n.id === id);
    if (!note) return null;

    note.content = content;
    note.updatedAt = new Date();
    return note;
  }

  deleteNote(id) {
    const initialLength = this.notes.length;
    this.notes = this.notes.filter(n => n.id !== id);
    return this.notes.length !== initialLength;
  }
}
