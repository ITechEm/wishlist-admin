import dbConnect from '@/lib/mongodb';
import Wish from '@/models/Wish';

export default async function handler(req, res) {
  await dbConnect();

  // GET — fetch all wishes + categories
  if (req.method === 'GET') {
    const wishes = await Wish.find().sort({ createdAt: -1 });
    const categories = [...new Set(wishes.map((wish) => wish.category))];
    return res.status(200).json({ wishes, categories });
  }

  // POST — create new wish
  if (req.method === 'POST') {
    const { title, description, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and Category are required' });
    }

    const wish = await Wish.create({ title, description, category });
    return res.status(200).json(wish);
  }

  // PUT — update wish OR update category
  if (req.method === 'PUT') {
    const { id, title, description, quantity, category, taken, takenBy, oldCategory, newCategory, mode } = req.body;

    // --- CATEGORY RENAME ---
    if (mode === "rename-category") {
      await Wish.updateMany({ category: oldCategory }, { category: newCategory });
      return res.json({ message: "Category renamed successfully" });
    }

    // --- CATEGORY DELETE ---
    if (mode === "delete-category") {
      await Wish.updateMany({ category: oldCategory }, { category: "" });
      return res.json({ message: "Category deleted and wishes uncategorized" });
    }

    // --- NORMAL WISH UPDATE ---
    try {
      const wish = await Wish.findById(id);
      if (!wish) {
        return res.status(404).json({ message: 'Wish not found' });
      }

      if (title !== undefined) wish.title = title;
      if (description !== undefined) wish.description = description;
      if (quantity !== undefined) wish.quantity = quantity;
      if (category !== undefined) wish.category = category;
      if (taken !== undefined) wish.taken = taken;
      if (takenBy !== undefined) wish.takenBy = takenBy;

      await wish.save();
      return res.json(wish);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating wish' });
    }
  }

  // DELETE — delete wish
  if (req.method === 'DELETE') {
    const { id } = req.body;
    await Wish.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Deleted successfully' });
  }

  res.status(405).end();
}
