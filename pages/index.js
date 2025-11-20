import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wishToDelete, setWishToDelete] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false); // For marking untaken
  const [wishToMarkUntaken, setWishToMarkUntaken] = useState(null);

  const loadWishes = async () => {
    const res = await fetch('/api/wishes');
    const data = await res.json();

    const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
    setWishes(data.wishes);
    setCategories(sortedCategories);
  };

  const addWish = async () => {
    if (!title || (!category && !newCategory)) {
      return alert('Title and Category are required');
    }

    const categoryToSend = newCategory || category;

    await fetch('/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category: categoryToSend }),
    });

    setTitle('');
    setDescription('');
    setCategory('');
    setNewCategory('');
    loadWishes();
  };

  const handleMarkTaken = async (wish) => {
    const takenBy = prompt('Enter name of person taking the wish:');
    const quantity = prompt('Enter quantity:', '1');

    await fetch('/api/wishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: wish._id,
        taken: true,
        takenBy,
        quantity: Number(quantity),
      }),
    });
    loadWishes();
  };

  const handleMarkUntakenClick = (wish) => {
    setWishToMarkUntaken(wish);
    setConfirmModalOpen(true); // Open confirmation modal
  };

  const confirmMarkUntaken = async () => {
    await fetch('/api/wishes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: wishToMarkUntaken._id,
        taken: false,
        takenBy: '',
        quantity: 0,
      }),
    });
    setConfirmModalOpen(false);
    setWishToMarkUntaken(null);
    loadWishes();
  };

  const openDeleteModal = (wish) => {
    setWishToDelete(wish);
    setDeleteModalOpen(true);
  };

  const deleteWish = async () => {
    await fetch('/api/wishes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: wishToDelete._id }),
    });
    setDeleteModalOpen(false);
    setWishToDelete(null);
    loadWishes();
  };

  useEffect(() => {
    loadWishes();
  }, []);

  const groupWishesByCategory = () => {
    const grouped = {};
    wishes.forEach((wish) => {
      const cat = wish.category || 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(wish);
    });

    const sortedCategories = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return sortedCategories.map((category) => ({
      category,
      wishes: grouped[category],
    }));
  };

  const container = { maxWidth: 700, margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: 20 };
  const input = { width: '100%', padding: 10, margin: '10px 0', borderRadius: 5, border: '1px solid #ccc' };
  const button = { padding: '10px 15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' };
  const deleteButton = { ...button, background: 'red' };
  const select = { padding: 8, marginBottom: 20, borderRadius: 5, border: '1px solid #ccc' };
  const card = (taken) => ({
    padding: 15,
    margin: '10px 0',
    borderRadius: 8,
    background: taken ? '#ffe6e6' : '#fff',
    borderLeft: taken ? '5px solid red' : '5px solid #0070f3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  });

  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
  };
  const modalContent = {
    background: '#fff', padding: 20, borderRadius: 8, minWidth: 300, textAlign: 'center'
  };
  const modalButton = { ...button, margin: '10px' };

  return (
    <div style={container}>
      <h1>Admin Panel</h1>

      <h2>Add Wish</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={input} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={input} />

      <div style={{ marginBottom: '20px' }}>
        <label>Choose or Create Category</label>
        <select
          style={select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={newCategory.length > 0}
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div>
          <input
            type="text"
            style={input}
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </div>
      </div>

      <button style={button} onClick={addWish}>Add Wish</button>

      <h2>Existing Wishes</h2>

      {groupWishesByCategory().map(({ category, wishes }) => (
        <div key={category}>
          <h3 style={{ color: '#0070f3' }}>{category}</h3>

          {wishes.map((wish) => (
            <div key={wish._id} style={{ margin: '10px 0' }}>
              <div style={card(wish.taken)}>
                <div>
                  <strong>{wish.title}</strong><br />
                  <small>{wish.description}</small><br />
                  {wish.takenBy && <em>Taken by: {wish.takenBy}</em>}<br />
                  {wish.quantity && <em>Quantity: {wish.quantity}</em>}
                </div>
                <div>
                  {wish.taken ? (
                    <button style={button} onClick={() => handleMarkUntakenClick(wish)}>Mark Untaken</button>
                  ) : (
                    <button style={button} onClick={() => handleMarkTaken(wish)}>Mark Taken</button>
                  )}
                  <button style={deleteButton} onClick={() => openDeleteModal(wish)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <p>Are you sure you want to delete <strong>{wishToDelete.title}</strong>?</p>
            <button style={modalButton} onClick={deleteWish}>Yes, Delete</button>
            <button style={modalButton} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Untaken Confirmation Modal */}
      {confirmModalOpen && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <p>Are you sure you want to mark <strong>{wishToMarkUntaken.title}</strong> as untaken?</p>
            <button style={modalButton} onClick={confirmMarkUntaken}>Yes</button>
            <button style={modalButton} onClick={() => setConfirmModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
